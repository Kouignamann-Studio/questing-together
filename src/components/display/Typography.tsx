import { Text, type TextProps } from 'react-native';
import { colors } from '@/constants/colors';

type TypographyVariant =
  | 'title'
  | 'subtitle'
  | 'heading'
  | 'subheading'
  | 'sectionTitle'
  | 'bodyLg'
  | 'body'
  | 'bodySm'
  | 'caption'
  | 'captionSm'
  | 'fine'
  | 'micro'
  | 'error';

type TypographyProps = TextProps & {
  variant?: TypographyVariant;
};

const variantStyles: Record<TypographyVariant, object> = {
  title: {
    fontSize: 30,
    color: colors.textDark,
    fontFamily: 'Besley',
    fontWeight: '700' as const,
    letterSpacing: 0.1,
    textAlign: 'center' as const,
  },
  subtitle: {
    fontSize: 14,
    color: colors.subtitleLight,
    fontFamily: 'Besley',
    textAlign: 'center' as const,
  },
  heading: {
    fontSize: 24,
    color: colors.textDark,
    fontFamily: 'Besley',
    fontWeight: '700' as const,
    textAlign: 'center' as const,
  },
  subheading: {
    fontSize: 20,
    color: colors.textOverlayHeading,
    fontFamily: 'Besley',
    fontWeight: '700' as const,
    textAlign: 'center' as const,
  },
  sectionTitle: {
    fontSize: 17,
    color: colors.textOverlayHeading,
    fontFamily: 'Besley',
    fontWeight: '700' as const,
  },
  bodyLg: {
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: 'Besley',
  },
  body: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Besley',
  },
  bodySm: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'Besley',
  },
  caption: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: 'Besley',
  },
  captionSm: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'Besley',
  },
  fine: {
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: 'Besley',
  },
  micro: {
    fontSize: 9,
    color: colors.textMuted,
    fontFamily: 'Besley',
    textAlign: 'center' as const,
    textTransform: 'uppercase' as const,
  },
  error: {
    fontSize: 12,
    color: colors.error,
    fontFamily: 'Besley',
    textAlign: 'center' as const,
  },
};

const Typography = ({ variant = 'body', style, ...props }: TypographyProps) => {
  return <Text style={[variantStyles[variant], style]} {...props} />;
};

export default Typography;
