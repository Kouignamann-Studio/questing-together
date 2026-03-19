import { Pressable } from 'react-native';
import Typography from '@/components/display/Typography';
import Stack from '@/components/layout/Stack';
import { colors } from '@/constants/colors';

type RoomCardProps = {
  code: string;
  status: string;
  playerCount: number;
  hostName: string;
  isHost?: boolean;
  disabled?: boolean;
  onPress: () => void;
  onDelete?: () => void;
};

const RoomCard = ({
  code,
  status,
  playerCount,
  hostName,
  isHost = false,
  disabled = false,
  onPress,
  onDelete,
}: RoomCardProps) => {
  return (
    <Stack direction="row" gap={8} align="center" style={{ width: '100%' }}>
      <Pressable disabled={disabled} onPress={onPress} style={{ flex: 1 }}>
        <Stack
          direction="row"
          align="center"
          style={{
            padding: 12,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.borderCard,
            backgroundColor: 'rgba(0,0,0,0.3)',
          }}
        >
          <Stack flex={1} gap={2}>
            <Typography variant="body1" bold style={{ color: colors.textPrimary }}>
              {code}
            </Typography>
            <Typography variant="small" style={{ color: colors.textSecondary }}>
              {hostName} · {status} · {playerCount}/3
            </Typography>
          </Stack>
          <Typography variant="caption" bold style={{ color: colors.success }}>
            Join
          </Typography>
        </Stack>
      </Pressable>

      {isHost && onDelete ? (
        <Pressable
          disabled={disabled}
          onPress={onDelete}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            backgroundColor: colors.riskyBadgeBg,
            borderWidth: 1,
            borderColor: colors.errorDark,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="body1">🗑️</Typography>
        </Pressable>
      ) : null}
    </Stack>
  );
};

export default RoomCard;
