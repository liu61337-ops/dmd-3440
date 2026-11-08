/**
 * Fake events used throughout the app until a real events source is wired up.
 * Swap this module for an API/data layer later — the shape stays the same.
 */

export type UConnEvent = {
  id: string;
  name: string;
  /** ISO calendar date, e.g. "2026-09-30" */
  date: string;
  /** Optional ISO end date for multi-day events, e.g. "2026-10-04" */
  endDate?: string;
  /** e.g. "11:00 AM" */
  startTime: string;
  /** e.g. "3:00 PM" */
  endTime: string;
  location: string;
  description: string;
  /** Short tip shown in the "What to Bring" callout on the detail screen */
  whatToBring?: string;
  imageUri: string;
};

export const events: UConnEvent[] = [
  {
    id: 'evt-career-fair',
    name: 'Career Fair',
    date: '2026-09-30',
    startTime: '11:00 AM',
    endTime: '3:00 PM',
    location: 'Student Union Ballroom',
    description: 'Meet employers and explore internship and full-time opportunities.',
    whatToBring: 'Resumes, business cards, and a positive attitude!',
    imageUri: 'https://picsum.photos/seed/career-fair/600/450',
  },
  {
    id: 'evt-movie-night',
    name: 'Movie Night',
    date: '2026-10-02',
    startTime: '7:00 PM',
    endTime: '10:00 PM',
    location: 'Student Union Lawn',
    description: 'Join us for a fun night with friends and a great movie!',
    whatToBring: 'A blanket, some snacks, and your favorite crew!',
    imageUri: 'https://picsum.photos/seed/movie-night/600/450',
  },
  {
    id: 'evt-hackathon',
    name: 'Hackathon',
    date: '2026-10-03',
    endDate: '2026-10-04',
    startTime: '9:00 AM',
    endTime: '5:00 PM',
    location: 'Innovation Partnership Building',
    description: 'Build solutions, win prizes, and collaborate with other Huskies.',
    whatToBring: 'Laptop, charger, and a team (or come find one here)!',
    imageUri: 'https://picsum.photos/seed/hackathon/600/450',
  },
  {
    id: 'evt-involvement-fair',
    name: 'Fall Involvement Fair',
    date: '2026-10-09',
    startTime: '3:00 PM',
    endTime: '6:00 PM',
    location: 'Student Union Ballroom',
    description: 'Meet 150+ student clubs and organizations and find your next thing on campus.',
    whatToBring: 'Your student ID and an open mind.',
    imageUri: 'https://picsum.photos/seed/involvement-fair/600/450',
  },
  {
    id: 'evt-research-symposium',
    name: 'Research Poster Symposium',
    date: '2026-10-16',
    startTime: '12:00 PM',
    endTime: '4:00 PM',
    location: 'Gampel Pavilion Concourse',
    description:
      'Undergraduate and graduate students present faculty-mentored research from every college.',
    whatToBring: 'A few good questions — posters and coffee are on us.',
    imageUri: 'https://picsum.photos/seed/research-symposium/600/450',
  },
  {
    id: 'evt-winter-formal',
    name: 'Winter Formal',
    date: '2026-11-14',
    startTime: '8:00 PM',
    endTime: '11:59 PM',
    location: 'Jorgensen Center Ballroom',
    description: 'An evening of music, dancing, and photos with friends before finals week.',
    whatToBring: 'Formal attire and your student ID.',
    imageUri: 'https://picsum.photos/seed/winter-formal/600/450',
  },
];

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function parseDate(date: string): Date | null {
  const [year, month, day] = date.split('-').map(Number);
  if (!year || !month || !day) {
    return null;
  }
  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** "2026-09-30" -> "Sep 30" */
function formatDay(date: string): string {
  const parsed = parseDate(date);
  if (!parsed) {
    return date;
  }
  return `${MONTHS[parsed.getMonth()].slice(0, 3)} ${parsed.getDate()}`;
}

/** "2026-09-30" -> "Wednesday, September 30, 2026" */
function formatFullDate(date: string): string {
  const parsed = parseDate(date);
  if (!parsed) {
    return date;
  }
  return `${WEEKDAYS[parsed.getDay()]}, ${MONTHS[parsed.getMonth()]} ${parsed.getDate()}, ${parsed.getFullYear()}`;
}

/**
 * Card line, e.g. "Sep 30, 11:00 AM – 3:00 PM"
 * or "Oct 3, 9:00 AM – Oct 4, 5:00 PM" for multi-day events.
 */
export function formatEventCardDateTime(event: UConnEvent): string {
  if (event.endDate) {
    return `${formatDay(event.date)}, ${event.startTime} – ${formatDay(event.endDate)}, ${event.endTime}`;
  }
  return `${formatDay(event.date)}, ${event.startTime} – ${event.endTime}`;
}

/** Detail line, e.g. "Wednesday, September 30, 2026" */
export function formatEventDateLong(event: UConnEvent): string {
  const start = formatFullDate(event.date);
  return event.endDate ? `${start} – ${formatFullDate(event.endDate)}` : start;
}

/** Detail line, e.g. "11:00 AM – 3:00 PM" */
export function formatEventTimeRange(event: UConnEvent): string {
  return `${event.startTime} – ${event.endTime}`;
}

/** Case-insensitive match across name, location, and description. */
export function filterEvents(query: string): UConnEvent[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return events;
  }
  return events.filter((event) =>
    [event.name, event.location, event.description].some((field) =>
      field.toLowerCase().includes(normalized),
    ),
  );
}
