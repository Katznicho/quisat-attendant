import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { colors, spacing, type } from '../theme';

export default function SectionHeader({ children }: { children: string }) {
  return <Text style={styles.text}>{children}</Text>;
}

const styles = StyleSheet.create({
  text: { ...type.caption, color: colors.muted, marginBottom: -spacing.sm, marginLeft: spacing.xs },
});
