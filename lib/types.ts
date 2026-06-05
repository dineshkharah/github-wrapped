export type Stats = {
  username: string;
  name: string | null;
  avatarUrl: string;

  // volume
  totalContributions: number;
  commits: number;
  pullRequests: number;
  issues: number;
  reviews: number;

  // cadence
  longestStreakDays: number;
  currentStreakDays: number;
  busiestDay: { date: string; count: number } | null;
  busiestWeekday: { weekday: number; label: string; count: number } | null;
  weekendRatio: number; // 0..1 — share of contributions on Sat/Sun
  busiestMonth: { month: string; label: string; count: number } | null;

  // reach
  followers: number;
  starsEarned: number;
  reposCreated: number;
  topRepo: { name: string; stars: number } | null;
  mostActiveRepo: {
    name: string;
    commits: number;
    language: string | null;
  } | null;

  // languages
  topLanguages: string[]; // ranked, most-used first
  distinctLanguages: number;
};

export type Persona = {
  key: string;
  title: string; // e.g. "The Machine 🤖"
  tagline: string; // one punchy line
  description: string; // 2-3 sentences
  animal: string; // spirit animal
};

export type Narrative = {
  persona: Persona;
  captions: Record<string, string>; // keyed by slide id, e.g. captions.streak
  yearInOneWord: string;
};

export type WrappedData = {
  stats: Stats;
  narrative: Narrative;
  rangeFrom: string; // ISO
  rangeTo: string; // ISO
  generatedAt: string; // ISO
};
