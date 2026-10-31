import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { colors, radius, spacing } from '../theme';

type Props = TextInputProps & { label: string; hint?: string; error?: string | null; large?: boolean };

export default function TextField({ label, hint, error, large, style, ...input }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        style={[styles.input, large && styles.large, error ? styles.inputError : null, style]}
        {...input}
      />
      {error ? <Text style={styles.error}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  label: { fontSize: 14, fontWeight: '600', color: colors.text },
  input: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    fontSize: 17,
    color: colors.text,
  },
  large: { minHeight: 64, fontSize: 28, fontWeight: '700', letterSpacing: 1 },
  inputError: { borderColor: colors.danger },
  hint: { fontSize: 13, color: colors.muted },
  error: { fontSize: 13, color: colors.danger },
});
