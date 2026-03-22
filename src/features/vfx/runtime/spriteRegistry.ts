import type { ImageSourcePropType } from 'react-native';
import demoCoreSprite from '@/features/vfx/assets/sprites/demo-core.png';
import demoSigilSprite from '@/features/vfx/assets/sprites/demo-sigil.png';
import tVfxParticleStarSprite from '@/features/vfx/assets/sprites/t-vfx-particle-star.png';

type VfxSpriteEntry = {
  id: string;
  source: ImageSourcePropType;
};

const vfxSprites: VfxSpriteEntry[] = [
  { id: 'demo-core', source: demoCoreSprite },
  { id: 'demo-sigil', source: demoSigilSprite },
  { id: 't-vfx-particle-star', source: tVfxParticleStarSprite },
];

const vfxSpriteById = new Map(vfxSprites.map((sprite) => [sprite.id, sprite]));

export function getVfxSpriteSource(spriteId: string) {
  return vfxSpriteById.get(spriteId)?.source ?? null;
}
