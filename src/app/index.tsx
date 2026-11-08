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
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyFrame, MuseumButton, StateMessage } from '@/components/museum-ui';
import { Museum } from '@/constants/museum';
import { Fonts } from '@/constants/theme';
import { fetchRelatedWords } from '@/lib/datamuse';
import {
  API_BASE,
  errorMessage,
  FALLBACK_IIIF_URL,
  FETCH_OPTIONS,
  iiifImageUrl,
  normalizeText,
} from '@/lib/artic';

// ---------------------------------------------------------------------------
// TEST FLAGS — flip to `true` to force a state, then reload the app.
// ---------------------------------------------------------------------------
/** Force the EMPTY state: searches only for "zxqvbnm", which matches no artworks. */
const TEST_EMPTY = false;
/** Force a 404: calls the bogus endpoint /artworkz/search instead of /artworks/search. */
const TEST_404 = false;

// ---------------------------------------------------------------------------
// API configuration
// ---------------------------------------------------------------------------
const SEARCH_PATH = TEST_404 ? '/artworkz/search' : '/artworks/search';
const FIELDS = ['id', 'title', 'artist_title', 'date_display', 'image_id', 'thumbnail'];
const RESULT_LIMIT = 24;
const EMPTY_QUERY = 'zxqvbnm'; // keyword used by TEST_EMPTY (guarantees 0 results)
/** Where a feeling is looked for: titles and the museum's own subject / theme tags. */
const MATCH_FIELDS = ['title^3', 'subject_titles^2', 'theme_titles^2', 'term_titles'];

// ---------------------------------------------------------------------------
// Moods → a main phrase plus related words (tested against the collection). Each mood
// has its own accent color used for the selected tab, plate numbers, and spinner.
// ---------------------------------------------------------------------------
type Mood = {
  key: string;
  label: string;
  phrase: string;
  related: string[];
  color: string;
};

const MOODS: Mood[] = [
  { key: 'calm', label: 'Calm', phrase: 'tranquil', related: ['calm', 'serene', 'peaceful', 'quiet'], color: '#4F8FA6' },
  { key: 'lonely', label: 'Lonely', phrase: 'solitude', related: ['lonely', 'alone', 'solitary', 'isolation'], color: '#5A6796' },
  { key: 'joyful', label: 'Joyful', phrase: 'joy', related: ['celebration', 'festival', 'dance', 'merry', 'delight'], color: '#C08A2E' },
  { key: 'melancholy', label: 'Melancholy', phrase: 'melancholy', related: ['rain', 'sorrow', 'mourning', 'gloom'], color: '#6B7C88' },
  { key: 'dreamy', label: 'Dreamy', phrase: 'dream', related: ['reverie', 'fantasy', 'moonlight', 'sleep'], color: '#946CAD' },
  { key: 'restless', label: 'Restless', phrase: 'storm', related: ['tempest', 'wind', 'turmoil', 'wave'], color: '#B4553E' },
  { key: 'cozy', label: 'Cozy', phrase: 'interior', related: ['home', 'hearth', 'fireside', 'domestic'], color: '#A8714F' },
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

/** Transform one API item into a display-ready object with all fallbacks applied. */
function toDisplayArtwork(raw: RawArtwork, iiifUrl: string): Artwork {
  const title = normalizeText(raw.title, 'Untitled');
  const artist = normalizeText(raw.artist_title, 'Unknown artist');
  const date = normalizeText(raw.date_display, 'Date unknown');

  const imageUrl = iiifImageUrl(iiifUrl, raw.image_id);

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

/**
 * What is currently being searched: one of the preset moods, or a feeling the user
 * typed themselves (`key: 'custom'`).
 */
type ActiveSearch = {
  key: string;
  label: string;
  /** The user's own words (or a mood's main word) — must match as a whole. */
  phrase: string;
  /** Related words; `null` = look them up with the Datamuse API (typed moods). */
  related: string[] | null;
  color: string;
};

const CUSTOM_KEY = 'custom';
const CUSTOM_COLOR = Museum.accent;
/** Wait this long after the last keystroke before searching a typed mood. */
const CUSTOM_DEBOUNCE_MS = 600;

function searchForMood(mood: Mood): ActiveSearch {
  return {
    key: mood.key,
    label: mood.label,
    phrase: mood.phrase,
    related: mood.related,
    color: mood.color,
  };
}

function searchForCustom(text: string): ActiveSearch {
  return { key: CUSTOM_KEY, label: text, phrase: text, related: null, color: CUSTOM_COLOR };
}

/**
 * Build GET /artworks/search?params=<JSON>. The API's plain `q=` search never returns
 * zero results (unmatched words fall back to the whole collection), so instead we send an
 * Elasticsearch query that only matches titles / subjects / themes:
 *   - the phrase must match as a whole ("fall in love" ≠ "Niagara Falls"), OR
 *   - any related word matches,
 *   - and the work must have a digitized image.
 */
function buildSearchUrl(phrase: string, related: string[]): string {
  const should: object[] = [
    { multi_match: { query: phrase, fields: MATCH_FIELDS, operator: 'and', boost: 3 } },
  ];
  if (related.length > 0) {
    should.push({ multi_match: { query: related.join(' '), fields: MATCH_FIELDS } });
  }
  const params = {
    fields: FIELDS,
    limit: RESULT_LIMIT,
    query: {
      bool: {
        filter: [{ exists: { field: 'image_id' } }],
        must: { bool: { should, minimum_should_match: 1 } },
      },
    },
  };
  return `${API_BASE}${SEARCH_PATH}?params=${encodeURIComponent(JSON.stringify(params))}`;
}

type SearchResult = { artworks: Artwork[]; related: string[] };

/**
 * 1) For typed moods, ask Datamuse for related words (never fails the search).
 * 2) GET the museum search, check `response.ok`, parse with `response.json()`, and
 *    transform each item into display-ready data. Throws on HTTP or network errors.
 */
async function requestArtworks(search: ActiveSearch): Promise<SearchResult> {
  const phrase = TEST_EMPTY ? EMPTY_QUERY : search.phrase;
  const related = TEST_EMPTY ? [] : (search.related ?? (await fetchRelatedWords(phrase)));

  // FETCH_OPTIONS sends no Referer (the API's firewall blocks localhost referrers on web).
  const response = await fetch(buildSearchUrl(phrase, related), FETCH_OPTIONS);
  if (!response.ok) {
    throw new Error(`Request failed (HTTP ${response.status}). Please try again.`);
  }
  const json: SearchResponse = await response.json();
  const iiifUrl = normalizeText(json.config?.iiif_url, FALLBACK_IIIF_URL);
  const items = Array.isArray(json.data) ? json.data : [];
  return { artworks: items.map((item) => toDisplayArtwork(item, iiifUrl)), related };
}

// ---------------------------------------------------------------------------
// Artwork card
// ---------------------------------------------------------------------------
/**
 * Styled like a museum wall: the image hangs on its own (no white box, no shadow) with a
 * small wall label underneath — plate number, serif title, small-caps artist, date.
 */
function ArtworkCard({
  artwork,
  index,
  accent,
}: {
  artwork: Artwork;
  index: number;
  accent: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const plateNumber = String(index + 1).padStart(2, '0');
  const canOpen = artwork.id.length > 0;

  const openDetail = () => {
    if (!canOpen) return;
    router.push({
      pathname: '/artwork/[id]',
      params: { id: artwork.id, title: artwork.title },
    });
  };

  return (
    <Pressable
      onPress={openDetail}
      disabled={!canOpen}
      accessibilityRole="button"
      accessibilityLabel={`${artwork.title} by ${artwork.artist}. Open details.`}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
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
      <View style={styles.label}>
        <Text style={[styles.plateNumber, { color: accent }]}>{plateNumber}</Text>
        <View style={styles.labelText}>
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
        {canOpen ? (
          <Text style={styles.cardArrow} accessibilityElementsHidden importantForAccessibility="no">
            →
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Main (and only) screen
// ---------------------------------------------------------------------------
export default function HomeScreen() {
  // Three SEPARATE state variables for loading / data / error (+ one for pull-to-refresh).
  const [active, setActive] = useState<ActiveSearch>(() => searchForMood(MOODS[0]));
  const [customText, setCustomText] = useState('');
  // Words the last search also looked for (shown under the input for typed moods).
  const [relatedWords, setRelatedWords] = useState<string[]>([]);
  const [inputFocused, setInputFocused] = useState(false);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Monotonic request id: responses from older requests are ignored (stale guards).
  const requestIdRef = useRef(0);
  // Pending debounce timer for the "type your own mood" input.
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Fetch artworks for a search and store the result. State is only updated inside the
   * promise callbacks (after the network responds), so this is safe to call from useEffect.
   * Pull-to-refresh replaces the whole list (never appends).
   */
  const loadArtworks = useCallback((search: ActiveSearch) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    // Stale response guard: a newer request has started, so drop this one.
    const isCurrent = () => requestId === requestIdRef.current;

    return requestArtworks(search)
      .then((result) => {
        // REPLACE the data (works for both initial load and pull-to-refresh).
        if (!isCurrent()) return;
        setArtworks(result.artworks);
        setRelatedWords(result.related);
      })
      .catch((err: unknown) => {
        if (isCurrent()) setError(errorMessage(err));
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
    (search: ActiveSearch, isRefresh: boolean) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      return loadArtworks(search);
    },
    [loadArtworks],
  );

  // Initial load (fetch lives in useEffect, never in render). `loading` already starts
  // as true and `error` as null, so no state needs resetting before this first request.
  useEffect(() => {
    void loadArtworks(searchForMood(MOODS[0]));
  }, [loadArtworks]);

  const cancelPendingCustomSearch = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  };

  /** Start a new search (stale responses from the previous one are ignored). */
  const startSearch = (search: ActiveSearch) => {
    setActive(search);
    void fetchArtworks(search, false);
  };

  const handleSelectMood = (mood: Mood) => {
    cancelPendingCustomSearch();
    setCustomText(''); // a preset chip replaces whatever was typed
    startSearch(searchForMood(mood));
  };

  /** Typing: search automatically once the user pauses (debounced). */
  const handleCustomChange = (text: string) => {
    setCustomText(text);
    cancelPendingCustomSearch();
    const trimmed = text.trim();
    if (trimmed.length === 0) return;
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      startSearch(searchForCustom(trimmed));
    }, CUSTOM_DEBOUNCE_MS);
  };

  /** Pressing Enter / Search on the keyboard searches right away. */
  const handleCustomSubmit = () => {
    cancelPendingCustomSearch();
    const trimmed = customText.trim();
    if (trimmed.length > 0) startSearch(searchForCustom(trimmed));
  };

  const handleRefresh = () => {
    void fetchArtworks(active, true);
  };

  const handleRetry = () => {
    void fetchArtworks(active, false); // a real new request
  };

  const accent = active.color;
  const isCustomActive = active.key === CUSTOM_KEY;

  const renderArtwork = ({ item, index }: { item: Artwork; index: number }) => (
    <ArtworkCard artwork={item} index={index} accent={accent} />
  );

  const renderEmpty = () => (
    <StateMessage
      illustration={<EmptyFrame />}
      eyebrow="An empty wall"
      title="No art matches this feeling yet"
      body={
        isCustomActive
          ? 'Try another word (in English), or choose a mood above.'
          : 'Try choosing a different mood above.'
      }
      accent={accent}
    />
  );

  let content: ReactNode;
  if (loading) {
    content = (
      <StateMessage
        loading
        eyebrow="Now curating"
        title={`Finding art that feels ${isCustomActive ? `“${active.label}”` : active.label.toLowerCase()}…`}
        accent={accent}
      />
    );
  } else if (error) {
    content = (
      <StateMessage
        eyebrow="Gallery closed"
        title={error}
        accent={accent}
        action={<MuseumButton label="Retry" onPress={handleRetry} color={accent} />}
      />
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
          <Text style={styles.overline}>A collection of feelings</Text>
          <Text style={styles.title}>Mood Museum</Text>
          <Text style={styles.subtitle}>How are you feeling today?</Text>
        </View>

        {/* Mood "tabs": plain spaced capitals; the selected one is underlined in its color. */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.moodRow}>
          {MOODS.map((m) => {
            const isSelected = m.key === active.key;
            return (
              <Pressable
                key={m.key}
                onPress={() => handleSelectMood(m)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={m.label}
                style={({ pressed }) => [
                  styles.moodTab,
                  { borderBottomColor: isSelected ? m.color : 'transparent' },
                  pressed && styles.pressed,
                ]}>
                <View style={[styles.moodDot, { backgroundColor: m.color }, !isSelected && styles.moodDotIdle]} />
                <Text
                  style={[styles.moodLabel, isSelected && styles.moodLabelSelected]}
                  numberOfLines={1}>
                  {m.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Custom mood: a single underline, like writing on a gallery card. */}
        <View style={styles.customRow}>
          <TextInput
            value={customText}
            onChangeText={handleCustomChange}
            onSubmitEditing={handleCustomSubmit}
            placeholder="or write your own feeling…"
            placeholderTextColor={Museum.faint}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
            accessibilityLabel="Type your own mood"
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            style={[
              styles.customInput,
              // Focus / active indicator is the underline itself (replaces the web focus box).
              (inputFocused || isCustomActive) && {
                borderBottomColor: isCustomActive ? CUSTOM_COLOR : Museum.ink,
                borderBottomWidth: 2,
              },
            ]}
          />
          {isCustomActive && !loading && !error && relatedWords.length > 0 ? (
            <Text style={styles.relatedWords} numberOfLines={2}>
              also looking for: {relatedWords.join(' · ')}
            </Text>
          ) : null}
        </View>
      </SafeAreaView>

      <View style={styles.content}>{content}</View>

      <SafeAreaView style={styles.footerSafe} edges={['bottom']}>
        <Text style={styles.footer}>Artwork data · Art Institute of Chicago</Text>
      </SafeAreaView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles — museum wall: hairline rules, serif titles, spaced capitals, no boxes
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Museum.wall,
  },
  headerSafe: {
    backgroundColor: Museum.wall,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  overline: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: Museum.muted,
  },
  title: {
    marginTop: 6,
    fontFamily: Fonts.serif,
    fontSize: 38,
    lineHeight: 44,
    color: Museum.ink,
  },
  subtitle: {
    marginTop: 2,
    fontFamily: Fonts.serif,
    fontStyle: 'italic',
    fontSize: 17,
    color: Museum.inkSoft,
  },
  moodRow: {
    paddingHorizontal: 20,
    gap: 22,
  },
  moodTab: {
    minHeight: 44, // ≥44pt touch target
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderBottomWidth: 2,
  },
  moodDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  moodDotIdle: {
    opacity: 0.45,
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: Museum.muted,
  },
  moodLabelSelected: {
    color: Museum.ink,
  },
  pressed: {
    opacity: 0.6,
  },
  customRow: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  customInput: {
    minHeight: 44, // ≥44pt touch target
    paddingHorizontal: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Museum.rule,
    fontFamily: Fonts.serif,
    fontStyle: 'italic',
    fontSize: 17, // ≥16 avoids iOS Safari zoom-on-focus
    color: Museum.ink,
    // Web: no browser focus box — the underline shows focus instead. (`solid` is needed
    // because the browser's default `outline-style: auto` ignores a width of 0.)
    outlineStyle: 'solid',
    outlineWidth: 0,
  },
  relatedWords: {
    marginTop: 8,
    fontFamily: Fonts.serif,
    fontStyle: 'italic',
    fontSize: 13,
    lineHeight: 18,
    color: Museum.muted,
  },
  content: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  // Museum-wall card: no box, no shadow — the image hangs on the wall with a label below.
  card: {
    marginBottom: 44,
  },
  cardImage: {
    width: '100%',
    height: 300,
    backgroundColor: Museum.wallShade,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Museum.rule,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  placeholderText: {
    fontFamily: Fonts.serif,
    fontStyle: 'italic',
    fontSize: 14,
    color: Museum.muted,
  },
  // Wall label: hairline rule, plate number, then title / artist / date.
  label: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Museum.rule,
  },
  plateNumber: {
    width: 34,
    paddingTop: 4,
    fontFamily: Fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
  },
  labelText: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: Fonts.serif,
    fontStyle: 'italic',
    fontSize: 20,
    lineHeight: 26,
    color: Museum.ink,
  },
  cardArtist: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: Museum.inkSoft,
  },
  cardDate: {
    marginTop: 3,
    fontFamily: Fonts.serif,
    fontSize: 13,
    color: Museum.muted,
  },
  cardArrow: {
    paddingTop: 2,
    paddingLeft: 12,
    fontSize: 18,
    color: Museum.faint,
  },
  cardPressed: {
    opacity: 0.7,
  },
  footerSafe: {
    backgroundColor: Museum.wall,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Museum.ruleSoft,
  },
  footer: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: Museum.muted,
    textAlign: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
});
