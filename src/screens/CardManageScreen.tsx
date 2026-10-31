import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { api } from '../api/client';
import type { Card } from '../api/types';
import Button from '../components/Button';
import Notice from '../components/Notice';
import Screen from '../components/Screen';
import StudentCard from '../components/StudentCard';
import type { AppStackParamList } from '../navigation/types';
import { colors } from '../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'CardManage'>;

export default function CardManageScreen({ navigation, route }: Props) {
  const { cardNumber } = route.params;
  const [card, setCard] = useState<Card | null>(null);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      api
        .card(cardNumber)
        .then((response) => {
          setCard(response.data.card);
          setError(null);
        })
        .catch((e) => setError(e instanceof Error ? e.message : 'Could not load the card.'));
    }, [cardNumber]),
  );

  if (!card) {
    return (
      <Screen>
        {error ? <Notice tone="danger">{error}</Notice> : <ActivityIndicator color={colors.primary} />}
      </Screen>
    );
  }

  return (
    <Screen>
      <StudentCard card={card} />

      {card.status === 'blocked' ? (
        <Notice tone="warning">This card is blocked by the school. Only the school admin can unblock it.</Notice>
      ) : null}

      {card.status === 'inactive' ? (
        <Button title="Activate card" onPress={() => navigation.navigate('SetCardPin', { card, mode: 'activate' })} />
      ) : null}

      {card.status === 'active' ? (
        <Button
          title={card.is_locked ? 'Unlock: reset PIN' : 'Reset PIN'}
          variant="secondary"
          onPress={() => navigation.navigate('SetCardPin', { card, mode: 'reset' })}
        />
      ) : null}

      {card.status !== 'blocked' ? (
        <Button title="Top up with mobile money" onPress={() => navigation.navigate('CardTopup', { card })} />
      ) : null}
    </Screen>
  );
}
