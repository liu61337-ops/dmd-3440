/**
 * Artwork detail — opened by tapping a card in the gallery.
 * GET /artworks/{id} for a short introduction plus medium, origin, dimensions, and credit.
 * Same rules as the gallery: fetch outside render, separate loading / data / error state,
 * response.ok checked, fallbacks for every missing field, and a Retry that re-requests.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, Stack, useLocalSearchParams, useNavigation } from 'expo-router';

import { MuseumButton, StateMessage } from '@/components/museum-ui';
import { Museum } from '@/constants/museum';
import { Fonts } from '@/constants/theme';
import { errorMessage, fetchArtworkDetail, type ArtworkDetail } from '@/lib/artic';

const ACCENT = Museum.accent;
const NO_INTRO_TEXT =
  'The museum has not written an introduction for this work yet. The details below come from its collection record.';

/**
 * `artist_display` looks like "Name (French, 1848–1894)" or "Name\nAmerican, 1921-2000".
 * Split it so the name can be set in small caps and the bio line in quiet italic.
 */
function splitArtist(display: string): { name: string; bio: string | null } {
  const newline = display.indexOf('\n');
  if (newline > 0) {
    return { name: display.slice(0, newline).trim(), bio: display.slice(newline + 1).trim() || null };
  }
  const match = /^(.*?)\s*\((.+)\)\s*$/.exec(display);
  if (match && match[1].trim()) return { name: match[1].trim(), bio: match[2].trim() };
  return { name: display, bio: null };
}

export default function ArtworkDetailScreen() {
  const params = useLocalSearchParams<{ id: string; title?: string }>();
  const id = typeof params.id === 'string' ? params.id : '';
  const passedTitle = typeof params.title === 'string' ? params.title : '';
  // Navigation state (safe during render, unlike the imperative router).
  const canGoBack = useNavigation().canGoBack();

  const [artwork, setArtwork] = useState<ArtworkDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);

  // Ignore responses for an older id / an older retry.
  const requestIdRef = useRef(0);

  /** State is only set in promise callbacks, so this is safe to call from useEffect. */
  const load = useCallback((artworkId: string) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const isCurrent = () => requestId === requestIdRef.current;

    return fetchArtworkDetail(artworkId)
      .then((detail) => {
        if (isCurrent()) setArtwork(detail);
      })
      .catch((err: unknown) => {
        if (isCurrent()) setError(errorMessage(err));
      })
      .finally(() => {
        if (isCurrent()) setLoading(false);
      });
  }, []);

  useEffect(() => {
    void load(id);
  }, [id, load]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setImageFailed(false);
    void load(id); // a real new request
  };

  const headerTitle = artwork?.title ?? passedTitle;

  let content;
  if (loading) {
    content = (
      <StateMessage
        loading
        eyebrow="Opening the catalogue"
        title={passedTitle ? `“${passedTitle}”` : 'This artwork'}
        accent={ACCENT}
      />
    );
  } else if (error || !artwork) {
    content = (
      <StateMessage
        eyebrow="Not on view"
        title={error ?? 'This artwork could not be loaded.'}
        accent={ACCENT}
        action={<MuseumButton label="Retry" onPress={handleRetry} color={ACCENT} />}
      />
    );
  } else {
    const artist = splitArtist(artwork.artist);
    content = (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {artwork.imageUrl && !imageFailed ? (
          <Image
            source={{ uri: artwork.imageUrl }}
            style={[styles.image, { aspectRatio: artwork.imageAspectRatio }]}
            resizeMode="contain"
            accessibilityLabel={artwork.alt}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <View style={styles.imagePlaceholder} accessible accessibilityLabel={artwork.alt}>
            <Text style={styles.mutedText}>Image not available</Text>
          </View>
        )}

        <View style={styles.body}>
          <Text style={styles.title}>{artwork.title}</Text>
          <Text style={styles.artist}>{artist.name}</Text>
          {artist.bio ? <Text style={styles.artistBio}>{artist.bio}</Text> : null}
          <Text style={styles.date}>{artwork.date}</Text>

          <Text style={styles.sectionHeading}>About this work</Text>
          <Text style={artwork.about ? styles.about : styles.aboutMissing}>
            {artwork.about ?? NO_INTRO_TEXT}
          </Text>

          {artwork.facts.length > 0 ? (
            <View style={styles.facts}>
              {artwork.facts.map((fact) => (
                <View key={fact.label} style={styles.factRow}>
                  <Text style={styles.factLabel}>{fact.label}</Text>
                  <Text style={styles.factValue}>{fact.value}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <Text style={styles.credit}>
            {artwork.aboutIsCcBy
              ? 'Description © Art Institute of Chicago, CC BY 4.0. Other data: CC0.'
              : 'Artwork data: Art Institute of Chicago (CC0).'}
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.root}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: headerTitle || 'Artwork',
          headerBackTitle: 'Gallery',
          headerTintColor: Museum.ink,
          headerTitleStyle: { fontFamily: Fonts.serif, fontSize: 17, color: Museum.ink },
          headerStyle: { backgroundColor: Museum.wall },
          headerShadowVisible: false,
          // Opened directly (web refresh / deep link) → no history, so offer a way home.
          headerLeft: canGoBack
            ? undefined
            : () => (
                <Pressable
                  onPress={() => router.replace('/')}
                  accessibilityRole="button"
                  accessibilityLabel="Back to gallery"
                  hitSlop={12}
                  style={({ pressed }) => [styles.homeButton, pressed && styles.pressed]}>
                  <Text style={styles.homeLabel}>← Gallery</Text>
                </Pressable>
              ),
        }}
      />
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Museum.wall,
  },
  mutedText: {
    fontFamily: Fonts.serif,
    fontStyle: 'italic',
    fontSize: 15,
    color: Museum.inkSoft,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
  homeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  homeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Museum.ink,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  image: {
    width: '100%',
    maxHeight: 480,
    backgroundColor: Museum.wallShade,
  },
  imagePlaceholder: {
    width: '100%',
    height: 240,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Museum.rule,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontFamily: Fonts.serif,
    fontStyle: 'italic',
    fontSize: 30,
    lineHeight: 36,
    color: Museum.ink,
  },
  artist: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: Museum.inkSoft,
  },
  artistBio: {
    marginTop: 2,
    fontFamily: Fonts.serif,
    fontStyle: 'italic',
    fontSize: 14,
    color: Museum.inkSoft,
  },
  date: {
    marginTop: 4,
    fontFamily: Fonts.serif,
    fontSize: 14,
    color: Museum.muted,
  },
  sectionHeading: {
    marginTop: 24,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: ACCENT,
  },
  about: {
    fontFamily: Fonts.serif,
    fontSize: 17,
    lineHeight: 27,
    color: Museum.ink,
  },
  aboutMissing: {
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
    color: Museum.inkSoft,
  },
  // Catalogue-style list: hairline rules, small-caps labels, serif values — no box.
  facts: {
    marginTop: 28,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Museum.rule,
  },
  factRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Museum.ruleSoft,
  },
  factLabel: {
    width: 104,
    paddingTop: 3,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Museum.muted,
  },
  factValue: {
    flex: 1,
    fontFamily: Fonts.serif,
    fontSize: 15,
    lineHeight: 21,
    color: Museum.ink,
  },
  credit: {
    marginTop: 24,
    fontSize: 12,
    color: Museum.muted,
  },
});
