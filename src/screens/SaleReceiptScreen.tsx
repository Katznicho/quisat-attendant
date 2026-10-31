import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Button from '../components/Button';
import Screen from '../components/Screen';
import type { AppStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';
import { dateTime, money } from '../utils/format';

type Props = NativeStackScreenProps<AppStackParamList, 'SaleReceipt'>;

export default function SaleReceiptScreen({ navigation, route }: Props) {
  const { sale, cardBalance } = route.params;

  const rows: Array<[string, string]> = [
    ['Student', sale.student?.name ?? '—'],
    ['Card', sale.card_number ?? '—'],
    ['Receipt', sale.receipt_number],
    ['Time', dateTime(sale.created_at)],
    ['Card balance now', money(cardBalance)],
  ];
  if (sale.description) {
    rows.splice(2, 0, ['Item', sale.description]);
  }

  return (
    <Screen
      footer={
        <View style={{ gap: spacing.sm }}>
          <Button
            title="Next sale"
            onPress={() => {
              navigation.popToTop();
              navigation.navigate('CardLookup', { purpose: 'sale' });
            }}
          />
          <Button title="Done" variant="secondary" onPress={() => navigation.popToTop()} />
        </View>
      }
    >
      <View style={styles.hero}>
        <Ionicons name="checkmark-circle" size={72} color={colors.success} />
        <Text style={styles.title}>Sale complete</Text>
        <Text style={styles.amount}>{money(sale.amount)}</Text>
      </View>

      <View style={styles.card}>
        {rows.map(([label, value]) => (
          <View key={label} style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: spacing.xs, marginTop: spacing.lg },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  amount: { fontSize: 36, fontWeight: '800', color: colors.success },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  label: { fontSize: 15, color: colors.muted },
  value: { fontSize: 15, fontWeight: '600', color: colors.text, flexShrink: 1, textAlign: 'right' },
});
