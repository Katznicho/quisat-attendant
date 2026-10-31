import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, type } from '../theme';

const PIN_LENGTH = 4;
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'];

type Props = {
  title: string;
  subtitle?: string;
  error?: string | null;
  busy?: boolean;
  /** Called with the 4 digits once complete. Change `resetKey` to clear the pad. */
  onComplete: (pin: string) => void;
  resetKey?: number | string;
};

/** Big-key 4-digit PIN entry. Digits are never shown, only dots. */
export default function PinPad({ title, subtitle, error, busy, onComplete, resetKey }: Props) {
  const [pin, setPin] = useState('');

  useEffect(() => {
    setPin('');
  }, [resetKey]);

  useEffect(() => {
    if (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    }
  }, [error, resetKey]);

  const press = (key: string) => {
    if (busy) {
      return;
    }
    Haptics.selectionAsync().catch(() => {});
    if (key === 'back') {
      setPin((current) => current.slice(0, -1));
      return;
    }
    if (pin.length >= PIN_LENGTH) {
      return;
    }
    const next = pin + key;
    setPin(next);
    if (next.length === PIN_LENGTH) {
      onComplete(next);
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.heading}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <View style={styles.dots} accessibilityLabel={`${pin.length} of ${PIN_LENGTH} digits entered`}>
        {Array.from({ length: PIN_LENGTH }).map((_, index) => (
          <View
            key={index}
            style={[styles.dot, index < pin.length && styles.dotFilled, error && pin.length === 0 ? styles.dotError : null]}
          />
        ))}
      </View>

      <View style={styles.status}>
        {busy ? <ActivityIndicator color={colors.primary} /> : error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <View style={styles.grid}>
        {KEYS.map((key, index) =>
          key === '' ? (
            <View key={index} style={styles.key} />
          ) : (
            <Pressable
              key={index}
              onPress={() => press(key)}
              accessibilityRole="button"
              accessibilityLabel={key === 'back' ? 'Delete' : key}
              style={({ pressed }) => [styles.key, key !== 'back' && styles.keyButton, pressed && styles.keyPressed]}
            >
              {key === 'back' ? (
                <Ionicons name="backspace-outline" size={28} color={colors.textSecondary} />
              ) : (
                <Text style={styles.keyText}>{key}</Text>
              )}
            </Pressable>
          ),
        )}
      </View>
    </View>
  );
}

const KEY = 76;

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.lg },
  heading: { alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.lg },
  title: { ...type.title, fontSize: 22, color: colors.text, textAlign: 'center' },
  subtitle: { ...type.small, color: colors.muted, textAlign: 'center' },
  dots: { flexDirection: 'row', gap: 20, marginTop: spacing.xs },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: colors.subtle },
  dotFilled: { backgroundColor: colors.primary, borderColor: colors.primary, transform: [{ scale: 1.1 }] },
  dotError: { borderColor: colors.danger },
  status: { minHeight: 40, justifyContent: 'center', paddingHorizontal: spacing.lg },
  error: { color: colors.danger, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: KEY * 3 + 28 * 2, justifyContent: 'space-between', rowGap: 16 },
  key: { width: KEY, height: KEY, borderRadius: KEY / 2, alignItems: 'center', justifyContent: 'center' },
  keyButton: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  keyPressed: { backgroundColor: colors.primarySoft, borderColor: colors.primarySoft },
  keyText: { fontSize: 30, fontWeight: '500', color: colors.text },
});
