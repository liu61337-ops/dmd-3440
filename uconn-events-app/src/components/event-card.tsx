import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import {
  formatEventDate,
  formatEventTime,
  type UConnEvent,
} from '@/data/events';

type EventCardProps = {
  event: UConnEvent;
};

export function EventCard({ event }: EventCardProps) {
  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <Image
        source={{ uri: event.imageUri }}
        style={styles.image}
        contentFit="cover"
        transition={200}
        accessibilityIgnoresInvertColors
      />
      <View style={styles.body}>
        <ThemedText type="smallBold" themeColor="tint" style={styles.when}>
          {formatEventDate(event.date)} · {formatEventTime(event)}
        </ThemedText>
        <ThemedText type="default" style={styles.name} numberOfLines={1}>
          {event.name}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          {event.location}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
          {event.description}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.two,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  image: {
    width: 96,
    height: 96,
    borderRadius: Spacing.two,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
  },
  body: {
    flex: 1,
    gap: Spacing.half,
    paddingRight: Spacing.one,
  },
  when: {
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  name: {
    fontWeight: 700,
    fontSize: 17,
    lineHeight: 24,
  },
});
