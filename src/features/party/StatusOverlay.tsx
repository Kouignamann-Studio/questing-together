import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '@/components/display';
import { Button } from '@/components/input';
import { colors } from '@/constants/colors';
import { roles } from '@/constants/constants';
import { useGame } from '@/contexts/GameContext';
import PartyStatusCard from '@/features/party/PartyStatusCard';

export function StatusOverlay() {
  const insets = useSafeAreaInsets();
  const game = useGame();
  const roomStory = game.roomStory;
  const connection = game.roomConnection;

  return (
    <View
      style={{
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: 24 + insets.bottom,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.borderOverlay,
        backgroundColor: colors.backgroundOverlayPanel,
        padding: 12,
        shadowColor: colors.textBlack,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 14,
      }}
    >
      <ScrollView style={{ maxHeight: 280 }} contentContainerStyle={{ gap: 8 }}>
        {connection.roomError ? (
          <Typography variant="error" style={{ fontSize: 13, color: colors.errorDark }}>
            Room error: {connection.roomError}
          </Typography>
        ) : null}
        {roomStory.storyError ? (
          <Typography variant="error" style={{ fontSize: 13, color: colors.errorDark }}>
            Story sync error: {roomStory.storyError}
          </Typography>
        ) : null}
        {game.room?.code ? (
          <Typography
            variant="body"
            style={{ fontSize: 13, fontWeight: '700', color: colors.textOverlayHeading }}
          >
            Room code: {game.room.code}
          </Typography>
        ) : null}
        {connection.players.length ? (
          <Typography
            variant="body"
            style={{ marginTop: -6, fontSize: 12, color: colors.textOverlayBody }}
          >
            Players: {connection.players.map((p) => p.display_name || p.player_id).join(', ')}
          </Typography>
        ) : null}
        {game.localRole ? (
          <Typography
            variant="body"
            style={{
              marginTop: -6,
              fontSize: 12,
              fontWeight: '700',
              color: colors.textOverlayAccent,
            }}
          >
            You are {roles.find((r) => r.id === game.localRole)?.label ?? game.localRole}.
          </Typography>
        ) : null}
        <PartyStatusCard title="Party Status" rows={game.partyStatusRows} variant="parchment" />
        <View style={{ marginTop: -4, flexDirection: 'row', justifyContent: 'flex-end' }}>
          {game.isHost ? (
            <Button
              label="Restart Adventure"
              size="sm"
              variant="ghost"
              onPress={() => void roomStory.resetStory()}
            />
          ) : null}
          <Button
            label={connection.isBusy ? 'Leaving...' : 'Leave Room'}
            variant="danger"
            size="sm"
            disabled={connection.isBusy}
            onPress={() => void connection.leaveRoom()}
          />
        </View>
      </ScrollView>
    </View>
  );
}
