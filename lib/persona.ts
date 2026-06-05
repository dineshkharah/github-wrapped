import type { Stats, Narrative, Persona } from "@/lib/types";

/** FNV-1a hash → a stable 32-bit number from any string. */
export function seedFrom(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministically pick one item from a list using the seed (+ a salt). */
function pick<T>(arr: T[], seed: number, salt = 0): T {
  return arr[(seed + salt) % arr.length];
}

/** Replace {placeholders} in a template with values. */
function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

//  persona catalog

const PERSONAS: Record<string, Persona> = {
  machine: {
    key: "machine",
    title: "The Machine 🤖",
    tagline: "Streaks don't scare you.",
    description:
      "Day after day, the commits kept coming. Rain or shine, you showed up to the keyboard like it owed you money.",
    animal: "Beaver",
  },
  weekendWarrior: {
    key: "weekendWarrior",
    title: "The Weekend Warrior ⚔️",
    tagline: "Saturdays are for shipping.",
    description:
      "While the world brunched, you built. Your best work happened when everyone else had logged off.",
    animal: "Owl",
  },
  serialStarter: {
    key: "serialStarter",
    title: "The Serial Starter 🌱",
    tagline: "So many repos, so little time.",
    description:
      "New idea, new repo. Your GitHub is a museum of brilliant beginnings — and a few that genuinely took off.",
    animal: "Magpie",
  },
  polyglot: {
    key: "polyglot",
    title: "The Polyglot 🦜",
    tagline: "One language is never enough.",
    description:
      "You switch syntaxes like accents. If it compiles, you'll learn it — fluency optional, curiosity mandatory.",
    animal: "Parrot",
  },
  specialist: {
    key: "specialist",
    title: "The Specialist 🎯",
    tagline: "One language, mastered.",
    description:
      "No shiny-object syndrome here. You went deep instead of wide, and it shows in every clean line.",
    animal: "Falcon",
  },
  gatekeeper: {
    key: "gatekeeper",
    title: "The Gatekeeper 🛡️",
    tagline: "Nothing merges without you.",
    description:
      "Pull requests learned to fear your review. You caught the bugs, asked the hard questions, and kept the codebase honest.",
    animal: "Watchdog",
  },
  opensourceHero: {
    key: "opensourceHero",
    title: "The Open-Source Hero ⭐",
    tagline: "Strangers star your work.",
    description:
      "Your code escaped into the wild and people loved it. Somewhere, a developer you'll never meet is quietly thanking you.",
    animal: "Lion",
  },
  shipper: {
    key: "shipper",
    title: "The Shipper 🚢",
    tagline: "Done beats perfect.",
    description:
      "Pull request after pull request, you kept things moving. Ideas don't count until they're merged — and you know it.",
    animal: "Dolphin",
  },
  prolific: {
    key: "prolific",
    title: "The Prolific One 🔥",
    tagline: "You simply do not stop.",
    description:
      "The contribution graph could barely keep up. Sheer, relentless output was your signature this year.",
    animal: "Hummingbird",
  },
  steady: {
    key: "steady",
    title: "The Steady Hand 🌿",
    tagline: "Quiet, consistent, reliable.",
    description:
      "No drama, no burnout — just steady progress. The kind of developer every team quietly depends on.",
    animal: "Tortoise",
  },
};

//  persona selection

// Thresholds: a trait "qualifies" once its value reaches the number below
// (intensity = value / threshold >= 1). The highest intensity wins.
const THRESHOLDS = {
  streak: 21,
  weekendRatio: 0.4,
  reposCreated: 20,
  distinctLanguages: 5,
  specialistTotal: 300,
  reviews: 30,
  stars: 100,
  pullRequests: 50,
  total: 1500,
};

export function choosePersona(stats: Stats, seed: number): Persona {
  const candidates: { persona: Persona; intensity: number }[] = [
    {
      persona: PERSONAS.machine,
      intensity: stats.longestStreakDays / THRESHOLDS.streak,
    },
    {
      persona: PERSONAS.weekendWarrior,
      intensity: stats.weekendRatio / THRESHOLDS.weekendRatio,
    },
    {
      persona: PERSONAS.serialStarter,
      intensity: stats.reposCreated / THRESHOLDS.reposCreated,
    },
    {
      persona: PERSONAS.polyglot,
      intensity: stats.distinctLanguages / THRESHOLDS.distinctLanguages,
    },
    {
      persona: PERSONAS.specialist,
      intensity:
        stats.distinctLanguages === 1
          ? stats.totalContributions / THRESHOLDS.specialistTotal
          : 0,
    },
    {
      persona: PERSONAS.gatekeeper,
      intensity: stats.reviews / THRESHOLDS.reviews,
    },
    {
      persona: PERSONAS.opensourceHero,
      intensity: stats.starsEarned / THRESHOLDS.stars,
    },
    {
      persona: PERSONAS.shipper,
      intensity: stats.pullRequests / THRESHOLDS.pullRequests,
    },
    {
      persona: PERSONAS.prolific,
      intensity: stats.totalContributions / THRESHOLDS.total,
    },
  ];

  // Keep only traits that actually cleared their threshold.
  const qualified = candidates.filter((c) => c.intensity >= 1);
  if (qualified.length === 0) return PERSONAS.steady;

  // Most extreme trait wins; ties broken deterministically by the seed.
  qualified.sort((a, b) => b.intensity - a.intensity);
  const top = qualified[0].intensity;
  const tied = qualified
    .filter((c) => c.intensity === top)
    .map((c) => c.persona);
  return pick(tied, seed, 7);
}

//  caption pools

const TOTAL_CAPTIONS = {
  epic: [
    "the contribution graph never stood a chance.",
    "green squares as far as the eye can see.",
    "did you take a single day off? doubtful.",
  ],
  solid: [
    "a seriously productive year at the keyboard.",
    "steady output, real momentum.",
    "the commits added up fast.",
  ],
  casual: [
    "quality over quantity — every commit counted.",
    "small steps still move the needle.",
    "a chill year, and that's perfectly fine.",
  ],
};

const STREAK_CAPTIONS = {
  epic: [
    "touch grass? never heard of it. 🌱",
    "the streak that refused to break.",
    "sleep is for devs without a commit streak.",
  ],
  solid: [
    "habit unlocked — and held.",
    "consistency is a superpower.",
    "show-up energy, certified.",
  ],
  casual: [
    "short bursts, big ideas.",
    "every streak starts somewhere.",
    "momentum is momentum.",
  ],
};

const LANGUAGE_CAPTIONS = {
  many: [
    "{lang} led the pack — but it had plenty of company.",
    "{lang} on top, with a whole toolbox behind it.",
    "fluent in {lang}, and a few others for good measure.",
  ],
  few: [
    "{lang}, your weapon of choice.",
    "{lang} did the heavy lifting this year.",
    "you and {lang} — name a better duo.",
  ],
};

const DAY_CAPTIONS = {
  weekend: [
    "{day} was your power day. weekends? what weekends.",
    "peak output landed on {day}.",
    "{day} energy is simply unmatched.",
  ],
  weekday: [
    "{day} was when the magic happened.",
    "{day}: your most dangerous day at the keyboard.",
    "something about {day} just clicks for you.",
  ],
};

const STARS_CAPTIONS = {
  many: [
    "strangers on the internet approve. ⭐",
    "your code went out and made friends.",
    "the stars aligned — literally.",
  ],
  some: [
    "a few well-earned stars in the bank.",
    "people noticed, and that's the dream.",
    "validation, one star at a time.",
  ],
  none: [
    "stars are overrated — shipping is the point.",
    "the best repos are sometimes the quiet ones.",
    "build for yourself first; stars follow.",
  ],
};

const YEAR_WORDS = [
  "relentless",
  "prolific",
  "focused",
  "curious",
  "unstoppable",
  "heads-down",
  "shipping",
  "caffeinated",
  "dialed-in",
  "legendary",
];

//  narrative assembly

function bucket3(value: number, hi: number, mid: number) {
  return value >= hi ? "epic" : value >= mid ? "solid" : "casual";
}

export function buildNarrative(stats: Stats): Narrative {
  const seed = seedFrom(stats.username.toLowerCase());
  const persona = choosePersona(stats, seed);

  const topLang = stats.topLanguages[0] ?? "code";
  const day = stats.busiestWeekday?.label ?? "some day";
  const isWeekendDay =
    stats.busiestWeekday?.weekday === 0 || stats.busiestWeekday?.weekday === 6;

  const totalBucket = bucket3(stats.totalContributions, 2000, 500);
  const streakBucket = bucket3(stats.longestStreakDays, 30, 7);
  const langBucket = stats.distinctLanguages >= 3 ? "many" : "few";
  const dayBucket = isWeekendDay ? "weekend" : "weekday";
  const starBucket =
    stats.starsEarned >= 50 ? "many" : stats.starsEarned > 0 ? "some" : "none";

  const captions: Record<string, string> = {
    total: pick(TOTAL_CAPTIONS[totalBucket], seed, 1),
    streak: pick(STREAK_CAPTIONS[streakBucket], seed, 2),
    languages: fill(pick(LANGUAGE_CAPTIONS[langBucket], seed, 3), {
      lang: topLang,
    }),
    busiestDay: fill(pick(DAY_CAPTIONS[dayBucket], seed, 4), { day }),
    stars: pick(STARS_CAPTIONS[starBucket], seed, 5),
  };

  const yearInOneWord = pick(YEAR_WORDS, seed, 6);

  return { persona, captions, yearInOneWord };
}
