import { forwardRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors } from '@/theme/colors';

interface InputFieldProps extends TextInputProps {
  label?: string;
  helperText?: string;
  tone?: 'default' | 'employer' | 'candidate';
  readonly?: boolean;
}

export const InputField = forwardRef<TextInput, InputFieldProps>(
  ({ label, helperText, multiline, tone = 'default', readonly = false, style, onFocus, onBlur, editable, ...rest }, ref) => {
    const [focused, setFocused] = useState(false);
    const accent =
      tone === 'employer' ? colors.employer : tone === 'candidate' ? colors.candidate : colors.accent;

    const isReadonly = readonly || editable === false;

    return (
      <View style={styles.container}>
        {label && (
          <View style={styles.labelRow}>
            <Text style={styles.label}>{label}</Text>
            {isReadonly && (
              <View style={styles.readonlyBadge}>
                <Text style={styles.readonlyBadgeText}>Solo lectura</Text>
              </View>
            )}
          </View>
        )}
        <View
          style={[
            styles.inputWrapper,
            focused && !isReadonly && [styles.inputWrapperFocused, { borderColor: accent, shadowOpacity: 0.08 }],
            isReadonly && styles.inputWrapperReadonly,
          ]}
        >
          <TextInput
            ref={ref}
            style={[
              styles.input,
              multiline && styles.multiline,
              isReadonly && styles.inputReadonly,
              style
            ]}
            placeholderTextColor={colors.muted}
            multiline={multiline}
            editable={!isReadonly}
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  readonlyBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  readonlyBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
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
  inputWrapperReadonly: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
  },
  inputReadonly: {
    color: colors.textSecondary,
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

