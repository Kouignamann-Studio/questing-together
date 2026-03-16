import { Pressable, type PressableProps, type ViewStyle } from 'react-native';
import Typography from '@/components/display/Typography';
import { colors } from '@/constants/colors';

type PillButtonVariant = 'default' | 'danger';

type PillButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: PillButtonVariant;
  style?: ViewStyle;
};

const variantColors: Record<PillButtonVariant, { bg: string; border: string; text: string }> = {
  default: {
    bg: colors.pillDefaultBg,
    border: colors.pillDefaultBorder,
    text: colors.pillDefaultText,
  },
  danger: {
    bg: colors.pillDangerBg,
    border: colors.pillDangerBorder,
    text: colors.pillDangerText,
  },
};

const PillButton = ({ label, variant = 'default', disabled, style, ...props }: PillButtonProps) => {
  const c = variantColors[variant];

  return (
    <Pressable
      disabled={disabled}
      style={[
        {
          borderRadius: 999,
          borderWidth: 1,
          borderColor: c.border,
          backgroundColor: c.bg,
          paddingHorizontal: 10,
          paddingVertical: 5,
        },
        disabled && { opacity: 0.5 },
        style,
      ]}
      {...props}
    >
      <Typography
        variant="caption"
        style={{ color: c.text, fontSize: 12, fontWeight: '700', textTransform: 'none' }}
      >
        {label}
      </Typography>
    </Pressable>
  );
};

export default PillButton;
