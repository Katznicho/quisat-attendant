import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { api } from '../api/client';
import type { Sale } from '../api/types';
import Button from '../components/Button';
import Notice from '../components/Notice';
import Screen from '../components/Screen';
import DetailList, { DetailRow } from '../components/DetailList';
import StatusPill from '../components/StatusPill';
import TextField from '../components/TextField';
import type { AppStackParamList } from '../navigation/types';
import { colors, spacing, type } from '../theme';
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

  const rows: DetailRow[] = [
    { label: 'Student', value: sale.student?.name ?? '—' },
    ...(sale.description ? [{ label: 'Item', value: sale.description }] : []),
    { label: 'Card', value: sale.card_number ?? '—', mono: true },
    { label: 'Receipt', value: sale.receipt_number, mono: true },
    { label: 'Time', value: dateTime(sale.created_at) },
    { label: 'Attendant', value: sale.attendant ?? '—' },
  ];

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={[styles.amount, sale.status === 'reversed' && styles.struck]}>{money(sale.amount)}</Text>
        <StatusPill status={sale.status === 'reversed' ? 'reversed' : sale.reversal_status ?? 'completed'} />
      </View>

      <DetailList rows={rows} />

      {sale.reversal_status === 'pending' ? (
        <Notice tone="warning">Reversal requested: "{sale.reversal_reason}". Waiting for Quisat to approve.</Notice>
      ) : null}
      {sale.reversal_status === 'approved' ? (
        <Notice tone="success">Reversal approved. The money went back to the card and the float.</Notice>
      ) : null}
      {sale.reversal_status === 'rejected' ? (
        <Notice tone="danger">Reversal rejected{sale.reversal_review_note ? `: ${sale.reversal_review_note}` : ''}.</Notice>
      ) : null}

      {error ? <Notice tone="danger">{error}</Notice> : null}

      {sale.can_request_reversal && !requesting ? (
        <Button title="Request reversal" icon="arrow-undo-outline" variant="secondary" onPress={() => setRequesting(true)} />
      ) : null}

      {requesting ? (
        <View style={{ gap: spacing.md }}>
          <Notice>Quisat must approve the reversal before the money is returned.</Notice>
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
  hero: { alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg, marginBottom: spacing.sm },
  amount: { ...type.display, color: colors.text },
  struck: { textDecorationLine: 'line-through', color: colors.muted },
});
