// Canonical tool registry — the single source for the launcher grid, the
// in-tool drawer, and the brochure. `path` is the same-origin route each tool
// is served at under the unified domain (Vercel multi-zone). Keep `key`/`path`
// stable; they are referenced by routing + redirects.
export const BRAND = "Fretworks";
export const STUDIO = "SyncopatedSyntax";
export const MAKER = "Zak";
export const KOFI = "https://ko-fi.com/syncopatedsyntax";

// Home / launcher route (also the installed PWA start_url).
export const HOME_PATH = "/app";

export const TOOLS = [
  {
    key: "chord",
    name: "Chord Trainer",
    emoji: "🎸",
    accent: "#ffd93d", // major-group gold
    path: "/chord/",
    skill: "All levels",
    blurb:
      "Build a working chord vocabulary with spaced-repetition practice, quizzes, and progressions of the day.",
    chips: ["SRS practice", "Chord library", "Audio", "Progressions"],
    note: "Start here",
  },
  {
    key: "diatonic",
    name: "Diatonic Chord Trainer",
    emoji: "🗺️",
    accent: "#ff6b6b", // major-chord red
    path: "/diatonic/",
    skill: "Beginner–Intermediate",
    blurb:
      "Find every diatonic chord’s root across the whole neck using named fretboard shapes.",
    chips: ["Fretboard shapes", "Root positions", "Diatonic harmony"],
  },
  {
    key: "mm",
    name: "Melodic Minor Trainer",
    emoji: "🎼",
    accent: "#74b9ff", // key-selector blue
    path: "/melodic-minor/",
    skill: "Intermediate–Advanced",
    blurb:
      "Master the seven melodic minor modes and where each one earns its keep across styles.",
    chips: ["7 modes", "5 positions + full neck", "Chord–scale map", "Quiz"],
  },
  {
    key: "alt",
    name: "Altered Scale Trainer",
    emoji: "⚡",
    accent: "#2dd4bf", // resolution teal
    path: "/altered/",
    skill: "Advanced",
    blurb:
      "Play the altered sound over a V7 chord and see exactly how its tensions resolve into the chord you’re landing on.",
    chips: ["V7alt → I", "Target tones", "Guide tones", "5 positions"],
  },
];

// Suggested learning order for the brochure's "learning path" section.
export const LEARNING_PATH = [
  { key: "chord", why: "Learn the chords and build a daily practice habit." },
  { key: "diatonic", why: "Place those chords across the entire neck." },
  { key: "mm", why: "Add modal colour for soloing over them." },
  { key: "alt", why: "Bring tension to dominant chords — and resolve it." },
];

export const toolByKey = (key) => TOOLS.find((t) => t.key === key);
