import { Redirect } from 'expo-router';
import { DecisionProvider } from '@/contexts/DecisionContext';
import { useGame } from '@/contexts/GameContext';
import CombatScreen from '@/features/combat/CombatScreen';

const AdventureSetupScreen = () => {
  const { roomStory, isLobby, isHost } = useGame();

  if (isLobby) {
    return <Redirect href="/(game)/lobby" />;
  }

  return (
    <DecisionProvider
      roomStory={roomStory}
      onResetStory={roomStory.resetStory}
      canResetStory={isHost}
      embedded={false}
    >
      <CombatScreen />
    </DecisionProvider>
  );
};

export default AdventureSetupScreen;
