import { forwardRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors } from '@/theme/colors';

interface InputFieldProps extends TextInputProps {
  label?: string;
  helperText?: string;
  tone?: 'default' | 'employer' | 'candidate';
}

export const InputField = forwardRef<TextInput, InputFieldProps>(
  ({ label, helperText, multiline, tone = 'default', style, onFocus, onBlur, ...rest }, ref) => {
    const [focused, setFocused] = useState(false);
    const accent =
      tone === 'employer' ? colors.employer : tone === 'candidate' ? colors.candidate : colors.accent;

    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View
          style={[
            styles.inputWrapper,
            focused && [styles.inputWrapperFocused, { borderColor: accent, shadowOpacity: 0.08 }],
          ]}
        >
          <TextInput
            ref={ref}
            style={[styles.input, multiline && styles.multiline, style]}
            placeholderTextColor={colors.muted}
            multiline={multiline}
            onFocus={(event) => {
              setFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
            {...rest}
          />
        </View>
        {helperText && <Text style={styles.helper}>{helperText}</Text>}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    paddingHorizontal: 4,
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  inputWrapperFocused: {
    borderColor: colors.accent,
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
  },
  helper: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
});
