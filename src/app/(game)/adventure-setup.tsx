import { Redirect } from 'expo-router';
import { useGame } from '@/contexts/GameContext';
import CombatScreen from '@/features/combat/CombatScreen';

const AdventureSetupScreen = () => {
  const { isLobby } = useGame();

  if (isLobby) {
    return <Redirect href="/(game)/lobby" />;
  }

  return <CombatScreen />;
};

export default AdventureSetupScreen;
