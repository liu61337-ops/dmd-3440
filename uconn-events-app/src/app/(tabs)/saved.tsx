import { Ionicons } from '@expo/vector-icons';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EventCard } from '@/components/event-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import type { UConnEvent } from '@/data/events';
import { useSavedEvents } from '@/hooks/use-saved-events';
import { useTheme } from '@/hooks/use-theme';

export default function SavedEventsScreen() {
  const theme = useTheme();
  const { savedEvents, removeSaved, clearSaved } = useSavedEvents();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <FlatList
          data={savedEvents}
          style={styles.list}
          keyExtractor={(item: UConnEvent) => item.id}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              variant="saved"
              onRemove={() => removeSaved(item.id)}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <ThemedText type="title" style={styles.title}>
                  Saved Events
                </ThemedText>
                <Pressable
                  onPress={clearSaved}
                  hitSlop={10}
                  disabled={savedEvents.length === 0}
                  accessibilityRole="button"
                  accessibilityLabel="Clear all saved events"
                  style={[styles.iconButton, savedEvents.length === 0 && styles.disabled]}>
                  <Ionicons name="trash-outline" size={24} color={theme.danger} />
                </Pressable>
              </View>
              <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
                Events you&rsquo;ve saved for later
              </ThemedText>
            </View>
          }
          ListEmptyComponent={
            <ThemedView style={styles.emptyState}>
              <Ionicons name="heart-outline" size={36} color={theme.textSecondary} />
              <ThemedText type="default" style={styles.emptyTitle}>
                No saved events yet
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.emptyText}>
                Open an event and tap Save Event to keep it here.
              </ThemedText>
            </ThemedView>
          }
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 0,
  },
  safeArea: {
    flex: 1,
    minHeight: 0,
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  list: {
    flex: 1,
    minHeight: 0,
  },
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.five,
    gap: Spacing.three,
  },
  header: {
    gap: Spacing.one,
    marginBottom: Spacing.three,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: 800,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  iconButton: {
    padding: Spacing.half,
  },
  disabled: {
    opacity: 0.35,
  },
  emptyState: {
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.six,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: 700,
    marginTop: Spacing.two,
  },
  emptyText: {
    textAlign: 'center',
    paddingHorizontal: Spacing.four,
  },
});
