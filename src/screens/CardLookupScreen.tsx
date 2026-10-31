import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { api } from '../api/client';
import type { Card } from '../api/types';
import Button from '../components/Button';
import CardScanner from '../components/CardScanner';
import Notice from '../components/Notice';
import Screen from '../components/Screen';
import SegmentedControl from '../components/SegmentedControl';
import StudentCard from '../components/StudentCard';
import TextField from '../components/TextField';
import type { AppStackParamList, CardPurpose } from '../navigation/types';
import { colors, spacing, type } from '../theme';
import { normalizeCardNumber } from '../utils/format';

type Props = NativeStackScreenProps<AppStackParamList, 'CardLookup'>;

type Method = 'scan' | 'type';

const INTRO: Record<CardPurpose, string> = {
  sale: 'Scan the student’s card or type its number to start the sale.',
  activate: 'Scan the new card or type its number. The student will then choose a PIN.',
  manage: 'Scan the card or type its number to top up, reset the PIN or unlock it.',
};

const CONTINUE: Record<CardPurpose, string> = {
  sale: 'Continue to amount',
  activate: 'Student sets PIN',
  manage: 'Open card',
};

/** First step of every card flow: scan the card's QR code or type its number, then confirm the student. */
export default function CardLookupScreen({ navigation, route }: Props) {
  const { purpose } = route.params;
  const [method, setMethod] = useState<Method>('scan');
  const [number, setNumber] = useState('');
  const [card, setCard] = useState<Card | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const find = async (raw: string) => {
    const cardNumber = normalizeCardNumber(raw);
    if (cardNumber.length < 4) {
      return;
    }
    setBusy(true);
    setError(null);
    setCard(null);
    try {
      const response = await api.card(cardNumber);
      setCard(response.data.card);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Card not found.');
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setCard(null);
    setError(null);
    setNumber('');
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

  if (card) {
    const problem = cardProblem(card, purpose);

    return (
      <Screen
        footer={
          <View style={styles.footer}>
            <Button title={CONTINUE[purpose]} icon="arrow-forward" size="lg" disabled={!!problem} onPress={proceed} />
            <Button
              title={method === 'scan' ? 'Scan a different card' : 'Enter a different number'}
              variant="ghost"
              onPress={reset}
            />
          </View>
        }
      >
        <Text style={styles.eyebrow}>Card found</Text>
        <StudentCard card={card} showMoney={purpose !== 'activate'} />
        {problem ? (
          <Notice tone="warning">{problem}</Notice>
        ) : (
          <Notice>Check that the photo and name match the student in front of you.</Notice>
        )}
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.intro}>{INTRO[purpose]}</Text>

      <SegmentedControl<Method>
        value={method}
        onChange={(value) => {
          setMethod(value);
          setError(null);
        }}
        options={[
          { value: 'scan', label: 'Scan card', icon: 'qr-code-outline' },
          { value: 'type', label: 'Enter number', icon: 'keypad-outline' },
        ]}
      />

      {method === 'scan' ? (
        <>
          <CardScanner paused={busy} onScanned={find} />
          {error ? <Notice tone="danger">{error}</Notice> : null}
        </>
      ) : (
        <>
          <TextField
            label="Card number"
            icon="card-outline"
            value={number}
            onChangeText={(value) => {
              setNumber(value);
              setError(null);
            }}
            autoCapitalize="characters"
            autoCorrect={false}
            autoFocus
            large
            placeholder="2600 0000 0000"
            returnKeyType="search"
            onSubmitEditing={() => find(number)}
            error={error}
            hint="The number printed under the QR code."
          />
          <Button
            title="Find card"
            icon="search"
            size="lg"
            loading={busy}
            disabled={normalizeCardNumber(number).length < 4}
            onPress={() => find(number)}
          />
        </>
      )}
    </Screen>
  );
}

function cardProblem(card: Card, purpose: CardPurpose): string | null {
  if (card.status === 'blocked') {
    return 'This card is deactivated. The student should contact the school.';
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

const styles = StyleSheet.create({
  intro: { ...type.body, color: colors.muted, lineHeight: 22 },
  eyebrow: { ...type.caption, color: colors.success },
  footer: { gap: spacing.xs },
});
