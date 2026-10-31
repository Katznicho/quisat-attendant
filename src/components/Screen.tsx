import { HeaderHeightContext } from '@react-navigation/elements';
import React, { useContext } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, elevation, spacing } from '../theme';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  footer?: React.ReactNode;
};

/** Page wrapper: safe area, keyboard avoidance, optional scrolling and a pinned footer. */
export default function Screen({ children, scroll = true, style, footer }: Props) {
  const insets = useSafeAreaInsets();
  // Zero on screens without a header (login), so the keyboard offset is right everywhere.
  const headerHeight = useContext(HeaderHeightContext) ?? 0;
  const bottom = insets.bottom + spacing.lg;

  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.content, !footer && { paddingBottom: bottom + spacing.lg }, style]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, styles.fill, !footer && { paddingBottom: bottom }, style]}>{children}</View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.fill, styles.page, { paddingLeft: insets.left, paddingRight: insets.right }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
    >
      {content}
      {footer ? <View style={[styles.footer, { paddingBottom: bottom }]}>{footer}</View> : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background },
  fill: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg },
  footer: {
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...elevation.card,
    shadowOffset: { width: 0, height: -4 },
  },
});
