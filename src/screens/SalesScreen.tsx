import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { api } from '../api/client';
import type { Sale } from '../api/types';
import Notice from '../components/Notice';
import StatusPill from '../components/StatusPill';
import type { AppStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';
import { dateTime, money } from '../utils/format';

type Props = NativeStackScreenProps<AppStackParamList, 'Sales'>;

type Filter = 'mine' | 'all' | 'pending';

const FILTERS: Array<[Filter, string]> = [
  ['mine', 'My sales'],
  ['all', 'Canteen'],
  ['pending', 'Reversals'],
];

export default function SalesScreen({ navigation }: Props) {
  const [filter, setFilter] = useState<Filter>('mine');
  const [sales, setSales] = useState<Sale[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (nextPage: number) => {
      setLoading(true);
      try {
        const response = await api.sales({
          page: nextPage,
          mine: filter === 'mine' ? true : undefined,
          reversal_status: filter === 'pending' ? 'pending' : undefined,
        });
        setSales((current) => (nextPage === 1 ? response.data.sales : [...current, ...response.data.sales]));
        setPage(response.data.pagination.current_page);
        setLastPage(response.data.pagination.last_page);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not load sales.');
      } finally {
        setLoading(false);
      }
    },
    [filter],
  );

  useFocusEffect(
    useCallback(() => {
      load(1);
    }, [load]),
  );

  return (
    <View style={styles.page}>
      <View style={styles.tabs}>
        {FILTERS.map(([key, label]) => (
          <Pressable key={key} onPress={() => setFilter(key)} style={[styles.tab, filter === key && styles.tabActive]}>
            <Text style={[styles.tabText, filter === key && styles.tabTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {error ? <View style={{ paddingHorizontal: spacing.lg }}><Notice tone="danger">{error}</Notice></View> : null}

      <FlatList
        data={sales}
        keyExtractor={(sale) => sale.uuid}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading && page === 1} onRefresh={() => load(1)} />}
        onEndReachedThreshold={0.3}
        onEndReached={() => {
          if (!loading && page < lastPage) {
            load(page + 1);
          }
        }}
        ListEmptyComponent={loading ? null : <Text style={styles.empty}>No sales yet.</Text>}
        ListFooterComponent={loading && page > 1 ? <ActivityIndicator color={colors.primary} /> : null}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.primarySoft }]}
            onPress={() => navigation.navigate('SaleDetail', { uuid: item.uuid })}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.name}>{item.student?.name ?? 'Student'}</Text>
              <Text style={styles.meta}>
                {dateTime(item.created_at)} · {item.receipt_number}
                {filter !== 'mine' && item.attendant ? ` · ${item.attendant}` : ''}
              </Text>
              {item.reversal_status || item.status === 'reversed' ? (
                <StatusPill status={item.status === 'reversed' ? 'reversed' : (item.reversal_status as string)} />
              ) : null}
            </View>
            <Text style={[styles.amount, item.status === 'reversed' && styles.struck]}>{money(item.amount)}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  tabs: {
    flexDirection: 'row',
    margin: spacing.lg,
    backgroundColor: colors.border,
    borderRadius: radius.md,
    padding: 3,
  },
  tab: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.sm, alignItems: 'center' },
  tabActive: { backgroundColor: colors.surface },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.muted },
  tabTextActive: { color: colors.primary },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  meta: { fontSize: 13, color: colors.muted },
  amount: { fontSize: 16, fontWeight: '800', color: colors.text },
  struck: { textDecorationLine: 'line-through', color: colors.muted },
  empty: { textAlign: 'center', color: colors.muted, marginTop: spacing.xxl },
});
