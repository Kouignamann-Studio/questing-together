import { useState } from 'react';
import { ActionButton, Stack } from '@/components';
import { useGame } from '@/contexts/GameContext';
import type { RoleId } from '@/types/player';

const ABILITY_COOLDOWN = 5;
const HEAL_COOLDOWN = 3;

type AbilityConfig = {
  label: string;
  icon: string;
  subtitle: string;
  damage: number;
  aoe: boolean;
};

const ABILITIES: Record<RoleId, AbilityConfig> = {
  warrior: { label: 'Taunt', icon: '🛡️', subtitle: 'Taunt 3 turns', damage: 0, aoe: false },
  sage: { label: 'Fireball', icon: '🔥', subtitle: '20 Damage', damage: 20, aoe: false },
  ranger: { label: 'Arrows', icon: '🏹', subtitle: '7 Damage AoE', damage: 7, aoe: true },
};

type CombatActionGridProps = {
  onAttack: () => void;
  onAbility: () => void;
  onHeal: () => void;
};

const CombatActionGrid = ({ onAttack, onAbility, onHeal }: CombatActionGridProps) => {
  const { localRole, roomConnection } = useGame();
  const [abilityCooldown, setAbilityCooldown] = useState(0);
  const [healCooldown, setHealCooldown] = useState(0);

  const ability = localRole ? ABILITIES[localRole] : null;

  const handleAttack = () => {
    onAttack();
    setAbilityCooldown((c) => Math.max(0, c - 1));
    setHealCooldown((c) => Math.max(0, c - 1));
  };

  const handleAbility = () => {
    if (abilityCooldown > 0) return;
    onAbility();
    setAbilityCooldown(ABILITY_COOLDOWN);
    setHealCooldown((c) => Math.max(0, c - 1));
  };

  const handleHeal = () => {
    if (healCooldown > 0) return;
    onHeal();
    setHealCooldown(HEAL_COOLDOWN);
    setAbilityCooldown((c) => Math.max(0, c - 1));
  };

  const handleLeave = () => {
    void roomConnection.cancelAdventure();
  };

  return (
    <Stack gap={8}>
      <Stack direction="row" gap={8}>
        <ActionButton label="Attack" icon="⚔️" subtitle="10 Damage" onPress={handleAttack} />
        <ActionButton
          label={ability?.label ?? 'Ability'}
          icon={ability?.icon ?? '✨'}
          subtitle={ability?.subtitle ?? ''}
          disabled={abilityCooldown > 0}
          cooldownText={
            abilityCooldown > 0
              ? `cd: ${ABILITY_COOLDOWN - abilityCooldown}/${ABILITY_COOLDOWN}`
              : undefined
          }
          onPress={handleAbility}
        />
      </Stack>
      <Stack direction="row" gap={8}>
        <ActionButton
          label="Heal"
          icon="💚"
          subtitle="Heal 10 HP"
          disabled={healCooldown > 0}
          cooldownText={
            healCooldown > 0 ? `cd: ${HEAL_COOLDOWN - healCooldown}/${HEAL_COOLDOWN}` : undefined
          }
          onPress={handleHeal}
        />
        <ActionButton
          label="Run away"
          icon="🏃"
          subtitle="Leave Room"
          variant="danger"
          disabled={roomConnection.isBusy}
          onPress={handleLeave}
        />
      </Stack>
    </Stack>
  );
};

export default CombatActionGrid;
