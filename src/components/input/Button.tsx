import { type ReactNode, useState } from 'react';
import { Image, Pressable, type PressableProps, View, type ViewStyle } from 'react-native';
import buttonTexture from '@/assets/images/T_Button.png';
import buttonTextureDisabled from '@/assets/images/T_Button_Disabled.png';
import buttonTextureSelected from '@/assets/images/T_Button_Selected.png';
import Typography from '@/components/display/Typography';
import { colors } from '@/constants/colors';

type ButtonVariant = 'default' | 'selected' | 'validation' | 'danger' | 'ghost';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

const textureByVariant: Partial<Record<ButtonVariant, typeof buttonTexture>> = {
  default: buttonTexture,
  selected: buttonTextureSelected,
};

const sizeStyles: Record<ButtonSize, ViewStyle> = {
  xs: {
    minHeight: 0,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  sm: {
    minHeight: 0,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  md: {
    minHeight: 44,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 10,
  },
  lg: {
    minHeight: 66,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
  },
};

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  default: {},
  selected: {},
  validation: {
    backgroundColor: colors.success,
    borderWidth: 1,
    borderColor: colors.success,
  },
  danger: {
    backgroundColor: colors.pillDangerBg,
    borderWidth: 1,
    borderColor: colors.pillDangerBorder,
  },
  ghost: {
    backgroundColor: colors.pillDefaultBg,
    borderWidth: 1,
    borderColor: colors.pillDefaultBorder,
  },
};

const labelColorByVariant: Record<ButtonVariant, string> = {
  default: colors.textPrimary,
  selected: colors.textPrimary,
  validation: colors.textParchment,
  danger: colors.pillDangerText,
  ghost: colors.pillDefaultText,
};

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label?: string;
  hint?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  textured?: boolean;
  width?: ViewStyle['width'];
  height?: ViewStyle['height'];
  children?: ReactNode;
  style?: ViewStyle;
};

const Button = ({
  label,
  hint,
  variant = 'default',
  size = 'md',
  textured = true,
  width,
  height,
  disabled,
  children,
  style,
  ...props
}: ButtonProps) => {
  const [measuredSize, setMeasuredSize] = useState({ width: 0, height: 0 });
  const hasTexture = textured && variant in textureByVariant;
  const texture = disabled ? buttonTextureDisabled : (textureByVariant[variant] ?? buttonTexture);
  const isCompact = size === 'xs' || size === 'sm';
  const fontSize = size === 'xs' ? 10 : size === 'sm' ? 12 : size === 'md' ? 14 : 16;
  const typographyVariant = isCompact ? 'caption' : 'body';

  const content = children ?? (
    <>
      <Typography
        variant={typographyVariant}
        bold
        style={{
          color: labelColorByVariant[variant],
          fontSize,
          textAlign: 'center',
        }}
      >
        {label}
      </Typography>
      {hint ? (
        <Typography variant="caption" style={{ textAlign: 'center' }}>
          {hint}
        </Typography>
      ) : null}
    </>
  );

  return (
    <Pressable
      role="button"
      disabled={disabled}
      style={[{ width: width ?? (isCompact ? undefined : '100%'), height }, style]}
      {...props}
    >
      <View
        onLayout={(e) => {
          const { width: w, height: h } = e.nativeEvent.layout;
          setMeasuredSize({ width: Math.ceil(w), height: Math.ceil(h) });
        }}
        style={[
          {
            overflow: 'hidden',
            alignItems: children ? 'stretch' : 'center',
            justifyContent: 'center',
            gap: children ? 5 : isCompact ? 0 : 8,
          },
          sizeStyles[size],
          variantStyles[variant],
          disabled && { opacity: 0.5 },
        ]}
      >
        {hasTexture && measuredSize.height > 0 ? (
          <Image
            source={texture}
            resizeMode="stretch"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: measuredSize.width,
              height: measuredSize.height,
              borderRadius: sizeStyles[size].borderRadius,
            }}
          />
        ) : null}
        {content}
      </View>
    </Pressable>
  );
};

export default Button;
export type { ButtonProps, ButtonSize, ButtonVariant };
