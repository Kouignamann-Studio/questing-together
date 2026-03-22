import { getEffectAsset } from '@/features/vfx/runtime/effectRegistry';
import type { EffectInstance, PlayEffectOptions } from '@/features/vfx/types/runtime';

const counter = { value: 0 };

export function createEffectInstance(
  assetId: string,
  options: PlayEffectOptions,
): EffectInstance | null {
  if (!getEffectAsset(assetId)) {
    return null;
  }

  counter.value += 1;

  return {
    assetId,
    instanceId: `${assetId}-${counter.value}`,
    ...options,
  };
}
