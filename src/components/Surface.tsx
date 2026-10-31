import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { colors, elevation, radius, spacing } from '../theme';

/** White rounded card with a soft shadow: the base container for grouped content. */
export default function Surface({ children, style, flush }: { children: React.ReactNode; style?: ViewStyle; flush?: boolean }) {
  return <View style={[styles.surface, flush ? null : styles.padded, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  surface: { backgroundColor: colors.surface, borderRadius: radius.lg, ...elevation.card },
  padded: { padding: spacing.lg },
});
