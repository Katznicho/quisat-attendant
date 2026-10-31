import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api, ApiError } from '../../api/client';
import Button from '../../components/Button';
import PinPad from '../../components/PinPad';
import Screen from '../../components/Screen';
import TextField from '../../components/TextField';
import { useAuth } from '../../context/AuthContext';
import type { AuthStackParamList } from '../../navigation/types';
import { colors, elevation, radius, spacing, type } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
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
      <Screen style={{ paddingTop: insets.top + spacing.sm }}>
        <Pressable
          onPress={() => {
            setStep('phone');
            setError(null);
          }}
          style={({ pressed }) => [styles.phonePill, pressed && { opacity: 0.7 }]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Change phone number"
        >
          <Ionicons name="chevron-back" size={18} color={colors.primary} />
          <Text style={styles.phonePillText}>{phone}</Text>
        </Pressable>

        <View style={{ marginTop: spacing.lg }}>
          <PinPad title="Enter your PIN" subtitle="Your 4-digit attendant PIN" error={error} busy={busy} resetKey={resetKey} onComplete={login} />
        </View>

        <Pressable onPress={() => navigation.navigate('OtpRequest', { mode: 'forgot' })} style={styles.center} hitSlop={12}>
          <Text style={styles.link}>Forgot PIN?</Text>
        </Pressable>
      </Screen>
    );
  }

  return (
    <Screen style={{ paddingTop: insets.top + 56 }}>
      <View style={styles.brand}>
        <View style={styles.logoWrap}>
          <Image source={require('../../../assets/icon.png')} style={styles.logo} />
        </View>
        <Text style={styles.title}>Quisat Attendant</Text>
        <Text style={styles.subtitle}>Cashless canteen sales for Quisat Pocket Pay</Text>
      </View>

      <TextField
        label="Phone number"
        icon="call-outline"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        autoComplete="tel"
        placeholder="07XX XXX XXX"
        returnKeyType="next"
        onSubmitEditing={() => phone.trim().length >= 9 && setStep('pin')}
      />
      <Button title="Continue" size="lg" icon="arrow-forward" disabled={phone.trim().length < 9} onPress={() => setStep('pin')} />

      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.muted}>New attendant?</Text>
        <View style={styles.line} />
      </View>
      <Button
        title="Set up your account"
        variant="secondary"
        icon="person-add-outline"
        onPress={() => navigation.navigate('OtpRequest', { mode: 'setup' })}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xl },
  logoWrap: { borderRadius: 24, backgroundColor: colors.surface, padding: 6, marginBottom: spacing.md, ...elevation.raised },
  logo: { width: 80, height: 80, borderRadius: 20 },
  title: { ...type.title, color: colors.text },
  subtitle: { ...type.small, color: colors.muted, textAlign: 'center' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.md },
  line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  muted: { color: colors.muted, fontSize: 13 },
  link: { color: colors.primary, fontSize: 15, fontWeight: '700' },
  phonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingLeft: 8,
    paddingRight: 14,
    paddingVertical: 7,
  },
  phonePillText: { color: colors.primary, fontSize: 15, fontWeight: '700' },
  center: { alignItems: 'center', marginTop: spacing.sm },
});
