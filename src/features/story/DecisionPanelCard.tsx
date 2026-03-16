import { Stack, TabBar, Typography } from '@/components';
import { colors } from '@/constants/colors';
import { useDecision } from '@/contexts/DecisionContext';
import EmbeddedDecisionPanel from '@/features/story/components/decision/EmbeddedDecisionPanel';
import FullPanelContent from '@/features/story/components/FullPanelContent';

type TabId = 'actions' | 'decisions';

const DECISION_TABS: { id: TabId; label: string }[] = [
  { id: 'actions', label: 'Actions' },
  { id: 'decisions', label: 'Decisions' },
];

const COMBAT_TABS: { id: TabId; label: string }[] = [
  { id: 'actions', label: 'Actions' },
  { id: 'decisions', label: 'Combat' },
];

const DecisionPanelCard = () => {
  const ctx = useDecision();

  if (ctx.embedded) {
    return <EmbeddedDecisionPanel />;
  }

  return (
    <Stack
      gap={10}
      style={{
        backgroundColor: colors.backgroundCombatCard,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.borderCard,
      }}
    >
      <Typography variant="sectionTitle" style={{ color: colors.textStatus }}>
        Decision Panel
      </Typography>

      {!ctx.scene.isTimed && !ctx.scene.isEnding ? (
        <TabBar
          tabs={ctx.scene.isCombat ? COMBAT_TABS : DECISION_TABS}
          activeTab={ctx.activeTab}
          onChangeTab={(tab) => ctx.setActiveTab(tab as TabId)}
        />
      ) : null}

      <Stack gap={8}>
        <FullPanelContent />
      </Stack>
    </Stack>
  );
};

export default DecisionPanelCard;
