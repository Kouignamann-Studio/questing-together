import { createContext, type ReactNode, useContext } from 'react';
import { useGameState } from '@/hooks/useGameState';

type GameStateValue = ReturnType<typeof useGameState>;

const GameContext = createContext<GameStateValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const game = useGameState();
  return <GameContext.Provider value={game}>{children}</GameContext.Provider>;
}

export function useGame(): GameStateValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
