import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  LayoutAnimation,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  type ScrollView,
  UIManager,
} from 'react-native';

type JournalEntry = {
  id: string;
  kind: string;
  text?: string;
  speaker?: string;
  aside?: string;
  narration?: string;
  lines?: string[];
  stage?: string;
};

type AnimationPlan = {
  signature: string | null;
  delays: Map<string, number>;
  animatedEntryIds: Set<string>;
  totalDurationMs: number;
  animateFooter: boolean;
};

type PersistedFeedState = {
  storyInstanceKey: string;
  entryIds: string[];
  footerSceneKeys: string[];
};

const WORD_REVEAL_CADENCE_MS = 120;
const WORD_FADE_DURATION_MS = 300;
const FOOTER_FADE_DURATION_MS = 500;
const FOOTER_REVEAL_BUFFER_MS = 120;
const SEEN_FEED_STORAGE_PREFIX = 'scene-feed-seen';
const AUTO_SCROLL_DURATION_MS = 420;
const LAYOUT_TRANSITION_DURATION_MS = 420;

const EMPTY_PLAN: AnimationPlan = {
  signature: null,
  delays: new Map(),
  animatedEntryIds: new Set(),
  totalDurationMs: 0,
  animateFooter: false,
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

function quoted(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return text;
  if (/^["\u201C\u00AB]/.test(trimmed)) return text;
  return `\u201C${text}\u201D`;
}

function getEntryAnimationUnits(item: JournalEntry): { key: string; text: string }[] {
  if (item.kind === 'transition' && item.text) {
    return [{ key: `${item.id}-transition`, text: item.text }];
  }

  if (item.kind === 'narration' && item.text) {
    return [{ key: `${item.id}-narration`, text: item.text }];
  }

  if (item.kind === 'combat_summary') {
    return [];
  }

  if (item.kind === 'npc') {
    const units: { key: string; text: string }[] = [];
    if (item.speaker) units.push({ key: `${item.id}-speaker`, text: item.speaker });
    if (item.aside) units.push({ key: `${item.id}-aside`, text: item.aside });
    if (item.text) units.push({ key: `${item.id}-line`, text: quoted(item.text) });
    if (item.narration) units.push({ key: `${item.id}-narration`, text: item.narration });
    return units;
  }

  const units: { key: string; text: string }[] = [];
  if (item.stage) units.push({ key: `${item.id}-stage`, text: item.stage });
  item.lines?.forEach((line, lineIndex) => {
    units.push({ key: `${item.id}-line-${lineIndex}`, text: quoted(line) });
  });
  if (item.narration) units.push({ key: `${item.id}-narration`, text: item.narration });
  return units;
}

function persistSeenState(
  storageKey: string,
  storyInstanceKey: string,
  seenEntryIds: Set<string>,
  seenFooterSceneKeys: Set<string>,
) {
  const state: PersistedFeedState = {
    storyInstanceKey,
    entryIds: Array.from(seenEntryIds),
    footerSceneKeys: Array.from(seenFooterSceneKeys),
  };
  void AsyncStorage.setItem(storageKey, JSON.stringify(state)).catch((error) => {
    console.warn('[scene-feed] Failed to persist seen animation state:', error);
  });
}

export function useSceneFeedAnimation({
  sceneId,
  sceneTitle,
  persistenceScopeKey,
  storyInstanceKey,
  journalEntries,
}: {
  sceneId: string;
  sceneTitle: string;
  persistenceScopeKey: string | null;
  storyInstanceKey: string;
  journalEntries: JournalEntry[];
}) {
  const scrollRef = useRef<ScrollView>(null);
  const autoScrollRef = useRef(true);
  const hasInitializedScrollRef = useRef(false);
  const scrollAnimationFrameRef = useRef<number | null>(null);
  const scrollMetricsRef = useRef({ contentHeight: 0, layoutHeight: 0, offsetY: 0 });

  const [isReady, setIsReady] = useState(false);
  const seenEntryIdsRef = useRef<Set<string>>(new Set());
  const seenFooterSceneKeysRef = useRef<Set<string>>(new Set());
  const animationPlanRef = useRef<AnimationPlan>(EMPTY_PLAN);
  const footerOpacity = useRef(new Animated.Value(1)).current;

  const footerSceneKey = sceneId ?? sceneTitle ?? '__scene__';
  const storageKey = persistenceScopeKey
    ? `${SEEN_FEED_STORAGE_PREFIX}:${persistenceScopeKey}`
    : null;

  // Mount: enable LayoutAnimation on Android + cleanup scroll animation
  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
    return () => {
      if (scrollAnimationFrameRef.current !== null) {
        cancelAnimationFrame(scrollAnimationFrameRef.current);
      }
    };
  }, []);

  // Load persisted seen state from AsyncStorage
  useEffect(() => {
    let isCancelled = false;

    setIsReady(false);
    seenEntryIdsRef.current = new Set();
    seenFooterSceneKeysRef.current = new Set();
    animationPlanRef.current = EMPTY_PLAN;

    async function load() {
      if (storageKey && storyInstanceKey) {
        try {
          const raw = await AsyncStorage.getItem(storageKey);
          if (!isCancelled && raw) {
            const parsed = JSON.parse(raw) as Partial<PersistedFeedState>;
            if (parsed.storyInstanceKey === storyInstanceKey) {
              seenEntryIdsRef.current = new Set(parsed.entryIds ?? []);
              seenFooterSceneKeysRef.current = new Set(parsed.footerSceneKeys ?? []);
            }
          }
        } catch (error) {
          console.warn('[scene-feed] Failed to restore seen animation state:', error);
        }
      }

      if (isCancelled) return;
      setIsReady(true);

      LayoutAnimation.configureNext({
        duration: LAYOUT_TRANSITION_DURATION_MS,
        create: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
        update: { type: LayoutAnimation.Types.easeInEaseOut },
        delete: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
      });
    }

    void load();
    return () => {
      isCancelled = true;
    };
  }, [storageKey, storyInstanceKey]);

  // Compute animation plan synchronously during render
  const animationSignature = useMemo(
    () =>
      isReady
        ? `${storyInstanceKey ?? 'local'}|1|${footerSceneKey}|${journalEntries.map((e) => e.id).join(',')}`
        : null,
    [footerSceneKey, isReady, journalEntries, storyInstanceKey],
  );

  if (animationSignature && animationPlanRef.current.signature !== animationSignature) {
    const animatedEntryIds = new Set<string>();
    const delays = new Map<string, number>();
    let delayCursor = 0;

    for (const item of journalEntries) {
      if (seenEntryIdsRef.current.has(item.id)) continue;
      animatedEntryIds.add(item.id);
      for (const { key, text } of getEntryAnimationUnits(item)) {
        const wordCount = getWordRevealCount(text);
        if (wordCount === 0) continue;
        delays.set(key, delayCursor);
        delayCursor += wordCount * WORD_REVEAL_CADENCE_MS;
      }
    }

    animationPlanRef.current = {
      signature: animationSignature,
      delays,
      animatedEntryIds,
      totalDurationMs:
        delayCursor > 0 ? delayCursor - WORD_REVEAL_CADENCE_MS + WORD_FADE_DURATION_MS : 0,
      animateFooter: !seenFooterSceneKeysRef.current.has(footerSceneKey),
    };

    // Mark entries as seen and persist
    let hasChanges = false;
    for (const item of journalEntries) {
      if (!seenEntryIdsRef.current.has(item.id)) {
        seenEntryIdsRef.current.add(item.id);
        hasChanges = true;
      }
    }
    if (!seenFooterSceneKeysRef.current.has(footerSceneKey)) {
      seenFooterSceneKeysRef.current.add(footerSceneKey);
      hasChanges = true;
    }
    if (hasChanges && storageKey && storyInstanceKey) {
      persistSeenState(
        storageKey,
        storyInstanceKey,
        seenEntryIdsRef.current,
        seenFooterSceneKeysRef.current,
      );
    }
  }

  const animationPlan = animationPlanRef.current;

  // Footer opacity: animate reveal after text animation completes
  useEffect(() => {
    if (!isReady) {
      footerOpacity.setValue(0);
      return;
    }
    if (!animationPlan.animateFooter) {
      footerOpacity.setValue(1);
      return;
    }

    footerOpacity.setValue(0);
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
  }, [animationPlan.animateFooter, animationPlan.totalDurationMs, footerOpacity, isReady]);

  // Scroll helpers
  const stopAutoScrollAnimation = useCallback(() => {
    if (scrollAnimationFrameRef.current === null) return;
    cancelAnimationFrame(scrollAnimationFrameRef.current);
    scrollAnimationFrameRef.current = null;
  }, []);

  const scrollToBottom = useCallback(
    (animated: boolean) => {
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
    },
    [stopAutoScrollAnimation],
  );

  const handleScrollLayout = useCallback(
    (event: { nativeEvent: { layout: { height: number } } }) => {
      scrollMetricsRef.current.layoutHeight = event.nativeEvent.layout.height;
      if (
        !hasInitializedScrollRef.current &&
        autoScrollRef.current &&
        scrollMetricsRef.current.contentHeight > 0
      ) {
        hasInitializedScrollRef.current = true;
        scrollToBottom(false);
      }
    },
    [scrollToBottom],
  );

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    scrollMetricsRef.current = {
      layoutHeight: layoutMeasurement.height,
      offsetY: contentOffset.y,
      contentHeight: contentSize.height,
    };
    autoScrollRef.current = layoutMeasurement.height + contentOffset.y >= contentSize.height - 24;
  }, []);

  const handleContentSizeChange = useCallback(
    (_: number, contentHeight: number) => {
      const previousContentHeight = scrollMetricsRef.current.contentHeight;
      scrollMetricsRef.current.contentHeight = contentHeight;

      if (scrollMetricsRef.current.layoutHeight <= 0 || !autoScrollRef.current) return;

      if (!hasInitializedScrollRef.current) {
        hasInitializedScrollRef.current = true;
        scrollToBottom(false);
        return;
      }

      scrollToBottom(contentHeight > previousContentHeight + 1);
    },
    [scrollToBottom],
  );

  const getStartDelay = useCallback(
    (animationKey: string) => animationPlan.delays.get(animationKey) ?? 0,
    [animationPlan.delays],
  );

  return {
    isReady,
    animationPlan,
    footerOpacity,
    scrollRef,
    getStartDelay,
    scrollHandlers: {
      onLayout: handleScrollLayout,
      onScrollBeginDrag: stopAutoScrollAnimation,
      onScroll: handleScroll,
      onContentSizeChange: handleContentSizeChange,
    },
  };
}

export { quoted, splitIntoWordTokens, WORD_FADE_DURATION_MS, WORD_REVEAL_CADENCE_MS };
