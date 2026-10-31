import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Alert } from 'react-native';

import { api } from '../api/client';
import NewPinFlow from '../components/NewPinFlow';
import Notice from '../components/Notice';
import Screen from '../components/Screen';
import { StudentChip } from '../components/StudentCard';
import type { AppStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AppStackParamList, 'SetCardPin'>;

/** The student chooses their card PIN: on activation, or when an attendant helps reset it. */
export default function SetCardPinScreen({ navigation, route }: Props) {
  const { card, mode } = route.params;
  const name = card.student?.first_name ?? 'the student';

  return (
    <Screen>
      <StudentChip card={card} />
      <Notice>
        Hand the phone to {name}. The parent gets an SMS when the PIN is {mode === 'activate' ? 'set' : 'reset'}.
      </Notice>
      <NewPinFlow
        title={`${name}, choose a 4-digit PIN`}
        subtitle="Keep it secret. You will use it every time you buy."
        onConfirmed={async (pin) => {
          if (mode === 'activate') {
            await api.activateCard(card.card_number, pin);
          } else {
            await api.resetCardPin(card.card_number, pin);
          }
          Alert.alert(
            mode === 'activate' ? 'Card activated' : 'PIN reset',
            mode === 'activate' ? `${name} can now buy with the card.` : `${name}'s new PIN is ready to use.`,
          );
          navigation.popToTop();
        }}
      />
    </Screen>
  );
}
