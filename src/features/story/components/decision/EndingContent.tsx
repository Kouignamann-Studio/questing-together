import { Button, Stack, Typography } from '@/components';
import { colors } from '@/constants/colors';

type EndingContentProps = {
  canResetStory: boolean;
  onResetStory: () => void;
  embedded: boolean;
};

const EndingContent = ({ canResetStory, onResetStory, embedded }: EndingContentProps) => {
  return (
    <Stack gap={12} align="center" justify="center" style={{ paddingVertical: 10 }}>
      <Typography
        variant="heading"
        style={{ color: embedded ? colors.combatTitleEmbedded : colors.textPrimary }}
      >
        Fin.
      </Typography>
      {canResetStory ? (
        <Button variant="selected" label="Recommencer l'aventure" onPress={onResetStory} />
      ) : (
        <Typography
          variant="caption"
          style={{
            textAlign: 'center',
            color: colors.combatHealthValueEmbedded,
            fontStyle: 'italic',
          }}
        >
          En attente de l&apos;hote pour recommencer.
        </Typography>
      )}
    </Stack>
  );
};

export default EndingContent;
