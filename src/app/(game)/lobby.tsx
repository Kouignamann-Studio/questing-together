import { Redirect } from 'expo-router';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import paperTexture from '@/assets/images/T_Background_Paper.png';
import { PillButton, Stack, TiledBackground, Typography } from '@/components';
import { colors } from '@/constants/colors';
import { useGame } from '@/contexts/GameContext';
import LobbyView from '@/features/lobby/LobbyView';
import type { RoleId } from '@/types/player';

const LobbyScreen = () => {
  const game = useGame();
  const insets = useSafeAreaInsets();

  if (!game.room) return null;

  if (game.isStoryView) {
    return <Redirect href="/(game)/story" />;
  }

  if (!game.roomStory.isReady) {
    return (
      <Stack
        flex={1}
        align="center"
        justify="center"
        style={{ backgroundColor: colors.backgroundPaper }}
      >
        <TiledBackground source={paperTexture} />
        <Typography variant="body" style={{ fontSize: 14, color: colors.textSecondary }}>
          Syncing room state...
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack flex={1} style={{ backgroundColor: colors.backgroundPaper }}>
      <TiledBackground source={paperTexture} />
      <ScrollView
        contentContainerStyle={{
          padding: 12,
          gap: 14,
          paddingTop: 12 + insets.top,
          paddingBottom: 96 + insets.bottom,
          flexGrow: 1,
        }}
      >
        {game.roomConnection.roomError ? (
          <Typography variant="error" style={{ fontSize: 13, color: colors.errorDark }}>
            Room error: {game.roomConnection.roomError}
          </Typography>
        ) : null}
        {game.roomStory.storyError ? (
          <Typography variant="error" style={{ fontSize: 13, color: colors.errorDark }}>
            Story sync error: {game.roomStory.storyError}
          </Typography>
        ) : null}

        {game.isLobby ? (
          <LobbyView
            localPlayerId={game.localPlayerId}
            localDisplayName={game.localDisplayName}
            roomCode={game.room?.code ?? null}
            targetPlayerCount={game.room.target_player_count}
            players={game.roomConnection.players.map((p) => ({
              playerId: p.player_id,
              roleId: p.role_id,
              displayName: p.display_name,
            }))}
            isHost={game.isHost}
            isBusy={game.roomConnection.isBusy}
            onSetDisplayName={(name) => void game.roomConnection.setDisplayName(name)}
            onSelectRole={(roleId: RoleId) => void game.roomConnection.selectRole(roleId)}
            onSetTargetPlayerCount={(c) => void game.roomConnection.setTargetPlayerCount(c)}
            onStartAdventure={() => void game.roomConnection.startAdventure()}
            onLeaveRoom={() => void game.roomConnection.leaveRoom()}
          />
        ) : !game.localPlayerId ? (
          <Typography variant="body" style={{ fontSize: 14, color: colors.textSecondary }}>
            Syncing your player slot...
          </Typography>
        ) : !game.isAdventureStarted || !game.localRole ? (
          <>
            <Typography variant="body" style={{ fontSize: 14, color: colors.textSecondary }}>
              {!game.isAdventureStarted
                ? 'Waiting for adventure to start...'
                : 'This room is in progress but your role is not assigned.'}
            </Typography>
            <Stack direction="row" justify="flex-end" style={{ marginTop: -4 }}>
              <PillButton
                label={game.roomConnection.isBusy ? 'Leaving...' : 'Leave Room'}
                variant="danger"
                disabled={game.roomConnection.isBusy}
                onPress={() => void game.roomConnection.leaveRoom()}
              />
            </Stack>
          </>
        ) : null}
      </ScrollView>
    </Stack>
  );
};

export default LobbyScreen;
