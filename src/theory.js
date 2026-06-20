// ── Shared music-theory constants ────────────────────────────────────────────
// Canonical copy of the toolbox's degree-colour language and note names.
// Seeded from Chord-Trainer/data/theory.js — keep this pure (no React/DOM).
// Each trainer should import DC/NOTE_NAMES from here instead of redefining them.

// Open-string MIDI notes, low-E (string index 0) to high-e (index 5).
export const OPEN_MIDI = [40, 45, 50, 55, 59, 64];

// Pitch-class names (index 0 = C).
export const NOTE_NAMES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

// Degree → colour. The signature of the whole toolbox: every diagram dot and
// degree chip is coloured by what the note *does*, not where it sits.
export const DC = {
  R: "#ff4757", "3": "#ffd93d", b3: "#ff9f43", "7": "#ff6b6b", b7: "#fdcb6e",
  "9": "#2ed573", "13": "#00b894", "6": "#1e9e77", "#11": "#0fbcf9", "5": "#778ca3",
  b9: "#7c5cbf", "#9": "#6c5ce7", b13: "#9b2335", b5: "#fd79a8", "#5": "#a29bfe",
  bb7: "#b2bec3", "4": "#74b9ff", "2": "#b2d9ff", "11": "#81ecec",
};

// Degree label → semitones above the root (enharmonic overlaps are intentional).
export const DEGREE_SEMITONE = {
  R: 0, b9: 1, "9": 2, "2": 2, "#9": 3, b3: 3, "3": 4, "4": 5, "11": 5,
  b5: 6, "#11": 6, "5": 7, "#5": 8, b13: 8, "6": 9, "13": 9, bb7: 9, b7: 10, "7": 11,
};

// Pitch class (0–11) of a given string at a given fret. fret < 0 = muted.
export const pitchClassAt = (stringIdx, fret) =>
  fret < 0 ? null : (OPEN_MIDI[stringIdx] + fret) % 12;
