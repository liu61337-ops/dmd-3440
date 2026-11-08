/**
 * Shared helpers for the Art Institute of Chicago API (https://api.artic.edu/docs).
 * Used by the gallery screen (search) and the artwork detail screen.
 */

export const API_BASE = 'https://api.artic.edu/api/v1';
export const FALLBACK_IIIF_URL = 'https://www.artic.edu/iiif/2';

/**
 * Options for every request. `no-referrer`: on web, the API's Cloudflare firewall returns
 * 403 (shown by the browser as a CORS error) when the Referer is http://localhost:… —
 * so omit it. Native fetch ignores this option.
 */
export const FETCH_OPTIONS: RequestInit = { referrerPolicy: 'no-referrer' };

/** Returns `value` trimmed, or `fallback` when it is missing/blank. */
export function normalizeText(value: string | null | undefined, fallback: string): string {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  return trimmed.length > 0 ? trimmed : fallback;
}

/** Returns `value` trimmed, or null when it is missing/blank. */
export function optionalText(value: string | null | undefined): string | null {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  return trimmed.length > 0 ? trimmed : null;
}

/** IIIF image URL at the museum's recommended (cache-friendly) 843px width, or null. */
export function iiifImageUrl(iiifUrl: string, imageId: string | null | undefined): string | null {
  const id = typeof imageId === 'string' ? imageId.trim() : '';
  return id.length > 0 ? `${iiifUrl}/${id}/full/843,/0/default.jpg` : null;
}

/** React Native's fetch rejects with TypeError("Network request failed") when offline. */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  return (
    error instanceof Error &&
    /network request failed|fetch failed|network error/i.test(error.message)
  );
}

/** A user-facing message for any failed request. */
export function errorMessage(error: unknown): string {
  if (isNetworkError(error)) {
    return 'You seem to be offline. Check your connection and try again.';
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  rsquo: '’',
  lsquo: '‘',
  rdquo: '”',
  ldquo: '“',
  mdash: '—',
  ndash: '–',
  hellip: '…',
};

/** The API's `description` is HTML: turn it into plain paragraphs for a <Text>. */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&([a-z]+);/gi, (match, name: string) => ENTITIES[name.toLowerCase()] ?? match)
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ---------------------------------------------------------------------------
// Artwork detail: GET /artworks/{id}
// ---------------------------------------------------------------------------
const DETAIL_FIELDS = [
  'id',
  'title',
  'artist_display',
  'date_display',
  'image_id',
  'thumbnail',
  'short_description',
  'description',
  'medium_display',
  'place_of_origin',
  'dimensions',
  'credit_line',
].join(',');

type RawArtworkDetail = {
  id?: number | string | null;
  title?: string | null;
  artist_display?: string | null;
  date_display?: string | null;
  image_id?: string | null;
  thumbnail?: { alt_text?: string | null; width?: number | null; height?: number | null } | null;
  short_description?: string | null;
  description?: string | null;
  medium_display?: string | null;
  place_of_origin?: string | null;
  dimensions?: string | null;
  credit_line?: string | null;
};

type DetailResponse = {
  data?: RawArtworkDetail;
  config?: { iiif_url?: string | null };
};

export type ArtworkDetail = {
  id: string;
  title: string;
  artist: string;
  date: string;
  imageUrl: string | null;
  imageAspectRatio: number;
  alt: string;
  /** Plain-text introduction, or null when the museum has not written one. */
  about: string | null;
  /** True when `about` came from the CC-BY licensed `description` field. */
  aboutIsCcBy: boolean;
  facts: { label: string; value: string }[];
};

/** GET one artwork, check `response.ok`, parse JSON, and transform it for display. */
export async function fetchArtworkDetail(id: string): Promise<ArtworkDetail> {
  const url = `${API_BASE}/artworks/${encodeURIComponent(id)}?fields=${encodeURIComponent(DETAIL_FIELDS)}`;
  const response = await fetch(url, FETCH_OPTIONS);
  if (response.status === 404) {
    throw new Error('This artwork could not be found.');
  }
  if (!response.ok) {
    throw new Error(`Request failed (HTTP ${response.status}). Please try again.`);
  }
  const json: DetailResponse = await response.json();
  const raw = json.data ?? {};
  const iiifUrl = normalizeText(json.config?.iiif_url, FALLBACK_IIIF_URL);

  const title = normalizeText(raw.title, 'Untitled');
  const artist = normalizeText(raw.artist_display, 'Unknown artist');

  // Prefer the short plain-text summary; fall back to the long HTML description.
  const short = optionalText(raw.short_description);
  const long = optionalText(raw.description ? htmlToPlainText(raw.description) : null);

  const width = raw.thumbnail?.width ?? 0;
  const height = raw.thumbnail?.height ?? 0;

  const facts = [
    { label: 'Medium', value: optionalText(raw.medium_display) },
    { label: 'Place of origin', value: optionalText(raw.place_of_origin) },
    { label: 'Dimensions', value: optionalText(raw.dimensions) },
    { label: 'Credit', value: optionalText(raw.credit_line) },
  ].filter((fact): fact is { label: string; value: string } => fact.value !== null);

  return {
    id: raw.id != null ? String(raw.id) : id,
    title,
    artist,
    date: normalizeText(raw.date_display, 'Date unknown'),
    imageUrl: iiifImageUrl(iiifUrl, raw.image_id),
    imageAspectRatio: width > 0 && height > 0 ? width / height : 4 / 3,
    alt: normalizeText(raw.thumbnail?.alt_text, `${title} by ${artist}`),
    about: short ?? long,
    aboutIsCcBy: short === null && long !== null,
    facts,
  };
}
