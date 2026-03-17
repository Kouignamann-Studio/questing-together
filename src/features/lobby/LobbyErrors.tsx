import { Stack, Typography } from '@/components';
import { colors } from '@/constants/colors';
import { useGame } from '@/contexts/GameContext';

const LobbyErrors = () => {
  const { roomConnection, roomStory } = useGame();

  if (!roomConnection.roomError && !roomStory.storyError) return null;

  return (
    <Stack gap={6}>
      {roomConnection.roomError ? (
        <Typography variant="error" style={{ color: colors.errorDark }}>
          Room error: {roomConnection.roomError}
        </Typography>
      ) : null}
      {roomStory.storyError ? (
        <Typography variant="error" style={{ color: colors.errorDark }}>
          Story sync error: {roomStory.storyError}
        </Typography>
      ) : null}
    </Stack>
  );
};

export default LobbyErrors;
