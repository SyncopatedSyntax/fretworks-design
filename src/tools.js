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

// The families the toolbox is grouped into on the brochure and the launcher.
export const TOOL_GROUPS = [
  { key: "chords", name: "Chords" },
  { key: "theory", name: "Notes, keys & harmony" },
  { key: "scales", name: "Scales" },
  { key: "tunes", name: "Tunes" },
];

// Order = family by family (TOOL_GROUPS), easiest first within each. Drives the
// toolbox grid, the launcher and the ToolDrawer; the drawer is a flat list, so
// keeping the families together makes all three agree (`npm test` checks it).
// Where to start is not this order — that is START_PATHS, by goal.
export const TOOLS = [
  {
    key: "chord",
    storage: "ct_", // localStorage prefix — sync uses it to know which keys belong to the open app
    group: "chords",
    name: "Chord Trainer",
    emoji: "🎸",
    accent: "#ffd93d", // major-group gold
    path: "/chord/",
    skill: "All levels",
    blurb:
      "Build a working chord vocabulary with spaced-repetition practice, quizzes, and progressions of the day.",
    chips: ["Chord library", "Progressions", "SRS practice"],
  },
  {
    key: "focus",
    storage: "fct_",
    group: "chords",
    name: "Focused Chord Trainer",
    emoji: "🎯",
    accent: "#4ecdc4", // drop-2 teal
    path: "/focus/",
    skill: "All levels",
    blurb:
      "Build your own chord library one shape at a time, then drill it with the same spaced repetition and quizzes.",
    chips: ["Your own library", "Chord editor", "SRS practice"],
  },
  {
    key: "triads",
    storage: "tri_",
    group: "chords",
    name: "Triad Trainer",
    emoji: "🔺",
    accent: "#4ade80", // green
    path: "/triads/",
    skill: "Beginner–Intermediate",
    blurb:
      "Learn every triad shape across the neck — all 4 qualities, 3 inversions, 4 string sets — with spaced-repetition practice.",
    chips: ["Closed triads", "All inversions", "SRS practice"],
  },
  {
    key: "notes",
    storage: "nt_",
    group: "theory",
    name: "Note Trainer",
    emoji: "📍",
    accent: "#fb923c", // fretboard orange
    path: "/notes/",
    skill: "Beginner–Intermediate",
    blurb:
      "Know where every note is. Play them on the real neck — the app listens — one string at a time until you find any note without counting.",
    chips: ["Play, don’t tap", "String by string", "SRS practice"],
  },
  {
    key: "circle",
    storage: "cof_",
    group: "theory",
    name: "Circle of Fifths Trainer",
    emoji: "🧭",
    accent: "#f0a05a", // warm amber
    path: "/circle/",
    skill: "All levels",
    blurb:
      "See how keys, chords and sharps/flats connect — then use the circle to write progressions that work.",
    chips: ["Keys & chords", "Songwriting", "Sharps/flats"],
  },
  {
    key: "diatonic",
    storage: "dc_",
    group: "theory",
    name: "Diatonic Chord Trainer",
    emoji: "🗺️",
    accent: "#ff6b6b", // major-chord red
    path: "/diatonic/",
    skill: "Beginner–Intermediate",
    blurb:
      "Find every diatonic chord’s root across the whole neck using named fretboard shapes, then drill it with spaced repetition.",
    chips: ["Named shapes", "Progressions", "SRS quiz"],
  },
  {
    key: "blues",
    storage: "bs_",
    group: "scales",
    name: "Blues Scale Trainer",
    emoji: "🎷",
    accent: "#818cf8", // blue-note indigo
    path: "/blues/",
    skill: "Beginner–Intermediate",
    blurb:
      "Learn the blues scale in five boxes and the joins between them, see it against major, minor and both pentatonics, and hear what its one blue note does over a 12-bar.",
    chips: ["Minor & major blues", "The blue note", "Compare scales"],
  },
  {
    key: "major",
    storage: "mj_",
    group: "scales",
    name: "Major Scale Trainer",
    emoji: "☀️",
    accent: "#22d3ee", // sky cyan
    path: "/major/",
    skill: "Beginner–Intermediate",
    blurb:
      "Learn the major scale in five CAGED shapes and its seven modes, see what its 4 and 7 do against Mixolydian, Lydian and the pentatonic, and drill it with spaced repetition.",
    chips: ["5 shapes + 3nps", "7 modes", "Chords of the key"],
  },
  {
    key: "nm",
    storage: "nm_",
    group: "scales",
    name: "Natural Minor Trainer",
    emoji: "🌙",
    accent: "#f472b6", // rose pink
    path: "/natural-minor/",
    skill: "Beginner–Intermediate",
    blurb:
      "Learn the natural minor scale in five shapes and its seven modes, see where it differs from harmonic and melodic minor, and drill it with spaced repetition.",
    chips: ["5 shapes + 3nps", "7 modes", "Compare minors"],
  },
  {
    key: "hm",
    storage: "hm_",
    group: "scales",
    name: "Harmonic Minor Trainer",
    emoji: "🎻",
    accent: "#a3e635", // lime
    path: "/harmonic-minor/",
    skill: "Intermediate",
    blurb:
      "Learn harmonic minor — the natural minor with a raised 7th — in five shapes and seven modes, and hear the V7 it gives a minor key.",
    chips: ["The raised 7th", "7 modes", "Compare minors"],
  },
  {
    key: "mm",
    storage: "mm_",
    group: "scales",
    name: "Melodic Minor Trainer",
    emoji: "🎼",
    accent: "#74b9ff", // key-selector blue
    path: "/melodic-minor/",
    skill: "Intermediate–Advanced",
    blurb:
      "Master the seven melodic minor modes and where each one earns its keep across styles.",
    chips: ["7 modes", "5 CAGED shapes", "Chord–scale map"],
  },
  {
    key: "alt",
    storage: "at_",
    group: "scales",
    name: "Altered Scale Trainer",
    emoji: "⚡",
    accent: "#2dd4bf", // resolution teal
    path: "/altered/",
    skill: "Advanced",
    blurb:
      "Play the altered sound over a V7 chord, see exactly how its tensions resolve into the chord you’re landing on, and drill it with spaced repetition.",
    chips: ["V7alt → I", "Guide tones", "SRS drills"],
  },
  {
    key: "standards",
    storage: "js_",
    group: "tunes",
    name: "Standards Trainer",
    emoji: "🎺",
    accent: "#a78bfa", // violet
    path: "/standards/",
    skill: "Intermediate",
    blurb:
      "Learn jazz standards properly — head, changes, form and soloing, each on its own review schedule — until you can call one at a jam.",
    chips: ["40-tune core path", "Four skills per tune", "SRS reviews"],
  },
];

// "Where do you want to start?" on the brochure: pick a goal, get a short path
// of trainers in order. It replaced a single learning path through every tool,
// which was not a real order — Focused is an alternative to Chord, not the
// next step, and nobody needs all of them. `or` is an alternative first step.
// Every trainer is on at least one path, so none is unreachable from the
// chooser (`npm test` checks it).
export const START_PATHS = [
  {
    key: "neck",
    label: "Know the neck",
    title: "Find your way around the fretboard",
    steps: [
      { key: "notes", why: "Learn where every note is, one string at a time. It listens while you play." },
      { key: "triads", why: "The small movable chord shapes that cover the whole neck." },
      { key: "major", why: "Five scale shapes that join the neck into one map." },
    ],
  },
  {
    key: "chords",
    label: "Chords",
    title: "Build a chord vocabulary",
    steps: [
      { key: "chord", why: "A big library of voicings, with a daily review that brings each one back before you forget it." },
      { key: "triads", why: "The three-note shapes inside every bigger chord." },
      { key: "diatonic", why: "Find the root of each of a key’s seven chords, anywhere on the neck." },
    ],
    or: { key: "focus", why: "Already have your own list? Build it here and drill only those chords." },
  },
  {
    key: "harmony",
    label: "Keys & harmony",
    title: "Understand why chords go together",
    steps: [
      { key: "circle", why: "How keys, chords and sharps/flats connect, and how to write progressions with it." },
      { key: "major", why: "The scale a key’s chords are built from." },
      { key: "diatonic", why: "Find each of those chords anywhere on the neck." },
    ],
  },
  {
    key: "solo",
    label: "Soloing",
    title: "Solo and improvise",
    steps: [
      { key: "blues", why: "The scale most solos start from, and its one blue note." },
      { key: "major", why: "Five shapes and seven modes: the scale everything is measured against." },
      { key: "nm", why: "The minor scale, and how it differs from the major." },
      { key: "hm", why: "Raise one note and a minor key gets a real V7." },
    ],
  },
  {
    key: "jazz",
    label: "Jazz",
    title: "Play jazz",
    steps: [
      { key: "standards", why: "Start learning tunes now: head, changes, form and soloing, each on its own schedule." },
      { key: "chord", why: "Drop 2s, shells and extended chords for comping." },
      { key: "mm", why: "The seven melodic minor modes and the chord each one fits." },
      { key: "alt", why: "Tension over the V7, and exactly where it resolves." },
    ],
  },
];

export const toolByKey = (key) => TOOLS.find((t) => t.key === key);
