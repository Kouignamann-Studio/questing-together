import type { ConvergenceEffect, Trait, TraitMeta } from '@/features/gameConfig/cardTypes';
import type { RoleId } from '@/types/player';

// ─── All trait definitions ─────────────────────────────────────

const TRAITS: TraitMeta[] = [
  // Warrior
  { id: 'rage', name: 'Rage', icon: '🔥', color: '#e63946' },
  { id: 'iron', name: 'Iron', icon: '🛡️', color: '#5b9bd5' },
  { id: 'blood', name: 'Blood', icon: '🩸', color: '#9b59b6' },
  { id: 'thunder', name: 'Thunder', icon: '⚡', color: '#f4d03f' },
  // Sage
  { id: 'fire', name: 'Fire', icon: '🔥', color: '#ff6b35' },
  { id: 'frost', name: 'Frost', icon: '❄️', color: '#00bcd4' },
  { id: 'storm', name: 'Storm', icon: '⚡', color: '#ffc107' },
  { id: 'arcane', name: 'Arcane', icon: '🔮', color: '#7e57c2' },
  // Ranger
  { id: 'shadow', name: 'Shadow', icon: '🌑', color: '#7e57c2' },
  { id: 'nature', name: 'Nature', icon: '🌿', color: '#66bb6a' },
  { id: 'precision', name: 'Precision', icon: '🎯', color: '#eceff1' },
  { id: 'venom', name: 'Venom', icon: '🧪', color: '#8bc34a' },
  // Neutral
  { id: 'neutral', name: 'Neutral', icon: '⚪', color: '#9e9e9e' },
];

const TRAIT_MAP: Record<string, TraitMeta> = Object.fromEntries(TRAITS.map((t) => [t.id, t]));

// ─── Schools per character ─────────────────────────────────────

const SCHOOLS_BY_ROLE: Record<RoleId, Trait[]> = {
  warrior: ['rage', 'iron', 'blood', 'thunder'],
  sage: ['fire', 'frost', 'storm', 'arcane'],
  ranger: ['shadow', 'nature', 'precision', 'venom'],
};

const getSchoolsForRole = (roleId: RoleId): TraitMeta[] =>
  SCHOOLS_BY_ROLE[roleId].map((id) => TRAIT_MAP[id]);

// ─── Convergence effects ───────────────────────────────────────

const CONVERGENCE_BY_TRAIT: Record<string, ConvergenceEffect> = {
  // Warrior
  rage: { trait: 'rage', base: { damage: 16 }, scalePerUpgradeRank: 0.08 },
  iron: { trait: 'iron', base: { block: 14, persistBlock: true }, scalePerUpgradeRank: 0.08 },
  blood: { trait: 'blood', base: { heal: 12 }, scalePerUpgradeRank: 0.08 },
  thunder: { trait: 'thunder', base: { vulnerable: 2, weakened: 2 }, scalePerUpgradeRank: 0.08 },
  // Sage
  fire: { trait: 'fire', base: { damage: 16 }, scalePerUpgradeRank: 0.08 },
  frost: { trait: 'frost', base: { block: 14, weakened: 1 }, scalePerUpgradeRank: 0.08 },
  storm: { trait: 'storm', base: { damage: 12 }, scalePerUpgradeRank: 0.08 },
  arcane: { trait: 'arcane', base: { heal: 8, block: 6 }, scalePerUpgradeRank: 0.08 },
  // Ranger
  shadow: { trait: 'shadow', base: { vulnerable: 2, weakened: 2 }, scalePerUpgradeRank: 0.08 },
  nature: { trait: 'nature', base: { heal: 12 }, scalePerUpgradeRank: 0.08 },
  precision: { trait: 'precision', base: { damage: 16 }, scalePerUpgradeRank: 0.08 },
  venom: { trait: 'venom', base: { damage: 8, burn: 8 }, scalePerUpgradeRank: 0.08 },
};

const CONVERGENCE_COUNT_MULTIPLIERS: Record<string, number> = {
  twoTraits: 1,
  threeTraits: 1.5,
  fourTraits: 2,
};

const getConvergenceMultiplier = (empoweredCount: number): number => {
  if (empoweredCount >= 4) return CONVERGENCE_COUNT_MULTIPLIERS.fourTraits;
  if (empoweredCount >= 3) return CONVERGENCE_COUNT_MULTIPLIERS.threeTraits;
  return CONVERGENCE_COUNT_MULTIPLIERS.twoTraits;
};

export {
  CONVERGENCE_BY_TRAIT,
  CONVERGENCE_COUNT_MULTIPLIERS,
  getConvergenceMultiplier,
  getSchoolsForRole,
  SCHOOLS_BY_ROLE,
  TRAIT_MAP,
  TRAITS,
};
