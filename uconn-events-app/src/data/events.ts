/**
 * Fake events used throughout the app until a real events source is wired up.
 * Swap this module for an API/data layer later — the shape stays the same.
 */

export type UConnEvent = {
  id: string;
  name: string;
  /** ISO calendar date, e.g. "2026-09-25" */
  date: string;
  /** e.g. "6:00 PM" */
  startTime: string;
  /** e.g. "8:00 PM" */
  endTime?: string;
  location: string;
  description: string;
  imageUri: string;
};

export const events: UConnEvent[] = [
  {
    id: 'evt-001',
    name: 'Fall Involvement Fair',
    date: '2026-09-25',
    startTime: '3:00 PM',
    endTime: '6:00 PM',
    location: 'Student Union Ballroom',
    description:
      'Meet 150+ student clubs and organizations and find your next thing on campus.',
    imageUri: 'https://picsum.photos/seed/involvement-fair/400/400',
  },
  {
    id: 'evt-002',
    name: 'Husky Hackathon 2026',
    date: '2026-10-03',
    startTime: '9:00 AM',
    endTime: '9:00 PM',
    location: 'ITE Building, Room 123',
    description:
      'A 24-hour build sprint with mentors, free food, and prizes for the best student prototypes.',
    imageUri: 'https://picsum.photos/seed/husky-hackathon/400/400',
  },
  {
    id: 'evt-003',
    name: 'Research Poster Symposium',
    date: '2026-10-10',
    startTime: '12:00 PM',
    endTime: '4:00 PM',
    location: 'Gampel Pavilion Concourse',
    description:
      'Undergrad and grad students present faculty-mentored research across every college.',
    imageUri: 'https://picsum.photos/seed/research-symposium/400/400',
  },
  {
    id: 'evt-004',
    name: 'Night Market on Storrs',
    date: '2026-10-17',
    startTime: '5:30 PM',
    endTime: '9:00 PM',
    location: 'Storrs Center, Main Street',
    description:
      'Local food trucks, student performers, and makers market stalls light up downtown Storrs.',
    imageUri: 'https://picsum.photos/seed/night-market/400/400',
  },
  {
    id: 'evt-005',
    name: 'Alumni Career Networking Night',
    date: '2026-11-05',
    startTime: '6:00 PM',
    endTime: '8:30 PM',
    location: 'Babbidge Library, Level 1',
    description:
      'Practice your elevator pitch with UConn alumni hiring for internships and entry-level roles.',
    imageUri: 'https://picsum.photos/seed/alumni-networking/400/400',
  },
  {
    id: 'evt-006',
    name: 'Winter Formal',
    date: '2026-11-14',
    startTime: '8:00 PM',
    endTime: '11:59 PM',
    location: 'Jorgensen Center Ballroom',
    description:
      'An evening of music, dancing, and photos with friends before finals week hits.',
    imageUri: 'https://picsum.photos/seed/winter-formal/400/400',
  },
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/** "2026-09-25" -> "Fri, Sep 25" */
export function formatEventDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const parsed = new Date(year, (month ?? 1) - 1, day ?? 1);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }
  return `${WEEKDAYS[parsed.getDay()]}, ${MONTHS[parsed.getMonth()]} ${parsed.getDate()}`;
}

/** "6:00 PM" + "8:00 PM" -> "6:00 PM – 8:00 PM" */
export function formatEventTime(event: UConnEvent): string {
  return event.endTime ? `${event.startTime} – ${event.endTime}` : event.startTime;
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
