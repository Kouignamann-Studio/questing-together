import { TextInput, type TextInputProps, View } from 'react-native';
import Typography from '@/components/display/Typography';
import { colors } from '@/constants/colors';

type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  helperText?: string;
  error?: string | null;
};

const TextField = ({ label, helperText, error, ...props }: TextFieldProps) => {
  const hasError = Boolean(error);
  const bottomText = error ?? helperText;

  return (
    <View style={{ gap: 4 }}>
      {label ? (
        <Typography
          variant="captionSm"
          bold
          style={{ color: hasError ? colors.errorInline : colors.textOverlayAccent }}
        >
          {label}
        </Typography>
      ) : null}
      <TextInput
        placeholderTextColor={colors.textPlaceholderCool}
        {...props}
        style={{
          borderWidth: 1,
          borderColor: hasError ? colors.errorInline : colors.borderInput,
          borderRadius: 9,
          paddingHorizontal: 10,
          paddingVertical: 8,
          color: colors.textInputDark,
          backgroundColor: colors.backgroundInputLight,
          fontSize: 14,
          fontFamily: 'Besley',
        }}
      />
      {bottomText ? (
        <Typography
          variant="captionSm"
          style={{ color: hasError ? colors.errorInline : colors.textMuted }}
        >
          {bottomText}
        </Typography>
      ) : null}
    </View>
  );
};

export default TextField;
