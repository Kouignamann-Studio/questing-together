import fireballImpactData from '@/features/vfx/assets/effects/fireball-impact.json';
import fireballTravelData from '@/features/vfx/assets/effects/fireball-travel.json';
import type { EffectAsset } from '@/features/vfx/types/assets';

const effectAssets = [fireballTravelData, fireballImpactData] as EffectAsset[];

const effectAssetById = new Map(effectAssets.map((asset) => [asset.id, asset]));

export function getEffectAsset(assetId: string) {
  return effectAssetById.get(assetId) ?? null;
}

export function listEffectAssets() {
  return effectAssets;
}
