import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { api } from '../api/client';
import type { Sale } from '../api/types';
import EmptyState from '../components/EmptyState';
import Notice from '../components/Notice';
import SegmentedControl from '../components/SegmentedControl';
import StatusPill from '../components/StatusPill';
import type { AppStackParamList } from '../navigation/types';
import { colors, elevation, radius, spacing, type } from '../theme';
import { dateTime, money } from '../utils/format';

type Props = NativeStackScreenProps<AppStackParamList, 'Sales'>;

type Filter = 'mine' | 'all' | 'pending';

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: 'mine', label: 'My sales' },
  { value: 'all', label: 'Canteen' },
  { value: 'pending', label: 'Reversals' },
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
        <SegmentedControl<Filter> options={FILTERS} value={filter} onChange={setFilter} />
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
        ListEmptyComponent={
          loading ? undefined : (
            <EmptyState
              icon={filter === 'pending' ? 'swap-horizontal-outline' : 'receipt-outline'}
              title={filter === 'pending' ? 'No reversals waiting' : 'No sales yet'}
              message={filter === 'pending' ? 'Reversal requests waiting for approval show here.' : 'Sales appear here as soon as they are made.'}
            />
          )
        }
        ListFooterComponent={loading && page > 1 ? <ActivityIndicator color={colors.primary} /> : undefined}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surfaceMuted }]}
            onPress={() => navigation.navigate('SaleDetail', { uuid: item.uuid })}
          >
            <View style={styles.icon}>
              <Ionicons name={item.status === 'reversed' ? 'arrow-undo' : 'bag-handle-outline'} size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={styles.name} numberOfLines={1}>
                {item.student?.name ?? 'Student'}
              </Text>
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
  tabs: { padding: spacing.lg, paddingBottom: spacing.md },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...elevation.card,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { ...type.bodyStrong, color: colors.text },
  meta: { fontSize: 13, color: colors.muted },
  amount: { ...type.amount, fontSize: 16, color: colors.text },
  struck: { textDecorationLine: 'line-through', color: colors.muted },
});
