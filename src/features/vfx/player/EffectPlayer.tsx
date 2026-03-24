import EffectPlayerSkia, { canUseSkiaRenderer } from '@/features/vfx/player/EffectPlayerSkia';
import EffectPlayerSvg from '@/features/vfx/player/EffectPlayerSvg';
import type { EffectInstance } from '@/features/vfx/types/runtime';

type EffectPlayerProps = {
  instance: EffectInstance;
  onComplete: (instanceId: string) => void;
};

const EffectPlayer = ({ instance, onComplete }: EffectPlayerProps) =>
  canUseSkiaRenderer ? (
    <EffectPlayerSkia instance={instance} onComplete={onComplete} />
  ) : (
    <EffectPlayerSvg instance={instance} onComplete={onComplete} />
  );

export default EffectPlayer;
