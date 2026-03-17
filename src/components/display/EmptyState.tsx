import Typography from '@/components/display/Typography';
import Stack from '@/components/layout/Stack';
import { colors } from '@/constants/colors';

type EmptyStateProps = {
  text: string;
};

const EmptyState = ({ text }: EmptyStateProps) => (
  <Stack align="center" justify="center" style={{ paddingVertical: 12 }}>
    <Typography variant="body" style={{ color: colors.textSecondary, textAlign: 'center' }}>
      {text}
    </Typography>
  </Stack>
);

export default EmptyState;
