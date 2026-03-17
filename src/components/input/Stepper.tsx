import { Pressable, View } from 'react-native';
import Typography from '@/components/display/Typography';
import { colors } from '@/constants/colors';

type StepperProps = {
  value: number;
  min?: number;
  max?: number;
  label?: (value: number) => string;
  disabled?: boolean;
  onValueChange: (value: number) => void;
};

const Stepper = ({
  value,
  min = 1,
  max = 3,
  label,
  disabled = false,
  onValueChange,
}: StepperProps) => {
  const canDecrement = !disabled && value > min;
  const canIncrement = !disabled && value < max;
  const displayLabel = label ? label(value) : `${value}`;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        gap: 16,
      }}
    >
      <Pressable
        disabled={!canDecrement}
        onPress={() => onValueChange(value - 1)}
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: canDecrement ? colors.borderInput : colors.borderCard,
          backgroundColor: canDecrement ? colors.backgroundInputLight : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: canDecrement ? 1 : 0.4,
        }}
      >
        <Typography variant="body" bold style={{ color: colors.textDark, fontSize: 18 }}>
          −
        </Typography>
      </Pressable>

      <Typography
        variant="body"
        bold
        style={{
          color: colors.textOverlayHeading,
          fontSize: 14,
          minWidth: 80,
          textAlign: 'center',
        }}
      >
        {displayLabel}
      </Typography>

      <Pressable
        disabled={!canIncrement}
        onPress={() => onValueChange(value + 1)}
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: canIncrement ? colors.borderInput : colors.borderCard,
          backgroundColor: canIncrement ? colors.backgroundInputLight : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: canIncrement ? 1 : 0.4,
        }}
      >
        <Typography variant="body" bold style={{ color: colors.textDark, fontSize: 18 }}>
          +
        </Typography>
      </Pressable>
    </View>
  );
};

export default Stepper;
