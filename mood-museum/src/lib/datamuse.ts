/**
 * Datamuse API (https://www.datamuse.com/api/) — free, no key, CORS-enabled.
 * `ml=` ("means like") turns a feeling the user typed into related words, e.g.
 * "heartbreak" → heartache, grief, sorrow, anguish…, so the museum search can find
 * artworks whose *titles and subjects* express that feeling.
 * Limit: 100,000 requests/day without a key.
 */

const DATAMUSE_URL = 'https://api.datamuse.com/words';
const MAX_RELATED = 8;

type DatamuseWord = { word?: string };

/**
 * Up to 8 single-word synonyms for `phrase`. Never throws: if Datamuse is down or slow,
 * the app still searches the museum with the user's own words.
 */
export async function fetchRelatedWords(phrase: string): Promise<string[]> {
  try {
    const url = `${DATAMUSE_URL}?ml=${encodeURIComponent(phrase)}&max=${MAX_RELATED * 2}`;
    const response = await fetch(url, { referrerPolicy: 'no-referrer' });
    if (!response.ok) return [];
    const json: unknown = await response.json();
    if (!Array.isArray(json)) return [];
    const own = phrase.toLowerCase();
    return (json as DatamuseWord[])
      .map((item) => (typeof item.word === 'string' ? item.word.trim().toLowerCase() : ''))
      // Single words only: multi-word results like "take a fancy to" add noise ("take", "go").
      .filter((word) => /^[a-z]+$/.test(word) && word !== own)
      .slice(0, MAX_RELATED);
  } catch {
    return [];
  }
}
