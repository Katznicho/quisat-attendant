import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, type } from '../theme';
import Surface from './Surface';

export type DetailRow = { label: string; value: string; mono?: boolean; strong?: boolean };

/** Label / value rows inside a card, e.g. receipts and profile details. */
export default function DetailList({ rows }: { rows: DetailRow[] }) {
  return (
    <Surface flush style={styles.card}>
      {rows.map((row, index) => (
        <View key={row.label} style={[styles.row, index > 0 && styles.divider]}>
          <Text style={styles.label}>{row.label}</Text>
          <Text style={[styles.value, row.mono && type.mono, row.strong && styles.strong]} selectable>
            {row.value}
          </Text>
        </View>
      ))}
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: { paddingHorizontal: spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, gap: spacing.lg },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  label: { ...type.small, color: colors.muted },
  value: { ...type.small, fontWeight: '600', color: colors.text, flexShrink: 1, textAlign: 'right' },
  strong: { fontSize: 16, fontWeight: '800', fontVariant: ['tabular-nums'] },
});
