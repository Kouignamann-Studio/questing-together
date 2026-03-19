import { Stack } from '@/components';
import TimedStatusCard from '@/features/story/components/timed/TimedStatusCard';
import type { TimedData } from '@/features/story/types/types';

type EmbeddedTimedSectionProps = {
  timed: TimedData;
  phaseLabel: string;
};

const EmbeddedTimedSection = ({ timed, phaseLabel }: EmbeddedTimedSectionProps) => {
  if (!timed.endsAt) return null;

  return (
    <>
      <Stack style={{ height: 18 }} />
      <TimedStatusCard
        label={phaseLabel}
        endAt={timed.endsAt}
        durationSeconds={timed.durationSeconds}
        statusText={timed.waitingText ?? 'Le groupe attend....'}
        statusStyle="journal"
        timePrefix="Temps restant"
        showTime
        showFinishButton
        allowEarly={timed.allowEarly}
        onFinishEarly={timed.onFinish}
        embedded
      />
    </>
  );
};

export default EmbeddedTimedSection;
