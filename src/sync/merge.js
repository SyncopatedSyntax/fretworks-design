// ════════════════════════════════════════════════════════════════════════
//  Sync — what syncs, and how two copies of a value become one.
//  Pure: no DOM, no network. scripts/test-sync.mjs exercises all of it.
//
//  Every value is the exact string localStorage holds (or null = absent).
//  Merging is three-way: BASE is the version this device last agreed with
//  the server on, LOCAL is what is on the device now, REMOTE is what the
//  server has now. A side that still equals the base did not change, so the
//  other side wins outright; only when BOTH changed do we look inside.
// ════════════════════════════════════════════════════════════════════════

// Keys that never leave the device. The GitHub backup's keys (`fwbk_`) hold a
// token and must never be uploaded anywhere — the server refuses them too.
// `fwsync_` is this engine's own bookkeeping. The rest are per-device hints
// and counters: an install banner dismissed on the phone has nothing to say
// about the laptop, and the screen-awake toggle is a property of a device.
const DEVICE_ONLY = [
  /^fwbk_/, /^fwsync_/,
  /^fw_install_dismissed$/, /^fw_wakelock$/,
  /_ios_hint$/, /_audio_hint/, /_launches$/, /_launched$/,
];
export const isSyncedKey = k => typeof k === 'string' && k.length > 0 && k.length <= 200 && !DEVICE_ONLY.some(r => r.test(k));

// Key order must not make two equal objects look different.
export function canon(v) {
  if (v === undefined) return 'undefined';
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
  return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}';
}
const same = (a, b) => canon(a) === canon(b);
const isPlain = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const parse = s => { if (s === null || s === undefined) return { ok: true, v: null }; try { return { ok: true, v: JSON.parse(s) }; } catch { return { ok: false }; } };

// Two versions of ONE entry that both changed — e.g. the same practice card
// answered on two devices while both were offline. Whichever has been
// practised more (`seen`, written by every SRS trainer's grade()) is the
// truthful one. Without a counter, the more recent change wins; on a first
// merge (no base: a device's guest progress meeting an account) the account
// wins, so defaults a fresh device wrote on its first launch cannot overwrite
// settings the account already has.
function pickEntry(l, r, ctx) {
  if (l === undefined) return r;
  if (r === undefined) return l;
  if (isPlain(l) && isPlain(r) && typeof l.seen === 'number' && typeof r.seen === 'number' && l.seen !== r.seen)
    return l.seen > r.seen ? l : r;
  if (ctx.firstMerge) return r;
  return (ctx.localT || 0) > (ctx.remoteT || 0) ? l : r;
}

// Entry by entry: a card practised on one device and a different card on
// the other both survive. An entry deleted on one side and untouched on the
// other is deleted (that is how "Reset progress" travels), but deleted on
// one side and CHANGED on the other is kept — practice beats a deletion.
function mergeObjects(b, l, r, ctx) {
  const out = {};
  const keys = new Set([...Object.keys(l), ...Object.keys(r), ...(b ? Object.keys(b) : [])]);
  for (const k of keys) {
    const lv = l[k], rv = r[k], bv = b ? b[k] : undefined;
    let v;
    if (same(lv, rv)) v = lv;
    else if (b && same(lv, bv)) v = rv;
    else if (b && same(rv, bv)) v = lv;
    else v = pickEntry(lv, rv, ctx);
    if (v !== undefined) out[k] = v;
  }
  return out;
}

// Lists. Lists of plain values (mastered chord ids, tunes taken on) merge as
// sets; lists of objects that all carry an `id` (Focused Chord Trainer's
// library) merge entry by entry, like an object keyed by id. Order follows
// this device, with the other device's additions appended.
function mergeArrays(b, l, r, ctx) {
  const prim = a => a.every(x => x === null || typeof x !== 'object');
  const ided = a => a.every(x => isPlain(x) && (typeof x.id === 'string' || typeof x.id === 'number'));
  const all = [l, r, ...(b ? [b] : [])];
  if (all.every(prim)) {
    const key = canon, inB = new Set((b || []).map(key)), inL = new Set(l.map(key)), inR = new Set(r.map(key));
    const keep = x => !(b && inB.has(key(x)) && (!inL.has(key(x)) || !inR.has(key(x))));
    const out = [], seen = new Set();
    for (const x of [...l, ...r]) { const k = key(x); if (!seen.has(k) && keep(x)) { seen.add(k); out.push(x); } }
    return out;
  }
  if (all.every(ided)) {
    const byId = a => Object.fromEntries(a.map(x => [String(x.id), x]));
    const m = mergeObjects(b ? byId(b) : null, byId(l), byId(r), ctx);
    const order = [...l.map(x => String(x.id)), ...r.map(x => String(x.id))];
    const out = [], seen = new Set();
    for (const id of order) if (!seen.has(id) && m[id] !== undefined) { seen.add(id); out.push(m[id]); }
    return out;
  }
  return null;   // no safe structural merge — caller falls back to whole value
}

// The merge. `base` is undefined when there is no base at all (first merge),
// null when the base was "absent". Returns the merged string, or null for
// "delete the key". When one side wins outright its ORIGINAL string comes
// back untouched — a value stored as a bare string must not gain quotes.
export function mergeValue(base, local, remote, ctx = {}) {
  ctx = { ...ctx, firstMerge: base === undefined };
  if (local === remote) return local;
  if (base !== undefined) {
    if (local === base) return remote;
    if (remote === base) return local;
  }
  // A deletion against a change keeps the change; against an absent side,
  // the present side.
  if (local === null) return remote;
  if (remote === null) return local;
  const L = parse(local), R = parse(remote), B = parse(base === undefined ? null : base);
  if (L.ok && R.ok && B.ok) {
    if (same(L.v, R.v)) return local;
    // Same content as the base, just written in a different key order:
    // that side did not really change.
    if (base !== undefined && base !== null) {
      if (same(L.v, B.v)) return remote;
      if (same(R.v, B.v)) return local;
    }
    const bv = base === undefined || base === null ? null : B.v;
    if (isPlain(L.v) && isPlain(R.v) && (bv === null || isPlain(bv)))
      return JSON.stringify(mergeObjects(bv, L.v, R.v, ctx));
    if (Array.isArray(L.v) && Array.isArray(R.v) && (bv === null || Array.isArray(bv))) {
      const m = mergeArrays(bv, L.v, R.v, ctx);
      if (m) return JSON.stringify(m);
    }
  }
  // A plain value (a setting, a key, a label mode) changed on both sides.
  if (ctx.firstMerge) return remote;
  return (ctx.localT || 0) > (ctx.remoteT || 0) ? local : remote;
}
