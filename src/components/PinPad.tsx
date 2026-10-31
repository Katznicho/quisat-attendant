import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../theme';

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

  const press = (key: string) => {
    if (busy) {
      return;
    }
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
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      <View style={styles.dots} accessibilityLabel={`${pin.length} of ${PIN_LENGTH} digits entered`}>
        {Array.from({ length: PIN_LENGTH }).map((_, index) => (
          <View key={index} style={[styles.dot, index < pin.length && styles.dotFilled, error ? styles.dotError : null]} />
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
              style={({ pressed }) => [styles.key, styles.keyButton, pressed && styles.keyPressed]}
            >
              {key === 'back' ? (
                <Ionicons name="backspace-outline" size={28} color={colors.text} />
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

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.md },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, textAlign: 'center' },
  subtitle: { fontSize: 15, color: colors.muted, textAlign: 'center' },
  dots: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.md },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.primary },
  dotFilled: { backgroundColor: colors.primary },
  dotError: { borderColor: colors.danger },
  status: { minHeight: 24, justifyContent: 'center' },
  error: { color: colors.danger, fontSize: 14, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: 300, justifyContent: 'space-between', rowGap: spacing.md },
  key: { width: 88, height: 72, alignItems: 'center', justifyContent: 'center' },
  keyButton: { borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  keyPressed: { backgroundColor: colors.primarySoft },
  keyText: { fontSize: 28, fontWeight: '600', color: colors.text },
});
