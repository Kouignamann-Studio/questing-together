import Animated, { type SharedValue, useAnimatedProps } from 'react-native-reanimated';
import { Polygon } from 'react-native-svg';
import { sampleLayerTrack, sampleMotionPosition } from '@/features/vfx/runtime/sampleTrack';
import type { DiamondLayer, EffectAsset } from '@/features/vfx/types/assets';
import type { EffectInstance } from '@/features/vfx/types/runtime';

const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);

type DiamondPrimitiveProps = {
  asset: EffectAsset;
  instance: EffectInstance;
  layer: DiamondLayer;
  progress: SharedValue<number>;
};

function rotatePoint(x: number, y: number, angleRad: number) {
  'worklet';
  return {
    x: x * Math.cos(angleRad) - y * Math.sin(angleRad),
    y: x * Math.sin(angleRad) + y * Math.cos(angleRad),
  };
}

const DiamondPrimitive = ({ asset, instance, layer, progress }: DiamondPrimitiveProps) => {
  const animatedProps = useAnimatedProps(() => {
    const base = sampleMotionPosition(asset, instance, progress.value);
    const x = base.x + sampleLayerTrack(layer, 'x', progress.value, 0);
    const y = base.y + sampleLayerTrack(layer, 'y', progress.value, 0);
    const scale = sampleLayerTrack(layer, 'scale', progress.value, 1);
    const alpha = sampleLayerTrack(layer, 'alpha', progress.value, 1);
    const halfWidth = Math.max(1, (layer.width * scale) / 2);
    const halfHeight = Math.max(1, (layer.height * scale) / 2);
    const angleRad = ((layer.rotationDeg ?? 0) * Math.PI) / 180;
    const points = [
      { x: 0, y: -halfHeight },
      { x: halfWidth, y: 0 },
      { x: 0, y: halfHeight },
      { x: -halfWidth, y: 0 },
    ]
      .map((point) => rotatePoint(point.x, point.y, angleRad))
      .map((point) => `${x + point.x},${y + point.y}`)
      .join(' ');

    return {
      points,
      opacity: Math.max(0, alpha),
    };
  });

  return <AnimatedPolygon animatedProps={animatedProps} fill={layer.color} />;
};

export default DiamondPrimitive;
