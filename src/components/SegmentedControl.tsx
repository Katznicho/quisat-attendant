import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, elevation, radius } from '../theme';

type Option<T extends string> = { value: T; label: string; icon?: keyof typeof Ionicons.glyphMap };

type Props<T extends string> = { options: Option<T>[]; value: T; onChange: (value: T) => void };

export default function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View style={styles.track} accessibilityRole="tablist">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.segment, active && styles.active]}
          >
            {option.icon ? <Ionicons name={option.icon} size={17} color={active ? colors.primary : colors.muted} /> : null}
            <Text style={[styles.label, active && styles.labelActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', backgroundColor: '#E8ECF3', borderRadius: radius.md, padding: 4 },
  segment: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: radius.sm + 2,
  },
  active: { backgroundColor: colors.surface, ...elevation.card },
  label: { fontSize: 14, fontWeight: '600', color: colors.muted },
  labelActive: { color: colors.primary, fontWeight: '700' },
});
