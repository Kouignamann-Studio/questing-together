/**
 * Player identities — one per role. Each defines a dominant trait
 * and convergence action name/description.
 */

import type { Trait } from '@/features/gameConfig/cardTypes';

type Identity = {
  id: string;
  name: string;
  dominantTrait: Trait;
  passiveDescription: string;
  convergenceActionName: string;
  convergenceDescription: string;
};

const IDENTITIES: Identity[] = [
  {
    id: 'warrior',
    name: 'Warrior',
    dominantTrait: 'rage',
    passiveDescription:
      'Balanced melee fighter. Empowering schools fuels devastating Convergence effects.',
    convergenceActionName: 'Wrath',
    convergenceDescription:
      'If 2 or more schools are empowered, Wrath cashes out every empowered school into one combined free action.',
  },
  {
    id: 'sage',
    name: 'Sage',
    dominantTrait: 'fire',
    passiveDescription: 'Arcane caster. Empowering schools fuels powerful Convergence magic.',
    convergenceActionName: 'Cataclysm',
    convergenceDescription:
      'If 2 or more schools are empowered, Cataclysm cashes out every empowered school into one combined free action.',
  },
  {
    id: 'ranger',
    name: 'Ranger',
    dominantTrait: 'precision',
    passiveDescription: 'Agile fighter. Empowering schools fuels deadly Convergence strikes.',
    convergenceActionName: 'Execution',
    convergenceDescription:
      'If 2 or more schools are empowered, Execution cashes out every empowered school into one combined free action.',
  },
];

const IDENTITY_BY_ID: Record<string, Identity> = Object.fromEntries(
  IDENTITIES.map((i) => [i.id, i]),
);

const getIdentityById = (id: string): Identity | undefined => IDENTITY_BY_ID[id];

export type { Identity };
export { getIdentityById, IDENTITIES, IDENTITY_BY_ID };
