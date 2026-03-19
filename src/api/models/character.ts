import type { PlayerId } from '@/types/player';

type Character = {
  id: string;
  roomId: string;
  playerId: PlayerId;
  name: string;
  level: number;
  gold: number;
  exp: number;
};

const DEFAULT_CHARACTER_STATS = {
  level: 1,
  gold: 0,
  exp: 0,
} as const;

export type { Character };
export { DEFAULT_CHARACTER_STATS };
