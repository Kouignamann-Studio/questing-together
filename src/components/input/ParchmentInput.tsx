import { TextInput, type TextInputProps } from 'react-native';
import { colors } from '@/constants/colors';

type ParchmentInputProps = Omit<TextInputProps, 'style'>;

const ParchmentInput = (props: ParchmentInputProps) => (
  <TextInput
    placeholderTextColor={colors.textPlaceholderCool}
    {...props}
    style={{
      borderWidth: 1,
      borderColor: colors.borderInput,
      borderRadius: 9,
      paddingHorizontal: 10,
      paddingVertical: 8,
      color: colors.textInputDark,
      backgroundColor: colors.backgroundInputLight,
      fontSize: 14,
      fontFamily: 'Besley',
    }}
  />
);

export default ParchmentInput;
