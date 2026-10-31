import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Button from '../components/Button';
import DetailList, { DetailRow } from '../components/DetailList';
import Screen from '../components/Screen';
import type { AppStackParamList } from '../navigation/types';
import { colors, spacing, type } from '../theme';
import { dateTime, money } from '../utils/format';

type Props = NativeStackScreenProps<AppStackParamList, 'SaleReceipt'>;

export default function SaleReceiptScreen({ navigation, route }: Props) {
  const { sale, cardBalance } = route.params;

  const rows: DetailRow[] = [
    { label: 'Student', value: sale.student?.name ?? '—' },
    ...(sale.description ? [{ label: 'Item', value: sale.description }] : []),
    { label: 'Card', value: sale.card_number ?? '—', mono: true },
    { label: 'Receipt', value: sale.receipt_number, mono: true },
    { label: 'Time', value: dateTime(sale.created_at) },
    { label: 'Card balance now', value: money(cardBalance), strong: true },
  ];

  return (
    <Screen
      footer={
        <View style={{ gap: spacing.sm }}>
          <Button
            title="Next sale"
            icon="scan"
            size="lg"
            variant="success"
            onPress={() => {
              navigation.popToTop();
              navigation.navigate('CardLookup', { purpose: 'sale' });
            }}
          />
          <Button title="Done" variant="ghost" onPress={() => navigation.popToTop()} />
        </View>
      }
    >
      <View style={styles.hero}>
        <View style={styles.ring}>
          <View style={styles.check}>
            <Ionicons name="checkmark" size={40} color={colors.onPrimary} />
          </View>
        </View>
        <Text style={styles.title}>Payment successful</Text>
        <Text style={styles.amount}>{money(sale.amount)}</Text>
      </View>

      <DetailList rows={rows} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: spacing.xs, marginTop: spacing.lg, marginBottom: spacing.sm },
  ring: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  check: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...type.bodyStrong, color: colors.muted },
  amount: { ...type.display, color: colors.text },
});
