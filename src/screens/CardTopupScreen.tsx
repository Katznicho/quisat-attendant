import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { api } from '../api/client';
import type { Topup } from '../api/types';
import Button from '../components/Button';
import Notice from '../components/Notice';
import Screen from '../components/Screen';
import TextField from '../components/TextField';
import type { AppStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme';
import { digitsOnly, money } from '../utils/format';

type Props = NativeStackScreenProps<AppStackParamList, 'CardTopup'>;

const MIN_TOPUP = 500;
const POLL_MS = 4000;
const POLL_LIMIT_MS = 3 * 60 * 1000;

export default function CardTopupScreen({ navigation, route }: Props) {
  const { card } = route.params;
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topup, setTopup] = useState<Topup | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const startedAt = useRef(0);

  const waiting = topup !== null && ['pending', 'processing'].includes(topup.status);

  useEffect(() => {
    if (!waiting || !topup) {
      return;
    }
    const timer = setInterval(async () => {
      if (Date.now() - startedAt.current > POLL_LIMIT_MS) {
        setTimedOut(true);
        clearInterval(timer);
        return;
      }
      try {
        const response = await api.topup(topup.uuid);
        setTopup(response.data.topup);
      } catch {
        // Keep polling through brief network drops.
      }
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [waiting, topup]);

  const start = async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await api.topupCard(card.card_number, Number(amount), phone.trim());
      startedAt.current = Date.now();
      setTimedOut(false);
      setTopup(response.data.topup);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start the top-up.');
    } finally {
      setBusy(false);
    }
  };

  if (topup) {
    const done = topup.status === 'completed';
    const failed = !waiting && !done;

    return (
      <Screen
        footer={
          <View style={{ gap: spacing.sm }}>
            {failed || timedOut ? <Button title="Try again" variant="secondary" onPress={() => setTopup(null)} /> : null}
            <Button title="Done" onPress={() => navigation.popToTop()} />
          </View>
        }
      >
        <View style={styles.status}>
          {waiting && !timedOut ? <ActivityIndicator size="large" color={colors.primary} /> : null}
          <Text style={styles.amount}>{money(topup.amount)}</Text>
          <Text style={styles.forWho}>for {card.student?.name}</Text>
        </View>
        {done ? <Notice tone="success">Payment received. The card has been topped up and the parent notified.</Notice> : null}
        {failed ? <Notice tone="danger">The payment failed or was cancelled. No money was added.</Notice> : null}
        {waiting && !timedOut ? (
          <Notice>
            Ask the payer to approve the mobile money prompt on {topup.phone_number}
            {topup.payment?.platform_charge ? ` (total ${money(topup.payment.amount)} incl. ${money(topup.payment.platform_charge)} fee)` : ''}.
          </Notice>
        ) : null}
        {waiting && timedOut ? (
          <Notice tone="warning">Still waiting for the payment. If it was approved, the card is credited automatically when it arrives.</Notice>
        ) : null}
      </Screen>
    );
  }

  const value = Number(amount || 0);

  return (
    <Screen
      footer={
        <Button
          title={value >= MIN_TOPUP ? `Send prompt for ${money(value)}` : `Minimum ${money(MIN_TOPUP)}`}
          loading={busy}
          disabled={value < MIN_TOPUP || phone.trim().length < 9}
          onPress={start}
        />
      }
    >
      <Notice>Top-ups are paid by mobile money. The payer approves a prompt on their phone.</Notice>
      <TextField
        label="Amount (UGX)"
        value={amount ? Number(amount).toLocaleString('en-US') : ''}
        onChangeText={(text) => setAmount(digitsOnly(text).slice(0, 7))}
        keyboardType="number-pad"
        large
        placeholder="0"
      />
      <TextField
        label="Payer's mobile money number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder="07XX XXX XXX"
        error={error}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  status: { alignItems: 'center', gap: spacing.sm, marginTop: spacing.xl },
  amount: { fontSize: 34, fontWeight: '800', color: colors.text },
  forWho: { fontSize: 16, color: colors.muted },
});
