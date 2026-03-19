import { Typography } from '@/components/display';
import { ScreenContainer } from '@/components/layout';
import { useGame } from '@/contexts/GameContext';
import GameLauncher from '@/features/home/GameLauncher';

const HomeScreen = () => {
  const { auth } = useGame();

  if (!auth.isAuthReady) {
    return (
      <ScreenContainer centered>
        <Typography>Signing in...</Typography>
      </ScreenContainer>
    );
  }

  if (auth.authError) {
    return (
      <ScreenContainer centered>
        <Typography variant="error">Auth error: {auth.authError}</Typography>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <GameLauncher />
    </ScreenContainer>
  );
};

export default HomeScreen;
