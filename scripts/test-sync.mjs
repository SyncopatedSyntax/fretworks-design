// The merge rules, case by case and then at random.
//
//   node scripts/test-sync.mjs
//
// The end-to-end test (two devices, real server, real Postgres) lives in the
// shell repo: fretworks/scripts/verify-sync.mjs.
import { mergeValue, isSyncedKey, canon } from '../src/sync/merge.js';

let failures = 0, assertions = 0;
const check = (name, fn) => { try { fn(); console.log(`  ✓ ${name}`); } catch (e) { failures++; console.log(`  ✗ ${name}\n      ${e.message}`); } };
const fail = m => { throw new Error(m); };
const eq = (got, want, what) => { assertions++; if (canon(got) !== canon(want)) fail(`${what}: got ${canon(got)}, expected ${canon(want)}`); };
const J = JSON.stringify, P = s => (s === null ? null : JSON.parse(s));
const m = (b, l, r, ctx) => P(mergeValue(b === undefined ? undefined : b === null ? null : J(b), l === null ? null : J(l), r === null ? null : J(r), ctx));

console.log('\nWhat syncs');
check('device-only keys never sync; progress does', () => {
  for (const k of ['fwbk_config', 'fwbk_last', 'fwsync_base', 'fw_install_dismissed', 'fw_wakelock', 'at_ios_hint', 'bs_ios_hint', 'ct_launches', 'ct_launched', 'ct_audio_hint_launch', 'fct_audio_hint_launch2', 'fct_launches'])
    eq(isSyncedKey(k), false, k);
  for (const k of ['at_srs', 'bs_settings', 'js_charts', 'fct_chords', 'fct_seeded', 'ct_mastered', 'nt_srs', 'tri_level', 'cof_home', 'dc_srs', 'mm_mode'])
    eq(isSyncedKey(k), true, k);
});

console.log('\nOne side changed');
check('unchanged here → take theirs; unchanged there → keep mine; same → same', () => {
  eq(mergeValue('a', 'a', 'b'), 'b', 'take remote'); eq(mergeValue('a', 'b', 'a'), 'b', 'keep local'); eq(mergeValue('a', 'c', 'c'), 'c', 'agree');
});
check('a value that wins outright keeps its exact string (no added quotes)', () => {
  eq(mergeValue(J('degrees'), 'notes', J('degrees')), 'notes', 'bare string kept bare');
  eq(mergeValue('9', '9', ' 9'), ' 9', 'remote string untouched');
});
check('deletions: deleted here & untouched there → deleted; deleted here & changed there → kept', () => {
  eq(mergeValue('x', null, 'x'), null, 'delete travels'); eq(mergeValue('x', null, 'y'), 'y', 'change beats delete'); eq(mergeValue('x', 'y', null), 'y', 'both ways');
});

console.log('\nBoth changed — objects, entry by entry');
check('different entries on each side both survive', () => {
  eq(m({ a: 1, b: 1 }, { a: 2, b: 1 }, { a: 1, b: 3, c: 4 }), { a: 2, b: 3, c: 4 }, 'merged');
});
check('an entry deleted on one side and untouched on the other is deleted', () => {
  eq(m({ a: 1, b: 1 }, { a: 1 }, { a: 1, b: 1, c: 2 }), { a: 1, c: 2 }, 'b gone, c added');
});
check('Reset progress ({}) clears everything the other side did not touch', () => {
  eq(m({ a: 1, b: 1 }, {}, { a: 1, b: 1, z: 9 }), { z: 9 }, 'only the new card survives');
});
check('the same card answered on both: the one practised more wins (seen)', () => {
  eq(m({ c: { seen: 3 } }, { c: { seen: 5, reps: 2 } }, { c: { seen: 4, reps: 9 } }), { c: { seen: 5, reps: 2 } }, 'local more');
  eq(m({ c: { seen: 3 } }, { c: { seen: 4, reps: 2 } }, { c: { seen: 7, reps: 0 } }), { c: { seen: 7, reps: 0 } }, 'remote more');
});
check('an entry without a counter: the later change wins', () => {
  eq(m({ s: { a: 1 } }, { s: { a: 2 } }, { s: { a: 3 } }, { localT: 200, remoteT: 100 }), { s: { a: 2 } }, 'local later');
  eq(m({ s: { a: 1 } }, { s: { a: 2 } }, { s: { a: 3 } }, { localT: 100, remoteT: 200 }), { s: { a: 3 } }, 'remote later');
});
check('key order never matters', () => {
  eq(mergeValue(J({ a: 1, b: 2 }), J({ b: 2, a: 1 }), J({ a: 1, b: 3 })), J({ a: 1, b: 3 }), 'reordered local = unchanged');
});

console.log('\nBoth changed — plain values and lists');
check('a setting: the later change wins', () => {
  eq(mergeValue('4', '7', '9', { localT: 10, remoteT: 20 }), '9', 'remote later'); eq(mergeValue('4', '7', '9', { localT: 30, remoteT: 20 }), '7', 'local later');
});
check('lists of ids merge as sets (additions kept, removals travel)', () => {
  eq(m([1, 2], [1, 2, 3], [2, 4]), [2, 3, 4], 'merged');
});
check('lists of objects with ids merge per id; a changed one beats a deletion', () => {
  const b = [{ id: 'a', v: 1 }, { id: 'b', v: 1 }];
  eq(m(b, [{ id: 'a', v: 2 }, { id: 'b', v: 1 }], [{ id: 'b', v: 1 }, { id: 'c', v: 1 }]), [{ id: 'a', v: 2 }, { id: 'b', v: 1 }, { id: 'c', v: 1 }], 'a kept (changed), c added');
});
check('anything else falls back to the later change, whole', () => {
  eq(mergeValue(J([{ x: 1 }]), J([{ x: 2 }]), J([{ x: 3 }]), { localT: 1, remoteT: 2 }), J([{ x: 3 }]), 'mixed list');
});

console.log('\nFirst merge (a device’s guest progress meeting the account)');
check('settings: the account wins over a fresh device’s defaults', () => {
  eq(mergeValue(undefined, '9', '4', { localT: 999, remoteT: 1 }), '4', 'account kept even though local is newer');
});
check('progress: combined, and the card practised more wins', () => {
  eq(m(undefined, { a: { seen: 10 }, b: { seen: 1 } }, { b: { seen: 3 }, c: { seen: 1 } }), { a: { seen: 10 }, b: { seen: 3 }, c: { seen: 1 } }, 'union');
});
check('a key created on two devices independently (base absent) is NOT a first merge', () => {
  eq(mergeValue(null, '2', '7', { localT: 50, remoteT: 40 }), '2', 'later change wins');
});

console.log('\nAt random');
check('5000 random two-device edits to a practice map: nothing practised is lost', () => {
  let seed = 7;
  const rnd = n => { seed = (seed * 1103515245 + 12345) >>> 0; return seed % n; };
  for (let it = 0; it < 5000; it++) {
    const base = {};
    for (let i = 0; i < rnd(8); i++) base['c' + i] = { seen: 1 + rnd(5) };
    const edit = (src, tag) => {
      const o = JSON.parse(J(src));
      for (const k of Object.keys(o)) { const r = rnd(4); if (r === 0) delete o[k]; else if (r === 1) o[k] = { seen: o[k].seen + 1 + rnd(3) + (tag === 'L' ? 0 : 10) }; }
      for (let i = 0; i < rnd(3); i++) o[tag + it + '_' + i] = { seen: 1 };
      return o;
    };
    const L = edit(base, 'L'), R = edit(base, 'R');
    const out = m(base, L, R), sym = m(base, R, L);
    if (canon(out) !== canon(sym)) fail(`not symmetric at ${it}`);
    for (const k of new Set([...Object.keys(L), ...Object.keys(R)])) {
      const lc = L[k] && (!base[k] || canon(L[k]) !== canon(base[k])), rc = R[k] && (!base[k] || canon(R[k]) !== canon(base[k]));
      if ((lc || rc) && !out[k]) fail(`practised card ${k} lost at ${it}`);
      if (lc && rc && out[k].seen !== Math.max(L[k].seen, R[k].seen)) fail(`card ${k}: not the more-practised version at ${it}`);
    }
    for (const k of Object.keys(base)) {
      const ld = !(k in L), rd = !(k in R), lu = canon(L[k]) === canon(base[k]), ru = canon(R[k]) === canon(base[k]);
      if ((ld && (rd || ru)) || (rd && lu)) { if (k in out) fail(`deleted card ${k} came back at ${it}`); }
    }
    assertions += 3;
  }
});

console.log(failures === 0 ? `\nAll checks passed. ${assertions} assertions.\n` : `\n${failures} check(s) failed.\n`);
process.exit(failures === 0 ? 0 : 1);
