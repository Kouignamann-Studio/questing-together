import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet, Stack, Typography } from '@/components';
import { colors } from '@/constants/colors';
import { useDecision } from '@/contexts/DecisionContext/DecisionContext';
import { useGame } from '@/contexts/GameContext';
import CombatActionGrid from '@/features/combat/CombatActionGrid';
import CombatHeader from '@/features/combat/CombatHeader';
import type { CombatPlayer } from '@/features/combat/CombatPortraitStrip';
import CombatPortraitStrip from '@/features/combat/CombatPortraitStrip';
import CombatStatusCard from '@/features/combat/CombatStatusCard';
import EnemyList from '@/features/combat/EnemyList';

const CombatScreen = () => {
  const insets = useSafeAreaInsets();
  const { combat } = useDecision();
  const { roomConnection, localPlayerId, playerDisplayNameById } = useGame();

  const localCharacter =
    roomConnection.characters.find((c) => c.playerId === localPlayerId) ?? null;

  const combatPlayers: CombatPlayer[] = roomConnection.players
    .filter((p) => p.role_id)
    .map((p) => ({
      playerId: p.player_id,
      roleId: p.role_id as NonNullable<typeof p.role_id>,
      displayName: playerDisplayNameById[p.player_id] ?? p.player_id,
    }));

  return (
    <Stack flex={1} style={{ backgroundColor: colors.backgroundDark }}>
      <Stack style={{ paddingTop: insets.top }}>
        <CombatHeader character={localCharacter} />
      </Stack>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingBottom: 200 + insets.bottom,
          gap: 10,
          paddingTop: 8,
        }}
      >
        <Stack gap={4} align="center" style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
          <Typography
            variant="body"
            style={{
              color: colors.combatTitle,
              fontWeight: '700',
              fontSize: 15,
              textAlign: 'center',
            }}
          >
            Zone de combat
          </Typography>
          <Typography
            variant="caption"
            style={{ color: colors.combatWaiting, fontSize: 12, textAlign: 'center' }}
          >
            Vous êtes dans une zone de combat libre
          </Typography>
        </Stack>

        <EnemyList />

        {combat.state ? (
          <CombatStatusCard
            combatState={combat.state}
            combatLog={combat.log}
            resolvedOption={null}
            showResolutionStatus={false}
          />
        ) : null}

        <CombatPortraitStrip players={combatPlayers} localPlayerId={localPlayerId} />
      </ScrollView>

      <BottomSheet size="sm">
        <CombatActionGrid />
      </BottomSheet>
    </Stack>
  );
};

export default CombatScreen;
