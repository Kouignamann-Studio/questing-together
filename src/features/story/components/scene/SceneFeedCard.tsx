import AsyncStorage from '@react-native-async-storage/async-storage';
import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  LayoutAnimation,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  ScrollView,
  type StyleProp,
  Text,
  type TextStyle,
  UIManager,
} from 'react-native';
import dividerLarge from '@/assets/images/T_Divider_L.png';
import dividerSmall from '@/assets/images/T_Divider_S.png';
import { Stack, Typography } from '@/components';
import { colors } from '@/constants/colors';
import CombatStatusCard from '@/features/combat/CombatStatusCard';

type SceneHistoryItem = {
  sceneId: string;
  sceneTitle: string;
  optionId: string;
  outcomeText: string;
};

type JournalEntry =
  | { id: string; kind: 'transition'; text: string }
  | { id: string; kind: 'narration'; text: string }
  | { id: string; kind: 'npc'; speaker: string; text: string; aside?: string; narration?: string }
  | {
      id: string;
      kind: 'player';
      speaker: string;
      lines: string[];
      stage?: string;
      narration?: string;
    }
  | {
      id: string;
      kind: 'combat_summary';
      combatState: {
        partyHp: number;
        partyHpMax: number;
        enemyHp: number;
        enemyHpMax: number;
        enemyName: string;
        round: number;
        outcome: 'victory' | 'defeat' | 'escape' | null;
        allowRun: boolean;
      };
      combatLog: { id: string; text: string }[];
    };

type SceneFeedCardProps = {
  sceneId?: string | null;
  sceneTitle?: string | null;
  persistenceScopeKey?: string | null;
  storyInstanceKey?: string | null;
  journalEntries: JournalEntry[];
  sceneHistory: SceneHistoryItem[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
  fullBleed?: boolean;
};

const WORD_REVEAL_CADENCE_MS = 120;
const WORD_FADE_DURATION_MS = 300;
const FOOTER_FADE_DURATION_MS = 500;
const FOOTER_REVEAL_BUFFER_MS = 120;
const SEEN_FEED_STORAGE_PREFIX = 'scene-feed-seen';
const AUTO_SCROLL_DURATION_MS = 420;
const LAYOUT_TRANSITION_DURATION_MS = 420;

type PersistedFeedState = {
  storyInstanceKey: string;
  entryIds: string[];
  footerSceneKeys: string[];
};

function splitIntoWordTokens(text: string) {
  return text.split(/(\s+)/).filter((token) => token.length > 0);
}

function getWordRevealCount(text: string) {
  return splitIntoWordTokens(text).reduce(
    (count, token) => count + (/^\s+$/.test(token) ? 0 : 1),
    0,
  );
}

function StoryText({
  text,
  style,
  animate,
  startDelay = 0,
}: {
  text: string;
  style?: StyleProp<TextStyle>;
  animate: boolean;
  startDelay?: number;
}) {
  const tokenMeta = useMemo(() => {
    let wordIndex = 0;

    return splitIntoWordTokens(text).map((token) => {
      if (/^\s+$/.test(token)) {
        return { token, isWhitespace: true as const, wordIndex: -1 };
      }

      const currentWordIndex = wordIndex;
      wordIndex += 1;
      return { token, isWhitespace: false as const, wordIndex: currentWordIndex };
    });
  }, [text]);

  const wordCount = useMemo(
    () => tokenMeta.reduce((count, part) => count + (part.isWhitespace ? 0 : 1), 0),
    [tokenMeta],
  );
  const revealDurationMs = useMemo(
    () => (wordCount > 0 ? (wordCount - 1) * WORD_REVEAL_CADENCE_MS + WORD_FADE_DURATION_MS : 0),
    [wordCount],
  );
  const revealClock = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (wordCount === 0) {
      return;
    }

    if (!animate) {
      revealClock.setValue(revealDurationMs);
      return;
    }

    revealClock.setValue(0);
    let revealAnimation: Animated.CompositeAnimation | null = null;

    const startTimer = setTimeout(() => {
      revealAnimation = Animated.timing(revealClock, {
        toValue: revealDurationMs,
        duration: revealDurationMs,
        easing: Easing.linear,
        useNativeDriver: false,
      });
      revealAnimation.start();
    }, startDelay);

    return () => {
      clearTimeout(startTimer);
      revealAnimation?.stop();
      revealClock.stopAnimation();
    };
  }, [animate, revealClock, revealDurationMs, startDelay, wordCount]);

  if (tokenMeta.length === 0 || wordCount === 0) {
    return <Text style={style}>{text}</Text>;
  }

  return (
    <Text style={style}>
      {tokenMeta.map((part, tokenIndex) => {
        if (part.isWhitespace) {
          return part.token;
        }

        const wordStartMs = part.wordIndex * WORD_REVEAL_CADENCE_MS;
        const opacity = revealClock.interpolate({
          inputRange: [wordStartMs, wordStartMs + WORD_FADE_DURATION_MS],
          outputRange: [0, 1],
          extrapolate: 'clamp',
        });

        return (
          <Animated.Text key={`${tokenIndex}-${part.token}`} style={{ opacity }}>
            {part.token}
          </Animated.Text>
        );
      })}
    </Text>
  );
}

function quoted(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return text;
  if (/^["\u201C\u00AB]/.test(trimmed)) return text;
  return `\u201C${text}\u201D`;
}

function getEntryAnimationUnits(item: JournalEntry): { key: string; text: string }[] {
  if (item.kind === 'transition') {
    return [{ key: `${item.id}-transition`, text: item.text }];
  }

  if (item.kind === 'narration') {
    return [{ key: `${item.id}-narration`, text: item.text }];
  }

  if (item.kind === 'combat_summary') {
    return [];
  }

  if (item.kind === 'npc') {
    const units: { key: string; text: string }[] = [
      { key: `${item.id}-speaker`, text: item.speaker },
    ];
    if (item.aside) {
      units.push({ key: `${item.id}-aside`, text: item.aside });
    }
    units.push({ key: `${item.id}-line`, text: quoted(item.text) });
    if (item.narration) {
      units.push({ key: `${item.id}-narration`, text: item.narration });
    }
    return units;
  }

  const units: { key: string; text: string }[] = [];
  if (item.stage) {
    units.push({ key: `${item.id}-stage`, text: item.stage });
  }
  item.lines.forEach((line, lineIndex) => {
    units.push({ key: `${item.id}-line-${lineIndex}`, text: quoted(line) });
  });
  if (item.narration) {
    units.push({ key: `${item.id}-narration`, text: item.narration });
  }
  return units;
}

const SceneFeedCard = ({
  sceneId,
  sceneTitle,
  persistenceScopeKey,
  storyInstanceKey,
  journalEntries,
  sceneHistory: _sceneHistory,
  header,
  footer,
  fullBleed = false,
}: SceneFeedCardProps) => {
  const scrollRef = useRef<ScrollView>(null);
  const autoScrollRef = useRef(true);
  const hasInitializedScrollRef = useRef(false);
  const scrollAnimationFrameRef = useRef<number | null>(null);
  const hasSeenFirstLayoutTransitionRef = useRef(false);
  const scrollMetricsRef = useRef({
    contentHeight: 0,
    layoutHeight: 0,
    offsetY: 0,
  });
  const [isSeenStateReady, setIsSeenStateReady] = useState(false);
  const seenEntryIdsRef = useRef<Set<string>>(new Set());
  const seenFooterSceneKeysRef = useRef<Set<string>>(new Set());
  const animationPlanRef = useRef<{
    signature: string | null;
    delays: Map<string, number>;
    animatedEntryIds: Set<string>;
    totalDurationMs: number;
    animateFooter: boolean;
  }>({
    signature: null,
    delays: new Map<string, number>(),
    animatedEntryIds: new Set<string>(),
    totalDurationMs: 0,
    animateFooter: false,
  });
  const footerOpacity = useRef(new Animated.Value(1)).current;
  const footerSceneKey = sceneId ?? sceneTitle ?? '__scene__';
  const storageKey = persistenceScopeKey
    ? `${SEEN_FEED_STORAGE_PREFIX}:${persistenceScopeKey}`
    : null;
  const animationSignature = useMemo(
    () =>
      isSeenStateReady
        ? `${storyInstanceKey ?? 'local'}|${footer ? '1' : '0'}|${footerSceneKey}|${journalEntries.map((item) => item.id).join(',')}`
        : null,
    [footer, footerSceneKey, isSeenStateReady, journalEntries, storyInstanceKey],
  );

  useEffect(() => {
    let isCancelled = false;

    setIsSeenStateReady(false);
    seenEntryIdsRef.current = new Set();
    seenFooterSceneKeysRef.current = new Set();
    animationPlanRef.current = {
      signature: null,
      delays: new Map<string, number>(),
      animatedEntryIds: new Set<string>(),
      totalDurationMs: 0,
      animateFooter: false,
    };

    async function loadSeenState() {
      if (!storageKey || !storyInstanceKey) {
        if (!isCancelled) {
          setIsSeenStateReady(true);
        }
        return;
      }

      try {
        const rawValue = await AsyncStorage.getItem(storageKey);
        if (isCancelled) return;

        if (rawValue) {
          const parsed = JSON.parse(rawValue) as Partial<PersistedFeedState>;
          if (parsed.storyInstanceKey === storyInstanceKey) {
            seenEntryIdsRef.current = new Set(parsed.entryIds ?? []);
            seenFooterSceneKeysRef.current = new Set(parsed.footerSceneKeys ?? []);
          }
        }
      } catch (error) {
        console.warn('[scene-feed] Failed to restore seen animation state:', error);
      }

      if (!isCancelled) {
        setIsSeenStateReady(true);
      }
    }

    void loadSeenState();

    return () => {
      isCancelled = true;
    };
  }, [storageKey, storyInstanceKey]);

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (scrollAnimationFrameRef.current !== null) {
        cancelAnimationFrame(scrollAnimationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isSeenStateReady) {
      return;
    }

    if (!hasSeenFirstLayoutTransitionRef.current) {
      hasSeenFirstLayoutTransitionRef.current = true;
      return;
    }

    LayoutAnimation.configureNext({
      duration: LAYOUT_TRANSITION_DURATION_MS,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
  }, [isSeenStateReady]);

  const stopAutoScrollAnimation = () => {
    if (scrollAnimationFrameRef.current === null) {
      return;
    }

    cancelAnimationFrame(scrollAnimationFrameRef.current);
    scrollAnimationFrameRef.current = null;
  };

  const scrollToBottom = (animated: boolean) => {
    const { contentHeight, layoutHeight, offsetY } = scrollMetricsRef.current;
    const targetY = Math.max(0, contentHeight - layoutHeight);

    if (!animated) {
      stopAutoScrollAnimation();
      scrollRef.current?.scrollTo({ y: targetY, animated: false });
      scrollMetricsRef.current.offsetY = targetY;
      return;
    }

    const distance = targetY - offsetY;
    if (distance <= 1) {
      scrollRef.current?.scrollTo({ y: targetY, animated: false });
      scrollMetricsRef.current.offsetY = targetY;
      return;
    }

    stopAutoScrollAnimation();
    const startY = offsetY;
    const startAt = Date.now();

    const step = () => {
      const elapsedMs = Date.now() - startAt;
      const progress = Math.min(1, elapsedMs / AUTO_SCROLL_DURATION_MS);
      const easedProgress = Easing.out(Easing.cubic)(progress);
      const nextY = startY + distance * easedProgress;

      scrollRef.current?.scrollTo({ y: nextY, animated: false });
      scrollMetricsRef.current.offsetY = nextY;

      if (progress < 1) {
        scrollAnimationFrameRef.current = requestAnimationFrame(step);
        return;
      }

      scrollAnimationFrameRef.current = null;
      scrollMetricsRef.current.offsetY = targetY;
    };

    scrollAnimationFrameRef.current = requestAnimationFrame(step);
  };

  if (animationSignature && animationPlanRef.current.signature !== animationSignature) {
    const animatedEntryIds = new Set<string>();
    const delays = new Map<string, number>();
    let delayCursor = 0;

    journalEntries.forEach((item) => {
      if (seenEntryIdsRef.current.has(item.id)) {
        return;
      }

      animatedEntryIds.add(item.id);
      const units = getEntryAnimationUnits(item);
      units.forEach(({ key, text }) => {
        const wordCount = getWordRevealCount(text);
        if (wordCount === 0) return;
        delays.set(key, delayCursor);
        delayCursor += wordCount * WORD_REVEAL_CADENCE_MS;
      });
    });

    animationPlanRef.current = {
      signature: animationSignature,
      delays,
      animatedEntryIds,
      totalDurationMs:
        delayCursor > 0 ? delayCursor - WORD_REVEAL_CADENCE_MS + WORD_FADE_DURATION_MS : 0,
      animateFooter: Boolean(footer) && !seenFooterSceneKeysRef.current.has(footerSceneKey),
    };
  }

  const animationPlan = animationPlanRef.current;

  useEffect(() => {
    if (!isSeenStateReady) return;

    let hasChanges = false;
    journalEntries.forEach((item) => {
      if (seenEntryIdsRef.current.has(item.id)) return;
      seenEntryIdsRef.current.add(item.id);
      hasChanges = true;
    });

    if (footer && !seenFooterSceneKeysRef.current.has(footerSceneKey)) {
      seenFooterSceneKeysRef.current.add(footerSceneKey);
      hasChanges = true;
    }

    if (!hasChanges || !storageKey || !storyInstanceKey) {
      return;
    }

    const persistedState: PersistedFeedState = {
      storyInstanceKey,
      entryIds: Array.from(seenEntryIdsRef.current),
      footerSceneKeys: Array.from(seenFooterSceneKeysRef.current),
    };

    void AsyncStorage.setItem(storageKey, JSON.stringify(persistedState)).catch((error) => {
      console.warn('[scene-feed] Failed to persist seen animation state:', error);
    });
  }, [footer, footerSceneKey, isSeenStateReady, journalEntries, storageKey, storyInstanceKey]);

  useEffect(() => {
    if (!footer) return;
    if (!isSeenStateReady) {
      footerOpacity.setValue(0);
      return;
    }
    if (!animationPlan.animateFooter) {
      footerOpacity.setValue(1);
      return;
    }

    footerOpacity.setValue(0);
  }, [animationPlan.animateFooter, footer, footerOpacity, isSeenStateReady]);

  useEffect(() => {
    if (!footer) return;
    if (!isSeenStateReady) return;
    if (!animationPlan.animateFooter) return;

    const revealDelayMs = Math.max(0, animationPlan.totalDurationMs + FOOTER_REVEAL_BUFFER_MS);
    const timer = setTimeout(() => {
      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: FOOTER_FADE_DURATION_MS,
        useNativeDriver: true,
      }).start();
    }, revealDelayMs);

    return () => {
      clearTimeout(timer);
      footerOpacity.stopAnimation();
    };
  }, [
    animationPlan.animateFooter,
    animationPlan.totalDurationMs,
    footer,
    footerOpacity,
    isSeenStateReady,
  ]);

  const getStartDelay = (animationKey: string) => animationPlan.delays.get(animationKey) ?? 0;

  return (
    <Stack
      gap={10}
      flex={1}
      style={[
        {
          backgroundColor: colors.backgroundCombatCard,
          borderRadius: 12,
          padding: 10,
          borderWidth: 1,
          borderColor: colors.borderCard,
        },
        fullBleed && {
          backgroundColor: 'transparent',
          borderWidth: 0,
          padding: 0,
        },
      ]}
    >
      <Stack
        gap={12}
        flex={1}
        style={[
          {
            backgroundColor: colors.backgroundPaper,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.borderOverlay,
            padding: 14,
          },
          fullBleed && {
            borderRadius: 0,
            borderWidth: 0,
            backgroundColor: 'transparent',
          },
        ]}
      >
        {header ? <Stack gap={12}>{header}</Stack> : null}
        <Typography
          variant="caption"
          style={{
            fontWeight: '400',
            color: colors.combatTitleEmbedded,
            letterSpacing: 0.6,
            fontStyle: 'italic',
            textAlign: 'center',
            marginTop: 32,
          }}
        >
          {`*${sceneTitle ?? 'Scene'}*`}
        </Typography>
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ gap: 12, paddingTop: 4, paddingBottom: 4 }}
          nestedScrollEnabled
          onLayout={(event) => {
            scrollMetricsRef.current.layoutHeight = event.nativeEvent.layout.height;
            if (
              !hasInitializedScrollRef.current &&
              autoScrollRef.current &&
              scrollMetricsRef.current.contentHeight > 0
            ) {
              hasInitializedScrollRef.current = true;
              scrollToBottom(false);
            }
          }}
          onScrollBeginDrag={stopAutoScrollAnimation}
          onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
            scrollMetricsRef.current = {
              layoutHeight: layoutMeasurement.height,
              offsetY: contentOffset.y,
              contentHeight: contentSize.height,
            };
            const paddingToBottom = 24;
            autoScrollRef.current =
              layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
          }}
          onContentSizeChange={(_, contentHeight) => {
            const previousContentHeight = scrollMetricsRef.current.contentHeight;
            scrollMetricsRef.current.contentHeight = contentHeight;

            if (scrollMetricsRef.current.layoutHeight <= 0) {
              return;
            }

            if (!autoScrollRef.current) {
              return;
            }

            if (!hasInitializedScrollRef.current) {
              hasInitializedScrollRef.current = true;
              scrollToBottom(false);
              return;
            }

            if (contentHeight > previousContentHeight + 1) {
              scrollToBottom(true);
              return;
            }

            scrollToBottom(false);
          }}
          scrollEventThrottle={16}
        >
          {isSeenStateReady
            ? journalEntries.map((item) => {
                const shouldAnimate = animationPlan.animatedEntryIds.has(item.id);

                if (item.kind === 'transition') {
                  return (
                    <Stack key={item.id} gap={6} align="center" style={{ paddingVertical: 6 }}>
                      <StoryText
                        text={item.text}
                        style={{
                          fontSize: 12,
                          paddingTop: 4,
                          paddingBottom: 4,
                          fontStyle: 'italic',
                          color: colors.textTransition,
                          textAlign: 'center',
                          fontFamily: 'Besley',
                        }}
                        animate={shouldAnimate}
                        startDelay={getStartDelay(`${item.id}-transition`)}
                      />
                    </Stack>
                  );
                }

                if (item.kind === 'narration') {
                  return (
                    <Stack
                      key={item.id}
                      style={{
                        borderLeftWidth: 0,
                        borderLeftColor: colors.combatTitleEmbedded,
                        paddingLeft: 28,
                        paddingRight: 28,
                        paddingVertical: 24,
                      }}
                    >
                      <StoryText
                        text={item.text}
                        style={{
                          fontSize: 17,
                          lineHeight: 32,
                          color: colors.combatTitleEmbedded,
                          fontFamily: 'Besley',
                          fontWeight: '500',
                        }}
                        animate={shouldAnimate}
                        startDelay={getStartDelay(`${item.id}-narration`)}
                      />
                    </Stack>
                  );
                }

                if (item.kind === 'combat_summary') {
                  return (
                    <Stack key={item.id} style={{ marginLeft: 28, marginTop: 6, marginBottom: 6 }}>
                      <CombatStatusCard
                        combatState={item.combatState}
                        combatLog={item.combatLog}
                        resolvedOption={null}
                        showResolutionStatus={false}
                        embedded
                      />
                    </Stack>
                  );
                }

                if (item.kind === 'npc') {
                  return (
                    <Stack key={item.id} gap={12} style={{ marginLeft: 28 }}>
                      <StoryText
                        text={item.speaker}
                        style={{
                          fontSize: 14,
                          fontWeight: '600',
                          color: colors.combatTitleEmbedded,
                          textTransform: 'uppercase',
                          letterSpacing: 0.6,
                          fontFamily: 'Besley',
                          marginTop: 12,
                        }}
                        animate={shouldAnimate}
                        startDelay={getStartDelay(`${item.id}-speaker`)}
                      />
                      {item.aside ? (
                        <StoryText
                          text={item.aside}
                          style={{
                            fontSize: 16,
                            fontWeight: '400',
                            lineHeight: 20,
                            color: colors.textDialogue,
                            fontStyle: 'italic',
                            fontFamily: 'Besley',
                            marginTop: 4,
                            marginBottom: 12,
                          }}
                          animate={shouldAnimate}
                          startDelay={getStartDelay(`${item.id}-aside`)}
                        />
                      ) : null}
                      <StoryText
                        text={quoted(item.text)}
                        style={{
                          fontSize: 16,
                          lineHeight: 20,
                          color: colors.textDialogue,
                          fontFamily: 'Besley',
                          fontWeight: '400',
                          fontStyle: 'italic',
                          marginTop: 4,
                          marginBottom: 12,
                        }}
                        animate={shouldAnimate}
                        startDelay={getStartDelay(`${item.id}-line`)}
                      />
                      {item.narration ? (
                        <StoryText
                          text={item.narration}
                          style={{
                            marginTop: 6,
                            fontSize: 17,
                            lineHeight: 26,
                            color: colors.textDialogue,
                            fontFamily: 'Besley',
                            fontWeight: '500',
                          }}
                          animate={shouldAnimate}
                          startDelay={getStartDelay(`${item.id}-narration`)}
                        />
                      ) : null}
                    </Stack>
                  );
                }

                return (
                  <Stack key={item.id} gap={12} style={{ marginLeft: 28 }}>
                    <Image
                      source={dividerSmall}
                      style={{
                        width: '50%',
                        alignSelf: 'center',
                        aspectRatio: 400 / 22,
                        opacity: 0.75,
                        marginVertical: 2,
                      }}
                      resizeMode="contain"
                    />
                    <Typography
                      variant="body"
                      style={{
                        fontWeight: '600',
                        color: colors.combatTitleEmbedded,
                        textTransform: 'uppercase',
                        letterSpacing: 0.6,
                        marginTop: 12,
                      }}
                    >
                      {item.speaker}
                    </Typography>
                    {item.stage ? (
                      <StoryText
                        text={item.stage}
                        style={{
                          fontSize: 16,
                          fontWeight: '400',
                          lineHeight: 20,
                          color: colors.textDialogue,
                          fontStyle: 'italic',
                          fontFamily: 'Besley',
                          marginTop: 4,
                          marginBottom: 12,
                        }}
                        animate={shouldAnimate}
                        startDelay={getStartDelay(`${item.id}-stage`)}
                      />
                    ) : null}
                    {item.lines.map((line, lineIndex) => (
                      <StoryText
                        key={`${item.id}-line-${lineIndex}`}
                        text={quoted(line)}
                        style={{
                          fontSize: 16,
                          lineHeight: 20,
                          color: colors.textDialogue,
                          fontFamily: 'Besley',
                          fontWeight: '400',
                          fontStyle: 'italic',
                          marginTop: 4,
                          marginBottom: 12,
                        }}
                        animate={shouldAnimate}
                        startDelay={getStartDelay(`${item.id}-line-${lineIndex}`)}
                      />
                    ))}
                    {item.narration ? (
                      <StoryText
                        text={item.narration}
                        style={{
                          marginTop: 6,
                          fontSize: 17,
                          lineHeight: 26,
                          color: colors.textDialogue,
                          fontFamily: 'Besley',
                          fontWeight: '500',
                        }}
                        animate={shouldAnimate}
                        startDelay={getStartDelay(`${item.id}-narration`)}
                      />
                    ) : null}
                  </Stack>
                );
              })
            : null}
        </ScrollView>
        {footer && isSeenStateReady ? (
          <Animated.View style={{ marginTop: 6, gap: 10, opacity: footerOpacity }}>
            <Image
              source={dividerLarge}
              style={{ width: '100%', aspectRatio: 400 / 22, alignSelf: 'center' }}
              resizeMode="contain"
            />
            {footer}
          </Animated.View>
        ) : null}
      </Stack>
    </Stack>
  );
};

export default SceneFeedCard;
