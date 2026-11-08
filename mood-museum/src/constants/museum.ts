/**
 * Mood Museum visual language: a quiet gallery wall, ink-colored type, hairline rules,
 * serif for titles and prose, small spaced capitals for labels. No boxes, no shadows.
 */
export const Museum = {
  wall: '#F7F5EF', // page background (gallery wall)
  wallShade: '#ECE8DE', // image loading background
  ink: '#26221B', // primary text
  inkSoft: '#4A443B', // secondary text
  muted: '#8A8375', // captions, meta
  faint: '#A39B8C', // arrows, placeholders
  rule: '#B9B1A2', // strong hairline
  ruleSoft: '#D8D1C3', // light hairline
  accent: '#7A6A55', // default accent (custom mood, detail page)
} as const;
