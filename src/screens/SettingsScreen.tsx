import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Constants from 'expo-constants';
import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import Button from '../components/Button';
import Screen from '../components/Screen';
import { useAuth } from '../context/AuthContext';
import type { AppStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const { attendant, signOut } = useAuth();

  const rows: Array<[string, string]> = [
    ['Name', attendant?.name ?? ''],
    ['Phone', attendant?.phone ?? ''],
    ['Canteen', attendant?.canteen?.name ?? ''],
    ['School', attendant?.school?.name ?? ''],
  ];

  return (
    <Screen>
      <View style={styles.card}>
        {rows.map(([label, value]) => (
          <View key={label} style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
          </View>
        ))}
      </View>

      <Button title="Change PIN" variant="secondary" onPress={() => navigation.navigate('ChangePin')} />
      <Button
        title="Log out"
        variant="danger"
        onPress={() =>
          Alert.alert('Log out?', 'You will need your phone number and PIN to log in again.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log out', style: 'destructive', onPress: () => signOut() },
          ])
        }
      />
      <Text style={styles.version}>Quisat Attendant {Constants.expoConfig?.version}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  label: { fontSize: 15, color: colors.muted },
  value: { fontSize: 15, fontWeight: '600', color: colors.text, flexShrink: 1, textAlign: 'right' },
  version: { textAlign: 'center', color: colors.muted, fontSize: 12 },
});
