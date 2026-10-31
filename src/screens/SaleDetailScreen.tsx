import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { api } from '../api/client';
import type { Sale } from '../api/types';
import Button from '../components/Button';
import Notice from '../components/Notice';
import Screen from '../components/Screen';
import StatusPill from '../components/StatusPill';
import TextField from '../components/TextField';
import type { AppStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';
import { dateTime, money } from '../utils/format';

type Props = NativeStackScreenProps<AppStackParamList, 'SaleDetail'>;

export default function SaleDetailScreen({ route }: Props) {
  const { uuid } = route.params;
  const [sale, setSale] = useState<Sale | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .sale(uuid)
      .then((response) => setSale(response.data.sale))
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load the sale.'));
  }, [uuid]);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await api.requestReversal(uuid, reason.trim());
      setSale(response.data.sale);
      setRequesting(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not request the reversal.');
    } finally {
      setBusy(false);
    }
  };

  if (!sale) {
    return <Screen>{error ? <Notice tone="danger">{error}</Notice> : <ActivityIndicator color={colors.primary} />}</Screen>;
  }

  const rows: Array<[string, string]> = [
    ['Student', sale.student?.name ?? '—'],
    ['Card', sale.card_number ?? '—'],
    ['Receipt', sale.receipt_number],
    ['Time', dateTime(sale.created_at)],
    ['Attendant', sale.attendant ?? '—'],
  ];
  if (sale.description) {
    rows.push(['Item', sale.description]);
  }

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={[styles.amount, sale.status === 'reversed' && styles.struck]}>{money(sale.amount)}</Text>
        <StatusPill status={sale.status === 'reversed' ? 'reversed' : sale.reversal_status ?? 'completed'} />
      </View>

      <View style={styles.card}>
        {rows.map(([label, value]) => (
          <View key={label} style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
          </View>
        ))}
      </View>

      {sale.reversal_status === 'pending' ? (
        <Notice tone="warning">Reversal requested: "{sale.reversal_reason}". Waiting for the school admin.</Notice>
      ) : null}
      {sale.reversal_status === 'approved' ? (
        <Notice tone="success">Reversal approved. The money went back to the card and the float.</Notice>
      ) : null}
      {sale.reversal_status === 'rejected' ? (
        <Notice tone="danger">Reversal rejected{sale.reversal_review_note ? `: ${sale.reversal_review_note}` : ''}.</Notice>
      ) : null}

      {error ? <Notice tone="danger">{error}</Notice> : null}

      {sale.can_request_reversal && !requesting ? (
        <Button title="Request reversal" variant="secondary" onPress={() => setRequesting(true)} />
      ) : null}

      {requesting ? (
        <View style={{ gap: spacing.md }}>
          <Notice>A school admin must approve the reversal before the money is returned.</Notice>
          <TextField
            label="What happened?"
            value={reason}
            onChangeText={setReason}
            placeholder="e.g. Charged twice by mistake"
            multiline
            maxLength={255}
            style={{ minHeight: 90, textAlignVertical: 'top', paddingTop: spacing.md }}
          />
          <Button title="Send for approval" variant="danger" loading={busy} disabled={reason.trim().length < 5} onPress={submit} />
          <Button title="Cancel" variant="ghost" onPress={() => setRequesting(false)} />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  amount: { fontSize: 34, fontWeight: '800', color: colors.text },
  struck: { textDecorationLine: 'line-through', color: colors.muted },
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
