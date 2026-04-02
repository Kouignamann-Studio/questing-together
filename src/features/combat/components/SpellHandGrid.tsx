import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Stack, Typography } from '@/components';
import { colors } from '@/constants/colors';
import { COMBAT } from '@/constants/combatSettings';
import { useTranslation } from '@/contexts/I18nContext';
import SchoolChargeBar from '@/features/combat/components/SchoolChargeBar';
import CardView from '@/features/combat/components/SpellCard';
import { getCardById, getIdentityById, getSchoolsForRole } from '@/features/gameConfig';
import type { RoleId } from '@/types/player';
import type { PlayerCombatState } from '@/types/spellCombat';

const VISIBLE_HAND_SIZE = 4;

type CardHandGridProps = {
  combatState: PlayerCombatState;
  roleId: RoleId;
  disabled?: boolean;
  hideCards?: boolean;
  onPlayCard: (handIndex: number, targetEnemyIdx?: number | null) => void;
  onConvergence: () => void;
  onEndTurn: () => void;
  onReroll: () => void;
  onLeaveRoom: () => void;
  selectedEnemyIdx: number | null;
};

const CardHandGrid = ({
  combatState,
  roleId,
  disabled = false,
  hideCards = false,
  onPlayCard,
  onConvergence,
  onEndTurn,
  onReroll,
  onLeaveRoom,
  selectedEnemyIdx,
}: CardHandGridProps) => {
  const { t } = useTranslation();
  // Optimistic tracking
  const [localPlayedIndices, setLocalPlayedIndices] = useState<number[]>([]);
  // Lock to prevent spam — one card at a time
  const playLockRef = useRef(false);
  // Reroll: show first 4 cards, reroll swaps to remaining cards
  const [rerolled, setRerolled] = useState(false);

  // Reset optimistic state when hand changes
  const prevHandRef = useRef(JSON.stringify(combatState.hand));
  const prevEnergyRef = useRef(combatState.energy);
  useEffect(() => {
    const serialized = JSON.stringify(combatState.hand);
    const isNewTurn =
      combatState.energy === combatState.maxEnergy && prevEnergyRef.current !== combatState.energy;
    prevEnergyRef.current = combatState.energy;
    if (serialized !== prevHandRef.current) {
      prevHandRef.current = serialized;
      setLocalPlayedIndices([]);
      playLockRef.current = false;
      // Only reset reroll on new turn, not on reroll response
      if (isNewTurn) {
        setRerolled(false);
      }
    }
  }, [combatState.hand, combatState.energy, combatState.maxEnergy]);

  const identity = getIdentityById(combatState.identityId);

  // Count empowered traits
  const empoweredCount = Object.values(combatState.traitCharges).filter(
    (c) => c >= COMBAT.empowerThreshold,
  ).length;
  const canConverge = empoweredCount >= COMBAT.convergenceRequiredTraits;

  const handleCardPress = useCallback(
    (handIndex: number) => {
      if (playLockRef.current) return;
      if (localPlayedIndices.includes(handIndex)) return;
      const instance = combatState.hand[handIndex];
      if (!instance) return;
      const card = getCardById(instance.cardId);
      if (!card || combatState.energy < card.cost) return;

      playLockRef.current = true;
      setLocalPlayedIndices((prev) => [...prev, handIndex]);

      onPlayCard(handIndex, card.baseDamage && card.baseDamage > 0 ? selectedEnemyIdx : null);

      // Safety: unlock after 1.5s in case server response is slow
      const timer = setTimeout(() => {
        playLockRef.current = false;
      }, 1500);
      return () => clearTimeout(timer);
    },
    [combatState, localPlayedIndices, selectedEnemyIdx, onPlayCard],
  );

  // Schools for this character's role
  const schools = getSchoolsForRole(roleId);

  // Filter out played cards
  const availableCards = combatState.hand
    .map((instance, idx) => ({ instance, idx }))
    .filter(({ idx }) => !localPlayedIndices.includes(idx));

  const visibleCards = availableCards.slice(0, VISIBLE_HAND_SIZE);

  return (
    <Stack gap={10}>
      {/* Resource bar: energy + trait charges */}
      <SchoolChargeBar
        energy={combatState.energy}
        maxEnergy={combatState.maxEnergy}
        schools={schools}
        schoolCharges={combatState.traitCharges}
        onEndTurn={onEndTurn}
        endTurnDisabled={disabled}
        endTurnLabel={t('combat.endTurn')}
      />

      {/* Card hand: hidden during enemy phase / ended turn */}
      {!hideCards ? (
        <Stack direction="row" gap={8} justify="center" style={{ paddingTop: 4 }}>
          {visibleCards.map(({ instance, idx }) => {
            const card = getCardById(instance.cardId);
            if (!card) return null;
            return (
              <CardView
                key={`${instance.cardId}-${idx}`}
                instance={instance}
                traitCharge={combatState.traitCharges[card.trait] ?? 0}
                canAfford={combatState.energy >= card.cost}
                disabled={disabled}
                onPress={() => handleCardPress(idx)}
              />
            );
          })}
        </Stack>
      ) : null}

      {/* Convergence banner */}
      {canConverge && identity && !hideCards ? (
        <Pressable onPress={onConvergence} disabled={disabled}>
          <View
            style={{
              padding: 10,
              borderRadius: 10,
              borderWidth: 1.5,
              borderColor: colors.intentConfirmedBorder,
              backgroundColor: `${colors.intentConfirmedBorder}18`,
              alignItems: 'center',
              gap: 2,
              shadowColor: colors.intentConfirmedBorder,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.7,
              shadowRadius: 14,
            }}
          >
            <Typography
              variant="caption"
              style={{
                color: colors.intentConfirmedBorder,
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: 2,
              }}
            >
              {identity.convergenceActionName}
            </Typography>
            <Typography variant="micro" style={{ color: colors.textSecondary }}>
              {t('combat.traitsEmpowered', { count: empoweredCount })} — {t('combat.freeAction')}
            </Typography>
          </View>
        </Pressable>
      ) : null}

      {/* Bottom row: Reroll (75%) + Leave (25%) */}
      <Stack direction="row" gap={8}>
        <Pressable
          onPress={() => {
            setRerolled(true);
            setLocalPlayedIndices([]);
            onReroll();
          }}
          disabled={disabled || rerolled}
          style={{
            flex: 3,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            paddingVertical: 10,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: disabled || rerolled ? `${colors.tabBorder}44` : colors.tabBorder,
            backgroundColor: colors.backgroundCombat,
            opacity: disabled || rerolled ? 0.4 : 1,
          }}
        >
          <Typography variant="caption" style={{ color: colors.textSecondary, fontSize: 14 }}>
            🔄
          </Typography>
          <Typography variant="caption" style={{ color: colors.textSecondary, fontWeight: '600' }}>
            {t('combat.reroll')} ({rerolled ? 0 : 1})
          </Typography>
        </Pressable>

        <Pressable
          onPress={onLeaveRoom}
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 10,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: `${colors.combatDamage}44`,
            backgroundColor: `${colors.combatDamage}15`,
          }}
        >
          <Typography variant="caption" style={{ color: colors.combatDamage, fontSize: 14 }}>
            🏃
          </Typography>
        </Pressable>
      </Stack>
    </Stack>
  );
};

export default CardHandGrid;
