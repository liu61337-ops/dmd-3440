import React from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius, type } from '../theme';

export function Screen({ children, scroll = true }) {
  const Container = scroll ? ScrollView : View;
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Container
        style={styles.container}
        contentContainerStyle={scroll ? styles.scrollContent : styles.flexContent}
      >
        {children}
      </Container>
    </SafeAreaView>
  );
}

export function ScreenHeader({ title, subtitle }) {
  return (
    <View style={styles.header}>
      <Text style={type.display}>{title}</Text>
      {subtitle ? <Text style={[type.bodyMuted, { marginTop: 4 }]}>{subtitle}</Text> : null}
    </View>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.lg },
  scrollContent: { paddingBottom: spacing.xxl, paddingTop: spacing.md },
  flexContent: { flexGrow: 1, paddingTop: spacing.md },
  header: { marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
});
