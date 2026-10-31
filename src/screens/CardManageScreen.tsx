import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { api } from '../api/client';
import type { Card } from '../api/types';
import ActionRow from '../components/ActionRow';
import Notice from '../components/Notice';
import Screen from '../components/Screen';
import SectionHeader from '../components/SectionHeader';
import StudentCard from '../components/StudentCard';
import Surface from '../components/Surface';
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

  const actions = [
    card.status === 'inactive' && (
      <ActionRow
        key="activate"
        icon="card-outline"
        tone="success"
        title="Activate card"
        subtitle="The student chooses a PIN"
        onPress={() => navigation.navigate('SetCardPin', { card, mode: 'activate' })}
      />
    ),
    card.status !== 'blocked' && (
      <ActionRow
        key="topup"
        icon="add-circle-outline"
        title="Top up"
        subtitle="Paid by mobile money"
        onPress={() => navigation.navigate('CardTopup', { card })}
      />
    ),
    card.status === 'active' && (
      <ActionRow
        key="pin"
        icon={card.is_locked ? 'lock-open-outline' : 'key-outline'}
        tone={card.is_locked ? 'warning' : 'primary'}
        title={card.is_locked ? 'Unlock card' : 'Reset PIN'}
        subtitle={card.is_locked ? 'Locked after wrong PINs: set a new PIN' : 'The student chooses a new PIN'}
        onPress={() => navigation.navigate('SetCardPin', { card, mode: 'reset' })}
      />
    ),
  ].filter(Boolean) as React.ReactElement<{ divider?: boolean }>[];

  return (
    <Screen>
      <StudentCard card={card} />

      {card.status === 'blocked' ? (
        <Notice tone="warning">This card is deactivated by the school. Only the school admin can activate it again.</Notice>
      ) : null}

      {actions.length > 0 ? (
        <>
          <SectionHeader>Card services</SectionHeader>
          <Surface flush style={{ overflow: 'hidden' }}>
            {actions.map((action, index) => React.cloneElement(action, { divider: index > 0 }))}
          </Surface>
        </>
      ) : null}
    </Screen>
  );
}
