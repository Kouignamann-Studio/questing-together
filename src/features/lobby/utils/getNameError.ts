import type { PlayerId } from '@/types/player';

type PlayerWithName = {
  playerId: PlayerId;
  displayName: string | null;
};

function getNameError(
  name: string,
  players: PlayerWithName[],
  localPlayerId: PlayerId,
): string | null {
  if (name.length === 0) return 'Name is required.';
  if (name.length > 20) return 'Name must be 20 characters or fewer.';
  if (/\s/.test(name)) return 'Name cannot contain spaces.';

  const isDuplicate = players.some(
    (p) =>
      p.playerId !== localPlayerId &&
      p.displayName &&
      p.displayName.trim().toLocaleLowerCase() === name.toLocaleLowerCase(),
  );
  if (isDuplicate) return 'Name is already taken.';

  return null;
}

export { getNameError };
