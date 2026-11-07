import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { api } from '../api/client';
import type { Withdrawal } from '../api/types';
import { canWithdrawBalance } from '../api/types';
import Button from '../components/Button';
import Notice from '../components/Notice';
import Screen from '../components/Screen';
import TextField from '../components/TextField';
import { useAuth } from '../context/AuthContext';
import type { AppStackParamList } from '../navigation/types';
import { colors, radius, spacing, type } from '../theme';
import { dateTime, digitsOnly, money } from '../utils/format';

type Props = NativeStackScreenProps<AppStackParamList, 'Withdraw'>;

const MIN_WITHDRAWAL = 500;
const MAX_WITHDRAWAL = 5_000_000;

export default function WithdrawScreen({ navigation }: Props) {
  const { attendant, refresh } = useAuth();
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<Withdrawal | null>(null);
  const [recent, setRecent] = useState<Withdrawal[]>([]);
  const [balance, setBalance] = useState(attendant?.canteen?.float_balance ?? 0);

  const allowed = canWithdrawBalance(attendant);

  const load = useCallback(async () => {
    if (!allowed) {
      return;
    }
    try {
      const response = await api.withdrawals();
      setBalance(response.data.canteen?.float_balance ?? 0);
      setRecent(response.data.withdrawals);
    } catch {
      // The form still works from the balance already on the profile.
    }
  }, [allowed]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const value = Number(amount || 0);
  const tooMuch = value > balance;
  const ready = allowed && value >= MIN_WITHDRAWAL && value <= MAX_WITHDRAWAL && value <= balance && phone.trim().length >= 9;

  const send = async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await api.withdraw(value, phone.trim(), notes.trim());
      setSent(response.data.withdrawal);
      setBalance(response.data.canteen?.float_balance ?? 0);
      await refresh().catch(() => undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The withdrawal could not be sent.');
    } finally {
      setBusy(false);
    }
  };

  if (!allowed) {
    return (
      <Screen>
        <Notice tone="warning">Withdrawals are for canteens that keep a sales balance, and only for the attendant chosen to withdraw it.</Notice>
      </Screen>
    );
  }

  if (sent) {
    return (
      <Screen footer={<Button title="Done" size="lg" onPress={() => navigation.popToTop()} />}>
        <View style={styles.status}>
          <View style={[styles.ring, { backgroundColor: colors.successSoft }]}>
            <Ionicons name="checkmark-circle" size={56} color={colors.success} />
          </View>
          <Text style={styles.amount}>{money(sent.amount)}</Text>
          <Text style={styles.caption}>Sent to {sent.phone_number}</Text>
        </View>
        <Notice tone="success">The money is on its way. This canteen’s balance is now {money(balance)}.</Notice>
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <Button
          icon="cash-outline"
          size="lg"
          title={
            value <= 0
              ? 'Enter an amount'
              : value < MIN_WITHDRAWAL
                ? `Minimum ${money(MIN_WITHDRAWAL)}`
                : tooMuch
                  ? 'More than the balance'
                  : `Withdraw ${money(value)}`
          }
          loading={busy}
          disabled={!ready}
          onPress={send}
        />
      }
    >
      <View style={styles.balance}>
        <Text style={styles.balanceLabel}>Available to withdraw</Text>
        <Text style={styles.balanceValue}>{money(balance)}</Text>
      </View>
      <TextField
        label="Amount"
        prefix="UGX"
        value={amount ? Number(amount).toLocaleString('en-US') : ''}
        onChangeText={(text) => setAmount(digitsOnly(text).slice(0, 7))}
        keyboardType="number-pad"
        large
        placeholder="e.g. 50,000"
      />
      <TextField
        label="Mobile money number"
        icon="call-outline"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder="e.g. 0772 123 456"
      />
      <TextField
        label="Note"
        value={notes}
        onChangeText={setNotes}
        placeholder="e.g. Week of 3 Nov"
        error={error}
      />
      <Notice>This leaves the Pocket Pay account and reduces this canteen’s sales balance.</Notice>
      {recent.length > 0 ? (
        <View style={styles.recent}>
          <Text style={styles.recentTitle}>Recent withdrawals</Text>
          {recent.map((item) => (
            <View key={item.uuid} style={styles.recentRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.recentPhone}>{item.phone_number}</Text>
                <Text style={styles.recentMeta}>{dateTime(item.created_at)} · {item.status}</Text>
              </View>
              <Text style={styles.recentAmount}>{money(item.amount)}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  balance: { gap: 2 },
  balanceLabel: { ...type.caption, color: colors.muted },
  balanceValue: { ...type.display, color: colors.text, fontSize: 32 },
  status: { alignItems: 'center', gap: spacing.xs, marginTop: spacing.xl, marginBottom: spacing.sm },
  ring: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  amount: { ...type.display, color: colors.text },
  caption: { ...type.body, color: colors.muted },
  recent: { gap: spacing.sm, marginTop: spacing.sm },
  recentTitle: { ...type.caption, color: colors.muted },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  recentPhone: { ...type.body, color: colors.text, fontWeight: '600' },
  recentMeta: { ...type.caption, color: colors.muted, textTransform: 'capitalize' },
  recentAmount: { ...type.body, color: colors.text, fontWeight: '700' },
});
