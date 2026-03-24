import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, type LayoutChangeEvent, PanResponder, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import portraitFrame from '@/assets/images/T_PortraitFrame.png';
import {
  ActionButton,
  BottomSheet,
  Button,
  CircularHealthBar,
  ContentContainer,
  Portrait,
  ScreenContainer,
  Stack,
  Typography,
} from '@/components';
import { colors } from '@/constants/colors';
import { COMBAT } from '@/constants/combatSettings';
import FloatingDamage from '@/features/combat/components/FloatingDamage';
import EffectPlayer from '@/features/vfx/player/EffectPlayer';
import { createEffectInstance } from '@/features/vfx/runtime/createEffectInstance';
import { playEffectSequence } from '@/features/vfx/runtime/playEffectSequence';
import { getEffectSequence, listEffectSequences } from '@/features/vfx/runtime/sequenceRegistry';
import type { EffectInstance } from '@/features/vfx/types/runtime';
import type { RoleId } from '@/types/player';
import { portraitByRole } from '@/utils/portraitByRole';

type AnchorKey = 'caster' | 'target';
type Point = { x: number; y: number };
type FloatingHit = { id: number; text: string; color: string };

type VfxPreviewScreenProps = {
  sequenceId: string;
  travelAssetId?: string;
  impactAssetId?: string;
  title?: string;
  description?: string;
  roleId?: RoleId;
  playerName?: string;
  enemyName?: string;
  enemyLevel?: number;
  enemyHpMax?: number;
  abilityLabel?: string;
  abilityIcon?: string;
  abilitySubtitle?: string;
  damageAmount?: number;
};

const ENEMY_CARD_WIDTH = 320;
const ENEMY_CARD_HEIGHT = 124;
const RING_SIZE = 80;
const PORTRAIT_SIZE = 72;
const ENEMY_PORTRAIT_SIZE = 92;
const FLOATING_LIFETIME_MS = 1000;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getDefaultAnchors(width: number, height: number) {
  return {
    caster: {
      x: width * 0.5,
      y: height - 120,
    },
    target: {
      x: width * 0.5,
      y: Math.min(172, height * 0.36),
    },
  };
}

function getEnemyGlyph(enemyName: string) {
  const initials = enemyName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return initials || '?';
}

function getImpactDelayMs(sequenceId: string, impactAssetId?: string) {
  const sequence = getEffectSequence(sequenceId);
  if (!sequence) {
    return 0;
  }

  const cues = [...sequence.cues].sort((left, right) => left.atMs - right.atMs);
  const cueByImpactAsset = impactAssetId
    ? (cues.find((cue) => cue.assetId === impactAssetId) ?? null)
    : null;
  const namedImpactCue =
    cues.find((cue) => cue.id.toLowerCase().includes('impact')) ??
    cues.find((cue) => cue.anchor === 'target' && !cue.targetAnchor) ??
    cues[cues.length - 1] ??
    null;

  return cueByImpactAsset?.atMs ?? namedImpactCue?.atMs ?? 0;
}

function getSequenceAbilityIcon(sequenceId: string, fallbackIcon: string) {
  if (sequenceId.includes('slash')) return '✦';
  if (sequenceId.includes('lightning')) return '⚡';
  if (sequenceId.includes('frost')) return '❄️';
  if (sequenceId.includes('fire')) return '🔥';
  return fallbackIcon;
}

function getSequenceAbilityLabel(
  sequenceId: string,
  sequenceLabel: string | null,
  fallbackLabel: string,
) {
  if (sequenceLabel) {
    return sequenceLabel.replace(/\s+cast$/i, '');
  }

  if (sequenceId.includes('slash')) return 'Sleek Slash';
  if (sequenceId.includes('lightning')) return 'Lightning Strike';
  if (sequenceId.includes('frost')) return 'Frostbolt';
  if (sequenceId.includes('fire')) return 'Fireball';
  return fallbackLabel;
}

const VfxPreviewScreen = ({
  sequenceId,
  impactAssetId,
  title = 'Combat VFX Preview',
  description = 'Drag the portrait or enemy card to adjust anchors. Ability damage, HP loss, and enemy feedback are timed to the impact cue.',
  roleId = 'sage',
  playerName = 'You',
  enemyName = 'Ashen Wolf',
  enemyLevel = 3,
  enemyHpMax,
  abilityLabel,
  abilityIcon,
  abilitySubtitle,
  damageAmount,
}: VfxPreviewScreenProps) => {
  const router = useRouter();
  const ability = COMBAT.abilities[roleId];
  const sequenceOptions = useMemo(() => listEffectSequences(), []);
  const [selectedSequenceId, setSelectedSequenceId] = useState(sequenceId);
  const selectedSequence = useMemo(
    () => getEffectSequence(selectedSequenceId),
    [selectedSequenceId],
  );
  const resolvedDamageAmount = damageAmount ?? ability?.damage ?? 0;
  const resolvedEnemyHpMax = enemyHpMax ?? Math.max(resolvedDamageAmount * 4, 18);
  const resolvedAbilityLabel =
    abilityLabel ??
    getSequenceAbilityLabel(
      selectedSequenceId,
      selectedSequence?.label ?? null,
      ability?.label ?? 'Ability',
    );
  const resolvedAbilityIcon =
    abilityIcon ?? getSequenceAbilityIcon(selectedSequenceId, ability?.icon ?? '✨');
  const resolvedAbilitySubtitle =
    abilitySubtitle ?? selectedSequence?.label ?? ability?.subtitle ?? 'Preview cast';

  const stageRef = useRef<View>(null);
  const timeoutIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const floatingIdRef = useRef(0);
  const stageBoundsRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const enemyShake = useSharedValue(0);
  const enemyFlash = useSharedValue(0);

  const [instances, setInstances] = useState<EffectInstance[]>([]);
  const [enemyHp, setEnemyHp] = useState(resolvedEnemyHpMax);
  const [enemyHits, setEnemyHits] = useState<FloatingHit[]>([]);
  const [stageReady, setStageReady] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [anchors, setAnchors] = useState<{ caster: Point; target: Point }>({
    caster: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
  });

  useEffect(() => {
    setSelectedSequenceId(sequenceId);
  }, [sequenceId]);

  useEffect(() => {
    setEnemyHp(resolvedEnemyHpMax);
  }, [resolvedEnemyHpMax]);

  const clearTimers = useCallback(() => {
    for (const timeoutId of timeoutIdsRef.current) {
      clearTimeout(timeoutId);
    }
    timeoutIdsRef.current = [];
  }, []);

  const queueLocalTimeout = useCallback((callback: () => void, delayMs: number) => {
    const timeoutId = setTimeout(callback, Math.max(0, delayMs));
    timeoutIdsRef.current.push(timeoutId);
  }, []);

  const resetPreviewPlayback = useCallback(() => {
    clearTimers();
    setInstances([]);
    setEnemyHits([]);
    setIsCasting(false);
  }, [clearTimers]);

  useEffect(() => clearTimers, [clearTimers]);

  const refreshStageBounds = useCallback((onMeasured?: () => void) => {
    stageRef.current?.measureInWindow((x, y, width, height) => {
      stageBoundsRef.current = { x, y, width, height };
      onMeasured?.();
    });
  }, []);

  const updateAnchorFromPage = useCallback((anchor: AnchorKey, pageX: number, pageY: number) => {
    const bounds = stageBoundsRef.current;
    if (!bounds.width || !bounds.height) return;

    setAnchors((current) => ({
      ...current,
      [anchor]: {
        x: clamp(pageX - bounds.x, 0, bounds.width),
        y: clamp(pageY - bounds.y, 0, bounds.height),
      },
    }));
  }, []);

  const handleStageLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      const defaults = getDefaultAnchors(width, height);

      setStageReady(true);
      setAnchors((current) => {
        const shouldReset =
          (!current.caster.x && !current.caster.y && !current.target.x && !current.target.y) ||
          !stageBoundsRef.current.width;

        if (shouldReset) {
          return defaults;
        }

        const previous = stageBoundsRef.current;
        return {
          caster: {
            x: previous.width ? (current.caster.x / previous.width) * width : defaults.caster.x,
            y: previous.height ? (current.caster.y / previous.height) * height : defaults.caster.y,
          },
          target: {
            x: previous.width ? (current.target.x / previous.width) * width : defaults.target.x,
            y: previous.height ? (current.target.y / previous.height) * height : defaults.target.y,
          },
        };
      });

      requestAnimationFrame(() => {
        refreshStageBounds();
      });
    },
    [refreshStageBounds],
  );

  const playLocalEffect = useCallback(
    (assetId: string, options: Omit<EffectInstance, 'assetId' | 'instanceId'>) => {
      const instance = createEffectInstance(assetId, options);
      if (!instance) {
        return null;
      }

      setInstances((current) => [...current, instance]);
      return instance.instanceId;
    },
    [],
  );

  const handleComplete = useCallback((instanceId: string) => {
    setInstances((current) => current.filter((instance) => instance.instanceId !== instanceId));
  }, []);

  const pushEnemyHit = useCallback(
    (text: string, color: string) => {
      floatingIdRef.current += 1;
      const id = floatingIdRef.current;
      setEnemyHits((current) => [...current, { id, text, color }]);
      queueLocalTimeout(() => {
        setEnemyHits((current) => current.filter((entry) => entry.id !== id));
      }, FLOATING_LIFETIME_MS);
    },
    [queueLocalTimeout],
  );

  const triggerEnemyImpactFeedback = useCallback(() => {
    enemyFlash.value = withSequence(
      withTiming(1, { duration: 80 }),
      withTiming(0, { duration: 100 }),
      withTiming(0.8, { duration: 80 }),
      withTiming(0, { duration: 200 }),
    );

    enemyShake.value = withSequence(
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-8, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );

    if (resolvedDamageAmount > 0) {
      setEnemyHp((current) => Math.max(0, current - resolvedDamageAmount));
      pushEnemyHit(`-${resolvedDamageAmount}`, colors.combatAbilityDamage);
    }
  }, [enemyFlash, enemyShake, pushEnemyHit, resolvedDamageAmount]);

  const handlePlaySequence = useCallback(() => {
    if (!stageReady || isCasting || !selectedSequence) {
      return;
    }

    resetPreviewPlayback();
    setIsCasting(true);
    setEnemyHp((current) => (current <= 0 ? resolvedEnemyHpMax : current));

    const durationMs = playEffectSequence({
      sequenceId: selectedSequenceId,
      caster: anchors.caster,
      target: anchors.target,
      playEffect: playLocalEffect,
      onTimeout: queueLocalTimeout,
    });

    queueLocalTimeout(
      () => {
        triggerEnemyImpactFeedback();
      },
      getImpactDelayMs(selectedSequenceId, impactAssetId),
    );

    queueLocalTimeout(() => {
      setInstances([]);
      setIsCasting(false);
    }, durationMs + 180);
  }, [
    anchors.caster,
    anchors.target,
    impactAssetId,
    isCasting,
    playLocalEffect,
    queueLocalTimeout,
    resetPreviewPlayback,
    resolvedEnemyHpMax,
    selectedSequence,
    selectedSequenceId,
    stageReady,
    triggerEnemyImpactFeedback,
  ]);

  const handleResetTarget = useCallback(() => {
    resetPreviewPlayback();
    setEnemyHp(resolvedEnemyHpMax);
  }, [resetPreviewPlayback, resolvedEnemyHpMax]);

  const casterPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          refreshStageBounds(() => {
            updateAnchorFromPage('caster', event.nativeEvent.pageX, event.nativeEvent.pageY);
          });
        },
        onPanResponderMove: (event) => {
          updateAnchorFromPage('caster', event.nativeEvent.pageX, event.nativeEvent.pageY);
        },
      }),
    [refreshStageBounds, updateAnchorFromPage],
  );

  const targetPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          refreshStageBounds(() => {
            updateAnchorFromPage('target', event.nativeEvent.pageX, event.nativeEvent.pageY);
          });
        },
        onPanResponderMove: (event) => {
          updateAnchorFromPage('target', event.nativeEvent.pageX, event.nativeEvent.pageY);
        },
      }),
    [refreshStageBounds, updateAnchorFromPage],
  );

  const enemyShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: enemyShake.value }],
  }));

  const enemyFlashStyle = useAnimatedStyle(() => ({
    opacity: enemyFlash.value,
  }));

  const handleSelectSequence = useCallback(
    (nextSequenceId: string) => {
      if (nextSequenceId === selectedSequenceId) {
        return;
      }

      resetPreviewPlayback();
      setEnemyHp(resolvedEnemyHpMax);
      setSelectedSequenceId(nextSequenceId);
    },
    [resetPreviewPlayback, resolvedEnemyHpMax, selectedSequenceId],
  );

  return (
    <ScreenContainer>
      <ContentContainer
        style={{ justifyContent: 'center', maxWidth: 560, flex: 1, alignItems: 'stretch' }}
      >
        <Stack gap={12} style={{ width: '100%' }}>
          <Stack gap={4} style={{ paddingHorizontal: 4 }}>
            <Typography variant="h4" style={{ color: colors.combatTitle, textAlign: 'left' }}>
              {title}
            </Typography>
            <Typography
              variant="caption"
              style={{ color: colors.combatWaiting, textAlign: 'left' }}
            >
              {description}
            </Typography>
          </Stack>

          {sequenceOptions.length > 1 ? (
            <Stack gap={8} style={{ paddingHorizontal: 4 }}>
              <Typography
                variant="micro"
                style={{ color: colors.combatWaiting, textAlign: 'left' }}
              >
                Sequence
              </Typography>
              <Stack direction="row" gap={8} wrap="wrap">
                {sequenceOptions.map((sequence) => {
                  const isSelected = sequence.id === selectedSequenceId;

                  return (
                    <Button
                      key={sequence.id}
                      label={sequence.label.replace(/\s+Cast$/i, '')}
                      size="sm"
                      variant={isSelected ? 'selected' : 'ghost'}
                      textured={isSelected}
                      onPress={() => handleSelectSequence(sequence.id)}
                    />
                  );
                })}
              </Stack>
            </Stack>
          ) : null}

          <View ref={stageRef} onLayout={handleStageLayout} style={styles.stage}>
            <View style={styles.stageBackdrop} />

            <Stack gap={4} align="center" style={styles.combatZoneCopy} pointerEvents="none">
              <Typography variant="body" style={styles.combatZoneTitle}>
                Zone de combat
              </Typography>
              <Typography variant="caption" style={styles.combatZoneSubtitle}>
                Vous êtes dans une zone de combat libre
              </Typography>
            </Stack>

            {stageReady ? (
              <>
                <View
                  style={[
                    styles.enemySlot,
                    {
                      left: anchors.target.x - ENEMY_CARD_WIDTH / 2,
                      top: anchors.target.y - ENEMY_CARD_HEIGHT / 2,
                    },
                  ]}
                  {...targetPanResponder.panHandlers}
                >
                  <Animated.View style={[styles.enemyPortraitMotion, enemyShakeStyle]}>
                    <View style={styles.enemyPortraitShell}>
                      <CircularHealthBar
                        hp={enemyHp}
                        hpMax={resolvedEnemyHpMax}
                        size={ENEMY_PORTRAIT_SIZE}
                      />
                      <View style={styles.enemyPortraitFrameShell}>
                        <Image source={portraitFrame} style={styles.enemyPortraitFrame} />
                        <View style={styles.enemyPortraitFill}>
                          <Typography variant="h3" style={styles.enemyPortraitGlyph}>
                            {getEnemyGlyph(enemyName)}
                          </Typography>
                        </View>
                        <Animated.View
                          pointerEvents="none"
                          style={[styles.enemyPortraitFlash, enemyFlashStyle]}
                        />
                      </View>
                    </View>

                    <Typography variant="fine" style={styles.enemyName}>
                      {enemyName}
                    </Typography>
                    <Typography variant="micro" style={styles.enemyStats}>
                      Lv.{enemyLevel} · {enemyHp}/{resolvedEnemyHpMax}
                    </Typography>
                  </Animated.View>
                </View>

                <View
                  style={[
                    styles.playerSlot,
                    {
                      left: anchors.caster.x - RING_SIZE / 2,
                      top: anchors.caster.y - RING_SIZE / 2,
                    },
                  ]}
                  {...casterPanResponder.panHandlers}
                >
                  <View style={styles.playerPortraitShell}>
                    <CircularHealthBar
                      hp={COMBAT.baseHpByRole[roleId]}
                      hpMax={COMBAT.baseHpByRole[roleId]}
                      size={RING_SIZE}
                    />
                    <Portrait
                      source={portraitByRole(roleId)}
                      size={PORTRAIT_SIZE}
                      highlighted
                      highlightColor={colors.intentConfirmedBorder}
                      hideName
                    />
                  </View>
                  <Typography variant="fine" style={styles.playerName}>
                    {playerName}
                  </Typography>
                  <Typography variant="micro" style={styles.playerHp}>
                    {COMBAT.baseHpByRole[roleId]}/{COMBAT.baseHpByRole[roleId]}
                  </Typography>
                </View>
              </>
            ) : null}

            <View pointerEvents="none" style={styles.stageEffects}>
              {instances.map((instance) => (
                <EffectPlayer
                  key={instance.instanceId}
                  instance={instance}
                  onComplete={handleComplete}
                />
              ))}
            </View>

            {stageReady ? (
              <View pointerEvents="none" style={styles.feedbackLayer}>
                <View
                  style={[
                    styles.enemyDamageSlot,
                    {
                      left: anchors.target.x - 44,
                      top: anchors.target.y - 32,
                    },
                  ]}
                >
                  {enemyHits.map((entry) => (
                    <FloatingDamage key={entry.id} text={entry.text} color={entry.color} />
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        </Stack>
      </ContentContainer>

      <BottomSheet size="sm">
        <ActionButton
          label={resolvedAbilityLabel}
          icon={resolvedAbilityIcon}
          subtitle={resolvedAbilitySubtitle}
          disabled={!stageReady || isCasting}
          onPress={handlePlaySequence}
        />

        <Stack direction="row" gap={8}>
          <Button
            label="Reset Target"
            size="sm"
            variant="ghost"
            textured={false}
            onPress={handleResetTarget}
            style={{ flex: 1 }}
          />
          <Button
            label="Back"
            size="sm"
            variant="ghost"
            textured={false}
            onPress={() => router.back()}
            style={{ flex: 1 }}
          />
        </Stack>
      </BottomSheet>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  stage: {
    height: 540,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.tabBorder,
    backgroundColor: colors.backgroundDark,
    position: 'relative',
  },
  stageBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#140e09',
  },
  combatZoneCopy: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    zIndex: 0,
  },
  combatZoneTitle: {
    color: colors.combatTitle,
    fontWeight: '700',
    fontSize: 15,
    textAlign: 'center',
  },
  combatZoneSubtitle: {
    color: colors.combatWaiting,
    textAlign: 'center',
  },
  enemySlot: {
    position: 'absolute',
    width: ENEMY_CARD_WIDTH,
    zIndex: 1,
    alignItems: 'center',
  },
  enemyPortraitMotion: {
    alignItems: 'center',
  },
  enemyPortraitShell: {
    width: ENEMY_PORTRAIT_SIZE,
    height: ENEMY_PORTRAIT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enemyPortraitFrameShell: {
    width: ENEMY_PORTRAIT_SIZE - 8,
    height: ENEMY_PORTRAIT_SIZE - 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enemyPortraitFrame: {
    width: '100%',
    height: '100%',
  },
  enemyPortraitFill: {
    position: 'absolute',
    width: '78%',
    height: '78%',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.combatEnemySelectedBg,
    borderWidth: 1.5,
    borderColor: colors.combatEnemyFill,
  },
  enemyPortraitGlyph: {
    color: colors.combatTitle,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  enemyPortraitFlash: {
    position: 'absolute',
    width: '78%',
    height: '78%',
    borderRadius: 999,
    backgroundColor: colors.combatDamage,
    opacity: 0,
  },
  enemyName: {
    color: colors.combatTitle,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  enemyStats: {
    color: colors.combatHealthValue,
    fontWeight: '700',
  },
  playerSlot: {
    position: 'absolute',
    width: 112,
    alignItems: 'center',
    zIndex: 1,
  },
  playerPortraitShell: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerName: {
    color: colors.intentConfirmedBorder,
    fontWeight: '700',
    marginTop: 4,
  },
  playerHp: {
    color: colors.combatHeal,
    fontWeight: '700',
  },
  stageEffects: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  feedbackLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3,
  },
  enemyDamageSlot: {
    position: 'absolute',
    width: 88,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default VfxPreviewScreen;
