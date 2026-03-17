import { Button, EmptyState, Stack, Typography } from '@/components';
import { colors } from '@/constants/colors';
import { useGame } from '@/contexts/GameContext';
import RoleOnboardingCard from '@/features/lobby/RoleOnboardingCard';

const LobbyContent = () => {
  // Hooks
  const {
    roomConnection,
    localPlayerId,
    localDisplayName,
    room,
    isLobby,
    isAdventureStarted,
    localRole,
  } = useGame();

  // Handlers
  const handleLeaveRoom = () => roomConnection.leaveRoom();

  // Early returns
  if (!isLobby) {
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
            <Button
              label={roomConnection.isBusy ? 'Leaving...' : 'Leave Room'}
              variant="danger"
              size="sm"
              disabled={roomConnection.isBusy}
              onPress={handleLeaveRoom}
            />
          </Stack>
        </>
      );
    }

    return null;
  }

  // Render
  return (
    <Stack
      gap={12}
      style={{
        marginHorizontal: -12,
        marginTop: -2,
        paddingHorizontal: 12,
        paddingVertical: 14,
        overflow: 'hidden',
        backgroundColor: colors.backgroundCardTransparent,
      }}
    >
      <Typography variant="heading" style={{ color: colors.textOverlayHeading }}>
        {"À l'Aventure Compagnons"}
      </Typography>

      {localPlayerId ? (
        <Typography
          variant="bodySm"
          bold
          style={{ marginTop: -2, textAlign: 'center', color: colors.textOverlayAccent }}
        >
          Signed in as {localDisplayName}
        </Typography>
      ) : null}

      {room?.code ? (
        <Typography variant="body" bold style={{ color: colors.textOverlayHeading }}>
          Room code: {room.code}
        </Typography>
      ) : null}

      {localPlayerId ? <RoleOnboardingCard /> : <EmptyState text="Syncing your player slot..." />}
      <Stack direction="row" justify="flex-end" style={{ marginTop: -4 }}>
        <Button
          label={roomConnection.isBusy ? 'Leaving...' : 'Leave Room'}
          variant="danger"
          disabled={roomConnection.isBusy}
          onPress={handleLeaveRoom}
        />
      </Stack>
    </Stack>
  );
};

export default LobbyContent;
