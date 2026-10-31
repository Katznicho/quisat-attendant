import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { api, ApiError } from '../api/client';
import Button from '../components/Button';
import PinPad from '../components/PinPad';
import Screen from '../components/Screen';
import type { AppStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';
import { money } from '../utils/format';

type Props = NativeStackScreenProps<AppStackParamList, 'SalePin'>;

/** The student confirms the purchase with their card PIN. */
export default function SalePinScreen({ navigation, route }: Props) {
  const { card, amount, description } = route.params;
  const [error, setError] = useState<string | null>(null);
  const [fatal, setFatal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const pay = async (pin: string) => {
    setBusy(true);
    setError(null);
    try {
      const response = await api.makeSale(card.card_number, amount, pin, description);
      navigation.replace('SaleReceipt', { sale: response.data.sale, cardBalance: response.data.card_balance });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The sale failed.');
      // Only a wrong PIN can be retried on this screen; balance, limit, float or lock problems cannot.
      setFatal(!(e instanceof ApiError && e.code === 'wrong_pin'));
      setResetKey((key) => key + 1);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <View style={styles.summary}>
        <Text style={styles.label}>{card.student?.name}</Text>
        <Text style={styles.amount}>{money(amount)}</Text>
        {description ? <Text style={styles.label}>{description}</Text> : null}
      </View>

      {fatal ? (
        <View style={styles.fatal}>
          <Text style={styles.fatalText}>{error}</Text>
          <Button title="Back" variant="secondary" onPress={() => navigation.goBack()} />
        </View>
      ) : (
        <PinPad
          title={`${card.student?.first_name ?? 'Student'}, enter your PIN`}
          subtitle="Only the student should type this."
          error={error}
          busy={busy}
          resetKey={resetKey}
          onComplete={pay}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { fontSize: 15, color: colors.muted },
  amount: { fontSize: 34, fontWeight: '800', color: colors.text, marginVertical: spacing.xs },
  fatal: { gap: spacing.lg, alignItems: 'stretch' },
  fatalText: { fontSize: 17, color: colors.danger, textAlign: 'center', fontWeight: '600' },
});
