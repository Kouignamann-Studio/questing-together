import { useCallback } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Typography from '@/components/display/Typography';
import Stack from '@/components/layout/Stack';
import { colors } from '@/constants/colors';

type ActionButtonProps = {
  label: string;
  icon?: string;
  subtitle?: string;
  cooldownText?: string;
  selected?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'danger';
  onPress?: () => void;
};

const ActionButton = ({
  label,
  icon,
  subtitle,
  cooldownText,
  selected = false,
  disabled = false,
  variant = 'default',
  onPress,
}: ActionButtonProps) => {
  const isDanger = variant === 'danger';
  const showCooldown = Boolean(cooldownText);
  const scale = useSharedValue(1);
  const brightness = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.4 : 1 - brightness.value * 0.15,
  }));

  const handlePress = useCallback(() => {
    scale.value = withSequence(
      withTiming(0.92, { duration: 60 }),
      withTiming(1, { duration: 120 }),
    );
    brightness.value = withSequence(
      withTiming(1, { duration: 60 }),
      withTiming(0, { duration: 200 }),
    );
    onPress?.();
  }, [onPress, scale, brightness]);

  return (
    <Pressable disabled={disabled} onPress={handlePress} style={{ flex: 1 }}>
      <Animated.View style={animatedStyle}>
        <Stack
          direction="row"
          gap={6}
          align="center"
          style={{
            height: 48,
            paddingHorizontal: 8,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: selected
              ? colors.actionSelectedBorder
              : isDanger
                ? colors.errorDark
                : colors.tabBorder,
            backgroundColor: selected
              ? colors.actionSelectedBg
              : isDanger
                ? colors.riskyBadgeBg
                : colors.backgroundCombatCard,
          }}
        >
          {icon ? (
            <Typography variant="body" style={{ fontSize: 14 }}>
              {icon}
            </Typography>
          ) : null}

          <Stack flex={1} gap={0}>
            <Typography
              variant="caption"
              style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 11 }}
            >
              {label}
            </Typography>
            {subtitle ? (
              <Typography
                variant="fine"
                style={{
                  color: colors.textSubAction,
                  fontWeight: '700',
                  fontSize: 8,
                  textTransform: 'uppercase',
                }}
              >
                {subtitle}
              </Typography>
            ) : null}
          </Stack>

          {showCooldown ? (
            <Typography
              variant="fine"
              style={{
                color: disabled ? colors.combatWaiting : colors.intentConfirmedBorder,
                fontWeight: '700',
                fontSize: 9,
              }}
            >
              {cooldownText}
            </Typography>
          ) : null}
        </Stack>
      </Animated.View>
    </Pressable>
  );
};

export default ActionButton;
