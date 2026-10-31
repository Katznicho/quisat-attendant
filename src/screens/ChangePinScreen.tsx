import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert } from 'react-native';

import { api } from '../api/client';
import NewPinFlow from '../components/NewPinFlow';
import PinPad from '../components/PinPad';
import Screen from '../components/Screen';
import type { AppStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AppStackParamList, 'ChangePin'>;

export default function ChangePinScreen({ navigation }: Props) {
  const [currentPin, setCurrentPin] = useState<string | null>(null);

  return (
    <Screen>
      {currentPin === null ? (
        <PinPad title="Enter your current PIN" onComplete={setCurrentPin} />
      ) : (
        <NewPinFlow
          title="Choose a new PIN"
          onConfirmed={async (pin) => {
            try {
              await api.changePin(currentPin, pin);
            } catch (e) {
              // A wrong current PIN means starting over from the first step.
              Alert.alert('PIN not changed', e instanceof Error ? e.message : 'Try again.');
              setCurrentPin(null);
              return;
            }
            Alert.alert('PIN changed', 'Use your new PIN next time you log in.');
            navigation.goBack();
          }}
        />
      )}
    </Screen>
  );
}
