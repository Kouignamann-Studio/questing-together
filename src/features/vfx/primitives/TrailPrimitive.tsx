import Animated, { type SharedValue, useAnimatedProps } from 'react-native-reanimated';
import { Circle, Defs, Mask, Rect, Image as SvgImage } from 'react-native-svg';
import { sampleLayerTrack, sampleMotionPosition } from '@/features/vfx/runtime/sampleTrack';
import { getVfxSpriteSource } from '@/features/vfx/runtime/spriteRegistry';
import type { EffectAsset, TrailLayer } from '@/features/vfx/types/assets';
import type { EffectInstance } from '@/features/vfx/types/runtime';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedImage = Animated.createAnimatedComponent(SvgImage);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

type TrailSegmentProps = {
  asset: EffectAsset;
  instance: EffectInstance;
  layer: TrailLayer;
  progress: SharedValue<number>;
  index: number;
};

function sampleSegmentValues(
  asset: EffectAsset,
  instance: EffectInstance,
  layer: TrailLayer,
  progress: number,
  index: number,
) {
  'worklet';

  const falloff = layer.falloff ?? 0.1;
  const segmentProgress = Math.max(0, progress - index * layer.spacing);
  const base = sampleMotionPosition(asset, instance, segmentProgress);
  const x = base.x + sampleLayerTrack(layer, 'x', segmentProgress, 0);
  const y = base.y + sampleLayerTrack(layer, 'y', segmentProgress, 0);
  const scale = sampleLayerTrack(layer, 'scale', segmentProgress, 1);
  const alpha = sampleLayerTrack(layer, 'alpha', segmentProgress, 1);
  const sizeFactor = Math.max(0.1, 1 - index * falloff);

  return {
    x,
    y,
    scale,
    sizeFactor,
    opacity: Math.max(0, alpha * (0.65 - index * (falloff * 0.9))),
  };
}

const FillTrailSegment = ({ asset, instance, layer, progress, index }: TrailSegmentProps) => {
  const animatedProps = useAnimatedProps(() => {
    const values = sampleSegmentValues(asset, instance, layer, progress.value, index);
    const radius = Math.max(1, layer.radius * values.scale * values.sizeFactor);

    return {
      cx: values.x,
      cy: values.y,
      r: radius,
      opacity: values.opacity,
    };
  });

  return <AnimatedCircle animatedProps={animatedProps} fill={layer.color} />;
};

const SpriteTrailSegment = ({ asset, instance, layer, progress, index }: TrailSegmentProps) => {
  const source = getVfxSpriteSource(layer.spriteId ?? '');
  const maskId = `vfx-trail-mask-${instance.instanceId}-${layer.id}-${index}`;

  const imageProps = useAnimatedProps(() => {
    const values = sampleSegmentValues(asset, instance, layer, progress.value, index);
    const width = Math.max(1, (layer.width ?? layer.radius * 2) * values.scale * values.sizeFactor);
    const height = Math.max(
      1,
      (layer.height ?? layer.radius * 2) * values.scale * values.sizeFactor,
    );

    return {
      x: values.x - width / 2,
      y: values.y - height / 2,
      width,
      height,
    };
  });

  const displayProps = useAnimatedProps(() => {
    const values = sampleSegmentValues(asset, instance, layer, progress.value, index);
    const width = Math.max(1, (layer.width ?? layer.radius * 2) * values.scale * values.sizeFactor);
    const height = Math.max(
      1,
      (layer.height ?? layer.radius * 2) * values.scale * values.sizeFactor,
    );

    return {
      x: values.x - width / 2,
      y: values.y - height / 2,
      width,
      height,
      opacity: values.opacity,
    };
  });

  if (!source) return null;

  if (layer.tintColor) {
    return (
      <>
        <Defs>
          <Mask id={maskId} maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse">
            <AnimatedImage
              animatedProps={imageProps}
              href={source}
              preserveAspectRatio="xMidYMid meet"
            />
          </Mask>
        </Defs>
        <AnimatedRect
          animatedProps={displayProps}
          fill={layer.tintColor}
          mask={`url(#${maskId})`}
        />
      </>
    );
  }

  return (
    <AnimatedImage animatedProps={displayProps} href={source} preserveAspectRatio="xMidYMid meet" />
  );
};

const TrailSegment = (props: TrailSegmentProps) => {
  if (props.layer.spriteId) {
    return <SpriteTrailSegment {...props} />;
  }

  return <FillTrailSegment {...props} />;
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
