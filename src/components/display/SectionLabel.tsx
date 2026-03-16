import type { TextStyle } from 'react-native';
import Typography from '@/components/display/Typography';
import { colors } from '@/constants/colors';

type SectionLabelProps = {
  children: string;
  style?: TextStyle;
};

const SectionLabel = ({ children, style }: SectionLabelProps) => (
  <Typography
    variant="caption"
    style={[{ fontWeight: '700', color: colors.textAvatarNameParchment }, style]}
  >
    {children}
  </Typography>
);

export default SectionLabel;
