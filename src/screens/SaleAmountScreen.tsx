import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';

import Button from '../components/Button';
import Notice from '../components/Notice';
import Screen from '../components/Screen';
import StudentCard from '../components/StudentCard';
import TextField from '../components/TextField';
import type { AppStackParamList } from '../navigation/types';
import { digitsOnly, money } from '../utils/format';

type Props = NativeStackScreenProps<AppStackParamList, 'SaleAmount'>;

export default function SaleAmountScreen({ navigation, route }: Props) {
  const { card } = route.params;
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const value = Number(amount || 0);
  const limitLeft = card.remaining_today ?? null;

  let problem: string | null = null;
  if (value > card.balance) {
    problem = `More than the card balance (${money(card.balance)}).`;
  } else if (limitLeft !== null && value > limitLeft) {
    problem = `More than the student's daily limit allows today (${money(limitLeft)} left).`;
  }

  return (
    <Screen
      footer={
        <Button
          title={value > 0 ? `Charge ${money(value)}` : 'Enter an amount'}
          disabled={value <= 0 || !!problem}
          onPress={() => navigation.navigate('SalePin', { card, amount: value, description: description.trim() || undefined })}
        />
      }
    >
      <StudentCard card={card} />
      <TextField
        label="Amount (UGX)"
        value={amount ? Number(amount).toLocaleString('en-US') : ''}
        onChangeText={(text) => setAmount(digitsOnly(text).slice(0, 8))}
        keyboardType="number-pad"
        large
        autoFocus
        placeholder="0"
        error={problem}
      />
      <TextField
        label="What was bought (optional)"
        value={description}
        onChangeText={setDescription}
        placeholder="e.g. Lunch, snacks"
        maxLength={120}
      />
      <Notice>Next, hand the phone to {card.student?.first_name ?? 'the student'} to enter their PIN.</Notice>
    </Screen>
  );
}
