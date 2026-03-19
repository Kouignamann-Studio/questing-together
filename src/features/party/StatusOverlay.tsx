import { Alert, BottomSheet, Button, Stack, Typography } from '@/components';
import { roles } from '@/constants/constants';
import { useGame } from '@/contexts/GameContext';
import PartyStatusCard from '@/features/party/PartyStatusCard';

export function StatusOverlay() {
  const game = useGame();
  const roomStory = game.roomStory;
  const connection = game.roomConnection;
  const closePanel = () => game.setShowStatusPanel(false);

  const hasError = Boolean(connection.roomError || roomStory.storyError);

  const handleReset = () => {
    closePanel();
    roomStory.resetStory();
  };

  const handleLeave = () => {
    closePanel();
    connection.leaveRoom();
  };

  return (
    <BottomSheet size="md">
      {hasError ? (
        <Alert variant="danger">
          {connection.roomError ? `Room error: ${connection.roomError}\n` : ''}
          {roomStory.storyError ? `Story sync: ${roomStory.storyError}` : ''}
        </Alert>
      ) : null}

      {game.room?.code ? (
        <Typography variant="body" bold>
          Room code: {game.room.code}
        </Typography>
      ) : null}

      {connection.players.length ? (
        <Typography variant="caption">
          Players: {connection.players.map((p) => p.display_name || p.player_id).join(', ')}
        </Typography>
      ) : null}

      {game.localRole ? (
        <Typography variant="caption" bold>
          You are {roles.find((r) => r.id === game.localRole)?.label ?? game.localRole}.
        </Typography>
      ) : null}

      <PartyStatusCard title="Party Status" rows={game.partyStatusRows} variant="parchment" />

      <Stack direction="row" justify="flex-end" gap={8}>
        {game.isHost ? (
          <Button label="Restart Adventure" size="sm" variant="ghost" onPress={handleReset} />
        ) : null}
        <Button
          label={connection.isBusy ? 'Leaving...' : 'Leave Room'}
          variant="danger"
          size="sm"
          disabled={connection.isBusy}
          onPress={handleLeave}
        />
      </Stack>
    </BottomSheet>
  );
}
