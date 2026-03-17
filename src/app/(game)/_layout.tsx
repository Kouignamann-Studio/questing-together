import { Redirect, Stack } from 'expo-router';
import { useGame } from '@/contexts/GameContext';

export default function GameLayout() {
  const game = useGame();

  if (!game.room) {
    return <Redirect href="/(public)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="lobby" />
      <Stack.Screen name="story" />
    </Stack>
  );
}
