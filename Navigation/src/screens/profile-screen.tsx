/**
 * Profile screen — account info plus a few settings-style rows
 * (decorative for this assignment; no real state management needed).
 */

import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

const ROWS = ['Payment methods', 'Dietary preferences', 'Notifications', 'Help & feedback'];

export default function ProfileScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedView type="backgroundElement" style={styles.avatar}>
          <ThemedText type="subtitle">SL</ThemedText>
        </ThemedView>
        <ThemedText type="smallBold" style={styles.name}>
          Sophia Liu
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Gold card member · 42 drinks this year
        </ThemedText>

        <View style={styles.rows}>
          {ROWS.map((row) => (
            <ThemedView key={row} type="backgroundElement" style={styles.row}>
              <ThemedText type="small">{row}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                ›
              </ThemedText>
            </ThemedView>
          ))}
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.four,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  name: {
    fontSize: 18,
  },
  rows: {
    alignSelf: 'stretch',
    gap: Spacing.one,
    marginTop: Spacing.four,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: Spacing.two,
  },
});
