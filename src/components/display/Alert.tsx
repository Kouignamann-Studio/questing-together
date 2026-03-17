import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import Typography from '@/components/display/Typography';
import Stack from '@/components/layout/Stack';
import { colors } from '@/constants/colors';

type AlertVariant = 'info' | 'warning' | 'danger' | 'success' | 'dark' | 'parchment';

const variantStyles: Record<
  AlertVariant,
  { bg: string; border: string; title: string; text: string }
> = {
  info: {
    bg: 'rgba(244, 234, 215, 0.65)',
    border: colors.borderOverlay,
    title: colors.textOverlayHeading,
    text: colors.textOverlayAccent,
  },
  warning: {
    bg: 'rgba(59, 25, 1, 0.65)',
    border: colors.warningText,
    title: colors.warningText,
    text: colors.textParchment,
  },
  danger: {
    bg: 'rgba(156, 63, 50, 0.65)',
    border: colors.errorDark,
    title: colors.errorDark,
    text: colors.error,
  },
  success: {
    bg: 'rgba(95, 122, 69, 0.65)',
    border: colors.success,
    title: colors.success,
    text: colors.combatOutcome,
  },
  dark: {
    bg: 'rgba(30, 20, 13, 0.65)',
    border: colors.borderCard,
    title: colors.textPrimary,
    text: colors.textSecondary,
  },
  parchment: {
    bg: 'rgba(244, 234, 215, 0.65)',
    border: colors.borderOverlay,
    title: colors.textDark,
    text: colors.combatTitleEmbedded,
  },
};

type AlertProps = {
  title?: string;
  children?: ReactNode;
  variant?: AlertVariant;
  style?: ViewStyle;
};

const Alert = ({ title, children, variant = 'info', style }: AlertProps) => {
  const v = variantStyles[variant];

  return (
    <Stack
      gap={4}
      style={[
        {
          backgroundColor: v.bg,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: v.border,
          borderLeftWidth: 3,
          padding: 10,
        },
        style,
      ]}
    >
      {title ? (
        <Typography variant="body" bold style={{ color: v.title }}>
          {title}
        </Typography>
      ) : null}
      {typeof children === 'string' ? (
        <Typography variant="caption" style={{ color: v.text, lineHeight: 17 }}>
          {children}
        </Typography>
      ) : (
        children
      )}
    </Stack>
  );
};

export default Alert;
