import { Button, Stack } from '@/components';
import { ActionSubText, Typography } from '@/components/display';
import { colors } from '@/constants/colors';
import { useDecision } from '@/contexts/DecisionContext/DecisionContext';
import { useGame } from '@/contexts/GameContext';
import {
  formatHpLabel,
  getActionOpacity,
  getActionVariant,
} from '@/features/story/utils/decisionHelpers';

type GridSlot =
  | {
      type: 'action';
      id: string;
      text: string;
      hpDelta?: number;
      effectText?: string;
      isDisabled?: boolean;
    }
  | { type: 'leave' }
  | { type: 'empty' };

const CombatActionGrid = () => {
  const { actions } = useDecision();
  const { roomConnection } = useGame();

  // Build grid slots: actions first, then pad to even count, leave always last
  const slots: GridSlot[] = actions.items.map((a) => ({
    type: 'action' as const,
    id: a.id,
    text: a.text,
    hpDelta: a.hpDelta,
    effectText: a.effectText,
    isDisabled: a.isDisabled,
  }));

  // Pad with empty to make room for leave as last slot in a 2-col grid
  // Target: at least 4 slots, leave replaces the last one
  while (slots.length < 3) {
    slots.push({ type: 'empty' });
  }
  slots.push({ type: 'leave' });

  // Make even for 2-col grid
  if (slots.length % 2 !== 0) {
    slots.splice(slots.length - 1, 0, { type: 'empty' });
  }

  const rows: [GridSlot, GridSlot][] = [];
  for (let i = 0; i < slots.length; i += 2) {
    rows.push([slots[i], slots[i + 1]]);
  }

  const handleLeave = () => {
    void roomConnection.cancelAdventure();
  };

  return (
    <Stack gap={8}>
      {rows.map((row, rowIndex) => (
        <Stack key={`row-${rowIndex}`} direction="row" gap={8}>
          {row.map((slot, colIndex) => {
            if (slot.type === 'empty') {
              return (
                <Stack
                  key={`empty-${rowIndex}-${colIndex}`}
                  flex={1}
                  style={{
                    padding: 14,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: colors.tabBorder,
                    backgroundColor: colors.backgroundCombatCard,
                    opacity: 0.4,
                    minHeight: 72,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    variant="caption"
                    style={{ color: colors.combatWaiting, fontSize: 12 }}
                  >
                    TBD
                  </Typography>
                </Stack>
              );
            }

            if (slot.type === 'leave') {
              return (
                <Stack key="leave" flex={1}>
                  <Button
                    variant="danger"
                    disabled={roomConnection.isBusy}
                    onPress={handleLeave}
                    style={{ minHeight: 72 }}
                  >
                    <Typography
                      variant="body"
                      style={{
                        color: colors.textPrimary,
                        textAlign: 'center',
                        fontSize: 13,
                        fontWeight: '600',
                      }}
                    >
                      Run away
                    </Typography>
                    <ActionSubText hpLabel={null} effectText="Leave Room" />
                  </Button>
                </Stack>
              );
            }

            const isSelected = slot.id === actions.localSelectedId;
            const isDisabled = !actions.canAct || Boolean(slot.isDisabled);
            const hpLabel = formatHpLabel(slot.hpDelta);

            return (
              <Stack key={slot.id} flex={1}>
                <Button
                  variant={getActionVariant(isSelected)}
                  disabled={isDisabled}
                  onPress={() => actions.onTake(slot.id)}
                  style={{
                    opacity: getActionOpacity(isDisabled, isSelected),
                    minHeight: 72,
                  }}
                >
                  <Typography
                    variant="body"
                    style={{
                      color: colors.textPrimary,
                      textAlign: 'center',
                      fontSize: 13,
                      fontWeight: '600',
                    }}
                  >
                    {slot.text}
                  </Typography>
                  <ActionSubText hpLabel={hpLabel} effectText={slot.effectText} />
                </Button>
              </Stack>
            );
          })}
        </Stack>
      ))}
    </Stack>
  );
};

export default CombatActionGrid;
