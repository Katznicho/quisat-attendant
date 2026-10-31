import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '../theme';

const STYLES: Record<string, { bg: string; fg: string; label: string }> = {
  active: { bg: colors.successSoft, fg: colors.success, label: 'Active' },
  completed: { bg: colors.successSoft, fg: colors.success, label: 'Completed' },
  approved: { bg: colors.successSoft, fg: colors.success, label: 'Refunded' },
  inactive: { bg: colors.warningSoft, fg: colors.warning, label: 'Not activated' },
  pending: { bg: colors.warningSoft, fg: colors.warning, label: 'Awaiting approval' },
  processing: { bg: colors.warningSoft, fg: colors.warning, label: 'Waiting for payment' },
  blocked: { bg: colors.dangerSoft, fg: colors.danger, label: 'Blocked' },
  locked: { bg: colors.dangerSoft, fg: colors.danger, label: 'PIN locked' },
  rejected: { bg: colors.dangerSoft, fg: colors.danger, label: 'Reversal rejected' },
  failed: { bg: colors.dangerSoft, fg: colors.danger, label: 'Failed' },
  reversed: { bg: colors.border, fg: colors.muted, label: 'Reversed' },
};

export default function StatusPill({ status }: { status: string }) {
  const style = STYLES[status] ?? { bg: colors.border, fg: colors.muted, label: status };

  return (
    <View style={[styles.pill, { backgroundColor: style.bg }]}>
      <Text style={[styles.text, { color: style.fg }]}>{style.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { borderRadius: radius.xl, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  text: { fontSize: 12, fontWeight: '700' },
});
