import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { setStatusBarStyle } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '../api/client';
import type { Dashboard } from '../api/types';
import ActionRow from '../components/ActionRow';
import Notice from '../components/Notice';
import SectionHeader from '../components/SectionHeader';
import Surface from '../components/Surface';
import { useAuth } from '../context/AuthContext';
import type { AppStackParamList } from '../navigation/types';
import { colors, elevation, radius, spacing, type } from '../theme';
import { money } from '../utils/format';

type Props = NativeStackScreenProps<AppStackParamList, 'Home'>;

function greeting(): string {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
}

export default function HomeScreen({ navigation }: Props) {
  const { attendant } = useAuth();
  const insets = useSafeAreaInsets();
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
      // The navy header needs light status bar text; every other screen is light.
      setStatusBarStyle('light');
      load();
      return () => setStatusBarStyle('dark');
    }, [load]),
  );

  const canteen = dashboard?.attendant.canteen ?? attendant?.canteen;
  const school = dashboard?.attendant.school ?? attendant?.school;
  const firstName = attendant?.name?.split(' ')[0];

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxl }}
      refreshControl={
        <RefreshControl
          tintColor={colors.onPrimary}
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await load();
            setRefreshing(false);
          }}
        />
      }
    >
      {/* Navy fill above the header so pull-to-refresh never shows a white gap. */}
      <View style={styles.overscroll} />

      <View style={[styles.hero, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.topBar}>
          <View style={styles.schoolRow}>
            {school?.logo_url ? (
              <Image source={{ uri: school.logo_url }} style={styles.logo} />
            ) : (
              <View style={[styles.logo, styles.logoFallback]}>
                <Ionicons name="school" size={16} color={colors.onPrimary} />
              </View>
            )}
            <Text style={styles.schoolName} numberOfLines={1}>
              {school?.name}
            </Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate('Settings')}
            style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.7 }]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <Ionicons name="person-circle-outline" size={24} color={colors.onPrimary} />
          </Pressable>
        </View>

        <Text style={styles.greeting}>
          {greeting()}, {firstName}
        </Text>
        <Text style={styles.canteen} numberOfLines={1}>
          {canteen?.name ?? 'Your canteen'}
        </Text>

        <View style={styles.floatBlock}>
          <Text style={styles.floatLabel}>Canteen float</Text>
          <Text style={styles.floatValue} adjustsFontSizeToFit numberOfLines={1}>
            {money(canteen?.float_balance)}
          </Text>
          {canteen?.is_float_low ? (
            <View style={styles.lowChip}>
              <Ionicons name="warning" size={13} color="#7A4A00" />
              <Text style={styles.lowText}>Float is low. Ask Quisat to top it up.</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.stats}>
          <Stat label="Sales today" value={money(dashboard?.today.sales_total)} />
          <Stat label="My sales" value={money(dashboard?.today.my_sales_total)} />
          <Stat label="Count" value={String(dashboard?.today.sales_count ?? 0)} />
        </View>
      </View>

      <View style={styles.body}>
        <Pressable
          style={({ pressed }) => [styles.sale, pressed && styles.salePressed]}
          onPress={() => navigation.navigate('CardLookup', { purpose: 'sale' })}
          accessibilityRole="button"
          accessibilityLabel="Make sale"
        >
          <View style={styles.saleIcon}>
            <Ionicons name="cart" size={28} color={colors.success} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.saleTitle}>Make sale</Text>
            <Text style={styles.saleSubtitle}>Scan or enter a student card</Text>
          </View>
          <Ionicons name="arrow-forward" size={24} color={colors.onPrimary} />
        </Pressable>

        {error ? <Notice tone="danger">{error}</Notice> : null}

        {dashboard && dashboard.pending_reversals > 0 ? (
          <Notice tone="warning">
            {dashboard.pending_reversals} reversal{dashboard.pending_reversals === 1 ? '' : 's'} awaiting Quisat approval.
          </Notice>
        ) : null}

        <SectionHeader>Cards</SectionHeader>
        <Surface flush style={styles.group}>
          <ActionRow
            icon="card-outline"
            title="Activate card"
            subtitle="New card: the student sets a PIN"
            onPress={() => navigation.navigate('CardLookup', { purpose: 'activate' })}
          />
          <ActionRow
            divider
            icon="key-outline"
            title="Card services"
            subtitle="Top up, reset PIN, unlock"
            onPress={() => navigation.navigate('CardLookup', { purpose: 'manage' })}
          />
        </Surface>

        <SectionHeader>Records</SectionHeader>
        <Surface flush style={styles.group}>
          <ActionRow
            icon="receipt-outline"
            title="Sales"
            subtitle="Receipts and reversals"
            onPress={() => navigation.navigate('Sales')}
          />
          <ActionRow
            divider
            icon="wallet-outline"
            title="Float statement"
            subtitle="Every top-up and sale"
            onPress={() => navigation.navigate('FloatStatement')}
          />
        </Surface>
      </View>
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue} adjustsFontSizeToFit numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  overscroll: { position: 'absolute', top: -600, left: 0, right: 0, height: 600, backgroundColor: colors.primary },
  hero: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingBottom: 56,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl },
  schoolRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1, marginRight: spacing.md },
  logo: { width: 30, height: 30, borderRadius: 8, backgroundColor: colors.surface },
  logoFallback: { backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  schoolName: { color: colors.onPrimary, fontSize: 14, fontWeight: '600', flexShrink: 1 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: { color: colors.onPrimaryMuted, fontSize: 15 },
  canteen: { ...type.title, color: colors.onPrimary, marginTop: 2 },
  floatBlock: { marginTop: spacing.xl, gap: 2 },
  floatLabel: { ...type.caption, color: colors.onPrimaryMuted },
  floatValue: { ...type.display, color: colors.onPrimary },
  lowChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#FCD679',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: spacing.sm,
  },
  lowText: { color: '#7A4A00', fontSize: 12, fontWeight: '700' },
  stats: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl },
  stat: { flex: 1, backgroundColor: 'rgba(255,255,255,0.09)', borderRadius: radius.md, padding: spacing.md, gap: 3 },
  statLabel: { color: colors.onPrimaryMuted, fontSize: 12, fontWeight: '500' },
  statValue: { ...type.amount, color: colors.onPrimary, fontSize: 15 },
  body: { paddingHorizontal: spacing.lg, marginTop: -36, gap: spacing.lg },
  sale: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.success,
    borderRadius: radius.xl,
    padding: spacing.lg,
    paddingVertical: 20,
    ...elevation.raised,
    shadowColor: colors.success,
  },
  salePressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  saleIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.onPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saleTitle: { color: colors.onPrimary, fontSize: 21, fontWeight: '800' },
  saleSubtitle: { color: 'rgba(255,255,255,0.82)', fontSize: 14, marginTop: 2 },
  group: { overflow: 'hidden' },
});
