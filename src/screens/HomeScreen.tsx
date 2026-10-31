import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '../api/client';
import type { Dashboard } from '../api/types';
import Notice from '../components/Notice';
import { useAuth } from '../context/AuthContext';
import type { AppStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';
import { money } from '../utils/format';

type Props = NativeStackScreenProps<AppStackParamList, 'Home'>;

type Tile = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

export default function HomeScreen({ navigation }: Props) {
  const { attendant } = useAuth();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await api.dashboard();
      setDashboard(response.data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load the dashboard.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const canteen = dashboard?.attendant.canteen ?? attendant?.canteen;
  const school = dashboard?.attendant.school ?? attendant?.school;

  const tiles: Tile[] = [
    { label: 'Activate card', icon: 'card-outline', onPress: () => navigation.navigate('CardLookup', { purpose: 'activate' }) },
    { label: 'Card services', icon: 'key-outline', onPress: () => navigation.navigate('CardLookup', { purpose: 'manage' }) },
    { label: 'Sales', icon: 'receipt-outline', onPress: () => navigation.navigate('Sales') },
    { label: 'Float statement', icon: 'wallet-outline', onPress: () => navigation.navigate('FloatStatement') },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
          />
        }
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Hi, {attendant?.name?.split(' ')[0]}</Text>
            <Text style={styles.canteen}>{canteen?.name}</Text>
            <Text style={styles.school}>{school?.name}</Text>
          </View>
          <Pressable onPress={() => navigation.navigate('Settings')} hitSlop={12} accessibilityLabel="Settings">
            <Ionicons name="settings-outline" size={26} color={colors.primary} />
          </Pressable>
        </View>

        {error ? <Notice tone="danger">{error}</Notice> : null}

        <View style={styles.floatCard}>
          <Text style={styles.floatLabel}>Canteen float</Text>
          <Text style={styles.floatValue}>{money(canteen?.float_balance)}</Text>
          {canteen?.is_float_low ? <Text style={styles.floatWarn}>Float is low. Ask Quisat to top it up.</Text> : null}
          <View style={styles.todayRow}>
            <View>
              <Text style={styles.todayLabel}>Sales today</Text>
              <Text style={styles.todayValue}>{money(dashboard?.today.sales_total)}</Text>
            </View>
            <View>
              <Text style={styles.todayLabel}>My sales</Text>
              <Text style={styles.todayValue}>{money(dashboard?.today.my_sales_total)}</Text>
            </View>
            <View>
              <Text style={styles.todayLabel}>Count</Text>
              <Text style={styles.todayValue}>{dashboard?.today.sales_count ?? 0}</Text>
            </View>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.saleButton, pressed && { opacity: 0.9 }]}
          onPress={() => navigation.navigate('CardLookup', { purpose: 'sale' })}
          accessibilityRole="button"
        >
          <Ionicons name="cart" size={30} color="#fff" />
          <Text style={styles.saleText}>Make sale</Text>
        </Pressable>

        <View style={styles.grid}>
          {tiles.map((tile) => (
            <Pressable
              key={tile.label}
              style={({ pressed }) => [styles.tile, pressed && { backgroundColor: colors.primarySoft }]}
              onPress={tile.onPress}
              accessibilityRole="button"
            >
              <Ionicons name={tile.icon} size={26} color={colors.primary} />
              <Text style={styles.tileText}>{tile.label}</Text>
            </Pressable>
          ))}
        </View>

        {dashboard && dashboard.pending_reversals > 0 ? (
          <Notice tone="warning">
            {dashboard.pending_reversals} reversal{dashboard.pending_reversals === 1 ? '' : 's'} awaiting Quisat approval.
          </Notice>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'flex-start' },
  greeting: { fontSize: 15, color: colors.muted },
  canteen: { fontSize: 24, fontWeight: '800', color: colors.text, marginTop: 2 },
  school: { fontSize: 15, color: colors.muted },
  floatCard: { backgroundColor: colors.primary, borderRadius: radius.xl, padding: spacing.xl, gap: spacing.xs },
  floatLabel: { color: '#C7CEF5', fontSize: 14, fontWeight: '600' },
  floatValue: { color: '#fff', fontSize: 32, fontWeight: '800' },
  floatWarn: { color: '#FDE68A', fontSize: 13 },
  todayRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg },
  todayLabel: { color: '#C7CEF5', fontSize: 12 },
  todayValue: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 2 },
  saleButton: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    borderRadius: radius.xl,
    paddingVertical: spacing.xl,
  },
  saleText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  tileText: { fontSize: 16, fontWeight: '700', color: colors.text },
});
