import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { api, ApiError } from '../../api/client';
import Button from '../../components/Button';
import PinPad from '../../components/PinPad';
import Screen from '../../components/Screen';
import TextField from '../../components/TextField';
import { useAuth } from '../../context/AuthContext';
import type { AuthStackParamList } from '../../navigation/types';
import { colors, spacing } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'phone' | 'pin'>('phone');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const login = async (pin: string) => {
    setBusy(true);
    setError(null);
    try {
      const response = await api.login(phone.trim(), pin);
      await signIn(response.data.token, response.data.attendant);
    } catch (e) {
      if (e instanceof ApiError && e.code === 'setup_required') {
        navigation.navigate('OtpRequest', { mode: 'setup' });
      }
      setError(e instanceof Error ? e.message : 'Login failed.');
      setResetKey((key) => key + 1);
    } finally {
      setBusy(false);
    }
  };

  if (step === 'pin') {
    return (
      <Screen>
        <View style={styles.pinHeader}>
          <Pressable onPress={() => { setStep('phone'); setError(null); }} hitSlop={12}>
            <Text style={styles.link}>← {phone}</Text>
          </Pressable>
        </View>
        <PinPad title="Enter your PIN" error={error} busy={busy} resetKey={resetKey} onComplete={login} />
        <Pressable onPress={() => navigation.navigate('OtpRequest', { mode: 'forgot' })} style={styles.center} hitSlop={12}>
          <Text style={styles.link}>Forgot PIN?</Text>
        </Pressable>
      </Screen>
    );
  }

  return (
    <Screen style={styles.page}>
      <View style={styles.brand}>
        <Image source={require('../../../assets/icon.png')} style={styles.logo} />
        <Text style={styles.title}>Quisat Attendant</Text>
        <Text style={styles.subtitle}>Canteen sales for Quisat Pocket Pay</Text>
      </View>

      <TextField
        label="Phone number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        autoComplete="tel"
        placeholder="07XX XXX XXX"
        returnKeyType="next"
        onSubmitEditing={() => phone.trim().length >= 9 && setStep('pin')}
      />
      <Button title="Continue" disabled={phone.trim().length < 9} onPress={() => setStep('pin')} />

      <View style={styles.footer}>
        <Text style={styles.muted}>New attendant?</Text>
        <Pressable onPress={() => navigation.navigate('OtpRequest', { mode: 'setup' })} hitSlop={12}>
          <Text style={styles.link}>Set up your account</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { paddingTop: 72 },
  brand: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  logo: { width: 84, height: 84, borderRadius: 20 },
  title: { fontSize: 26, fontWeight: '800', color: colors.primary },
  subtitle: { fontSize: 15, color: colors.muted },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xs, marginTop: spacing.lg },
  muted: { color: colors.muted, fontSize: 15 },
  link: { color: colors.primary, fontSize: 15, fontWeight: '700' },
  pinHeader: { marginTop: spacing.xl },
  center: { alignItems: 'center', marginTop: spacing.md },
});
