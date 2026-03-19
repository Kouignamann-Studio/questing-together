import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet, Button, RoomCard, Stack, Typography } from '@/components';
import { colors } from '@/constants/colors';
import { useGame } from '@/contexts/GameContext';

type RoomBrowserProps = {
  onSelectRoom: (code: string) => void;
  onBack: () => void;
};

const RoomBrowser = ({ onSelectRoom, onBack }: RoomBrowserProps) => {
  const insets = useSafeAreaInsets();
  const { roomConnection } = useGame();
  const { myRooms, availableRooms, isBusy, roomError } = roomConnection;

  return (
    <Stack flex={1} style={{ backgroundColor: colors.backgroundDark }}>
      <ScrollView
        contentContainerStyle={{
          padding: 12,
          gap: 12,
          paddingTop: 12 + insets.top,
          paddingBottom: 120 + insets.bottom,
        }}
      >
        {myRooms.length > 0 ? (
          <Stack gap={8}>
            <Typography variant="h4" style={{ color: colors.combatTitle }}>
              Your Rooms
            </Typography>
            {myRooms.map((r) => (
              <RoomCard
                key={r.roomId}
                code={r.code}
                status={r.status}
                playerCount={r.playerCount}
                hostName={r.hostName}
                isHost={r.isHost}
                disabled={isBusy}
                onPress={() => void roomConnection.rejoinRoom(r.roomId)}
                onDelete={() => void roomConnection.deleteRoom(r.roomId)}
              />
            ))}
          </Stack>
        ) : null}

        <Stack gap={8}>
          <Typography variant="h4" style={{ color: colors.combatTitle }}>
            Available Rooms
          </Typography>
          {availableRooms.length > 0 ? (
            availableRooms.map((r) => (
              <RoomCard
                key={r.roomId}
                code={r.code}
                status={r.status}
                playerCount={r.playerCount}
                hostName={r.hostName}
                disabled={isBusy}
                onPress={() => onSelectRoom(r.code)}
              />
            ))
          ) : (
            <Typography
              variant="body1"
              style={{ color: colors.combatWaiting, textAlign: 'center' }}
            >
              No rooms available
            </Typography>
          )}
        </Stack>
      </ScrollView>

      <BottomSheet size="xs">
        <Button size="sm" variant="ghost" disabled={isBusy} onPress={onBack} label="Back" />
        {roomError ? <Typography variant="error">{roomError}</Typography> : null}
      </BottomSheet>
    </Stack>
  );
};

export default RoomBrowser;
