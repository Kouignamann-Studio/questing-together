import Animated, { type SharedValue, useAnimatedProps } from 'react-native-reanimated';
import { Rect } from 'react-native-svg';
import { sampleLayerTrack, sampleMotionPosition } from '@/features/vfx/runtime/sampleTrack';
import type { EffectAsset, StreakLayer } from '@/features/vfx/types/assets';
import type { EffectInstance } from '@/features/vfx/types/runtime';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

type StreakPrimitiveProps = {
  asset: EffectAsset;
  instance: EffectInstance;
  layer: StreakLayer;
  progress: SharedValue<number>;
};

const StreakPrimitive = ({ asset, instance, layer, progress }: StreakPrimitiveProps) => {
  const animatedProps = useAnimatedProps(() => {
    const base = sampleMotionPosition(asset, instance, progress.value);
    const x = base.x + sampleLayerTrack(layer, 'x', progress.value, 0);
    const y = base.y + sampleLayerTrack(layer, 'y', progress.value, 0);
    const scale = sampleLayerTrack(layer, 'scale', progress.value, 1);
    const alpha = sampleLayerTrack(layer, 'alpha', progress.value, 1);
    const width = Math.max(1, layer.width * scale);
    const height = Math.max(1, layer.height * scale);

    return {
      x: x - width / 2,
      y: y - height / 2,
      width,
      height,
      rx: height / 2,
      ry: height / 2,
      opacity: Math.max(0, alpha),
      transform: `rotate(${layer.rotationDeg ?? 0} ${x} ${y})`,
    };
  });

  return <AnimatedRect animatedProps={animatedProps} fill={layer.color} />;
};

export default StreakPrimitive;
