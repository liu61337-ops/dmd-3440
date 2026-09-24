import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EventCard } from '@/components/event-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { filterEvents, type UConnEvent } from '@/data/events';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const results = useMemo(() => filterEvents(query), [query]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <FlatList
          data={results}
          keyExtractor={(item: UConnEvent) => item.id}
          renderItem={({ item }) => <EventCard event={item} />}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.header}>
              <ThemedText type="title" style={styles.title}>
                UConn Events
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Find what&apos;s happening on and around campus.
              </ThemedText>

              <ThemedView type="backgroundElement" style={styles.searchBox}>
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search events, places, clubs…"
                  placeholderTextColor={theme.textSecondary}
                  autoCorrect={false}
                  returnKeyType="search"
                  style={[styles.searchInput, { color: theme.text }]}
                  accessibilityLabel="Search events"
                />
                {query.length > 0 && (
                  <ThemedText
                    type="small"
                    themeColor="tint"
                    onPress={() => setQuery('')}
                    accessibilityRole="button">
                    Clear
                  </ThemedText>
                )}
              </ThemedView>

              <ThemedText type="smallBold" style={styles.sectionTitle}>
                Upcoming Events
              </ThemedText>
            </View>
          }
          ListEmptyComponent={
            <ThemedView style={styles.emptyState}>
              <ThemedText type="default">No events match “{query.trim()}”.</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Try a different name, place, or keyword.
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
  },
  safeArea: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.five,
    gap: Spacing.two,
  },
  header: {
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: 700,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.five,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    marginTop: Spacing.one,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 500,
    paddingVertical: Spacing.one,
  },
  sectionTitle: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: Spacing.two,
  },
  emptyState: {
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.five,
  },
});
