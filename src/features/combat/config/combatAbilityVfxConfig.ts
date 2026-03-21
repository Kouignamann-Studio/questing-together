import type { RoleId } from '@/types/player';

type ProjectileAbilityVfxConfig = {
  kind: 'projectile';
  travelAssetId: string;
  impactAssetId: string;
};

type ImpactAbilityVfxConfig = {
  kind: 'impact';
  impactAssetId: string;
};

export type CombatAbilityVfxConfig = ProjectileAbilityVfxConfig | ImpactAbilityVfxConfig;

export const combatAbilityVfxConfig: Partial<Record<RoleId, CombatAbilityVfxConfig>> = {
  sage: {
    kind: 'projectile',
    travelAssetId: 'fireball-travel',
    impactAssetId: 'fireball-impact',
  },
  ranger: {
    kind: 'impact',
    impactAssetId: 'frostbolt-impact',
  },
};
