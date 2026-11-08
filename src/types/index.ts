export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface Venue {
  id: string;
  name: string;
  aliases: string[];
  gu: '종로구' | '중구';
  type: '미술관' | '박물관';
  lat: number;
  lng: number;
  representative: boolean;
  hours?: Partial<Record<Weekday, { open: string; close: string }>>;
  closed?: { weekday?: Weekday; ifHoliday?: 'nextDay'; dates?: string[] };
  lastEntry?: string;
  visitMinutes?: number;
  docent?: { days: Weekday[]; times: string[] }[];
  entry?: string;
  reservation?: string;
  source: string;
  verified: string;
}

export interface Exhibition {
  id: string;
  venueId: string;
  title: string;
  start: string;
  end: string;
  field?: string;
  placeName: string;
  link?: string;
  lat?: number;
  lng?: number;
  fetchedAt: string;
}

export interface JudgeInput {
  venue: Venue;
  exhibition: Exhibition;
  date: string;
  stayStart: string;
  stayEnd: string;
  holidays: string[];
}

export interface JudgeResult {
  result: 'possible' | 'impossible' | 'unknown';
  reasons: string[];
  entryTime?: string;
  endTime?: string;
  slackMinutes?: number;
}
