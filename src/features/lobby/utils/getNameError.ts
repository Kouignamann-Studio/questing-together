import type { PlayerId } from '@/types/player';

type PlayerWithName = {
  player_id: PlayerId;
  display_name: string | null;
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
      p.player_id !== localPlayerId &&
      p.display_name &&
      p.display_name.trim().toLocaleLowerCase() === name.toLocaleLowerCase(),
  );
  if (isDuplicate) return 'Name is already taken.';

  return null;
}

export { getNameError };
