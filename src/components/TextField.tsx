import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { colors, radius, spacing, type } from '../theme';

type Props = TextInputProps & {
  label: string;
  hint?: string;
  error?: string | null;
  large?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  prefix?: string;
};

export default function TextField({ label, hint, error, large, icon, prefix, style, onFocus, onBlur, ...input }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.box, large && styles.boxLarge, focused && styles.focused, error ? styles.boxError : null]}>
        {icon ? <Ionicons name={icon} size={20} color={focused ? colors.primary : colors.subtle} /> : null}
        {prefix ? <Text style={[styles.prefix, large && styles.prefixLarge]}>{prefix}</Text> : null}
        <TextInput
          placeholderTextColor={colors.subtle}
          style={[styles.input, large && styles.inputLarge, style]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...input}
        />
      </View>
      {error ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={15} color={colors.danger} />
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 54,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  boxLarge: { minHeight: 68 },
  focused: { borderColor: colors.primary },
  boxError: { borderColor: colors.danger },
  prefix: { ...type.bodyStrong, color: colors.muted },
  prefixLarge: { fontSize: 20 },
  input: { flex: 1, alignSelf: 'stretch', fontSize: 17, color: colors.text },
  inputLarge: { fontSize: 26, fontWeight: '700', letterSpacing: 0.5, fontVariant: ['tabular-nums'] },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  hint: { fontSize: 13, color: colors.muted },
  error: { flex: 1, fontSize: 13, color: colors.danger },
});
