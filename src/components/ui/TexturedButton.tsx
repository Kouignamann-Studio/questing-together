import { ImageBackground, Pressable, type PressableProps, StyleSheet } from 'react-native';
import buttonTexture from '@/assets/images/T_Button.png';
import buttonTextureDisabled from '@/assets/images/T_Button_Disabled.png';
import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/colors';

type TexturedButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  hint?: string;
};

const TexturedButton = ({ label, hint, disabled, style, ...props }: TexturedButtonProps) => {
  return (
    <Pressable
      disabled={disabled}
      style={[styles.wrap, disabled && styles.disabled, style]}
      {...props}
    >
      <ImageBackground
        source={disabled ? buttonTextureDisabled : buttonTexture}
        resizeMode="stretch"
        imageStyle={styles.image}
        style={styles.button}
      >
        <Typography variant="body" style={styles.label}>
          {label}
        </Typography>
        {hint ? <Typography variant="caption">{hint}</Typography> : null}
      </ImageBackground>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    maxWidth: 420,
  },
  button: {
    minHeight: 66,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  image: {
    borderRadius: 10,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
});

export { TexturedButton };
