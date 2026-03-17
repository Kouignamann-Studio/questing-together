import { EmptyState, PillButton, Stack } from '@/components';
import { useGame } from '@/contexts/GameContext';
import LobbyView from '@/features/lobby/LobbyView';

const LobbyContent = () => {
  const { isLobby, localPlayerId, isAdventureStarted, localRole, roomConnection } = useGame();

  if (isLobby) return <LobbyView />;

  if (!localPlayerId) {
    return <EmptyState text="Syncing your player slot..." />;
  }

  if (!isAdventureStarted || !localRole) {
    const statusText = !isAdventureStarted
      ? 'Waiting for adventure to start...'
      : 'This room is in progress but your role is not assigned.';

    return (
      <>
        <EmptyState text={statusText} />
        <Stack direction="row" justify="flex-end" style={{ marginTop: -4 }}>
          <PillButton
            label={roomConnection.isBusy ? 'Leaving...' : 'Leave Room'}
            variant="danger"
            disabled={roomConnection.isBusy}
            onPress={() => roomConnection.leaveRoom()}
          />
        </Stack>
      </>
    );
  }

  return null;
};

export default LobbyContent;
