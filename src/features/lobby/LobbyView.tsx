import { EmptyState, PillButton, Stack, Typography } from '@/components';
import { colors } from '@/constants/colors';
import { useGame } from '@/contexts/GameContext';
import { RoleOnboardingCard } from '@/features/lobby/RoleOnboardingCard';
import type { RoleId } from '@/types/player';

const LobbyView = () => {
  const { roomConnection, localPlayerId, localDisplayName, isHost, room } = useGame();

  const players = roomConnection.players.map((p) => ({
    playerId: p.player_id,
    roleId: p.role_id,
    displayName: p.display_name,
  }));

  const handleSetDisplayName = (name: string) => roomConnection.setDisplayName(name);
  const handleSelectRole = (roleId: RoleId) => roomConnection.selectRole(roleId);
  const handleSetTargetPlayerCount = (c: number) => roomConnection.setTargetPlayerCount(c);
  const handleStartAdventure = () => roomConnection.startAdventure();
  const handleLeaveRoom = () => roomConnection.leaveRoom();

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
          style={{
            marginTop: -2,
            fontWeight: '600',
            textAlign: 'center',
            color: colors.textOverlayAccent,
          }}
        >
          Signed in as {localDisplayName}
        </Typography>
      ) : null}

      {room?.code ? (
        <Typography variant="body" style={{ fontWeight: '700', color: colors.textOverlayHeading }}>
          Room code: {room.code}
        </Typography>
      ) : null}

      {localPlayerId ? (
        <RoleOnboardingCard
          localPlayerId={localPlayerId}
          players={players}
          targetPlayerCount={room?.target_player_count ?? 1}
          isHost={isHost}
          isBusy={roomConnection.isBusy}
          onSetDisplayName={handleSetDisplayName}
          onSelectRole={handleSelectRole}
          onSetTargetPlayerCount={handleSetTargetPlayerCount}
          onStartAdventure={handleStartAdventure}
        />
      ) : (
        <EmptyState text="Syncing your player slot..." />
      )}
      <Stack direction="row" justify="flex-end" style={{ marginTop: -4 }}>
        <PillButton
          label={roomConnection.isBusy ? 'Leaving...' : 'Leave Room'}
          variant="danger"
          disabled={roomConnection.isBusy}
          onPress={handleLeaveRoom}
        />
      </Stack>
    </Stack>
  );
};

export default LobbyView;
