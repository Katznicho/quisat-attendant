import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { api } from '../api/client';
import type { CanteenSummary, FloatTransaction } from '../api/types';
import EmptyState from '../components/EmptyState';
import Notice from '../components/Notice';
import { colors, elevation, radius, spacing, type } from '../theme';
import { dateTime, money } from '../utils/format';

export default function FloatStatementScreen() {
  const [canteen, setCanteen] = useState<CanteenSummary | null>(null);
  const [rows, setRows] = useState<FloatTransaction[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (nextPage: number) => {
    setLoading(true);
    try {
      const response = await api.floatStatement(nextPage);
      setCanteen(response.data.canteen);
      setRows((current) => (nextPage === 1 ? response.data.transactions : [...current, ...response.data.transactions]));
      setPage(response.data.pagination.current_page);
      setLastPage(response.data.pagination.last_page);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load the statement.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.list}
      data={rows}
      keyExtractor={(row) => row.uuid}
      refreshControl={<RefreshControl refreshing={loading && page === 1} onRefresh={() => load(1)} />}
      onEndReachedThreshold={0.3}
      onEndReached={() => {
        if (!loading && page < lastPage) {
          load(page + 1);
        }
      }}
      ListHeaderComponent={
        <View style={{ gap: spacing.md, marginBottom: spacing.sm }}>
          {error ? <Notice tone="danger">{error}</Notice> : null}
          {canteen ? (
            <View style={styles.balance}>
              <Text style={styles.balanceLabel}>{canteen.settlement_mode === 'collect' ? 'Available to withdraw' : 'Float balance'}</Text>
              <Text style={styles.balanceValue}>{money(canteen.float_balance)}</Text>
              <Text style={styles.balanceCanteen}>{canteen.name}</Text>
            </View>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        loading ? undefined : (
          <EmptyState
            icon="wallet-outline"
            title={canteen?.settlement_mode === 'collect' ? 'No balance movements yet' : 'No float movements yet'}
            message={canteen?.settlement_mode === 'collect' ? 'Sales and withdrawals show here.' : 'Top-ups and sales show here.'}
          />
        )
      }
      ListFooterComponent={loading && page > 1 ? <ActivityIndicator color={colors.primary} /> : undefined}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <View style={[styles.icon, { backgroundColor: item.direction === 'credit' ? colors.successSoft : colors.surfaceMuted }]}>
            <Ionicons
              name={item.direction === 'credit' ? 'arrow-down' : 'arrow-up'}
              size={18}
              color={item.direction === 'credit' ? colors.success : colors.textSecondary}
            />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.desc}>{item.description ?? item.type}</Text>
            <Text style={styles.meta}>{dateTime(item.created_at)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 2 }}>
            <Text style={[styles.amount, { color: item.direction === 'credit' ? colors.success : colors.text }]}>
              {item.direction === 'credit' ? '+' : '−'}
              {money(item.amount).replace('UGX ', '')}
            </Text>
            <Text style={styles.meta}>Bal {money(item.balance_after).replace('UGX ', '')}</Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, gap: spacing.sm },
  balance: { backgroundColor: colors.primary, borderRadius: radius.xl, padding: spacing.xl, gap: 2 },
  balanceLabel: { ...type.caption, color: colors.onPrimaryMuted },
  balanceValue: { ...type.display, fontSize: 32, color: colors.onPrimary },
  balanceCanteen: { color: colors.onPrimaryMuted, fontSize: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...elevation.card,
  },
  icon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  desc: { ...type.bodyStrong, fontSize: 15, color: colors.text },
  meta: { fontSize: 12, color: colors.muted },
  amount: { ...type.amount, fontSize: 16 },
});
