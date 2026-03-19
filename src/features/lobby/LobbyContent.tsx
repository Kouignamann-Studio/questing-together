import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BottomSheet,
  Button,
  Divider,
  EmptyState,
  Portrait,
  Stack,
  Typography,
} from '@/components';
import { colors } from '@/constants/colors';
import { playerNameById, roles } from '@/constants/constants';
import { useGame } from '@/contexts/GameContext';
import { portraitByRole } from '@/utils/portraitByRole';

const LobbyContent = () => {
  const {
    roomConnection,
    localPlayerId,
    localDisplayName,
    room,
    isLobby,
    isAdventureStarted,
    localRole,
    isHost,
  } = useGame();
  const insets = useSafeAreaInsets();
  const { players, isBusy } = roomConnection;

  // Early returns
  if (!isLobby) {
    if (!localPlayerId) {
      return <EmptyState text="Syncing your player slot..." />;
    }

    if (!isAdventureStarted || !localRole) {
      const statusText = !isAdventureStarted
        ? 'Waiting for adventure to start...'
        : 'This room is in progress but your role is not assigned.';

      return <EmptyState text={statusText} />;
    }

    return null;
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={{
          padding: 12,
          gap: 14,
          paddingTop: 12 + insets.top,
          paddingBottom: 120 + insets.bottom,
          flexGrow: 1,
        }}
      >
        <Stack
          gap={12}
          style={{
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

          {localPlayerId ? (
            <>
              <Divider />

              {/* Party members */}
              <Typography variant="caption" bold style={{ color: colors.textAvatarNameParchment }}>
                Party
              </Typography>
              <Stack direction="row" justify="space-evenly">
                {players.map((p) => {
                  const role = roles.find((r) => r.id === p.role_id);
                  return (
                    <Stack key={p.player_id} align="center" gap={2}>
                      {p.role_id ? (
                        <Portrait
                          source={portraitByRole(p.role_id)}
                          size={80}
                          highlighted
                          highlightColor={colors.success}
                          name={role?.label ?? ''}
                          nameColor={colors.success}
                          nameFontSize={12}
                        />
                      ) : null}
                      <Typography
                        variant="fine"
                        bold
                        style={{ color: colors.textAvatarNameParchment }}
                      >
                        {p.display_name ?? playerNameById[p.player_id]}
                      </Typography>
                    </Stack>
                  );
                })}
              </Stack>

              <Typography
                variant="caption"
                style={{ textAlign: 'center', color: colors.textOverlayAccent }}
              >
                {players.length === 1
                  ? 'Waiting for companions to join...'
                  : `${players.length} adventurers ready`}
              </Typography>
            </>
          ) : (
            <EmptyState text="Syncing your player slot..." />
          )}
        </Stack>
      </ScrollView>

      {/* Bottom actions */}
      <BottomSheet size="xs">
        <Stack direction="row" gap={10}>
          <Stack flex={1}>
            <Button
              label={isBusy ? 'Leaving...' : 'Leave Room'}
              variant="danger"
              size="sm"
              disabled={isBusy}
              onPress={() => roomConnection.leaveRoom()}
            />
          </Stack>
          <Stack flex={1}>
            {isHost ? (
              <Button
                label={isBusy ? 'Starting...' : 'Start Adventure'}
                variant="validation"
                size="sm"
                disabled={isBusy}
                onPress={() => roomConnection.startAdventure()}
              />
            ) : (
              <Button label="Waiting for host..." variant="ghost" size="sm" disabled />
            )}
          </Stack>
        </Stack>
      </BottomSheet>
    </>
  );
};

export default LobbyContent;
