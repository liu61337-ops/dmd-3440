# Mood Museum

A single-screen Expo / React Native app for **DMD 3440 — "Build an API-Powered App Screen"**.

**User task:** Pick a mood from the chip row at the top, and the app shows artworks from the
Art Institute of Chicago collection that match that feeling. Scroll the gallery, pull to refresh,
or tap another mood to change the feeling. If something goes wrong, tap **Retry**.

## Running the app

```bash
npx expo start
```

Then press `i` (iOS simulator), `a` (Android emulator), or scan the QR code with Expo Go.

## API

| Item | Value |
| --- | --- |
| API name | Art Institute of Chicago Public API |
| Docs | https://api.artic.edu/docs |
| Method | `GET` |
| Endpoint | `https://api.artic.edu/api/v1/artworks/search` |
| Auth | **None** — no API key required |
| Image base URL | `${response.config.iiif_url}` (fallback: `https://www.artic.edu/iiif/2`) |

### Query parameters used

| Param | Value | Purpose |
| --- | --- | --- |
| `q` | mood keyword (`tranquil`, `solitude`, `celebration`, `rain`, `dream`, `storm`, `interior`) | full-text search |
| `fields` | `id,title,artist_title,date_display,image_id,thumbnail` | only fetch the fields the screen needs (faster queries) |
| `limit` | `24` | number of results |

Example call:

```
GET https://api.artic.edu/api/v1/artworks/search?q=rain&fields=id,title,artist_title,date_display,image_id,thumbnail&limit=24
```

### Rate limits & attribution

- **Rate limit:** anonymous access is throttled to **60 requests per minute**. Higher limits —
  contact the museum. The app makes one request per mood tap / refresh, so it stays well under.
- **Headers:** requests must use HTTPS. The museum asks (as a courtesy) that you send an
  `AIC-User-Agent` header with your project name and a contact email. Browsers forbid changing
  `User-Agent`, so on web this header is omitted; it is harmless to omit in this lab app.
- **Best practices:** send only the `fields` you need, cache responses when possible, and use the
  recommended image size `/full/843,/0/default.jpg` (what this app uses) so images are cache-friendly.
- **Attribution / licensing:** the `description` field in API responses is CC-BY 4.0; all other data
  is CC0 1.0 (https://www.artic.edu/terms). The app displays the credit
  **"Artwork data: Art Institute of Chicago"** in the footer. Prefer public-domain artworks for
  images; the museum asks that you hotlink IIIF images rather than download them.

### Sample response (trimmed)

From
`curl "https://api.artic.edu/api/v1/artworks/search?q=rain&fields=id,title,artist_title,date_display,image_id,thumbnail&limit=3"`:

```json
{
  "preference": null,
  "pagination": { "total": 133165, "limit": 3, "offset": 0, "total_pages": 44389, "current_page": 1 },
  "data": [
    {
      "_score": 56.43,
      "id": 20684,
      "title": "Paris Street; Rainy Day",
      "thumbnail": {
        "width": 9987,
        "height": 7755,
        "alt_text": "Life-size painting of an urban scene in Paris. A man in a top hat holding an umbrella and a woman in a long fashionable dark dress walk arm in arm toward the viewer…"
      },
      "date_display": "1877",
      "artist_title": "Gustave Caillebotte",
      "image_id": "f8fd76e9-c396-5678-36ed-6a348c904d27"
    },
    {
      "_score": 55.70,
      "id": 11371,
      "title": "Spring Rains",
      "thumbnail": { "width": 7697, "height": 6963, "alt_text": "A work made of oil on canvas." },
      "date_display": "c. 1924",
      "artist_title": "Victor Higgins",
      "image_id": "f3ad0bd5-2502-a308-bd69-e6ca4987f55f"
    }
  ],
  "info": { "license_text": "…", "version": "1.16" },
  "config": { "iiif_url": "https://www.artic.edu/iiif/2", "website_url": "https://www.artic.edu" }
}
```

Image URL pattern used by the app:

```
${config.iiif_url}/${image_id}/full/843,/0/default.jpg
→ https://www.artic.edu/iiif/2/f8fd76e9-c396-5678-36ed-6a348c904d27/full/843,/0/default.jpg
```

## How the app is structured

- Screen: `src/app/index.tsx` (the only route; `src/app/_layout.tsx` is a plain stack with no tabs)
- `fetch()` runs only inside `useEffect` and event handlers — never during render
- `loading`, `artworks` (data), and `error` are **separate** `useState` variables
  (plus `refreshing` for pull-to-refresh)
- Each API item is transformed into `{ id, title, artist, date, imageUrl, alt }` with fallbacks:
  `Untitled` / `Unknown artist` / `Date unknown` / `Image not available` (missing `image_id` **or**
  `Image` `onError`)
- A `requestIdRef` counter discards stale responses when moods are tapped quickly
- Pull-to-refresh **replaces** the list (never appends), so repeated refreshes can't duplicate items
- Four states: loading spinner ("Finding art that feels *Mood*…"), success list, empty
  (`ListEmptyComponent`: "No art matches this feeling yet"), and error + **Retry** (with an
  offline-specific message when `fetch` fails at the network level)

### Test flags

At the top of `src/app/index.tsx`:

```ts
const TEST_EMPTY = false; // true → searches "zxqvbnm" (forces the empty state)
const TEST_404   = false; // true → calls /artworkz/search (forces a 404 error)
```

Flip either to `true` and reload the app.

## Test plan (fill in during lab testing)

| Test | Steps | Expected result | Pass? |
| --- | --- | --- | --- |
| Normal request | Launch app, tap a mood | Spinner shows, then a list of 24 artwork cards (image, title, artist, date) | |
| Slow request | Throttle network (DevTools / Network Link Conditioner), tap a mood | Spinner stays visible with "Finding art that feels *Mood*…" until data arrives | |
| Empty result | Set `TEST_EMPTY = true`, reload | "No art matches this feeling yet" via `ListEmptyComponent` | |
| Invalid endpoint / 404 | Set `TEST_404 = true`, reload | Error state with HTTP 404 message + Retry button; Retry issues a real new request | |
| Airplane mode / offline | Enable airplane mode, tap a mood or Retry | Offline message ("You seem to be offline…") + Retry | |
| Missing optional field | Find an artwork with no `image_id` (or no title/artist/date) | Placeholder box "Image not available"; "Untitled" / "Unknown artist" / "Date unknown" fallbacks | |
| Repeated refresh | Pull to refresh several times quickly, then wait | List is replaced each time — no duplicate cards; only the newest response renders | |

## State sketch (wireframe)

```
 LOADING                    SUCCESS                    EMPTY                      ERROR
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│ Mood Museum      │       │ Mood Museum      │       │ Mood Museum      │       │ Mood Museum      │
│ [Calm][Lonely].. │       │ [Calm][Lonely].. │       │ [Calm][Lonely].. │       │ [Calm][Lonely].. │
│                  │       │ ┌──────────────┐ │       │                  │       │                  │
│       ( o )      │       │ │   artwork    │ │       │       🖼️         │       │       ⚠️         │
│ Finding art that │       │ │    image     │ │       │ No art matches   │       │ Request failed   │
│ feels Calm…      │       │ └──────────────┘ │       │ this feeling yet │       │ (HTTP 404)…      │
│                  │       │ Title            │       │ Try a different  │       │                  │
│                  │       │ Artist · Date    │       │ mood above.      │       │    [ Retry ]     │
│                  │       │ ┌──────────────┐…│       │                  │       │                  │
│ Artwork data: AIC│       │ Artwork data: AIC│       │ Artwork data: AIC│       │ Artwork data: AIC│
└──────────────────┘       └──────────────────┘       └──────────────────┘       └──────────────────┘
```

Missing image → grey box labelled "Image not available"; missing title / artist / date →
"Untitled" / "Unknown artist" / "Date unknown".

## Demo video checklist (30–60 s)

Goal: show that the screen's data comes **live from the Art Institute of Chicago API**.

- [ ] Start the app: `npx expo start`, then `i` for the iOS simulator (or `w` for web)
- [ ] Start recording (iOS simulator: `xcrun simctl io booted recordVideo demo.mov`, stop with Ctrl+C;
      or macOS `Cmd+Shift+5` for a screen recording)
- [ ] Launch → the **loading** state ("Finding art that feels Calm…") appears, then the **success** list
- [ ] Tap 2–3 different moods → new artworks load each time (a new request per tap)
- [ ] Pull to refresh → the list is replaced, no duplicate cards
- [ ] **Prove it's an external API:** run the web version with browser DevTools → Network tab open,
      tap a mood, and click the `api.artic.edu/api/v1/artworks/search?q=…` request to show its JSON response
- [ ] Error state: turn on airplane mode (or set `TEST_404 = true`) → error message + tap **Retry**
- [ ] (Optional) Empty state: set `TEST_EMPTY = true` → "No art matches this feeling yet"
- [ ] Upload the video (keep it short; trim if needed)

## Reflection (draft — edit with your own test results)

Mood Museum turns a feeling into a search. Each mood chip maps to a keyword (Calm → "tranquil",
Melancholy → "rain") that is sent to the Art Institute of Chicago `/artworks/search` endpoint. The raw
response is not display-ready, so I transformed every item into a small `{ id, title, artist, date,
imageUrl, alt }` object: I built the image URL from the response's `config.iiif_url` plus each
`image_id`, trimmed text fields, and filled in fallbacks like "Untitled" and "Unknown artist." I also
requested only the six fields I needed, which keeps responses small.

During testing, _[describe what actually failed — e.g. some artworks had no `image_id` and rendered a
blank area until I added the placeholder; tapping moods quickly briefly showed results from the
wrong mood until I added the request-id guard; the 404 test showed that `fetch` does not throw on HTTP
errors, so checking `response.ok` was necessary]_. Offline mode produced a generic `TypeError`, so I
added a friendlier "You seem to be offline" message.

For a production app I would cache the last results (AsyncStorage) so the screen isn't empty offline,
add pagination or "load more" instead of a fixed 24 results, send the requested `AIC-User-Agent` header
from native builds, and refine the mood-to-keyword mapping, since a full-text search for "dream" also
returns works that only mention the word in their metadata. One limitation of this API is the
60-requests-per-minute anonymous rate limit.
