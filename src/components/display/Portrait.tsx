import { Image, type ImageSourcePropType, type ViewStyle } from 'react-native';
import portraitFrame from '@/assets/images/T_PortraitFrame.png';
import ShaderImageSkia from '@/components/display/ShaderImageSkia';
import Typography from '@/components/display/Typography';
import Stack from '@/components/layout/Stack';
import { colors } from '@/constants/colors';
import type { SkiaShaderUniformMap } from '@/features/shaders/shaderRegistry';

type PortraitProps = {
  source: ImageSourcePropType;
  name?: string;
  size?: number;
  nameColor?: string;
  nameFontSize?: number;
  highlighted?: boolean;
  highlightColor?: string;
  hideName?: boolean;
  artShaderId?: string;
  artShaderUniforms?: SkiaShaderUniformMap;
  style?: ViewStyle;
};

const Portrait = ({
  source,
  name,
  size = 84,
  nameColor,
  nameFontSize = 16,
  highlighted = false,
  highlightColor,
  hideName = false,
  artShaderId,
  artShaderUniforms,
  style,
}: PortraitProps) => {
  return (
    <Stack align="center" style={style}>
      <Stack
        align="center"
        justify="center"
        style={{
          width: size,
          height: size,
          borderRadius: 999,
          borderWidth: highlighted ? 1.5 : 0,
          borderColor: highlighted
            ? (highlightColor ?? colors.intentConfirmedBorder)
            : 'transparent',
        }}
      >
        <Image source={portraitFrame} style={{ width: '100%', height: '100%' }} />
        {artShaderId ? (
          <ShaderImageSkia
            source={source}
            width={size}
            height={size}
            shaderId={artShaderId}
            uniforms={artShaderUniforms}
            fit="contain"
            fallbackResizeMode="contain"
            style={{ position: 'absolute', width: size, height: size, zIndex: 2 }}
          />
        ) : (
          <Image
            source={source}
            resizeMode="contain"
            style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 2 }}
          />
        )}
      </Stack>
      {name && !hideName ? (
        <Typography
          variant="body"
          style={{ marginTop: 4, fontSize: nameFontSize, fontWeight: '600', color: nameColor }}
        >
          {name}
        </Typography>
      ) : null}
    </Stack>
  );
};

export default Portrait;
