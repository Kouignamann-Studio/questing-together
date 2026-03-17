import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LayoutAnimation, Platform, UIManager } from 'react-native';
import {
  DecisionContext,
  type DecisionContextValue,
  type TabId,
} from '@/contexts/DecisionContext/DecisionContext';
import type {
  ActionState,
  CombatData,
  SceneState,
  TimedData,
  VoteState,
} from '@/features/story/types/types';
import type { UseRoomStoryResult } from '@/hooks/useRoomStory';
import type { OptionId } from '@/types/story';

type DecisionProviderProps = {
  roomStory: UseRoomStoryResult;
  onResetStory: () => void;
  canResetStory: boolean;
  embedded: boolean;
  children: ReactNode;
};

export function DecisionProvider({
  roomStory,
  onResetStory,
  canResetStory,
  embedded,
  children,
}: DecisionProviderProps) {
  const [userTab, setUserTab] = useState<TabId>('actions');
  const [pendingDraft, setPendingDraft] = useState<OptionId | null>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    LayoutAnimation.configureNext({
      duration: 420,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: { type: LayoutAnimation.Types.easeInEaseOut },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
  }, []);

  const scene: SceneState = useMemo(
    () => ({
      isEnding: Boolean(roomStory.currentScene.isEnding),
      isCombat: roomStory.isCombatScene,
      isTimed: roomStory.isTimedScene,
      phaseLabel: roomStory.phaseLabel,
      statusText: roomStory.phaseStatusText,
    }),
    [
      roomStory.currentScene.isEnding,
      roomStory.isCombatScene,
      roomStory.isTimedScene,
      roomStory.phaseLabel,
      roomStory.phaseStatusText,
    ],
  );

  const actions: ActionState = useMemo(
    () => ({
      items: roomStory.availableActions,
      localSelectedId: roomStory.localSelectedActionId,
      canAct: roomStory.canAct,
      allowSkip: roomStory.allowSkip,
      onTake: roomStory.takeAction,
      onSkip: roomStory.skipAction,
    }),
    [
      roomStory.availableActions,
      roomStory.localSelectedActionId,
      roomStory.canAct,
      roomStory.allowSkip,
      roomStory.takeAction,
      roomStory.skipAction,
    ],
  );

  const vote: VoteState = useMemo(
    () => ({
      visibleOptions: roomStory.visibleOptions,
      hiddenOptionCount: roomStory.hiddenOptionCount,
      riskyUnlockedOptionIds: roomStory.riskyUnlockedOptionIds,
      optionIntentByOptionId: roomStory.optionIntentByOptionId,
      localSelected: roomStory.localSelectedOption,
      localConfirmed: roomStory.localConfirmedOption,
      voteCounts: roomStory.voteCounts,
      confirmedCount: roomStory.confirmedVoteCount,
      expectedPlayerCount: roomStory.expectedPlayerCount,
      resolved: roomStory.resolvedOption,
      resolutionMode: roomStory.resolutionMode,
      localHasContinued: roomStory.localHasContinued,
      continuedCount: roomStory.continuedCount,
      isStoryEnded: roomStory.isStoryEnded,
      canVote: roomStory.canVote,
      lockReason: roomStory.voteLockReason,
      onSelect: roomStory.selectOption,
      onConfirm: roomStory.confirmOption,
      onContinue: roomStory.continueToNextScene,
    }),
    [
      roomStory.visibleOptions,
      roomStory.hiddenOptionCount,
      roomStory.riskyUnlockedOptionIds,
      roomStory.optionIntentByOptionId,
      roomStory.localSelectedOption,
      roomStory.localConfirmedOption,
      roomStory.voteCounts,
      roomStory.confirmedVoteCount,
      roomStory.expectedPlayerCount,
      roomStory.resolvedOption,
      roomStory.resolutionMode,
      roomStory.localHasContinued,
      roomStory.continuedCount,
      roomStory.isStoryEnded,
      roomStory.canVote,
      roomStory.voteLockReason,
      roomStory.selectOption,
      roomStory.confirmOption,
      roomStory.continueToNextScene,
    ],
  );

  const combat: CombatData = useMemo(
    () => ({ state: roomStory.combatState, log: roomStory.combatLog }),
    [roomStory.combatState, roomStory.combatLog],
  );

  const timed: TimedData = useMemo(
    () => ({
      endsAt: roomStory.timedEndsAt,
      durationSeconds: roomStory.timedDurationSeconds,
      statusText: roomStory.timedStatusText,
      allowEarly: roomStory.timedAllowEarly,
      waitingText: roomStory.timedWaitingText,
      onFinish: () => roomStory.finishTimedScene(true),
    }),
    [
      roomStory.timedEndsAt,
      roomStory.timedDurationSeconds,
      roomStory.timedStatusText,
      roomStory.timedAllowEarly,
      roomStory.timedWaitingText,
      roomStory.finishTimedScene,
    ],
  );

  const activeTab = useMemo<TabId>(() => {
    if (scene.isTimed) return 'actions';
    if (vote.localConfirmed || vote.resolved || vote.isStoryEnded) return 'decisions';
    return userTab;
  }, [scene.isTimed, vote.localConfirmed, vote.resolved, vote.isStoryEnded, userTab]);

  const draftOptionId = useMemo<OptionId | null>(() => {
    if (vote.resolved) return null;
    if (vote.localConfirmed) return vote.localConfirmed;
    if (vote.localSelected) return vote.localSelected;
    if (pendingDraft && vote.visibleOptions.some((o) => o.id === pendingDraft)) {
      return pendingDraft;
    }
    return null;
  }, [vote.resolved, vote.localConfirmed, vote.localSelected, vote.visibleOptions, pendingDraft]);

  const handleSelectOption = useCallback(
    (optionId: OptionId) => {
      setPendingDraft(optionId);
      vote.onSelect(optionId);
    },
    [vote.onSelect],
  );

  const value = useMemo<DecisionContextValue>(
    () => ({
      scene,
      actions,
      vote,
      combat,
      timed,
      activeTab,
      draftOptionId,
      onResetStory,
      canResetStory,
      embedded,
      setActiveTab: setUserTab,
      handleSelectOption,
    }),
    [
      scene,
      actions,
      vote,
      combat,
      timed,
      activeTab,
      draftOptionId,
      onResetStory,
      canResetStory,
      embedded,
      handleSelectOption,
    ],
  );

  return <DecisionContext.Provider value={value}>{children}</DecisionContext.Provider>;
}
