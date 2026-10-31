import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Constants from 'expo-constants';
import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import ActionRow from '../components/ActionRow';
import DetailList from '../components/DetailList';
import Screen from '../components/Screen';
import SectionHeader from '../components/SectionHeader';
import Surface from '../components/Surface';
import { useAuth } from '../context/AuthContext';
import type { AppStackParamList } from '../navigation/types';
import { colors, spacing, type } from '../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const { attendant, signOut } = useAuth();
  const initials = (attendant?.name ?? '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <Screen>
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{initials}</Text>
        </View>
        <Text style={styles.name}>{attendant?.name}</Text>
        <Text style={styles.phone}>{attendant?.phone}</Text>
      </View>

      <SectionHeader>Workplace</SectionHeader>
      <DetailList
        rows={[
          { label: 'Canteen', value: attendant?.canteen?.name ?? '—' },
          { label: 'School', value: attendant?.school?.name ?? '—' },
        ]}
      />

      <SectionHeader>Security</SectionHeader>
      <Surface flush style={{ overflow: 'hidden' }}>
        <ActionRow icon="keypad-outline" title="Change PIN" onPress={() => navigation.navigate('ChangePin')} />
        <ActionRow
          divider
          icon="log-out-outline"
          tone="danger"
          title="Log out"
          onPress={() =>
            Alert.alert('Log out?', 'You will need your phone number and PIN to log in again.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Log out', style: 'destructive', onPress: () => signOut() },
            ])
          }
        />
      </Surface>

      <Text style={styles.version}>Quisat Attendant · v{Constants.expoConfig?.version}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profile: { alignItems: 'center', gap: 2, paddingVertical: spacing.md },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  initials: { fontSize: 28, fontWeight: '800', color: colors.onPrimary },
  name: { ...type.heading, color: colors.text },
  phone: { ...type.small, color: colors.muted },
  version: { textAlign: 'center', color: colors.subtle, fontSize: 12, marginTop: spacing.sm },
});
