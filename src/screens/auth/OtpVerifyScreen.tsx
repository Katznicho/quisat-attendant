import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert } from 'react-native';

import { api } from '../../api/client';
import Button from '../../components/Button';
import NewPinFlow from '../../components/NewPinFlow';
import AuthIntro from '../../components/AuthIntro';
import Screen from '../../components/Screen';
import TextField from '../../components/TextField';
import { useAuth } from '../../context/AuthContext';
import type { AuthStackParamList } from '../../navigation/types';
import { digitsOnly } from '../../utils/format';

type Props = NativeStackScreenProps<AuthStackParamList, 'OtpVerify'>;

export default function OtpVerifyScreen({ navigation, route }: Props) {
  const { phone, mode } = route.params;
  const { signIn } = useAuth();
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'otp' | 'pin'>('otp');
  const [resending, setResending] = useState(false);

  const resend = async () => {
    setResending(true);
    try {
      const response = await api.requestOtp(phone);
      Alert.alert('One-time PIN', response.message);
    } catch (e) {
      Alert.alert('Could not resend', e instanceof Error ? e.message : 'Try again.');
    } finally {
      setResending(false);
    }
  };

  if (step === 'pin') {
    return (
      <Screen>
        <NewPinFlow
          title={mode === 'setup' ? 'Choose your 4-digit PIN' : 'Choose a new 4-digit PIN'}
          subtitle="You will use it to log in. Keep it private."
          onConfirmed={async (pin) => {
            try {
              const response = await api.verifyOtp(phone, otp, pin);
              await signIn(response.data.token, response.data.attendant);
            } catch (e) {
              // A bad or expired one-time PIN means starting over from the code step.
              Alert.alert('Could not set your PIN', e instanceof Error ? e.message : 'Try again.');
              setStep('otp');
              setOtp('');
            }
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <AuthIntro
        icon="chatbubble-ellipses-outline"
        title="Enter the one-time PIN"
        message={
          mode === 'setup'
            ? `Type the 4-digit code sent by SMS to ${phone} when your school added you.`
            : `Type the 4-digit code sent by SMS to ${phone}. It expires in 10 minutes.`
        }
      />
      <TextField
        label="One-time PIN"
        value={otp}
        onChangeText={(value) => setOtp(digitsOnly(value).slice(0, 4))}
        keyboardType="number-pad"
        autoComplete="sms-otp"
        textContentType="oneTimeCode"
        large
        maxLength={4}
        placeholder="••••"
        style={{ textAlign: 'center', letterSpacing: 12 }}
      />
      <Button title="Continue" size="lg" icon="arrow-forward" disabled={otp.length !== 4} onPress={() => setStep('pin')} />
      <Button
        title={mode === 'setup' ? "Didn't get it? Send a new one" : 'Resend one-time PIN'}
        variant="ghost" loading={resending} onPress={resend} />
      <Button title="Back to login" variant="ghost" onPress={() => navigation.popToTop()} />
    </Screen>
  );
}
