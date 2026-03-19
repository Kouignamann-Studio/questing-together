import { Text, type TextProps } from 'react-native';
import { colors } from '@/constants/colors';

type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'subtitle'
  | 'body1'
  | 'body2'
  | 'body3'
  | 'caption'
  | 'small'
  | 'micro'
  | 'error'
  // Legacy aliases
  | 'title'
  | 'heading'
  | 'subheading'
  | 'sectionTitle'
  | 'bodyLg'
  | 'body'
  | 'bodySm'
  | 'captionSm'
  | 'fine';

type TypographyProps = TextProps & {
  variant?: TypographyVariant;
  bold?: boolean;
  uppercase?: boolean;
};

const BASE = { fontFamily: 'Besley' };

const variantStyles: Record<TypographyVariant, object> = {
  // Headings
  h1: {
    ...BASE,
    fontSize: 30,
    color: colors.textDark,
    fontWeight: '700',
    letterSpacing: 0.1,
    textAlign: 'center',
  },
  h2: { ...BASE, fontSize: 24, color: colors.textDark, fontWeight: '700', textAlign: 'center' },
  h3: {
    ...BASE,
    fontSize: 20,
    color: colors.textOverlayHeading,
    fontWeight: '700',
    textAlign: 'center',
  },
  h4: { ...BASE, fontSize: 17, color: colors.textOverlayHeading, fontWeight: '700' },
  h5: { ...BASE, fontSize: 16, color: colors.textSecondary },
  h6: { ...BASE, fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
  subtitle: { ...BASE, fontSize: 14, color: colors.subtitleLight, textAlign: 'center' },

  // Body
  body1: { ...BASE, fontSize: 14, color: colors.textSecondary },
  body2: { ...BASE, fontSize: 13, color: colors.textSecondary },
  body3: { ...BASE, fontSize: 12, color: colors.textMuted },

  // Small
  caption: { ...BASE, fontSize: 12, color: colors.textMuted },
  small: { ...BASE, fontSize: 11, color: colors.textMuted },
  micro: {
    ...BASE,
    fontSize: 9,
    color: colors.textMuted,
    textAlign: 'center',
    textTransform: 'uppercase',
  },

  // Utility
  error: { ...BASE, fontSize: 12, color: colors.error, textAlign: 'center' },

  // Legacy aliases (map to new variants)
  title: {
    ...BASE,
    fontSize: 30,
    color: colors.textDark,
    fontWeight: '700',
    letterSpacing: 0.1,
    textAlign: 'center',
  },
  heading: {
    ...BASE,
    fontSize: 24,
    color: colors.textDark,
    fontWeight: '700',
    textAlign: 'center',
  },
  subheading: {
    ...BASE,
    fontSize: 20,
    color: colors.textOverlayHeading,
    fontWeight: '700',
    textAlign: 'center',
  },
  sectionTitle: { ...BASE, fontSize: 17, color: colors.textOverlayHeading, fontWeight: '700' },
  bodyLg: { ...BASE, fontSize: 16, color: colors.textSecondary },
  body: { ...BASE, fontSize: 14, color: colors.textSecondary },
  bodySm: { ...BASE, fontSize: 13, color: colors.textSecondary },
  captionSm: { ...BASE, fontSize: 11, color: colors.textMuted },
  fine: { ...BASE, fontSize: 10, color: colors.textMuted },
};

const Typography = ({ variant = 'body1', bold, uppercase, style, ...props }: TypographyProps) => {
  return (
    <Text
      style={[
        variantStyles[variant],
        bold && { fontWeight: '700' as const },
        uppercase && { textTransform: 'uppercase' as const },
        style,
      ]}
      {...props}
    />
  );
};

export default Typography;
