import { Stack, Typography } from '@/components';
import { colors } from '@/constants/colors';
import { useDecision } from '@/contexts/DecisionContext';
import EmbeddedActionButtons from '@/features/story/components/decision/EmbeddedActionButtons';
import EmbeddedTimedSection from '@/features/story/components/decision/EmbeddedTimedSection';
import EmbeddedVoteSection from '@/features/story/components/decision/EmbeddedVoteSection';
import EndingContent from '@/features/story/components/decision/EndingContent';

const EmbeddedDecisionPanel = () => {
  const ctx = useDecision();

  if (ctx.scene.isEnding) {
    return (
      <Stack gap={14} style={{ paddingTop: 6 }}>
        <EndingContent canResetStory={ctx.canResetStory} onResetStory={ctx.onResetStory} embedded />
      </Stack>
    );
  }

  const timedIntroMessage =
    !ctx.timed.endsAt && ctx.scene.isTimed ? (
      <Typography
        variant="caption"
        style={{
          textAlign: 'center',
          color: colors.combatHealthValueEmbedded,
          fontStyle: 'italic',
        }}
      >
        {ctx.scene.statusText}
      </Typography>
    ) : null;

  return (
    <Stack gap={14} style={{ paddingTop: 6 }}>
      <Typography
        variant="bodyLg"
        style={{ color: colors.combatTitleEmbedded, textAlign: 'center', fontWeight: '600' }}
      >
        What do you do?
      </Typography>
      {timedIntroMessage}

      <EmbeddedActionButtons actions={ctx.actions} />

      {ctx.scene.isCombat ? null : ctx.scene.isTimed ? (
        <EmbeddedTimedSection timed={ctx.timed} phaseLabel={ctx.scene.phaseLabel} />
      ) : (
        <EmbeddedVoteSection
          vote={{ ...ctx.vote, onSelect: ctx.handleSelectOption }}
          draftOptionId={ctx.draftOptionId}
        />
      )}
    </Stack>
  );
};

export default EmbeddedDecisionPanel;
