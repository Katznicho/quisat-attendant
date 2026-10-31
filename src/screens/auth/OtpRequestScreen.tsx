import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';

import { api } from '../../api/client';
import AuthIntro from '../../components/AuthIntro';
import Button from '../../components/Button';
import Screen from '../../components/Screen';
import TextField from '../../components/TextField';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'OtpRequest'>;

export default function OtpRequestScreen({ navigation, route }: Props) {
  const { mode } = route.params;
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ready = phone.trim().length >= 9;

  const send = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.requestOtp(phone.trim());
      navigation.navigate('OtpVerify', { phone: phone.trim(), mode });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send the one-time PIN.');
    } finally {
      setBusy(false);
    }
  };

  const toVerify = () => navigation.navigate('OtpVerify', { phone: phone.trim(), mode });

  return (
    <Screen
      footer={
        mode === 'setup' ? (
          // The admin's "add attendant" action already texted the one-time PIN.
          <Button title="Continue" size="lg" icon="arrow-forward" disabled={!ready} onPress={toVerify} />
        ) : (
          <>
            <Button title="Send one-time PIN" size="lg" icon="chatbubble-ellipses-outline" loading={busy} disabled={!ready} onPress={send} />
            <Button title="I already have a one-time PIN" variant="ghost" disabled={!ready} onPress={toVerify} />
          </>
        )
      }
    >
      {mode === 'setup' ? (
        <AuthIntro
          icon="person-add-outline"
          title="Set up your account"
          message="Your school added you as an attendant and sent a one-time PIN to your phone by SMS. Enter that phone number to continue."
        />
      ) : (
        <AuthIntro
          icon="key-outline"
          title="Forgot your PIN?"
          message="Enter your phone number. We will text you a one-time PIN so you can choose a new PIN."
        />
      )}
      <TextField
        label="Phone number"
        icon="call-outline"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        autoComplete="tel"
        autoFocus
        placeholder="07XX XXX XXX"
        error={error}
      />
    </Screen>
  );
}
