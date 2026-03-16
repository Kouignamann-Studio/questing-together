function getActionVariant(isSelected: boolean): 'selected' | 'default' {
  if (isSelected) return 'selected';
  return 'default';
}

function getActionOpacity(isDisabled: boolean, isSelected: boolean): number {
  if (isSelected) return 1;
  if (isDisabled) return 0.7;
  return 1;
}

function getOptionVariant(isSelected: boolean, isResolved: boolean): 'selected' | 'default' {
  if (isSelected || isResolved) return 'selected';
  return 'default';
}

function getOptionOpacity(
  isDisabled: boolean,
  isResolved: boolean,
  isLockedSelected: boolean,
): number {
  if (isResolved) return 0.95;
  if (isDisabled && !isLockedSelected) return 0.7;
  return 1;
}

function formatHpLabel(hpDelta: number | undefined): string | null {
  const value = typeof hpDelta === 'number' && Number.isFinite(hpDelta) ? hpDelta : 0;
  if (value === 0) return null;
  return `HP ${value > 0 ? '+' : ''}${value}`;
}

export { formatHpLabel, getActionOpacity, getActionVariant, getOptionOpacity, getOptionVariant };
