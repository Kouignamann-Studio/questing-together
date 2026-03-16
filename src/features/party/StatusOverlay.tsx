import { ScrollView, View } from 'react-native';
import { Typography } from '@/components/display';
import { PillButton } from '@/components/input';
import { colors } from '@/constants/colors';
import { roles } from '@/constants/constants';
import PartyStatusCard from '@/features/party/PartyStatusCard';
import type { PlayerId, RoleId } from '@/types/player';
import type { PartyStatusRow } from '@/utils/buildPartyStatusRows';

type StatusOverlayProps = {
  bottomInset: number;
  roomCode: string | null;
  roomError: string | null;
  storyError: string | null;
  players: Array<{ display_name: string | null; player_id: PlayerId }>;
  localRole: RoleId | null;
  partyStatusRows: PartyStatusRow[];
  isHost: boolean;
  isBusy: boolean;
  onResetStory: () => void;
  onLeaveRoom: () => void;
};

export function StatusOverlay({
  bottomInset,
  roomCode,
  roomError,
  storyError,
  players,
  localRole,
  partyStatusRows,
  isHost,
  isBusy,
  onResetStory,
  onLeaveRoom,
}: StatusOverlayProps) {
  return (
    <View
      style={{
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: 24 + bottomInset,
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
        {roomError ? (
          <Typography variant="error" style={{ fontSize: 13, color: colors.errorDark }}>
            Room error: {roomError}
          </Typography>
        ) : null}
        {storyError ? (
          <Typography variant="error" style={{ fontSize: 13, color: colors.errorDark }}>
            Story sync error: {storyError}
          </Typography>
        ) : null}
        {roomCode ? (
          <Typography
            variant="body"
            style={{ fontSize: 13, fontWeight: '700', color: colors.textOverlayHeading }}
          >
            Room code: {roomCode}
          </Typography>
        ) : null}
        {players.length ? (
          <Typography
            variant="body"
            style={{ marginTop: -6, fontSize: 12, color: colors.textOverlayBody }}
          >
            Players: {players.map((p) => p.display_name || p.player_id).join(', ')}
          </Typography>
        ) : null}
        {localRole ? (
          <Typography
            variant="body"
            style={{
              marginTop: -6,
              fontSize: 12,
              fontWeight: '700',
              color: colors.textOverlayAccent,
            }}
          >
            You are {roles.find((r) => r.id === localRole)?.label ?? localRole}.
          </Typography>
        ) : null}
        <PartyStatusCard title="Party Status" rows={partyStatusRows} variant="parchment" />
        <View style={{ marginTop: -4, flexDirection: 'row', justifyContent: 'flex-end' }}>
          {isHost ? <PillButton label="Restart Adventure" onPress={onResetStory} /> : null}
          <PillButton
            label={isBusy ? 'Leaving...' : 'Leave Room'}
            variant="danger"
            disabled={isBusy}
            onPress={onLeaveRoom}
          />
        </View>
      </ScrollView>
    </View>
  );
}
