import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, type } from '../theme';

type Props = { icon: keyof typeof Ionicons.glyphMap; title: string; message: string };

/** Icon, title and explanation at the top of the account setup and forgot-PIN screens. */
export default function AuthIntro({ icon, title, message }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.circle}>
        <Ionicons name={icon} size={30} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.sm, marginTop: spacing.md, marginBottom: spacing.sm },
  circle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  title: { ...type.title, fontSize: 22, color: colors.text, textAlign: 'center' },
  message: { ...type.body, fontSize: 15, lineHeight: 22, color: colors.muted, textAlign: 'center' },
});
