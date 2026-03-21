import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Card, ContentContainer, ScreenContainer, Stack, Typography } from '@/components';
import { colors } from '@/constants/colors';
import { listEffectAssets, useVfx } from '@/features/vfx';

const FxTestScreen = () => {
  const router = useRouter();
  const { playEffect } = useVfx();
  const stageRef = useRef<View>(null);
  const timeoutIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const assets = listEffectAssets();

  const clearTimers = useCallback(() => {
    for (const timeoutId of timeoutIdsRef.current) {
      clearTimeout(timeoutId);
    }
    timeoutIdsRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const withStageBounds = useCallback(
    (callback: (bounds: { x: number; y: number; width: number; height: number }) => void) => {
      stageRef.current?.measureInWindow((x, y, width, height) => {
        callback({ x, y, width, height });
      });
    },
    [],
  );

  const handleCastFireball = useCallback(() => {
    clearTimers();
    withStageBounds(({ x, y, width, height }) => {
      const startX = x + width * 0.18;
      const startY = y + height * 0.72;
      const targetX = x + width * 0.78;
      const targetY = y + height * 0.34;

      playEffect('fireball-travel', {
        x: startX,
        y: startY,
        targetX,
        targetY,
      });

      timeoutIdsRef.current.push(
        setTimeout(() => {
          playEffect('fireball-impact', {
            x: targetX,
            y: targetY,
          });
        }, 620),
      );
    });
  }, [clearTimers, playEffect, withStageBounds]);

  const handleImpactOnly = useCallback(() => {
    withStageBounds(({ x, y, width, height }) => {
      playEffect('fireball-impact', {
        x: x + width * 0.72,
        y: y + height * 0.36,
      });
    });
  }, [playEffect, withStageBounds]);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <ContentContainer style={{ justifyContent: 'center', maxWidth: 420 }}>
          <Stack gap={16} style={{ width: '100%' }}>
            <Stack gap={6}>
              <Typography variant="h3">VFX Playground</Typography>
              <Typography style={{ textAlign: 'left' }}>
                This screen now uses the same `playEffect()` runtime API gameplay code will call
                later. The visual assets live in JSON, and this card is only a test stage.
              </Typography>
            </Stack>

            <Card
              backgroundColor={colors.backgroundOverlayPanel}
              borderColor={colors.borderOverlay}
            >
              <Stack gap={12}>
                <Typography variant="sectionTitle" style={{ color: colors.textOverlayHeading }}>
                  Fireball Example
                </Typography>
                <Typography style={{ color: colors.textOverlayBody, textAlign: 'left' }}>
                  `fireball-travel` flies across the stage. `fireball-impact` bursts at the target.
                  Both are spawned through the same runtime entry point.
                </Typography>
                <View
                  ref={stageRef}
                  style={{
                    height: 240,
                    borderRadius: 18,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: colors.borderOverlay,
                    backgroundColor: '#140d08',
                    justifyContent: 'space-between',
                    padding: 18,
                  }}
                >
                  <Typography style={{ color: '#f2d6ad', textAlign: 'left' }}>
                    Stage markers:
                  </Typography>
                  <Stack
                    direction="row"
                    justify="space-between"
                    align="flex-end"
                    style={{ flex: 1 }}
                  >
                    <Stack gap={6} align="center">
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 999,
                          backgroundColor: 'rgba(114, 67, 31, 0.78)',
                          borderWidth: 1,
                          borderColor: '#ce9654',
                        }}
                      />
                      <Typography variant="caption" style={{ color: '#f2d6ad' }}>
                        Caster
                      </Typography>
                    </Stack>
                    <Stack gap={6} align="center" style={{ marginBottom: 74 }}>
                      <View
                        style={{
                          width: 54,
                          height: 54,
                          borderRadius: 999,
                          backgroundColor: 'rgba(59, 38, 23, 0.82)',
                          borderWidth: 1,
                          borderColor: '#ffd27a',
                        }}
                      />
                      <Typography variant="caption" style={{ color: '#f2d6ad' }}>
                        Target
                      </Typography>
                    </Stack>
                  </Stack>
                </View>
                <Typography style={{ color: colors.textOverlayBody, textAlign: 'left' }}>
                  Available assets in the registry: {assets.map((asset) => asset.id).join(', ')}
                </Typography>
              </Stack>
            </Card>

            <Stack gap={12}>
              <Stack direction="row" gap={12}>
                <Button
                  label="Cast Fireball"
                  size="md"
                  onPress={handleCastFireball}
                  style={{ flex: 1 }}
                />
                <Button
                  label="Impact Only"
                  size="md"
                  variant="ghost"
                  textured={false}
                  onPress={handleImpactOnly}
                  style={{ flex: 1 }}
                />
              </Stack>
              <Button
                label="Back"
                size="md"
                variant="ghost"
                textured={false}
                onPress={() => router.back()}
                style={{ width: '100%' }}
              />
            </Stack>
          </Stack>
        </ContentContainer>
      </ScrollView>
    </ScreenContainer>
  );
};

export default FxTestScreen;
