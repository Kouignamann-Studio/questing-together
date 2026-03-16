import { PillButton, Stack, Typography } from '@/components';
import { colors } from '@/constants/colors';
import { RoleOnboardingCard } from '@/features/lobby/RoleOnboardingCard';
import type { PlayerId, RoleId } from '@/types/player';

type LobbyViewProps = {
  localPlayerId: PlayerId | null;
  localDisplayName: string;
  roomCode: string | null;
  targetPlayerCount: number;
  players: Array<{ playerId: PlayerId; roleId: RoleId | null; displayName: string | null }>;
  isHost: boolean;
  isBusy: boolean;
  onSetDisplayName: (name: string) => void;
  onSelectRole: (roleId: RoleId) => void;
  onSetTargetPlayerCount: (count: number) => void;
  onStartAdventure: () => void;
  onLeaveRoom: () => void;
};

const LobbyView = ({
  localPlayerId,
  localDisplayName,
  roomCode,
  targetPlayerCount,
  players,
  isHost,
  isBusy,
  onSetDisplayName,
  onSelectRole,
  onSetTargetPlayerCount,
  onStartAdventure,
  onLeaveRoom,
}: LobbyViewProps) => {
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
      <Typography
        variant="title"
        style={{ fontSize: 24, textAlign: 'center', color: colors.textOverlayHeading }}
      >
        {"À l'Aventure Compagnons"}
      </Typography>

      {localPlayerId ? (
        <Typography
          variant="body"
          style={{
            marginTop: -2,
            fontSize: 13,
            fontWeight: '600',
            textAlign: 'center',
            color: colors.textOverlayAccent,
          }}
        >
          Signed in as {localDisplayName}
        </Typography>
      ) : null}

      {roomCode ? (
        <Typography
          variant="body"
          style={{ fontSize: 14, fontWeight: '700', color: colors.textOverlayHeading }}
        >
          Room code: {roomCode}
        </Typography>
      ) : null}

      {localPlayerId ? (
        <RoleOnboardingCard
          localPlayerId={localPlayerId}
          players={players}
          targetPlayerCount={targetPlayerCount}
          isHost={isHost}
          isBusy={isBusy}
          onSetDisplayName={onSetDisplayName}
          onSelectRole={onSelectRole}
          onSetTargetPlayerCount={onSetTargetPlayerCount}
          onStartAdventure={onStartAdventure}
        />
      ) : (
        <Typography variant="body" style={{ fontSize: 14, color: colors.textSecondary }}>
          Syncing your player slot...
        </Typography>
      )}
      <Stack direction="row" justify="flex-end" style={{ marginTop: -4 }}>
        <PillButton
          label={isBusy ? 'Leaving...' : 'Leave Room'}
          variant="danger"
          disabled={isBusy}
          onPress={onLeaveRoom}
        />
      </Stack>
    </Stack>
  );
};

export default LobbyView;
