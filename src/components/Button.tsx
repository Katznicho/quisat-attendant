import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, radius, spacing } from '../theme';

type Variant = 'primary' | 'success' | 'secondary' | 'danger' | 'ghost';

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

const FILLED: Variant[] = ['primary', 'success', 'danger'];

export default function Button({ title, onPress, variant = 'primary', icon, size = 'md', loading, disabled, style }: Props) {
  const inactive = disabled || loading;
  const filled = FILLED.includes(variant);
  const fg = filled ? colors.onPrimary : variant === 'danger' ? colors.danger : colors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.base,
        size === 'lg' && styles.large,
        styles[variant],
        pressed && !inactive && (filled ? styles.pressedFilled : styles.pressedPlain),
        inactive && styles.inactive,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.inner}>
          {icon ? <Ionicons name={icon} size={size === 'lg' ? 22 : 19} color={fg} /> : null}
          <Text style={[styles.label, size === 'lg' && styles.labelLarge, { color: fg }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  large: { minHeight: 60, borderRadius: radius.lg },
  inner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  primary: { backgroundColor: colors.primary },
  success: { backgroundColor: colors.success },
  danger: { backgroundColor: colors.danger },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  ghost: { backgroundColor: 'transparent' },
  pressedFilled: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  pressedPlain: { backgroundColor: colors.primarySoft },
  inactive: { opacity: 0.45 },
  label: { fontSize: 16, fontWeight: '700' },
  labelLarge: { fontSize: 17 },
});
