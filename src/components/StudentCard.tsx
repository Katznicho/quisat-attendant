import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import type { Card } from '../api/types';
import { colors, radius, spacing, type } from '../theme';
import { money } from '../utils/format';
import StatusPill from './StatusPill';
import Surface from './Surface';

function initialsOf(name: string | undefined): string {
  return (name ?? '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

/** Compact one-line version for later steps of a flow, once the student is confirmed. */
export function StudentChip({ card, detail }: { card: Card; detail?: string }) {
  const student = card.student;

  return (
    <View style={styles.chip}>
      {student?.photo_url ? (
        <Image source={{ uri: student.photo_url }} style={styles.chipPhoto} />
      ) : (
        <View style={[styles.chipPhoto, styles.placeholder]}>
          <Text style={styles.chipInitials}>{initialsOf(student?.name)}</Text>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.chipName} numberOfLines={1}>
          {student?.name ?? 'Unknown student'}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {detail ?? card.masked_number}
        </Text>
      </View>
    </View>
  );
}

/** Who the card belongs to, so the attendant can check the face before selling. */
export default function StudentCard({ card, showMoney = true }: { card: Card; showMoney?: boolean }) {
  const student = card.student;
  const initials = initialsOf(student?.name);

  return (
    <Surface style={styles.card}>
      <View style={styles.row}>
        {student?.photo_url ? (
          <Image source={{ uri: student.photo_url }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, styles.placeholder]}>
            <Text style={styles.initials}>{initials}</Text>
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>
            {student?.name ?? 'Unknown student'}
          </Text>
          {student?.class ? <Text style={styles.meta}>{student.class}</Text> : null}
          <StatusPill status={card.is_locked ? 'locked' : card.status} />
        </View>
      </View>

      <View style={styles.numberRow}>
        <Text style={styles.numberLabel}>CARD</Text>
        <Text style={styles.number}>{card.masked_number}</Text>
      </View>

      {showMoney && card.status === 'active' ? (
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Balance</Text>
            <Text style={styles.statValue}>{money(card.balance)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Left today</Text>
            <Text style={styles.statValue}>
              {card.remaining_today === null || card.remaining_today === undefined ? 'No limit' : money(card.remaining_today)}
            </Text>
          </View>
        </View>
      ) : null}
    </Surface>
  );
}

const PHOTO = 68;

const styles = StyleSheet.create({
  card: { gap: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  photo: { width: PHOTO, height: PHOTO, borderRadius: PHOTO / 2, backgroundColor: colors.primarySoft },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  initials: { fontSize: 24, fontWeight: '800', color: colors.primary },
  info: { flex: 1, gap: 4, alignItems: 'flex-start' },
  name: { ...type.heading, color: colors.text },
  meta: { ...type.small, color: colors.muted },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  numberLabel: { ...type.caption, color: colors.subtle },
  number: { ...type.mono, fontSize: 15, fontWeight: '600', color: colors.textSecondary },
  stats: { flexDirection: 'row', backgroundColor: colors.surfaceMuted, borderRadius: radius.md, padding: spacing.md },
  stat: { flex: 1, gap: 2, paddingHorizontal: spacing.xs },
  statDivider: { width: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginHorizontal: spacing.sm },
  statLabel: { ...type.caption, color: colors.muted },
  statValue: { ...type.amount, fontSize: 17, color: colors.text },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipPhoto: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primarySoft },
  chipInitials: { fontSize: 16, fontWeight: '800', color: colors.primary },
  chipName: { ...type.bodyStrong, color: colors.text },
});
