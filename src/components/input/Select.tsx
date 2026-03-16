import { useState } from 'react';
import { Pressable } from 'react-native';
import Typography from '@/components/display/Typography';
import Stack from '@/components/layout/Stack';
import { colors } from '@/constants/colors';

type SelectOption<T extends string | number> = {
  value: T;
  label: string;
  disabled?: boolean;
};

type SelectProps<T extends string | number> = {
  value: T;
  options: SelectOption<T>[];
  disabled?: boolean;
  onSelect: (value: T) => void;
};

function Select<T extends string | number>({ value, options, disabled, onSelect }: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <Stack gap={8}>
      <Pressable
        disabled={disabled}
        onPress={() => setIsOpen((v) => !v)}
        style={[
          {
            width: '100%',
            borderRadius: 9,
            borderWidth: 1,
            borderColor: colors.borderInput,
            backgroundColor: colors.backgroundInputLight,
          },
          disabled && { opacity: 0.72 },
        ]}
      >
        <Stack
          direction="row"
          align="center"
          justify="space-between"
          gap={8}
          style={{ minHeight: 42, paddingHorizontal: 10, paddingVertical: 8 }}
        >
          <Typography variant="caption" style={{ color: colors.textInputDark }}>
            {selected?.label ?? ''}
          </Typography>
          <Typography variant="body" style={{ color: colors.textOverlayAccent }}>
            {isOpen ? '˄' : '˅'}
          </Typography>
        </Stack>
      </Pressable>
      {isOpen ? (
        <Stack gap={6}>
          {options.map((option) => (
            <Pressable
              key={option.value}
              disabled={option.disabled}
              onPress={() => {
                setIsOpen(false);
                if (option.value === value) return;
                onSelect(option.value);
              }}
              style={[
                {
                  borderRadius: 9,
                  borderWidth: 1,
                  borderColor: colors.borderInput,
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  backgroundColor: colors.backgroundInputLight,
                },
                option.disabled && { opacity: 0.5 },
              ]}
            >
              <Typography variant="caption" style={{ color: colors.textInputDark }}>
                {option.label}
                {option.value === value ? ' (selected)' : ''}
              </Typography>
            </Pressable>
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
}

export default Select;
