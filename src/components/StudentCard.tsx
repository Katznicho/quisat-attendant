import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import type { Card } from '../api/types';
import { colors, radius, spacing } from '../theme';
import { money } from '../utils/format';
import StatusPill from './StatusPill';

/** Who the card belongs to, so the attendant can check the face before selling. */
export default function StudentCard({ card, showMoney = true }: { card: Card; showMoney?: boolean }) {
  const student = card.student;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        {student?.photo_url ? (
          <Image source={{ uri: student.photo_url }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, styles.placeholder]}>
            <Ionicons name="person" size={32} color={colors.muted} />
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.name}>{student?.name ?? 'Unknown student'}</Text>
          {student?.class ? <Text style={styles.meta}>{student.class}</Text> : null}
          <Text style={styles.meta}>Card {card.masked_number}</Text>
        </View>
        <StatusPill status={card.is_locked ? 'locked' : card.status} />
      </View>

      {showMoney && card.status === 'active' ? (
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Balance</Text>
            <Text style={styles.statValue}>{money(card.balance)}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Left today</Text>
            <Text style={styles.statValue}>
              {card.remaining_today === null || card.remaining_today === undefined ? 'No limit' : money(card.remaining_today)}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  photo: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.background },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 18, fontWeight: '700', color: colors.text },
  meta: { fontSize: 14, color: colors.muted },
  stats: { flexDirection: 'row', gap: spacing.md },
  stat: { flex: 1, backgroundColor: colors.background, borderRadius: radius.md, padding: spacing.md },
  statLabel: { fontSize: 12, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { fontSize: 17, fontWeight: '700', color: colors.text, marginTop: 2 },
});
