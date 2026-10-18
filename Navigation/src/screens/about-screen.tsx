/**
 * About screen — only reachable from the DRAWER pattern (as a 5th item).
 * This highlights a key difference: drawers can hold secondary destinations
 * that don't merit permanent tab-bar real estate.
 */

import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export default function AboutScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          ☕
        </ThemedText>
        <ThemedText type="subtitle">Brew &amp; Board</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
          A neighborhood coffee shop and board-game cafe. Order ahead, earn
          stamps, and claim a table by the window.
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
          Navigation demo built with Expo + React Navigation for DMD 3440.
        </ThemedText>
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
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
    flex: 1,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: 64,
    lineHeight: 72,
  },
  centerText: {
    textAlign: 'center',
  },
});
