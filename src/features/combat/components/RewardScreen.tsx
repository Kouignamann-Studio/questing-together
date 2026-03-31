import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet, Button, Stack, Typography } from '@/components';
import { colors } from '@/constants/colors';
import { useGame } from '@/contexts/GameContext';
import { useTranslation } from '@/contexts/I18nContext';
import { TRAIT_MAP } from '@/features/gameConfig';

type RewardOption = {
  type: 'add_card' | 'upgrade_card' | 'bonus';
  cardId?: string;
  name: string;
  description?: string;
  trait?: string;
  cost?: number;
  isRare?: boolean;
  upgradeName?: string;
  upgradeDescription?: string;
  icon?: string;
  id?: string;
};

type RewardData = {
  cardChoices: RewardOption[];
  upgradeChoices: RewardOption[];
  bonusChoices: RewardOption[];
};

type RewardScreenProps = {
  onDone: () => void;
};

const RewardCard = ({
  option,
  selected,
  onPress,
}: {
  option: RewardOption;
  selected: boolean;
  onPress: () => void;
}) => {
  const traitMeta = option.trait ? TRAIT_MAP[option.trait] : null;
  const traitColor = traitMeta?.color ?? colors.tabBorder;
  const descText =
    option.type === 'upgrade_card' ? (option.upgradeDescription ?? '') : (option.description ?? '');

  return (
    <Pressable onPress={onPress}>
      <Stack
        gap={4}
        style={{
          padding: 12,
          borderRadius: 8,
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? colors.intentConfirmedBorder : colors.tabBorder,
          backgroundColor: selected
            ? `${colors.intentConfirmedBorder}15`
            : colors.backgroundCombatCard,
        }}
      >
        <Stack direction="row" gap={6} align="center">
          {option.icon ? (
            <Typography variant="body">{option.icon}</Typography>
          ) : traitMeta ? (
            <Typography variant="body">{traitMeta.icon}</Typography>
          ) : null}
          <Stack flex={1} gap={descText ? 2 : 0}>
            <Stack direction="row" gap={4} align="center">
              <Typography
                variant="captionSm"
                style={{ color: colors.textPrimary, fontWeight: '700' }}
              >
                {option.type === 'upgrade_card' ? (option.upgradeName ?? option.name) : option.name}
              </Typography>
              {option.cost !== undefined && option.cost > 0 ? (
                <Stack
                  align="center"
                  justify="center"
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: traitColor,
                  }}
                >
                  <Typography
                    variant="micro"
                    style={{ color: '#fff', fontWeight: '800', fontSize: 9 }}
                  >
                    {option.cost}
                  </Typography>
                </Stack>
              ) : null}
              {option.isRare ? (
                <Typography
                  variant="micro"
                  style={{ color: '#ffd700', fontWeight: '800', fontSize: 7 }}
                >
                  RARE
                </Typography>
              ) : null}
            </Stack>
            {descText ? (
              <Typography variant="fine" style={{ color: colors.textSecondary, fontSize: 9 }}>
                {descText}
              </Typography>
            ) : null}
          </Stack>
        </Stack>
      </Stack>
    </Pressable>
  );
};

const RewardSection = ({
  title,
  options,
  selectedId,
  onSelect,
}: {
  title: string;
  options: RewardOption[];
  selectedId: string | null;
  onSelect: (opt: RewardOption) => void;
}) => (
  <Stack gap={6}>
    <Typography
      variant="caption"
      bold
      style={{ color: colors.textSecondary, textTransform: 'uppercase' }}
    >
      {title}
    </Typography>
    {options.map((opt, idx) => {
      const optId = opt.cardId ?? opt.id ?? `${opt.type}-${idx}`;
      return (
        <RewardCard
          key={optId}
          option={opt}
          selected={selectedId === optId}
          onPress={() => onSelect(opt)}
        />
      );
    })}
  </Stack>
);

const RewardScreen = ({ onDone }: RewardScreenProps) => {
  const insets = useSafeAreaInsets();
  const { roomConnection } = useGame();
  const { t } = useTranslation();
  const [rewards, setRewards] = useState<RewardData | null>(null);
  const [selectedReward, setSelectedReward] = useState<RewardOption | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: must only fire once on mount
  useEffect(() => {
    void roomConnection.combatGenerateRewards().then((result) => {
      if (result) setRewards(result as RewardData);
    });
  }, []);

  const handleSelect = useCallback((opt: RewardOption) => {
    const id = opt.cardId ?? opt.id ?? opt.name;
    setSelectedReward(opt);
    setSelectedId(id);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!selectedReward) return;
    setApplying(true);
    const rewardId = selectedReward.cardId ?? selectedReward.id ?? '';
    await roomConnection.combatSelectReward(selectedReward.type, rewardId);
    setApplying(false);
    onDone();
  }, [selectedReward, roomConnection, onDone]);

  if (!rewards) {
    return (
      <Stack flex={1} align="center" justify="center" style={{ padding: 24 }}>
        <Typography variant="caption" style={{ color: colors.combatWaiting }}>
          {t('combat.generating')}
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack
      flex={1}
      style={{
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.backgroundDark,
        zIndex: 10,
      }}
    >
      {/* Fixed header */}
      <Stack
        align="center"
        gap={6}
        style={{
          paddingTop: insets.top + 16,
          paddingBottom: 16,
          backgroundColor: `${colors.intentConfirmedBorder}12`,
          borderBottomWidth: 1,
          borderBottomColor: colors.tabBorder,
        }}
      >
        <Stack direction="row" gap={10} align="center">
          <Typography variant="body" style={{ color: colors.textSecondary }}>
            ⚔️
          </Typography>
          <Typography
            variant="h3"
            style={{ color: colors.combatOutcome, fontWeight: '800', letterSpacing: 1 }}
          >
            {t('combat.victory')}
          </Typography>
          <Typography variant="body" style={{ color: colors.textSecondary }}>
            ⚔️
          </Typography>
        </Stack>
        <Typography variant="caption" style={{ color: colors.textSecondary }}>
          {t('combat.chooseReward')}
        </Typography>
      </Stack>

      {/* Scrollable rewards */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 100 + insets.bottom,
          gap: 16,
        }}
        style={{ flex: 1 }}
      >
        <RewardSection
          title={t('combat.addCard')}
          options={rewards.cardChoices}
          selectedId={selectedId}
          onSelect={handleSelect}
        />

        <RewardSection
          title={t('combat.upgradeCard')}
          options={rewards.upgradeChoices}
          selectedId={selectedId}
          onSelect={handleSelect}
        />

        <RewardSection
          title={t('combat.bonus')}
          options={rewards.bonusChoices}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
      </ScrollView>

      {/* Fixed bottom confirm */}
      <BottomSheet
        size="sm"
        style={{ backgroundColor: colors.backgroundDark, borderColor: colors.tabBorder }}
      >
        <Button
          size="md"
          label={applying ? t('combat.applying') : t('combat.confirm')}
          onPress={() => void handleConfirm()}
          disabled={!selectedReward || applying}
        />
      </BottomSheet>
    </Stack>
  );
};

export default RewardScreen;
