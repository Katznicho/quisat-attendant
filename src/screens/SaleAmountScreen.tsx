import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import Button from '../components/Button';
import Screen from '../components/Screen';
import { StudentChip } from '../components/StudentCard';
import Surface from '../components/Surface';
import TextField from '../components/TextField';
import type { AppStackParamList } from '../navigation/types';
import { colors, radius, spacing, type } from '../theme';
import { digitsOnly, money } from '../utils/format';

type Props = NativeStackScreenProps<AppStackParamList, 'SaleAmount'>;

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

export default function SaleAmountScreen({ navigation, route }: Props) {
  const { card } = route.params;
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const value = Number(amount || 0);
  const limitLeft = card.remaining_today ?? null;
  const available = limitLeft === null ? card.balance : Math.min(card.balance, limitLeft);

  let problem: string | null = null;
  if (value > card.balance) {
    problem = `More than the card balance (${money(card.balance)}).`;
  } else if (limitLeft !== null && value > limitLeft) {
    problem = `More than the daily limit allows today (${money(limitLeft)} left).`;
  }

  return (
    <Screen
      footer={
        <Button
          title={value > 0 ? `Charge ${money(value)}` : 'Enter an amount'}
          icon="lock-closed"
          size="lg"
          disabled={value <= 0 || !!problem}
          onPress={() => navigation.navigate('SalePin', { card, amount: value, description: description.trim() || undefined })}
        />
      }
    >
      <StudentChip card={card} detail={`Can spend ${money(available)}`} />

      <Surface style={styles.amountCard}>
        <Text style={styles.amountLabel}>Amount</Text>
        <View style={styles.amountRow}>
          <Text style={[styles.currency, value > 0 && styles.currencyActive]}>UGX</Text>
          <TextInput
            value={amount ? Number(amount).toLocaleString('en-US') : ''}
            onChangeText={(text) => setAmount(digitsOnly(text).slice(0, 8))}
            keyboardType="number-pad"
            autoFocus
            placeholder="0"
            placeholderTextColor={colors.subtle}
            style={[styles.amountInput, problem ? { color: colors.danger } : null]}
            accessibilityLabel="Amount in UGX"
          />
        </View>
        {problem ? <Text style={styles.problem}>{problem}</Text> : null}

        <View style={styles.quick}>
          {QUICK_AMOUNTS.map((quick) => (
            <Pressable
              key={quick}
              onPress={() => setAmount(String(quick))}
              disabled={quick > available}
              style={({ pressed }) => [
                styles.chip,
                value === quick && styles.chipActive,
                pressed && styles.chipPressed,
                quick > available && styles.chipDisabled,
              ]}
            >
              <Text style={[styles.chipText, value === quick && styles.chipTextActive]}>{quick.toLocaleString('en-US')}</Text>
            </Pressable>
          ))}
        </View>
      </Surface>

      <TextField
        label="What was bought (optional)"
        icon="fast-food-outline"
        value={description}
        onChangeText={setDescription}
        placeholder="e.g. Lunch, snacks"
        maxLength={120}
        hint={`Next, hand the phone to ${card.student?.first_name ?? 'the student'} to enter their PIN.`}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  amountCard: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  amountLabel: { ...type.caption, color: colors.muted },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  currency: { fontSize: 20, fontWeight: '700', color: colors.subtle },
  currencyActive: { color: colors.muted },
  amountInput: { ...type.display, fontSize: 44, color: colors.text, minWidth: 60, padding: 0, textAlign: 'center' },
  problem: { color: colors.danger, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  quick: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipPressed: { backgroundColor: colors.primarySoft },
  chipDisabled: { opacity: 0.35 },
  chipText: { fontSize: 14, fontWeight: '700', color: colors.textSecondary, fontVariant: ['tabular-nums'] },
  chipTextActive: { color: colors.onPrimary },
});
