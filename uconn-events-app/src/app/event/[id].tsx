import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import {
  events,
  formatEventDateLong,
  formatEventTimeRange,
  type UConnEvent,
} from '@/data/events';
import { useSavedEvents } from '@/hooks/use-saved-events';
import { useTheme } from '@/hooks/use-theme';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { isSaved, toggleSaved } = useSavedEvents();

  const event: UConnEvent | undefined = events.find((e) => e.id === id);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  if (!event) {
    return (
      <ThemedView style={[styles.container, styles.notFound]}>
        <Ionicons name="alert-circle-outline" size={40} color={theme.textSecondary} />
        <ThemedText type="subtitle" style={styles.notFoundTitle}>
          Event not found
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          This event may have been removed.
        </ThemedText>
        <Pressable onPress={handleBack} style={[styles.saveButton, styles.notFoundButton]}>
          <ThemedText type="smallBold" style={{ color: theme.onTint }}>
            Back to events
          </ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  const saved = isSaved(event.id);

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.one }]}>
        <Pressable
          onPress={handleBack}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.iconButton}>
          <Ionicons name="chevron-back" size={26} color={theme.text} />
        </Pressable>
        <Pressable
          onPress={() => toggleSaved(event.id)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={saved ? 'Remove from saved events' : 'Save event'}
          style={styles.iconButton}>
          <Ionicons name={saved ? 'heart' : 'heart-outline'} size={24} color={theme.danger} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: event.imageUri }}
          style={styles.hero}
          contentFit="cover"
          transition={200}
          accessibilityIgnoresInvertColors
        />

        <View style={styles.body}>
          <ThemedText type="title" style={styles.title}>
            {event.name}
          </ThemedText>

          <View style={styles.detailList}>
            <DetailRow icon="calendar-outline" text={formatEventDateLong(event)} />
            <DetailRow icon="time-outline" text={formatEventTimeRange(event)} />
            <DetailRow icon="location-outline" text={event.location} />
          </View>

          <ThemedText type="default" style={styles.sectionTitle}>
            About This Event
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.description}>
            {event.description}
          </ThemedText>

          {event.whatToBring && (
            <View style={[styles.callout, { backgroundColor: theme.backgroundElement }]}>
              <Ionicons name="information-circle-outline" size={20} color={theme.tint} />
              <View style={styles.calloutText}>
                <ThemedText type="smallBold">What to Bring</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {event.whatToBring}
                </ThemedText>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: theme.background,
            borderTopColor: theme.border,
            paddingBottom: Math.max(insets.bottom, Spacing.two),
          },
        ]}>
        <Pressable
          onPress={() => toggleSaved(event.id)}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.saveButton,
            { backgroundColor: saved ? 'transparent' : theme.tint, borderColor: theme.tint },
            saved && styles.saveButtonSaved,
            pressed && styles.pressed,
          ]}>
          <Ionicons
            name={saved ? 'heart' : 'heart-outline'}
            size={20}
            color={saved ? theme.tint : theme.onTint}
          />
          <ThemedText
            type="default"
            style={{ color: saved ? theme.tint : theme.onTint, fontWeight: 700 }}>
            {saved ? 'Saved' : 'Save Event'}
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

function DetailRow({ icon, text }: { icon: ComponentProps<typeof Ionicons>['name']; text: string }) {
  const theme = useTheme();
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={20} color={theme.tint} />
      <ThemedText type="small" style={styles.detailText}>
        {text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 0,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.one,
  },
  iconButton: {
    padding: Spacing.half,
  },
  scroll: {
    flex: 1,
    minHeight: 0,
  },
  scrollContent: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingBottom: Spacing.five,
  },
  hero: {
    width: '100%',
    height: 280,
    backgroundColor: 'rgba(128, 128, 128, 0.15)',
  },
  body: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    gap: Spacing.two,
  },
  title: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: 800,
    letterSpacing: -0.5,
  },
  detailList: {
    gap: Spacing.two + 2,
    marginTop: Spacing.one,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  detailText: {
    flexShrink: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 19,
    lineHeight: 26,
    fontWeight: 700,
    marginTop: Spacing.three,
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
  },
  callout: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    marginTop: Spacing.two,
    alignItems: 'flex-start',
  },
  calloutText: {
    flex: 1,
    gap: Spacing.half,
  },
  bottomBar: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.five,
    paddingVertical: Spacing.two + 6,
    borderWidth: 1.5,
  },
  saveButtonSaved: {
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.8,
  },
  notFound: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    padding: Spacing.four,
  },
  notFoundTitle: {
    fontSize: 24,
    lineHeight: 32,
  },
  notFoundButton: {
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.five,
    backgroundColor: '#4F46E5',
  },
});
