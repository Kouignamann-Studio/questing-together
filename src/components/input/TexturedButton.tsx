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

type TexturedButtonVariant = 'default' | 'selected';

const textureByVariant: Record<TexturedButtonVariant, typeof buttonTexture> = {
  default: buttonTexture,
  selected: buttonTextureSelected,
};

type TexturedButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label?: string;
  hint?: string;
  variant?: TexturedButtonVariant;
  children?: ReactNode;
  style?: ViewStyle;
};

const TexturedButton = ({
  label,
  hint,
  variant = 'default',
  disabled,
  children,
  style,
  ...props
}: TexturedButtonProps) => {
  const texture = disabled ? buttonTextureDisabled : textureByVariant[variant];

  return (
    <Pressable
      disabled={disabled}
      style={[{ width: '100%', maxWidth: 420 }, disabled && { opacity: 0.6 }, style]}
      {...props}
    >
      <View
        style={{
          minHeight: children ? 74 : 66,
          borderRadius: 10,
          overflow: 'hidden',
          paddingHorizontal: 14,
          paddingVertical: 10,
          alignItems: children ? undefined : 'center',
          justifyContent: 'center',
          gap: children ? 5 : 10,
        }}
      >
        <Image
          source={texture}
          resizeMode="stretch"
          style={[
            StyleSheet.absoluteFillObject,
            { width: undefined, height: undefined, borderRadius: 10 },
          ]}
        />
        {children ?? (
          <>
            <Typography
              variant="body"
              style={{
                color: colors.textPrimary,
                fontSize: 16,
                fontWeight: '600',
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

export default TexturedButton;
