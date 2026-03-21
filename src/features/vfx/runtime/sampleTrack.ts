import type {
  EffectAsset,
  EffectKeyframe,
  EffectLayer,
  EffectTrackName,
} from '@/features/vfx/types/assets';
import type { EffectInstance } from '@/features/vfx/types/runtime';

function clamp01(value: number) {
  'worklet';
  return Math.max(0, Math.min(1, value));
}

function lerp(start: number, end: number, amount: number) {
  'worklet';
  return start + (end - start) * amount;
}

export function sampleTrack(track: EffectKeyframe[] | undefined, progress: number, fallback = 0) {
  'worklet';

  if (!track || track.length === 0) return fallback;

  const clampedProgress = clamp01(progress);

  if (clampedProgress <= track[0].at) {
    return track[0].value;
  }

  const lastKeyframe = track[track.length - 1];
  if (clampedProgress >= lastKeyframe.at) {
    return lastKeyframe.value;
  }

  for (let index = 1; index < track.length; index += 1) {
    const current = track[index];
    const previous = track[index - 1];

    if (clampedProgress > current.at) {
      continue;
    }

    const span = current.at - previous.at;
    if (span <= 0) {
      return current.value;
    }

    const localProgress = (clampedProgress - previous.at) / span;
    return lerp(previous.value, current.value, localProgress);
  }

  return lastKeyframe.value;
}

export function sampleLayerTrack(
  layer: EffectLayer,
  name: EffectTrackName,
  progress: number,
  fallback = 0,
) {
  'worklet';
  return sampleTrack(layer.tracks?.[name], progress, fallback);
}

export function sampleMotionPosition(
  asset: EffectAsset,
  instance: EffectInstance,
  progress: number,
) {
  'worklet';

  if (
    (asset.motion?.mode === 'line' || asset.motion?.mode === 'path') &&
    instance.targetX != null &&
    instance.targetY != null
  ) {
    const travel = sampleTrack(asset.motion.tracks?.travel, progress, progress);
    const base = {
      x: lerp(instance.x, instance.targetX, travel),
      y: lerp(instance.y, instance.targetY, travel),
    };

    if (asset.motion.mode === 'path') {
      return {
        x: base.x + sampleTrack(asset.motion.tracks?.x, progress, 0),
        y: base.y + sampleTrack(asset.motion.tracks?.y, progress, 0),
      };
    }

    return base;
  }

  if (asset.motion?.mode === 'path') {
    return {
      x: instance.x + sampleTrack(asset.motion.tracks?.x, progress, 0),
      y: instance.y + sampleTrack(asset.motion.tracks?.y, progress, 0),
    };
  }

  return {
    x: instance.x,
    y: instance.y,
  };
}
