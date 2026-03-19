import { Typography } from '@/components/display';
import { ScreenContainer } from '@/components/layout';
import { useGame } from '@/contexts/GameContext';
import RoomConnectionCard from '@/features/lobby/RoomConnectionCard';

const HomeScreen = () => {
  const game = useGame();

  if (!game.auth.isAuthReady) {
    return (
      <ScreenContainer centered>
        <Typography>Signing in...</Typography>
      </ScreenContainer>
    );
  }

  if (game.auth.authError) {
    return (
      <ScreenContainer centered>
        <Typography variant="error">Auth error: {game.auth.authError}</Typography>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <RoomConnectionCard
        isBusy={game.roomConnection.isBusy}
        errorText={game.roomConnection.roomError}
        onCreateRoom={(name, roleId) => void game.roomConnection.createRoom(name, roleId)}
        onJoinRoom={(code, name, roleId) => void game.roomConnection.joinRoom(code, name, roleId)}
        onPeekRoom={(code) => game.roomConnection.peekRoom(code)}
      />
    </ScreenContainer>
  );
};

export default HomeScreen;
