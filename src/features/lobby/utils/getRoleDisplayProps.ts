import { playerNameById } from '@/constants/constants';
import type { PlayerId } from '@/types/player';

type PlayerWithRole = {
  playerId: PlayerId;
  roleId: string | null;
  displayName: string | null;
};

function getRoleStatusText(isSelectedByLocal: boolean, owner: PlayerWithRole | undefined): string {
  if (isSelectedByLocal) return 'You';
  if (owner) return `Taken by ${owner.displayName ?? playerNameById[owner.playerId]}`;
  return 'Available';
}

function getRoleTextureVariant(isSelectedByLocal: boolean): 'selected' | 'default' {
  if (isSelectedByLocal) return 'selected';
  return 'default';
}

function getRoleOpacity(isTakenByOther: boolean, isDisabled: boolean): number {
  if (isTakenByOther) return 0.88;
  if (isDisabled) return 0.72;
  return 1;
}

export { getRoleOpacity, getRoleStatusText, getRoleTextureVariant };
