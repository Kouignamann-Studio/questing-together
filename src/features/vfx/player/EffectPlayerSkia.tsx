import {
  BlendColor,
  Canvas,
  Circle,
  Group,
  Path,
  RoundedRect,
  Image as SkiaImage,
  useImage,
} from '@shopify/react-native-skia';
import { useEffect, useMemo } from 'react';
import { Platform, Image as RNImage, StyleSheet } from 'react-native';
import {
  cancelAnimation,
  Easing,
  type SharedValue,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { getEffectAsset } from '@/features/vfx/runtime/effectRegistry';
import { sampleLayerTrack, sampleMotionPosition } from '@/features/vfx/runtime/sampleTrack';
import { getVfxSpriteSource } from '@/features/vfx/runtime/spriteRegistry';
import type {
  ArcLayer,
  DiamondLayer,
  EffectAsset,
  EffectLayer,
  OrbLayer,
  RingLayer,
  SpriteLayer,
  StarburstLayer,
  StreakLayer,
  TrailLayer,
} from '@/features/vfx/types/assets';
import type { EffectInstance } from '@/features/vfx/types/runtime';

type EffectPlayerProps = {
  instance: EffectInstance;
  onComplete: (instanceId: string) => void;
};

type SharedLayerMetrics = {
  x: SharedValue<number>;
  y: SharedValue<number>;
  scale: SharedValue<number>;
  alpha: SharedValue<number>;
};

function resolveSkiaDataSource(spriteId: string) {
  const source = getVfxSpriteSource(spriteId);

  if (!source) {
    return null;
  }

  if (typeof source === 'number' || typeof source === 'string') {
    return source;
  }

  if (Array.isArray(source)) {
    const first = source[0];
    if (!first) return null;
    return typeof first === 'number' ? first : (first.uri ?? null);
  }

  return RNImage.resolveAssetSource(source)?.uri ?? null;
}

function rotatePoint(x: number, y: number, angleRad: number) {
  'worklet';

  return {
    x: x * Math.cos(angleRad) - y * Math.sin(angleRad),
    y: x * Math.sin(angleRad) + y * Math.cos(angleRad),
  };
}

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  'worklet';

  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
}

function useLayerMetrics(
  asset: EffectAsset,
  instance: EffectInstance,
  layer: EffectLayer,
  progress: SharedValue<number>,
): SharedLayerMetrics {
  const x = useDerivedValue(() => {
    const base = sampleMotionPosition(asset, instance, progress.value);
    return base.x + sampleLayerTrack(layer, 'x', progress.value, 0);
  });

  const y = useDerivedValue(() => {
    const base = sampleMotionPosition(asset, instance, progress.value);
    return base.y + sampleLayerTrack(layer, 'y', progress.value, 0);
  });

  const scale = useDerivedValue(() => sampleLayerTrack(layer, 'scale', progress.value, 1));
  const alpha = useDerivedValue(() =>
    Math.max(0, sampleLayerTrack(layer, 'alpha', progress.value, 1)),
  );

  return { x, y, scale, alpha };
}

const OrbPrimitiveSkia = ({
  asset,
  instance,
  layer,
  progress,
}: {
  asset: EffectAsset;
  instance: EffectInstance;
  layer: OrbLayer;
  progress: SharedValue<number>;
}) => {
  const { x, y, scale, alpha } = useLayerMetrics(asset, instance, layer, progress);
  const glow = useDerivedValue(() => sampleLayerTrack(layer, 'glow', progress.value, 0));
  const glowRadius = useDerivedValue(
    () => layer.radius * scale.value * (layer.glowScale ?? 2.3) * (1 + glow.value * 0.45),
  );
  const glowOpacity = useDerivedValue(() => Math.max(0, alpha.value * (0.18 + glow.value * 0.35)));
  const coreRadius = useDerivedValue(() => Math.max(1, layer.radius * scale.value));

  return (
    <>
      <Circle
        cx={x}
        cy={y}
        r={glowRadius}
        color={layer.glowColor ?? layer.color}
        opacity={glowOpacity}
      />
      <Circle cx={x} cy={y} r={coreRadius} color={layer.color} opacity={alpha} />
    </>
  );
};

const RingPrimitiveSkia = ({
  asset,
  instance,
  layer,
  progress,
}: {
  asset: EffectAsset;
  instance: EffectInstance;
  layer: RingLayer;
  progress: SharedValue<number>;
}) => {
  const { x, y, scale, alpha } = useLayerMetrics(asset, instance, layer, progress);
  const radius = useDerivedValue(() => Math.max(0.5, layer.radius * scale.value));
  const strokeWidth = useDerivedValue(() => Math.max(1, layer.thickness * scale.value));

  return (
    <Circle
      cx={x}
      cy={y}
      r={radius}
      color={layer.color}
      opacity={alpha}
      style="stroke"
      strokeWidth={strokeWidth}
    />
  );
};

const StreakPrimitiveSkia = ({
  asset,
  instance,
  layer,
  progress,
}: {
  asset: EffectAsset;
  instance: EffectInstance;
  layer: StreakLayer;
  progress: SharedValue<number>;
}) => {
  const { x, y, scale, alpha } = useLayerMetrics(asset, instance, layer, progress);
  const width = useDerivedValue(() => Math.max(1, layer.width * scale.value));
  const height = useDerivedValue(() => Math.max(1, layer.height * scale.value));
  const rectX = useDerivedValue(() => x.value - width.value / 2);
  const rectY = useDerivedValue(() => y.value - height.value / 2);
  const radius = useDerivedValue(() => height.value / 2);
  const origin = useDerivedValue(() => ({ x: x.value, y: y.value }));
  const rotationRad = ((layer.rotationDeg ?? 0) * Math.PI) / 180;

  return (
    <Group origin={origin} transform={[{ rotate: rotationRad }]} opacity={alpha}>
      <RoundedRect
        x={rectX}
        y={rectY}
        width={width}
        height={height}
        r={radius}
        color={layer.color}
      />
    </Group>
  );
};

const DiamondPrimitiveSkia = ({
  asset,
  instance,
  layer,
  progress,
}: {
  asset: EffectAsset;
  instance: EffectInstance;
  layer: DiamondLayer;
  progress: SharedValue<number>;
}) => {
  const { x, y, scale, alpha } = useLayerMetrics(asset, instance, layer, progress);
  const path = useDerivedValue(() => {
    const halfWidth = Math.max(1, (layer.width * scale.value) / 2);
    const halfHeight = Math.max(1, (layer.height * scale.value) / 2);
    const angleRad = ((layer.rotationDeg ?? 0) * Math.PI) / 180;
    const points = [
      { x: 0, y: -halfHeight },
      { x: halfWidth, y: 0 },
      { x: 0, y: halfHeight },
      { x: -halfWidth, y: 0 },
    ]
      .map((point) => rotatePoint(point.x, point.y, angleRad))
      .map((point) => ({ x: x.value + point.x, y: y.value + point.y }));

    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y} L ${points[2].x} ${points[2].y} L ${points[3].x} ${points[3].y} Z`;
  });

  return <Path path={path} color={layer.color} opacity={alpha} />;
};

const ArcPrimitiveSkia = ({
  asset,
  instance,
  layer,
  progress,
}: {
  asset: EffectAsset;
  instance: EffectInstance;
  layer: ArcLayer;
  progress: SharedValue<number>;
}) => {
  const { x, y, scale, alpha } = useLayerMetrics(asset, instance, layer, progress);
  const path = useDerivedValue(() => {
    const radius = Math.max(1, layer.radius * scale.value);
    const startAngle = (layer.rotationDeg ?? -90) - layer.sweepDeg / 2;
    const endAngle = startAngle + layer.sweepDeg;
    const start = polarToCartesian(x.value, y.value, radius, startAngle);
    const end = polarToCartesian(x.value, y.value, radius, endAngle);
    const largeArcFlag = layer.sweepDeg > 180 ? 1 : 0;

    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  });
  const strokeWidth = useDerivedValue(() => Math.max(1, layer.thickness * scale.value));

  return (
    <Path
      path={path}
      color={layer.color}
      opacity={alpha}
      style="stroke"
      strokeWidth={strokeWidth}
      strokeCap="round"
    />
  );
};

const StarburstPrimitiveSkia = ({
  asset,
  instance,
  layer,
  progress,
}: {
  asset: EffectAsset;
  instance: EffectInstance;
  layer: StarburstLayer;
  progress: SharedValue<number>;
}) => {
  const { x, y, scale, alpha } = useLayerMetrics(asset, instance, layer, progress);
  const path = useDerivedValue(() => {
    const innerRadius = Math.max(0.5, layer.innerRadius * scale.value);
    const outerRadius = Math.max(innerRadius + 0.5, layer.outerRadius * scale.value);
    const points = Math.max(3, Math.round(layer.points));
    const rotationRad = ((layer.rotationDeg ?? -90) * Math.PI) / 180;
    const vertices = Array.from({ length: points * 2 }, (_, index) => {
      const radius = index % 2 === 0 ? outerRadius : innerRadius;
      const angle = rotationRad + (Math.PI * index) / points;
      return {
        x: x.value + radius * Math.cos(angle),
        y: y.value + radius * Math.sin(angle),
      };
    });

    return vertices
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ')
      .concat(' Z');
  });

  return <Path path={path} color={layer.color} opacity={alpha} />;
};

const SpriteNodeSkia = ({
  spriteId,
  x,
  y,
  width,
  height,
  opacity,
  tintColor,
  rotationDeg,
}: {
  spriteId: string;
  x: SharedValue<number>;
  y: SharedValue<number>;
  width: SharedValue<number>;
  height: SharedValue<number>;
  opacity: SharedValue<number>;
  tintColor?: string;
  rotationDeg?: number;
}) => {
  const dataSource = useMemo(() => resolveSkiaDataSource(spriteId), [spriteId]);
  const image = useImage(dataSource);
  const left = useDerivedValue(() => x.value - width.value / 2);
  const top = useDerivedValue(() => y.value - height.value / 2);
  const origin = useDerivedValue(() => ({ x: x.value, y: y.value }));
  const rotationRad = ((rotationDeg ?? 0) * Math.PI) / 180;

  if (!image) {
    return null;
  }

  return (
    <Group origin={origin} transform={[{ rotate: rotationRad }]} opacity={opacity}>
      <SkiaImage image={image} x={left} y={top} width={width} height={height} fit="fill">
        {tintColor ? <BlendColor color={tintColor} mode="srcIn" /> : null}
      </SkiaImage>
    </Group>
  );
};

const SpritePrimitiveSkia = ({
  asset,
  instance,
  layer,
  progress,
}: {
  asset: EffectAsset;
  instance: EffectInstance;
  layer: SpriteLayer;
  progress: SharedValue<number>;
}) => {
  const { x, y, scale, alpha } = useLayerMetrics(asset, instance, layer, progress);
  const width = useDerivedValue(() => Math.max(1, layer.width * scale.value));
  const height = useDerivedValue(() => Math.max(1, layer.height * scale.value));

  return (
    <SpriteNodeSkia
      spriteId={layer.spriteId}
      x={x}
      y={y}
      width={width}
      height={height}
      opacity={alpha}
      tintColor={layer.tintColor}
    />
  );
};

type TrailSegmentMetrics = {
  x: SharedValue<number>;
  y: SharedValue<number>;
  scale: SharedValue<number>;
  sizeFactor: SharedValue<number>;
  opacity: SharedValue<number>;
};

function useTrailSegmentMetrics(
  asset: EffectAsset,
  instance: EffectInstance,
  layer: TrailLayer,
  progress: SharedValue<number>,
  index: number,
): TrailSegmentMetrics {
  const segmentProgress = useDerivedValue(() =>
    Math.max(0, progress.value - index * layer.spacing),
  );
  const x = useDerivedValue(() => {
    const base = sampleMotionPosition(asset, instance, segmentProgress.value);
    return base.x + sampleLayerTrack(layer, 'x', segmentProgress.value, 0);
  });
  const y = useDerivedValue(() => {
    const base = sampleMotionPosition(asset, instance, segmentProgress.value);
    return base.y + sampleLayerTrack(layer, 'y', segmentProgress.value, 0);
  });
  const scale = useDerivedValue(() => sampleLayerTrack(layer, 'scale', segmentProgress.value, 1));
  const sizeFactor = useDerivedValue(() => Math.max(0.1, 1 - index * (layer.falloff ?? 0.1)));
  const opacity = useDerivedValue(() => {
    const alpha = sampleLayerTrack(layer, 'alpha', segmentProgress.value, 1);
    const falloff = layer.falloff ?? 0.1;
    return Math.max(0, alpha * (0.65 - index * (falloff * 0.9)));
  });

  return { x, y, scale, sizeFactor, opacity };
}

const TrailFillSegmentSkia = ({
  asset,
  instance,
  layer,
  progress,
  index,
}: {
  asset: EffectAsset;
  instance: EffectInstance;
  layer: TrailLayer;
  progress: SharedValue<number>;
  index: number;
}) => {
  const { x, y, scale, sizeFactor, opacity } = useTrailSegmentMetrics(
    asset,
    instance,
    layer,
    progress,
    index,
  );
  const radius = useDerivedValue(() => Math.max(1, layer.radius * scale.value * sizeFactor.value));

  return <Circle cx={x} cy={y} r={radius} color={layer.color} opacity={opacity} />;
};

const TrailRingSegmentSkia = ({
  asset,
  instance,
  layer,
  progress,
  index,
}: {
  asset: EffectAsset;
  instance: EffectInstance;
  layer: TrailLayer;
  progress: SharedValue<number>;
  index: number;
}) => {
  const { x, y, scale, sizeFactor, opacity } = useTrailSegmentMetrics(
    asset,
    instance,
    layer,
    progress,
    index,
  );
  const radius = useDerivedValue(() => Math.max(1, layer.radius * scale.value * sizeFactor.value));
  const strokeWidth = useDerivedValue(() =>
    Math.max(1, (layer.thickness ?? 2.5) * scale.value * sizeFactor.value),
  );

  return (
    <Circle
      cx={x}
      cy={y}
      r={radius}
      color={layer.color}
      opacity={opacity}
      style="stroke"
      strokeWidth={strokeWidth}
    />
  );
};

const TrailSpriteSegmentSkia = ({
  asset,
  instance,
  layer,
  progress,
  index,
}: {
  asset: EffectAsset;
  instance: EffectInstance;
  layer: TrailLayer;
  progress: SharedValue<number>;
  index: number;
}) => {
  const { x, y, scale, sizeFactor, opacity } = useTrailSegmentMetrics(
    asset,
    instance,
    layer,
    progress,
    index,
  );
  const width = useDerivedValue(() =>
    Math.max(1, (layer.width ?? layer.radius * 2) * scale.value * sizeFactor.value),
  );
  const height = useDerivedValue(() =>
    Math.max(1, (layer.height ?? layer.radius * 2) * scale.value * sizeFactor.value),
  );

  return (
    <SpriteNodeSkia
      spriteId={layer.spriteId ?? ''}
      x={x}
      y={y}
      width={width}
      height={height}
      opacity={opacity}
      tintColor={layer.tintColor}
      rotationDeg={layer.rotationDeg}
    />
  );
};

const TrailStreakSegmentSkia = ({
  asset,
  instance,
  layer,
  progress,
  index,
}: {
  asset: EffectAsset;
  instance: EffectInstance;
  layer: TrailLayer;
  progress: SharedValue<number>;
  index: number;
}) => {
  const { x, y, scale, sizeFactor, opacity } = useTrailSegmentMetrics(
    asset,
    instance,
    layer,
    progress,
    index,
  );
  const width = useDerivedValue(() =>
    Math.max(1, (layer.width ?? 36) * scale.value * sizeFactor.value),
  );
  const height = useDerivedValue(() =>
    Math.max(1, (layer.height ?? 10) * scale.value * sizeFactor.value),
  );
  const left = useDerivedValue(() => x.value - width.value / 2);
  const top = useDerivedValue(() => y.value - height.value / 2);
  const radius = useDerivedValue(() => height.value / 2);
  const origin = useDerivedValue(() => ({ x: x.value, y: y.value }));
  const rotationRad = ((layer.rotationDeg ?? -24) * Math.PI) / 180;

  return (
    <Group origin={origin} transform={[{ rotate: rotationRad }]} opacity={opacity}>
      <RoundedRect x={left} y={top} width={width} height={height} r={radius} color={layer.color} />
    </Group>
  );
};

const TrailDiamondSegmentSkia = ({
  asset,
  instance,
  layer,
  progress,
  index,
}: {
  asset: EffectAsset;
  instance: EffectInstance;
  layer: TrailLayer;
  progress: SharedValue<number>;
  index: number;
}) => {
  const { x, y, scale, sizeFactor, opacity } = useTrailSegmentMetrics(
    asset,
    instance,
    layer,
    progress,
    index,
  );
  const path = useDerivedValue(() => {
    const halfWidth = Math.max(1, ((layer.width ?? 24) * scale.value * sizeFactor.value) / 2);
    const halfHeight = Math.max(1, ((layer.height ?? 28) * scale.value * sizeFactor.value) / 2);
    const angle = ((layer.rotationDeg ?? 0) * Math.PI) / 180;
    const points = [
      rotatePoint(0, -halfHeight, angle),
      rotatePoint(halfWidth, 0, angle),
      rotatePoint(0, halfHeight, angle),
      rotatePoint(-halfWidth, 0, angle),
    ].map((point) => ({ x: x.value + point.x, y: y.value + point.y }));

    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y} L ${points[2].x} ${points[2].y} L ${points[3].x} ${points[3].y} Z`;
  });

  return <Path path={path} color={layer.color} opacity={opacity} />;
};

const TrailArcSegmentSkia = ({
  asset,
  instance,
  layer,
  progress,
  index,
}: {
  asset: EffectAsset;
  instance: EffectInstance;
  layer: TrailLayer;
  progress: SharedValue<number>;
  index: number;
}) => {
  const { x, y, scale, sizeFactor, opacity } = useTrailSegmentMetrics(
    asset,
    instance,
    layer,
    progress,
    index,
  );
  const path = useDerivedValue(() => {
    const radius = Math.max(1, (layer.radius ?? 12) * scale.value * sizeFactor.value);
    const sweepDeg = layer.sweepDeg ?? 130;
    const startAngle = (layer.rotationDeg ?? -90) - sweepDeg / 2;
    const endAngle = startAngle + sweepDeg;
    const start = polarToCartesian(x.value, y.value, radius, startAngle);
    const end = polarToCartesian(x.value, y.value, radius, endAngle);

    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${sweepDeg > 180 ? 1 : 0} 1 ${end.x} ${end.y}`;
  });
  const strokeWidth = useDerivedValue(() =>
    Math.max(1, (layer.thickness ?? 3) * scale.value * sizeFactor.value),
  );

  return (
    <Path
      path={path}
      color={layer.color}
      opacity={opacity}
      style="stroke"
      strokeWidth={strokeWidth}
      strokeCap="round"
    />
  );
};

const TrailStarburstSegmentSkia = ({
  asset,
  instance,
  layer,
  progress,
  index,
}: {
  asset: EffectAsset;
  instance: EffectInstance;
  layer: TrailLayer;
  progress: SharedValue<number>;
  index: number;
}) => {
  const { x, y, scale, sizeFactor, opacity } = useTrailSegmentMetrics(
    asset,
    instance,
    layer,
    progress,
    index,
  );
  const path = useDerivedValue(() => {
    const innerRadius = Math.max(0.5, (layer.innerRadius ?? 6) * scale.value * sizeFactor.value);
    const outerRadius = Math.max(
      innerRadius + 0.5,
      (layer.outerRadius ?? 14) * scale.value * sizeFactor.value,
    );
    const pointCount = Math.max(3, Math.round(layer.points ?? 6));
    const rotation = ((layer.rotationDeg ?? -90) * Math.PI) / 180;
    const points = Array.from({ length: pointCount * 2 }, (_, pointIndex) => {
      const radius = pointIndex % 2 === 0 ? outerRadius : innerRadius;
      const angle = rotation + (Math.PI * pointIndex) / pointCount;
      return {
        x: x.value + radius * Math.cos(angle),
        y: y.value + radius * Math.sin(angle),
      };
    });

    return points
      .map((point, pointIndex) => `${pointIndex === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ')
      .concat(' Z');
  });

  return <Path path={path} color={layer.color} opacity={opacity} />;
};

const TrailSegmentSkia = ({
  asset,
  instance,
  layer,
  progress,
  index,
}: {
  asset: EffectAsset;
  instance: EffectInstance;
  layer: TrailLayer;
  progress: SharedValue<number>;
  index: number;
}) => {
  const style = layer.style ?? 'fill';

  if (style === 'ring') {
    return (
      <TrailRingSegmentSkia
        asset={asset}
        instance={instance}
        layer={layer}
        progress={progress}
        index={index}
      />
    );
  }

  if (style === 'sprite') {
    return (
      <TrailSpriteSegmentSkia
        asset={asset}
        instance={instance}
        layer={layer}
        progress={progress}
        index={index}
      />
    );
  }

  if (style === 'streak') {
    return (
      <TrailStreakSegmentSkia
        asset={asset}
        instance={instance}
        layer={layer}
        progress={progress}
        index={index}
      />
    );
  }

  if (style === 'diamond') {
    return (
      <TrailDiamondSegmentSkia
        asset={asset}
        instance={instance}
        layer={layer}
        progress={progress}
        index={index}
      />
    );
  }

  if (style === 'arc') {
    return (
      <TrailArcSegmentSkia
        asset={asset}
        instance={instance}
        layer={layer}
        progress={progress}
        index={index}
      />
    );
  }

  if (style === 'starburst') {
    return (
      <TrailStarburstSegmentSkia
        asset={asset}
        instance={instance}
        layer={layer}
        progress={progress}
        index={index}
      />
    );
  }

  return (
    <TrailFillSegmentSkia
      asset={asset}
      instance={instance}
      layer={layer}
      progress={progress}
      index={index}
    />
  );
};

const TrailPrimitiveSkia = ({
  asset,
  instance,
  layer,
  progress,
}: {
  asset: EffectAsset;
  instance: EffectInstance;
  layer: TrailLayer;
  progress: SharedValue<number>;
}) => {
  return (
    <>
      {Array.from({ length: layer.segments }, (_, index) => (
        <TrailSegmentSkia
          key={`${layer.id}-${index}`}
          asset={asset}
          instance={instance}
          layer={layer}
          progress={progress}
          index={index}
        />
      ))}
    </>
  );
};

function renderLayer(layer: EffectLayer, instance: EffectInstance, progress: SharedValue<number>) {
  const asset = getEffectAsset(instance.assetId);

  if (!asset) return null;

  switch (layer.type) {
    case 'orb':
      return (
        <OrbPrimitiveSkia
          key={layer.id}
          asset={asset}
          instance={instance}
          layer={layer}
          progress={progress}
        />
      );
    case 'ring':
      return (
        <RingPrimitiveSkia
          key={layer.id}
          asset={asset}
          instance={instance}
          layer={layer}
          progress={progress}
        />
      );
    case 'streak':
      return (
        <StreakPrimitiveSkia
          key={layer.id}
          asset={asset}
          instance={instance}
          layer={layer}
          progress={progress}
        />
      );
    case 'diamond':
      return (
        <DiamondPrimitiveSkia
          key={layer.id}
          asset={asset}
          instance={instance}
          layer={layer}
          progress={progress}
        />
      );
    case 'arc':
      return (
        <ArcPrimitiveSkia
          key={layer.id}
          asset={asset}
          instance={instance}
          layer={layer}
          progress={progress}
        />
      );
    case 'starburst':
      return (
        <StarburstPrimitiveSkia
          key={layer.id}
          asset={asset}
          instance={instance}
          layer={layer}
          progress={progress}
        />
      );
    case 'trail':
      return (
        <TrailPrimitiveSkia
          key={layer.id}
          asset={asset}
          instance={instance}
          layer={layer}
          progress={progress}
        />
      );
    case 'sprite':
      return (
        <SpritePrimitiveSkia
          key={layer.id}
          asset={asset}
          instance={instance}
          layer={layer}
          progress={progress}
        />
      );
  }
}

const EffectPlayerSkia = ({ instance, onComplete }: EffectPlayerProps) => {
  const progress = useSharedValue(0);
  const asset = getEffectAsset(instance.assetId);
  const playbackDurationMs = Math.max(1, instance.durationMsOverride ?? asset?.durationMs ?? 1);

  useEffect(() => {
    if (!asset) return;

    cancelAnimation(progress);
    progress.value = 0;
    progress.value = withRepeat(
      withTiming(1, { duration: playbackDurationMs, easing: Easing.linear }),
      asset.loop ? -1 : 1,
      false,
    );

    if (asset.loop) {
      return () => {
        cancelAnimation(progress);
      };
    }

    const timeoutId = setTimeout(() => {
      onComplete(instance.instanceId);
    }, playbackDurationMs + 32);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimation(progress);
    };
  }, [asset, instance.instanceId, onComplete, playbackDurationMs, progress]);

  if (!asset) return null;

  return (
    <Canvas pointerEvents="none" style={styles.canvas}>
      {asset.layers.map((layer) => renderLayer(layer, instance, progress))}
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject,
  },
});

export const canUseSkiaRenderer = Platform.OS !== 'web';

export default EffectPlayerSkia;
