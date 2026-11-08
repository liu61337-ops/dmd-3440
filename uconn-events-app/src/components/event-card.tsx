import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { formatEventCardDateTime, type UConnEvent } from '@/data/events';
import { useTheme } from '@/hooks/use-theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

type EventCardProps = {
  event: UConnEvent;
  /** `default` is the home list card, `saved` is the Saved Events card. */
  variant?: 'default' | 'saved';
  onPress?: () => void;
  onRemove?: () => void;
};

const shadow = Platform.select({
  web: { boxShadow: '0px 4px 14px rgba(20, 26, 56, 0.08)' },
  default: {
    shadowColor: '#141A38',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});

function MetaRow({
  icon,
  text,
  tone,
  uppercase,
}: {
  icon: IconName;
  text: string;
  tone: 'strong' | 'muted';
  uppercase?: boolean;
}) {
  const theme = useTheme();
  return (
    <View style={styles.metaRow}>
      <Ionicons name={icon} size={15} color={theme.tint} />
      <ThemedText
        type="small"
        themeColor={tone === 'strong' ? 'text' : 'textSecondary'}
        numberOfLines={1}
        style={[styles.metaText, uppercase && styles.metaTextUppercase]}>
        {text}
      </ThemedText>
    </View>
  );
}

export function EventCard({ event, variant = 'default', onPress, onRemove }: EventCardProps) {
  const router = useRouter();
  const theme = useTheme();
  const handlePress = onPress ?? (() => router.push(`/event/${event.id}`));

  // The card body and the footer action are siblings: nesting a Pressable inside
  // another Pressable renders a <button> inside a <button> on web, which React rejects.
  return (
    <View
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`${event.name}, ${event.location}`}
        style={({ pressed }) => [styles.content, pressed && styles.pressed]}>
        <Image
          source={{ uri: event.imageUri }}
          style={styles.image}
          contentFit="cover"
          transition={200}
          accessibilityIgnoresInvertColors
        />

        <View style={styles.body}>
          {variant === 'saved' ? (
            <>
              <View style={styles.titleRow}>
                <ThemedText type="default" style={styles.name} numberOfLines={1}>
                  {event.name}
                </ThemedText>
                <Ionicons name="heart" size={22} color={theme.danger} />
              </View>
              <MetaRow icon="calendar-outline" text={formatEventCardDateTime(event)} tone="muted" />
              <MetaRow icon="location-outline" text={event.location} tone="muted" />
            </>
          ) : (
            <>
              <MetaRow
                icon="calendar-outline"
                text={formatEventCardDateTime(event)}
                tone="strong"
                uppercase
              />
              <ThemedText type="default" style={styles.name} numberOfLines={1}>
                {event.name}
              </ThemedText>
              <MetaRow icon="location-outline" text={event.location} tone="muted" />
              <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
                {event.description}
              </ThemedText>
            </>
          )}
        </View>
      </Pressable>

      {variant === 'saved' ? (
        <View style={styles.footer}>
          <Pressable
            onPress={onRemove}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${event.name}`}>
            <ThemedText type="smallBold" style={{ color: theme.danger }}>
              Remove
            </ThemedText>
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={handlePress}
          accessibilityRole="button"
          accessibilityLabel={`View details for ${event.name}`}
          style={({ pressed }) => [styles.footer, pressed && styles.pressed]}>
          <ThemedText type="smallBold" style={{ color: theme.tint }}>
            View Details
          </ThemedText>
          <Ionicons name="chevron-forward" size={16} color={theme.tint} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.three + 2,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.two,
    overflow: 'hidden',
    ...shadow,
  },
  content: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  image: {
    width: 108,
    height: 108,
    borderRadius: Spacing.two + 2,
    backgroundColor: 'rgba(128, 128, 128, 0.15)',
  },
  body: {
    flex: 1,
    gap: Spacing.half,
    paddingRight: Spacing.one,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  metaText: {
    flexShrink: 1,
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: 600,
  },
  metaTextUppercase: {
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  name: {
    flexShrink: 1,
    fontSize: 19,
    lineHeight: 26,
    fontWeight: 700,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.half,
    marginTop: Spacing.half,
    minHeight: 24,
    paddingRight: Spacing.half,
  },
});
