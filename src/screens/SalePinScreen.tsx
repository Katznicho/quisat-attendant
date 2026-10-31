import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { api, ApiError } from '../api/client';
import Button from '../components/Button';
import Notice from '../components/Notice';
import PinPad from '../components/PinPad';
import Screen from '../components/Screen';
import type { AppStackParamList } from '../navigation/types';
import { colors, radius, spacing, type } from '../theme';
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
        <Text style={styles.payTo}>Pay canteen</Text>
        <Text style={styles.amount}>{money(amount)}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {card.student?.name}
          {description ? ` · ${description}` : ''}
        </Text>
      </View>

      {fatal ? (
        <View style={styles.fatal}>
          <Notice tone="danger">{error}</Notice>
          <Button title="Back" variant="secondary" icon="arrow-back" onPress={() => navigation.goBack()} />
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
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: 2,
  },
  payTo: { ...type.caption, color: colors.onPrimaryMuted },
  amount: { ...type.display, fontSize: 34, color: colors.onPrimary },
  meta: { fontSize: 14, color: colors.onPrimaryMuted },
  fatal: { gap: spacing.lg },
});
