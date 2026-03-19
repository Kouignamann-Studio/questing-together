import { Portrait, Typography } from '@/components/display';
import { Stack } from '@/components/layout';
import { colors } from '@/constants/colors';
import type { PlayerId, RoleId } from '@/types/player';
import { portraitByRole } from '@/utils/portraitByRole';

type CombatPlayer = {
  playerId: PlayerId;
  roleId: RoleId;
  displayName: string;
};

type CombatPortraitStripProps = {
  players: CombatPlayer[];
  localPlayerId: PlayerId | null;
};

const CombatPortraitStrip = ({ players, localPlayerId }: CombatPortraitStripProps) => {
  return (
    <Stack direction="row" justify="space-evenly" style={{ paddingVertical: 8 }}>
      {players.map((player) => {
        const isLocal = player.playerId === localPlayerId;

        return (
          <Stack key={player.playerId} align="center" gap={2}>
            <Portrait
              source={portraitByRole(player.roleId)}
              size={56}
              highlighted={isLocal}
              highlightColor={isLocal ? colors.intentConfirmedBorder : colors.tabBorder}
              hideName
            />
            <Typography
              variant="fine"
              style={{
                color: isLocal ? colors.intentConfirmedBorder : colors.combatWaiting,
                fontWeight: isLocal ? '700' : '400',
                fontSize: 10,
              }}
            >
              {player.displayName}
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );
};

export default CombatPortraitStrip;
export type { CombatPlayer };
