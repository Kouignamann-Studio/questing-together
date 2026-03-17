import type { ReactNode } from 'react';
import {
  Image,
  Pressable,
  type PressableProps,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import buttonTexture from '@/assets/images/T_Button.png';
import buttonTextureDisabled from '@/assets/images/T_Button_Disabled.png';
import buttonTextureSelected from '@/assets/images/T_Button_Selected.png';
import Typography from '@/components/display/Typography';
import { colors } from '@/constants/colors';

type ButtonVariant = 'default' | 'selected' | 'danger' | 'ghost';
type ButtonSize = 'default' | 'sm';

const textureByVariant: Partial<Record<ButtonVariant, typeof buttonTexture>> = {
  default: buttonTexture,
  selected: buttonTextureSelected,
};

const sizeStyles: Record<ButtonSize, ViewStyle> = {
  default: {
    minHeight: 66,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sm: {
    minHeight: 0,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
};

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  default: {},
  selected: {},
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
  danger: colors.pillDangerText,
  ghost: colors.pillDefaultText,
};

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label?: string;
  hint?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  textured?: boolean;
  children?: ReactNode;
  style?: ViewStyle;
};

const Button = ({
  label,
  hint,
  variant = 'default',
  size = 'default',
  textured = true,
  disabled,
  children,
  style,
  ...props
}: ButtonProps) => {
  const hasTexture = textured && variant in textureByVariant;
  const texture = disabled ? buttonTextureDisabled : (textureByVariant[variant] ?? buttonTexture);
  const isCompact = size === 'sm';

  return (
    <Pressable
      role="button"
      disabled={disabled}
      style={[{ width: isCompact ? undefined : '100%' }, disabled && { opacity: 0.6 }, style]}
      {...props}
    >
      <View
        style={[
          {
            overflow: 'hidden',
            alignItems: children ? 'stretch' : 'center',
            justifyContent: 'center',
            gap: children ? 5 : isCompact ? 0 : 10,
          },
          sizeStyles[size],
          variantStyles[variant],
        ]}
      >
        {hasTexture ? (
          <Image
            source={texture}
            resizeMode="stretch"
            style={[
              StyleSheet.absoluteFillObject,
              { width: undefined, height: undefined, borderRadius: sizeStyles[size].borderRadius },
            ]}
          />
        ) : null}
        {children ?? (
          <>
            <Typography
              variant={isCompact ? 'caption' : 'body'}
              bold
              style={{
                color: labelColorByVariant[variant],
                fontSize: isCompact ? 12 : 16,
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
        )}
      </View>
    </Pressable>
  );
};

export default Button;
export type { ButtonProps, ButtonSize, ButtonVariant };
