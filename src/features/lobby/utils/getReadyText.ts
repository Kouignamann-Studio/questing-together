function getReadyText(
  canPickRole: boolean,
  waitingForPlayers: boolean,
  allPicked: boolean,
  joinedPlayerCount: number,
  targetPlayerCount: number,
  assignedCount: number,
): string {
  if (!canPickRole) return 'Set your name to unlock roles.';
  if (waitingForPlayers)
    return `Waiting for party to join (${joinedPlayerCount}/${targetPlayerCount}).`;
  if (allPicked) return 'All roles picked. Host can start adventure.';
  return `Waiting for all picks (${assignedCount}/${targetPlayerCount}).`;
}

export { getReadyText };
