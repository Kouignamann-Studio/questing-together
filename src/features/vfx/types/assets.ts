export type EffectKeyframe = {
  at: number;
  value: number;
};

export type EffectTrackName = 'x' | 'y' | 'scale' | 'alpha' | 'glow' | 'travel';

export type EffectTrackMap = Partial<Record<EffectTrackName, EffectKeyframe[]>>;

type EffectLayerBase = {
  id: string;
  tracks?: EffectTrackMap;
};

export type OrbLayer = EffectLayerBase & {
  type: 'orb';
  radius: number;
  color: string;
  glowColor?: string;
  glowScale?: number;
};

export type TrailLayer = EffectLayerBase & {
  type: 'trail';
  radius: number;
  color: string;
  segments: number;
  spacing: number;
  falloff?: number;
};

export type RingLayer = EffectLayerBase & {
  type: 'ring';
  radius: number;
  color: string;
  thickness: number;
};

export type EffectLayer = OrbLayer | TrailLayer | RingLayer;

export type EffectMotion = {
  mode: 'fixed' | 'line' | 'path';
  tracks?: Pick<EffectTrackMap, 'travel' | 'x' | 'y'>;
};

export type EffectAsset = {
  id: string;
  label: string;
  durationMs: number;
  loop?: boolean;
  motion?: EffectMotion;
  layers: EffectLayer[];
};
