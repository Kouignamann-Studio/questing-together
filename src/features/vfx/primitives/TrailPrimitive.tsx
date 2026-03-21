import Animated, { type SharedValue, useAnimatedProps } from 'react-native-reanimated';
import { Circle } from 'react-native-svg';
import { sampleLayerTrack, sampleMotionPosition } from '@/features/vfx/runtime/sampleTrack';
import type { EffectAsset, TrailLayer } from '@/features/vfx/types/assets';
import type { EffectInstance } from '@/features/vfx/types/runtime';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type TrailSegmentProps = {
  asset: EffectAsset;
  instance: EffectInstance;
  layer: TrailLayer;
  progress: SharedValue<number>;
  index: number;
};

const TrailSegment = ({ asset, instance, layer, progress, index }: TrailSegmentProps) => {
  const falloff = layer.falloff ?? 0.1;

  const animatedProps = useAnimatedProps(() => {
    const segmentProgress = Math.max(0, progress.value - index * layer.spacing);
    const base = sampleMotionPosition(asset, instance, segmentProgress);
    const x = base.x + sampleLayerTrack(layer, 'x', segmentProgress, 0);
    const y = base.y + sampleLayerTrack(layer, 'y', segmentProgress, 0);
    const scale = sampleLayerTrack(layer, 'scale', segmentProgress, 1);
    const alpha = sampleLayerTrack(layer, 'alpha', segmentProgress, 1);
    const segmentRadius = layer.radius * scale * (1 - index * falloff);

    return {
      cx: x,
      cy: y,
      r: Math.max(1, segmentRadius),
      opacity: Math.max(0, alpha * (0.65 - index * (falloff * 0.9))),
    };
  });

  return <AnimatedCircle animatedProps={animatedProps} fill={layer.color} />;
};

type TrailPrimitiveProps = {
  asset: EffectAsset;
  instance: EffectInstance;
  layer: TrailLayer;
  progress: SharedValue<number>;
};

const TrailPrimitive = ({ asset, instance, layer, progress }: TrailPrimitiveProps) => {
  return Array.from({ length: layer.segments }, (_, index) => (
    <TrailSegment
      key={`${layer.id}-${index}`}
      asset={asset}
      instance={instance}
      layer={layer}
      progress={progress}
      index={index}
    />
  ));
};

export default TrailPrimitive;
