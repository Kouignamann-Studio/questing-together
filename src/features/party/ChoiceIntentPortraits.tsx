import { Portrait, Stack } from '@/components';
import type { PlayerId, RoleId } from '@/types/player';
import { portraitByRole } from '@/utils/portraitByRole';

export type ChoiceIntentPortraitPlayer = {
  playerId: PlayerId;
  roleId: RoleId | null;
  confirmed: boolean;
};

type ChoiceIntentPortraitsProps = {
  players: ChoiceIntentPortraitPlayer[];
  size?: 'default' | 'compact';
  placement?: 'topRight' | 'bottomRight';
};

const sizeConfig = {
  default: { portraitSize: 34, overlap: -10, overlayRight: -10 },
  compact: { portraitSize: 30, overlap: -9, overlayRight: -8 },
} as const;

const placementStyle = {
  topRight: { top: -10 },
  bottomRight: { bottom: -10 },
} as const;

export function ChoiceIntentPortraits({
  players,
  size = 'default',
  placement = 'topRight',
}: ChoiceIntentPortraitsProps) {
  const visiblePlayers = players.filter(
    (player): player is ChoiceIntentPortraitPlayer & { roleId: RoleId } => Boolean(player.roleId),
  );
  if (!visiblePlayers.length) return null;

  const config = sizeConfig[size];

  return (
    <Stack
      direction="row"
      align="center"
      pointerEvents="none"
      style={{
        position: 'absolute',
        flexDirection: 'row-reverse',
        right: config.overlayRight,
        ...placementStyle[placement],
      }}
    >
      {visiblePlayers.map((player, index) => (
        <Portrait
          key={player.playerId}
          source={portraitByRole(player.roleId)}
          size={config.portraitSize}
          highlighted={player.confirmed}
          style={{
            zIndex: visiblePlayers.length - index,
            marginRight: index > 0 ? config.overlap : 0,
          }}
        />
      ))}
    </Stack>
  );
}
