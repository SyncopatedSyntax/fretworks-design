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

// Order = the suggested learning path: chord vocabulary, then the movable
// shapes underneath it, then key/harmony theory, then applying shapes across
// the neck within a key, then modal colour for soloing, then advanced
// tension/resolution. Drives the toolbox grid, the launcher, and the
// ToolDrawer, in addition to LEARNING_PATH below — keep them in this order.
export const TOOLS = [
  {
    key: "chord",
    storage: "ct_", // localStorage prefix — sync uses it to know which keys belong to the open app
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
    key: "focus",
    storage: "fct_",
    name: "Focused Chord Trainer",
    emoji: "🎯",
    accent: "#4ecdc4", // drop-2 teal
    path: "/focus/",
    skill: "All levels",
    blurb:
      "Build your own chord library one shape at a time, then drill it with the same spaced repetition and quizzes.",
    chips: ["Your own library", "Chord editor", "SRS practice", "Quiz"],
  },
  {
    key: "triads",
    storage: "tri_",
    name: "Triad Trainer",
    emoji: "🔺",
    accent: "#4ade80", // green
    path: "/triads/",
    skill: "Beginner–Intermediate",
    blurb:
      "Learn every triad shape across the neck — all 4 qualities, 3 inversions, 4 string sets — with spaced-repetition practice.",
    chips: ["Closed triads", "All inversions", "SRS practice", "Quiz"],
  },
  {
    key: "circle",
    storage: "cof_",
    name: "Circle of Fifths Trainer",
    emoji: "🧭",
    accent: "#f0a05a", // warm amber
    path: "/circle/",
    skill: "All levels",
    blurb:
      "See how keys, chords and sharps/flats connect — then use the circle to write progressions that work.",
    chips: ["Keys & chords", "Songwriting", "Sharps/flats", "Quiz"],
  },
  {
    key: "notes",
    storage: "nt_",
    name: "Note Trainer",
    emoji: "📍",
    accent: "#fb923c", // fretboard orange
    path: "/notes/",
    skill: "Beginner–Intermediate",
    blurb:
      "Know where every note is. Play them on the real neck — the app listens — one string at a time until you find any note without counting.",
    chips: ["Play, don’t tap", "String by string", "SRS practice", "Speed tier"],
  },
  {
    key: "diatonic",
    storage: "dc_",
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
    key: "blues",
    storage: "bs_",
    name: "Blues Scale Trainer",
    emoji: "🎷",
    accent: "#818cf8", // blue-note indigo
    path: "/blues/",
    skill: "Beginner–Intermediate",
    blurb:
      "Learn the blues scale in five boxes and the joins between them, see it against major, minor and both pentatonics, and hear what its one blue note does over a 12-bar.",
    chips: ["Minor & major blues", "The blue note", "Compare scales", "12-bar view"],
  },
  {
    key: "major",
    storage: "mj_",
    name: "Major Scale Trainer",
    emoji: "☀️",
    accent: "#22d3ee", // sky cyan
    path: "/major/",
    skill: "Beginner–Intermediate",
    blurb:
      "Learn the major scale in five CAGED shapes and its seven modes, see what its 4 and 7 do against Mixolydian, Lydian and the pentatonic, and drill it with spaced repetition.",
    chips: ["5 shapes + 3nps", "7 modes", "Chords of the key", "SRS practice"],
  },
  {
    key: "nm",
    storage: "nm_",
    name: "Natural Minor Trainer",
    emoji: "🌙",
    accent: "#f472b6", // rose pink
    path: "/natural-minor/",
    skill: "Beginner–Intermediate",
    blurb:
      "Learn the natural minor scale in five shapes and its seven modes, see where it differs from harmonic and melodic minor, and drill it with spaced repetition.",
    chips: ["5 shapes + 3nps", "7 modes", "Compare minors", "SRS practice"],
  },
  {
    key: "hm",
    storage: "hm_",
    name: "Harmonic Minor Trainer",
    emoji: "🎻",
    accent: "#a3e635", // lime
    path: "/harmonic-minor/",
    skill: "Intermediate",
    blurb:
      "Learn harmonic minor — the natural minor with a raised 7th — in five shapes and seven modes, and hear the V7 it gives a minor key.",
    chips: ["The raised 7th", "7 modes", "Compare minors", "SRS practice"],
  },
  {
    key: "mm",
    storage: "mm_",
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
    storage: "at_",
    name: "Altered Scale Trainer",
    emoji: "⚡",
    accent: "#2dd4bf", // resolution teal
    path: "/altered/",
    skill: "Advanced",
    blurb:
      "Play the altered sound over a V7 chord and see exactly how its tensions resolve into the chord you’re landing on.",
    chips: ["V7alt → I", "Target tones", "Guide tones", "5 positions"],
  },
  {
    key: "standards",
    storage: "js_",
    name: "Standards Trainer",
    emoji: "🎺",
    accent: "#a78bfa", // violet
    path: "/standards/",
    skill: "Intermediate",
    blurb:
      "Learn jazz standards properly — head, changes, form and soloing, each on its own review schedule — until you can call one at a jam.",
    chips: ["25-tune core path", "Four skills per tune", "SRS reviews", "Your own tunes"],
  },
];

// Suggested learning order for the brochure's "learning path" section — every
// tool, in the same order as TOOLS above.
export const LEARNING_PATH = [
  { key: "chord", why: "Learn the chords and build a daily practice habit." },
  { key: "focus", why: "Narrow the practice down to a library you build yourself." },
  { key: "triads", why: "Master the movable shapes that make up those chords." },
  { key: "circle", why: "Understand how keys and chords connect." },
  { key: "notes", why: "Know where every note actually is, so the shapes stop being blind." },
  { key: "diatonic", why: "Place those chords across the entire neck." },
  { key: "blues", why: "Solo with the scale the blues is built on, and hear what its one extra note does." },
  { key: "major", why: "Learn the scale everything else is measured against, in the same five shapes the minors use." },
  { key: "nm", why: "Learn the minor scale itself, and the seven modes that live inside it." },
  { key: "hm", why: "Raise one note and the minor key gets a real V7 — plus a set of exotic modes." },
  { key: "mm", why: "Add modal colour for soloing over them." },
  { key: "alt", why: "Bring tension to dominant chords — and resolve it." },
  { key: "standards", why: "Put all of it to work on real tunes, and get jam ready." },
];

export const toolByKey = (key) => TOOLS.find((t) => t.key === key);
