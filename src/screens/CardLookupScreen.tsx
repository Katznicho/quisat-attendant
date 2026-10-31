import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';

import { api } from '../api/client';
import type { Card } from '../api/types';
import Button from '../components/Button';
import Notice from '../components/Notice';
import Screen from '../components/Screen';
import StudentCard from '../components/StudentCard';
import TextField from '../components/TextField';
import type { AppStackParamList } from '../navigation/types';
import { normalizeCardNumber } from '../utils/format';

type Props = NativeStackScreenProps<AppStackParamList, 'CardLookup'>;

/** First step of every card flow: type the number printed on the card and confirm the student. */
export default function CardLookupScreen({ navigation, route }: Props) {
  const { purpose } = route.params;
  const [number, setNumber] = useState('');
  const [card, setCard] = useState<Card | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const find = async () => {
    setBusy(true);
    setError(null);
    setCard(null);
    try {
      const response = await api.card(normalizeCardNumber(number));
      setCard(response.data.card);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Card not found.');
    } finally {
      setBusy(false);
    }
  };

  const proceed = () => {
    if (!card) {
      return;
    }
    if (purpose === 'sale') {
      navigation.navigate('SaleAmount', { card });
    } else if (purpose === 'activate') {
      navigation.navigate('SetCardPin', { card, mode: 'activate' });
    } else {
      navigation.navigate('CardManage', { cardNumber: card.card_number });
    }
  };

  const problem = card ? cardProblem(card, purpose) : null;

  return (
    <Screen
      footer={
        card ? (
          <Button
            title={purpose === 'sale' ? 'Continue to amount' : purpose === 'activate' ? 'Student sets PIN' : 'Open card'}
            disabled={!!problem}
            onPress={proceed}
          />
        ) : undefined
      }
    >
      <TextField
        label="Card number"
        value={number}
        onChangeText={(value) => {
          setNumber(value);
          setCard(null);
        }}
        autoCapitalize="characters"
        autoCorrect={false}
        large
        placeholder="Number on the card"
        returnKeyType="search"
        onSubmitEditing={find}
        error={error}
      />
      <Button title="Find card" variant="secondary" loading={busy} disabled={number.trim().length < 3} onPress={find} />

      {card ? (
        <>
          <StudentCard card={card} showMoney={purpose !== 'activate'} />
          {problem ? <Notice tone="warning">{problem}</Notice> : <Notice>Check that this is the student in front of you.</Notice>}
        </>
      ) : null}
    </Screen>
  );
}

function cardProblem(card: Card, purpose: Props['route']['params']['purpose']): string | null {
  if (card.status === 'blocked') {
    return 'This card is blocked. The student should contact the school.';
  }
  if (purpose === 'activate' && card.status === 'active') {
    return 'This card is already active. Use Card services to reset its PIN.';
  }
  if (purpose === 'sale' && card.status === 'inactive') {
    return 'This card is not activated yet. Use Activate card first.';
  }
  if (purpose === 'sale' && card.is_locked) {
    return 'This card is locked after too many wrong PINs. Reset the PIN in Card services.';
  }
  return null;
}
