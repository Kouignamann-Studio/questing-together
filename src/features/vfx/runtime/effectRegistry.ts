import fireBlastImpactData from '@/features/vfx/assets/effects/fire-blast-impact.json';
import fireBlastMuzzleData from '@/features/vfx/assets/effects/fire-blast-muzzle.json';
import fireballImpactData from '@/features/vfx/assets/effects/fireball-impact.json';
import fireballMuzzleData from '@/features/vfx/assets/effects/fireball-muzzle.json';
import fireballTravelData from '@/features/vfx/assets/effects/fireball-travel.json';
import fireballTravelLeftData from '@/features/vfx/assets/effects/fireball-travel_left.json';
import frostboltImpactData from '@/features/vfx/assets/effects/frostbolt-impact.json';
import frostboltMuzzleData from '@/features/vfx/assets/effects/frostbolt-muzzle.json';
import frostboltTravelData from '@/features/vfx/assets/effects/frostbolt-travel.json';
import lightningStrikeImpactData from '@/features/vfx/assets/effects/lightning-strike-impact.json';
import lightningStrikeMuzzleData from '@/features/vfx/assets/effects/lightning-strike-muzzle.json';
import lightningStrikeTravelData from '@/features/vfx/assets/effects/lightning-strike-travel.json';
import sleekSlashImpactData from '@/features/vfx/assets/effects/sleek-slash-impact.json';
import sleekSlashMuzzleData from '@/features/vfx/assets/effects/sleek-slash-muzzle.json';
import type { EffectAsset } from '@/features/vfx/types/assets';

const effectAssets = [
  fireballMuzzleData,
  fireballTravelData,
  fireballTravelLeftData,
  fireballImpactData,
  fireBlastMuzzleData,
  fireBlastImpactData,
  frostboltMuzzleData,
  frostboltTravelData,
  frostboltImpactData,
  lightningStrikeMuzzleData,
  lightningStrikeTravelData,
  lightningStrikeImpactData,
  sleekSlashMuzzleData,
  sleekSlashImpactData,
] as EffectAsset[];

const effectAssetById = new Map(effectAssets.map((asset) => [asset.id, asset]));

export function getEffectAsset(assetId: string) {
  return effectAssetById.get(assetId) ?? null;
}

export function listEffectAssets() {
  return effectAssets;
}
