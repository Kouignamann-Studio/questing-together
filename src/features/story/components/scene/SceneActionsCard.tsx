import { Pressable, ScrollView } from 'react-native';
import { Stack, Typography } from '@/components';
import { colors } from '@/constants/colors';

type SceneActionChoice = {
  id: string;
  text: string;
  isDisabled?: boolean;
  hpDelta?: number;
  effectText?: string;
};

type SceneActionsCardProps = {
  phaseLabel: string;
  statusText: string;
  actions: SceneActionChoice[];
  localSelectedActionId: string | null;
  canAct: boolean;
  allowSkip: boolean;
  onTakeAction: (actionId: string) => void;
  onSkip: () => void;
  embedded?: boolean;
};

function getActionButtonStyle(isSelected: boolean, isActive: boolean, isDisabled: boolean) {
  const base = {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.tabBorder,
    backgroundColor: colors.textParchmentDark,
    padding: 10,
    gap: 4,
  };

  if (isSelected) {
    return {
      ...base,
      borderColor: colors.actionSelectedBorder,
      backgroundColor: colors.actionSelectedBg,
      opacity: 1,
    };
  }

  if (isActive) {
    return {
      ...base,
      borderColor: colors.borderOverlay,
      backgroundColor: colors.actionActiveBg,
    };
  }

  if (isDisabled) {
    return { ...base, opacity: 0.55 };
  }

  return base;
}

function getHpColor(hpDelta: number | undefined): string {
  if (hpDelta != null && hpDelta < 0) {
    return colors.hpNegative;
  }
  return colors.combatOutcome;
}

const SceneActionsCard = ({
  phaseLabel,
  statusText,
  actions,
  localSelectedActionId,
  canAct,
  allowSkip,
  onTakeAction,
  onSkip,
  embedded = false,
}: SceneActionsCardProps) => {
  return (
    <Stack
      gap={8}
      style={
        embedded
          ? { backgroundColor: 'transparent', borderWidth: 0, padding: 0 }
          : {
              backgroundColor: colors.backgroundCombatCard,
              borderRadius: 12,
              padding: 12,
              borderWidth: 1,
              borderColor: colors.borderCard,
            }
      }
    >
      {!embedded ? (
        <Typography variant="sectionTitle" style={{ color: colors.textStatus }}>
          Scene Actions
        </Typography>
      ) : null}
      <Typography
        variant="caption"
        style={{ fontWeight: '700', textTransform: 'uppercase', color: colors.textPhaseLabel }}
      >
        {phaseLabel}
      </Typography>
      <Typography variant="caption" style={{ color: colors.textRole, lineHeight: 18 }}>
        {statusText}
      </Typography>

      <ScrollView
        style={{ maxHeight: 260 }}
        contentContainerStyle={{ gap: 8, paddingBottom: 2 }}
        showsVerticalScrollIndicator={false}
      >
        {actions.map((action) => {
          const isSelected = action.id === localSelectedActionId;
          const isDisabled = !canAct || !!action.isDisabled;
          const isActive = isSelected || !isDisabled;
          const hasHpDelta =
            typeof action.hpDelta === 'number' &&
            Number.isFinite(action.hpDelta) &&
            action.hpDelta !== 0;
          const hpLabel = hasHpDelta
            ? `HP ${(action.hpDelta as number) > 0 ? '+' : ''}${action.hpDelta}`
            : null;

          return (
            <Pressable
              key={action.id}
              disabled={isDisabled}
              onPress={() => onTakeAction(action.id)}
              style={getActionButtonStyle(isSelected, isActive, isDisabled && !isSelected)}
            >
              <Typography variant="bodySm" style={{ lineHeight: 18, color: colors.textStatus }}>
                {action.text}
              </Typography>
              {hpLabel || action.effectText ? (
                <Stack direction="row" gap={8} wrap="wrap">
                  {hpLabel ? (
                    <Typography
                      variant="captionSm"
                      style={{
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        color: getHpColor(action.hpDelta),
                      }}
                    >
                      {hpLabel}
                    </Typography>
                  ) : null}
                  {action.effectText ? (
                    <Typography
                      variant="captionSm"
                      style={{
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        color: colors.textSubAction,
                      }}
                    >
                      {action.effectText}
                    </Typography>
                  ) : null}
                </Stack>
              ) : null}
              {action.isDisabled ? (
                <Typography
                  variant="captionSm"
                  style={{
                    color: colors.textDisabledAction,
                    textTransform: 'uppercase',
                    fontWeight: '700',
                  }}
                >
                  Unavailable after earlier actions
                </Typography>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>

      {allowSkip ? (
        <Pressable
          disabled={!canAct}
          onPress={onSkip}
          style={{
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.tabBorder,
            backgroundColor: colors.textParchmentDark,
            paddingVertical: 10,
            alignItems: 'center' as const,
            ...(!canAct ? { opacity: 0.5 } : {}),
          }}
        >
          <Typography
            variant="caption"
            style={{ fontWeight: '700', color: colors.textStatus, textTransform: 'uppercase' }}
          >
            Hold back (no reaction)
          </Typography>
        </Pressable>
      ) : null}
    </Stack>
  );
};

export default SceneActionsCard;
