import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, type } from '../theme';

type Props = { icon: keyof typeof Ionicons.glyphMap; title: string; message?: string };

export default function EmptyState({ icon, title, message }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.circle}>
        <Ionicons name={icon} size={30} color={colors.subtle} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxl * 1.5, paddingHorizontal: spacing.xl },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  title: { ...type.bodyStrong, color: colors.text },
  message: { ...type.small, color: colors.muted, textAlign: 'center' },
});
