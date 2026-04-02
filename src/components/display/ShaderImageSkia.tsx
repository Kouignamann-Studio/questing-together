import {
  Canvas,
  Group,
  Paint,
  RuntimeShader,
  Image as SkiaImage,
  useImage,
} from '@shopify/react-native-skia';
import {
  type ImageResizeMode,
  type ImageSourcePropType,
  type ImageStyle,
  type ImageURISource,
  Image as RNImage,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  getRegisteredSkiaShader,
  resolveSkiaShaderUniforms,
  type SkiaShaderUniformMap,
} from '@/features/shaders/shaderRegistry';

type ShaderImageFit =
  | 'contain'
  | 'cover'
  | 'fill'
  | 'fitHeight'
  | 'fitWidth'
  | 'none'
  | 'scaleDown';

type ShaderImageSkiaProps = {
  source: ImageSourcePropType;
  width: number;
  height: number;
  shaderId: string;
  uniforms?: SkiaShaderUniformMap;
  fit?: ShaderImageFit;
  fallbackResizeMode?: ImageResizeMode;
  style?: StyleProp<ViewStyle>;
};

function resolveSkiaImageSource(source: ImageSourcePropType) {
  if (typeof source === 'number' || typeof source === 'string') {
    return source;
  }

  if (Array.isArray(source)) {
    const first = source[0];
    if (!first) {
      return null;
    }

    return typeof first === 'number' ? first : ((first as ImageURISource).uri ?? null);
  }

  return (source as ImageURISource).uri ?? null;
}

const ShaderImageSkia = ({
  source,
  width,
  height,
  shaderId,
  uniforms,
  fit = 'contain',
  fallbackResizeMode = 'contain',
  style,
}: ShaderImageSkiaProps) => {
  const image = useImage(resolveSkiaImageSource(source));
  const shaderEffect = getRegisteredSkiaShader(shaderId);
  const resolvedUniforms = resolveSkiaShaderUniforms(shaderId, {
    resolution: [width, height],
    ...(uniforms ?? {}),
  });

  if (!image || !shaderEffect) {
    return (
      <RNImage
        source={source}
        resizeMode={fallbackResizeMode}
        style={[{ width, height }, style] as StyleProp<ImageStyle>}
      />
    );
  }

  return (
    <Canvas pointerEvents="none" style={[{ width, height }, style]}>
      <Group
        layer={
          <Paint>
            <RuntimeShader source={shaderEffect} uniforms={resolvedUniforms} />
          </Paint>
        }
      >
        <SkiaImage image={image} x={0} y={0} width={width} height={height} fit={fit} />
      </Group>
    </Canvas>
  );
};

export default ShaderImageSkia;
