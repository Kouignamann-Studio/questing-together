import type { RoleId } from '@/types/player';

export const COMBAT = {
  attackDamage: 3,
  healAmount: 10,
  abilityCooldown: 5,
  healCooldown: 3,
  abilities: {
    warrior: { label: 'Taunt', icon: '🛡️', subtitle: 'Taunt 3 turns', damage: 0, aoe: false },
    sage: { label: 'Fireball', icon: '🔥', subtitle: '6 Damage', damage: 6, aoe: false },
    ranger: { label: 'Arrows', icon: '🏹', subtitle: '3 Damage AoE', damage: 3, aoe: true },
  } satisfies Record<
    RoleId,
    { label: string; icon: string; subtitle: string; damage: number; aoe: boolean }
  >,
} as const;
