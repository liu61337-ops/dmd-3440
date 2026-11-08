import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EventCard } from '@/components/event-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { filterEvents, type UConnEvent } from '@/data/events';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const results = filterEvents(query);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <FlatList
          data={results}
          style={styles.list}
          keyExtractor={(item: UConnEvent) => item.id}
          renderItem={({ item }) => <EventCard event={item} />}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <ThemedText type="title" style={styles.title}>
                  UConn Events
                </ThemedText>
                <View style={styles.headerIcons}>
                  <Pressable
                    onPress={() => router.push('/saved')}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="View saved events"
                    style={({ pressed }) => pressed && styles.pressed}>
                    <Ionicons name="bookmark-outline" size={25} color={theme.text} />
                  </Pressable>
                  <Ionicons name="notifications-outline" size={26} color={theme.text} />
                </View>
              </View>
              <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
                Discover upcoming events on campus
              </ThemedText>

              <View style={[styles.searchBox, { backgroundColor: theme.backgroundElement }]}>
                <Ionicons name="search" size={18} color={theme.textSecondary} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search events..."
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
              </View>

              <ThemedText type="default" style={styles.sectionTitle}>
                Upcoming Events
              </ThemedText>
            </View>
          }
          ListEmptyComponent={
            <ThemedView style={styles.emptyState}>
              <Ionicons name="search-outline" size={32} color={theme.textSecondary} />
              <ThemedText type="default">No events match &ldquo;{query.trim()}&rdquo;.</ThemedText>
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
    gap: Spacing.two,
    marginBottom: Spacing.one,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  pressed: {
    opacity: 0.6,
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    marginTop: Spacing.one,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: 500,
    padding: 0,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: 700,
    marginTop: Spacing.two,
  },
  emptyState: {
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.five,
  },
});
