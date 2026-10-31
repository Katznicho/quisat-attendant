import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';

import { api } from '../../api/client';
import Button from '../../components/Button';
import Notice from '../../components/Notice';
import Screen from '../../components/Screen';
import TextField from '../../components/TextField';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'OtpRequest'>;

export default function OtpRequestScreen({ navigation, route }: Props) {
  const { mode } = route.params;
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <Screen>
      <Notice>
        {mode === 'setup'
          ? 'Your school admin added you as an attendant and a one-time PIN was sent to your phone by SMS. Enter that phone number to continue.'
          : 'Enter your phone number. We will send a one-time PIN by SMS so you can choose a new PIN.'}
      </Notice>
      <TextField
        label="Phone number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        autoComplete="tel"
        placeholder="07XX XXX XXX"
        error={error}
      />
      {mode === 'setup' ? (
        // The admin's "add attendant" action already texted the one-time PIN.
        <Button
          title="Continue"
          disabled={phone.trim().length < 9}
          onPress={() => navigation.navigate('OtpVerify', { phone: phone.trim(), mode })}
        />
      ) : (
        <>
          <Button title="Send one-time PIN" loading={busy} disabled={phone.trim().length < 9} onPress={send} />
          <Button
            title="I already have a one-time PIN"
            variant="ghost"
            disabled={phone.trim().length < 9}
            onPress={() => navigation.navigate('OtpVerify', { phone: phone.trim(), mode })}
          />
        </>
      )}
    </Screen>
  );
}
