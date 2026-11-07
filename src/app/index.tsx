/**
 * Mood Museum — DMD 3440 Lab: "Build an API-Powered App Screen"
 *
 * One screen: pick a mood, see artworks from the Art Institute of Chicago
 * API that match it. All network calls happen in useEffect / event handlers
 * (never during render), loading / data / error live in separate state
 * variables, and stale responses from rapid mood taps are ignored.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fonts } from '@/constants/theme';

// ---------------------------------------------------------------------------
// TEST FLAGS — flip to `true` to force a state, then reload the app.
// ---------------------------------------------------------------------------
/** Force the EMPTY state: searches for "zxqvbnm", which matches no artworks. */
const TEST_EMPTY = false;
/** Force a 404: calls the bogus endpoint /artworkz/search instead of /artworks/search. */
const TEST_404 = false;

// ---------------------------------------------------------------------------
// API configuration
// ---------------------------------------------------------------------------
const API_BASE = 'https://api.artic.edu/api/v1';
const SEARCH_PATH = TEST_404 ? '/artworkz/search' : '/artworks/search';
const FIELDS = 'id,title,artist_title,date_display,image_id,thumbnail';
const RESULT_LIMIT = 24;
const FALLBACK_IIIF_URL = 'https://www.artic.edu/iiif/2';
const EMPTY_QUERY = 'zxqvbnm'; // keyword used by TEST_EMPTY (guarantees 0 results)

// ---------------------------------------------------------------------------
// Moods → search keywords. Each mood has its own accent color used for the
// selected chip and the loading spinner.
// ---------------------------------------------------------------------------
type Mood = {
  key: string;
  label: string;
  emoji: string;
  query: string;
  color: string;
};

const MOODS: Mood[] = [
  { key: 'calm', label: 'Calm', emoji: '🌊', query: 'tranquil', color: '#45A6C4' },
  { key: 'lonely', label: 'Lonely', emoji: '🌙', query: 'solitude', color: '#5F6FA8' },
  { key: 'joyful', label: 'Joyful', emoji: '🌼', query: 'celebration', color: '#E3A135' },
  { key: 'melancholy', label: 'Melancholy', emoji: '🌧️', query: 'rain', color: '#708494' },
  { key: 'dreamy', label: 'Dreamy', emoji: '✨', query: 'dream', color: '#B478D6' },
  { key: 'restless', label: 'Restless', emoji: '⚡', query: 'storm', color: '#DF5B3F' },
  { key: 'cozy', label: 'Cozy', emoji: '🕯️', query: 'interior', color: '#C4805A' },
];

// ---------------------------------------------------------------------------
// API shapes (only the fields we ask for) and the display-ready model
// ---------------------------------------------------------------------------
type RawArtwork = {
  id?: number | string | null;
  title?: string | null;
  artist_title?: string | null;
  date_display?: string | null;
  image_id?: string | null;
  thumbnail?: { alt_text?: string | null } | null;
};

type SearchResponse = {
  data?: RawArtwork[];
  config?: { iiif_url?: string | null };
};

type Artwork = {
  id: string;
  title: string;
  artist: string;
  date: string;
  imageUrl: string | null;
  alt: string;
};

/** Returns `value` trimmed, or `fallback` when it is missing/blank. */
function normalizeText(value: string | null | undefined, fallback: string): string {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  return trimmed.length > 0 ? trimmed : fallback;
}

/** Transform one API item into a display-ready object with all fallbacks applied. */
function toDisplayArtwork(raw: RawArtwork, iiifUrl: string): Artwork {
  const title = normalizeText(raw.title, 'Untitled');
  const artist = normalizeText(raw.artist_title, 'Unknown artist');
  const date = normalizeText(raw.date_display, 'Date unknown');

  const imageId = typeof raw.image_id === 'string' ? raw.image_id.trim() : '';
  const imageUrl =
    imageId.length > 0 ? `${iiifUrl}/${imageId}/full/843,/0/default.jpg` : null;

  const alt = normalizeText(raw.thumbnail?.alt_text, `${title} by ${artist}`);

  return {
    id: raw.id != null ? String(raw.id) : '',
    title,
    artist,
    date,
    imageUrl,
    alt,
  };
}

/** The keyword a mood searches for (TEST_EMPTY overrides it). */
function queryFor(mood: Mood): string {
  return TEST_EMPTY ? EMPTY_QUERY : mood.query;
}

function buildSearchUrl(query: string): string {
  const params =
    `q=${encodeURIComponent(query)}` +
    `&fields=${encodeURIComponent(FIELDS)}` +
    `&limit=${RESULT_LIMIT}`;
  return `${API_BASE}${SEARCH_PATH}?${params}`;
}

/** React Native's fetch rejects with TypeError("Network request failed") when offline. */
function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  return (
    error instanceof Error &&
    /network request failed|fetch failed|network error/i.test(error.message)
  );
}

/**
 * GET the search endpoint, check `response.ok`, parse with `response.json()`, and
 * transform each item into display-ready data. Throws on HTTP or network errors.
 */
async function requestArtworks(mood: Mood): Promise<Artwork[]> {
  // `no-referrer`: on web, the API's Cloudflare firewall returns 403 (shown by the
  // browser as a CORS error) when the Referer is http://localhost:… — omit it.
  // Native fetch ignores this option.
  const response = await fetch(buildSearchUrl(queryFor(mood)), { referrerPolicy: 'no-referrer' });
  if (!response.ok) {
    throw new Error(`Request failed (HTTP ${response.status}). Please try again.`);
  }
  const json: SearchResponse = await response.json();
  const iiifUrl = normalizeText(json.config?.iiif_url, FALLBACK_IIIF_URL);
  const items = Array.isArray(json.data) ? json.data : [];
  return items.map((item) => toDisplayArtwork(item, iiifUrl));
}

// ---------------------------------------------------------------------------
// Artwork card
// ---------------------------------------------------------------------------
function ArtworkCard({ artwork }: { artwork: Artwork }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <View style={styles.card}>
      {artwork.imageUrl && !imageFailed ? (
        <Image
          source={{ uri: artwork.imageUrl }}
          style={styles.cardImage}
          resizeMode="cover"
          accessibilityLabel={artwork.alt}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <View
          style={styles.imagePlaceholder}
          accessible
          accessibilityLabel={
            artwork.imageUrl ? `${artwork.alt}. Image not available.` : artwork.alt
          }>
          <Text style={styles.placeholderText}>Image not available</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {artwork.title}
        </Text>
        <Text style={styles.cardArtist} numberOfLines={1}>
          {artwork.artist}
        </Text>
        <Text style={styles.cardDate} numberOfLines={1}>
          {artwork.date}
        </Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main (and only) screen
// ---------------------------------------------------------------------------
export default function HomeScreen() {
  // Three SEPARATE state variables for loading / data / error (+ one for pull-to-refresh).
  const [moodIndex, setMoodIndex] = useState(0);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Monotonic request id: responses from older requests are ignored (stale guards).
  const requestIdRef = useRef(0);

  /**
   * Fetch artworks for a mood and store the result. State is only updated inside the
   * promise callbacks (after the network responds), so this is safe to call from useEffect.
   * Pull-to-refresh replaces the whole list (never appends).
   */
  const loadArtworks = useCallback((moodIdx: number) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    // Stale response guard: a newer request has started, so drop this one.
    const isCurrent = () => requestId === requestIdRef.current;

    const mood = MOODS[moodIdx] ?? MOODS[0];
    return requestArtworks(mood)
      .then((items) => {
        // REPLACE the data (works for both initial load and pull-to-refresh).
        if (isCurrent()) setArtworks(items);
      })
      .catch((err: unknown) => {
        if (!isCurrent()) return;
        if (isNetworkError(err)) {
          setError('You seem to be offline. Check your connection and try again.');
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Something went wrong. Please try again.');
        }
      })
      .finally(() => {
        // Only the newest request is allowed to clear the spinners.
        if (isCurrent()) {
          setLoading(false);
          setRefreshing(false);
        }
      });
  }, []);

  /**
   * Event-driven request (mood tap / retry / pull-to-refresh): show the right spinner,
   * clear any old error, then fetch. `isRefresh` picks which spinner shows.
   */
  const fetchArtworks = useCallback(
    (moodIdx: number, isRefresh: boolean) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      return loadArtworks(moodIdx);
    },
    [loadArtworks],
  );

  // Initial load (fetch lives in useEffect, never in render). `loading` already starts
  // as true and `error` as null, so no state needs resetting before this first request.
  useEffect(() => {
    void loadArtworks(0);
  }, [loadArtworks]);

  const handleSelectMood = useCallback(
    (index: number) => {
      setMoodIndex(index);
      void fetchArtworks(index, false); // stale responses from the previous mood are ignored
    },
    [fetchArtworks],
  );

  const handleRefresh = useCallback(() => {
    void fetchArtworks(moodIndex, true);
  }, [fetchArtworks, moodIndex]);

  const handleRetry = useCallback(() => {
    void fetchArtworks(moodIndex, false); // a real new request
  }, [fetchArtworks, moodIndex]);

  const mood = MOODS[moodIndex];
  const accent = mood.color;

  const renderArtwork = ({ item }: { item: Artwork }) => <ArtworkCard artwork={item} />;

  const renderEmpty = () => (
    <View style={styles.centered}>
      <Text style={styles.emptyEmoji}>🖼️</Text>
      <Text style={styles.emptyTitle}>No art matches this feeling yet</Text>
      <Text style={styles.emptyText}>Try picking a different mood above.</Text>
    </View>
  );

  let content: ReactNode;
  if (loading) {
    content = (
      <View style={styles.centered} accessibilityLabel="Loading artworks">
        <ActivityIndicator size="large" color={accent} />
        <Text style={styles.loadingText}>Finding art that feels {mood.label}…</Text>
      </View>
    );
  } else if (error) {
    content = (
      <View style={styles.centered}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable
          onPress={handleRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry"
          style={({ pressed }) => [
            styles.retryButton,
            { backgroundColor: accent },
            pressed && styles.pressed,
          ]}>
          <Text style={styles.retryLabel}>Retry</Text>
        </Pressable>
      </View>
    );
  } else {
    content = (
      <FlatList
        data={artworks}
        keyExtractor={(item, index) => item.id || `artwork-${index}`}
        renderItem={renderArtwork}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[accent]} // Android spinner
            tintColor={accent} // iOS spinner
          />
        }
      />
    );
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.headerSafe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Mood Museum</Text>
          <Text style={styles.subtitle}>How are you feeling today?</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}>
          {MOODS.map((m, index) => {
            const isSelected = index === moodIndex;
            return (
              <Pressable
                key={m.key}
                onPress={() => handleSelectMood(index)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${m.emoji} ${m.label}`}
                style={({ pressed }) => [
                  styles.chip,
                  isSelected && { backgroundColor: m.color, borderColor: m.color },
                  pressed && styles.pressed,
                ]}>
                <Text
                  style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}
                  numberOfLines={1}>
                  {m.emoji} {m.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </SafeAreaView>

      <View style={styles.content}>{content}</View>

      <SafeAreaView style={styles.footerSafe} edges={['bottom']}>
        <Text style={styles.footer}>Artwork data: Art Institute of Chicago</Text>
      </SafeAreaView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles — clean, gallery-like: off-white background, white rounded cards
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7F5EF', // off-white gallery wall
  },
  headerSafe: {
    backgroundColor: '#F7F5EF',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 34,
    fontWeight: '700',
    color: '#26221B',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 16,
    color: '#6E675C',
  },
  chipsRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  chip: {
    minHeight: 44, // ≥44pt touch target
    borderRadius: 22,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E0D6',
  },
  chipLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3E3A31',
  },
  chipLabelSelected: {
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.75,
  },
  content: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4A443B',
    textAlign: 'center',
  },
  errorEmoji: {
    fontSize: 28,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#4A443B',
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    marginTop: 20,
    minHeight: 44, // ≥44pt touch target
    paddingHorizontal: 28,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#26221B',
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 6,
    fontSize: 15,
    color: '#6E675C',
    textAlign: 'center',
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#EFECE4',
  },
  imagePlaceholder: {
    width: '100%',
    height: 220,
    backgroundColor: '#EFECE4',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  placeholderText: {
    fontSize: 14,
    color: '#8A8375',
  },
  cardBody: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#26221B',
  },
  cardArtist: {
    marginTop: 4,
    fontSize: 15,
    color: '#4A443B',
  },
  cardDate: {
    marginTop: 4,
    fontSize: 13,
    color: '#8A8375',
  },
  footerSafe: {
    backgroundColor: '#F7F5EF',
  },
  footer: {
    fontSize: 12,
    color: '#8A8375',
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});
