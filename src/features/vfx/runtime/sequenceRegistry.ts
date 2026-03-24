import fireBlastData from '@/features/vfx/assets/sequences/fire-blast.json';
import fireballCastData from '@/features/vfx/assets/sequences/fireball-cast.json';
import frostboltCastData from '@/features/vfx/assets/sequences/frostbolt-cast.json';
import lightningStrikeData from '@/features/vfx/assets/sequences/lightning-strike.json';
import sleekSlashData from '@/features/vfx/assets/sequences/sleek-slash.json';
import type { EffectSequence } from '@/features/vfx/types/sequences';

const effectSequences = [
  fireballCastData,
  fireBlastData,
  frostboltCastData,
  lightningStrikeData,
  sleekSlashData,
] as EffectSequence[];

const effectSequenceById = new Map(effectSequences.map((sequence) => [sequence.id, sequence]));

export function getEffectSequence(sequenceId: string) {
  return effectSequenceById.get(sequenceId) ?? null;
}

export function listEffectSequences() {
  return effectSequences;
}
