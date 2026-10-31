import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { api } from '../api/client';
import type { CanteenSummary, FloatTransaction } from '../api/types';
import Notice from '../components/Notice';
import { colors, radius, spacing } from '../theme';
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
              <Text style={styles.balanceLabel}>Float balance</Text>
              <Text style={styles.balanceValue}>{money(canteen.float_balance)}</Text>
            </View>
          ) : null}
        </View>
      }
      ListEmptyComponent={loading ? undefined : <Text style={styles.empty}>No float movements yet.</Text>}
      ListFooterComponent={loading && page > 1 ? <ActivityIndicator color={colors.primary} /> : undefined}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.desc}>{item.description ?? item.type}</Text>
            <Text style={styles.meta}>{dateTime(item.created_at)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 2 }}>
            <Text style={[styles.amount, { color: item.direction === 'credit' ? colors.success : colors.danger }]}>
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
  balance: { backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.lg },
  balanceLabel: { color: '#C7CEF5', fontSize: 13, fontWeight: '600' },
  balanceValue: { color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 2 },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  desc: { fontSize: 15, fontWeight: '600', color: colors.text },
  meta: { fontSize: 12, color: colors.muted },
  amount: { fontSize: 16, fontWeight: '800' },
  empty: { textAlign: 'center', color: colors.muted, marginTop: spacing.xxl },
});
