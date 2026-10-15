// ════════════════════════════════════════════════════════════════════════
//  Sync engine. One per page. Testable: storage, fetch, clock and reload are
//  all injected — scripts in the shell repo drive two of these as two devices.
//
//  The device copy (localStorage) stays the source of truth for the app, so
//  every trainer works offline exactly as before. The engine compares it with
//  what was last agreed with the server (`base`), sends what changed, pulls
//  what other devices changed, and merges (merge.js).
//
//  THE ONE RULE THAT MATTERS: never change a key underneath the app that is
//  running. A trainer reads its keys into React state once, at startup, and
//  later writes the WHOLE value back from that state — so a value merged in
//  behind its back would be overwritten with the stale copy and the other
//  device's practice would be lost. Remote changes to the running app's own
//  keys are therefore HELD (fwsync_held) and applied either by a reload right
//  away (if you have not touched the page yet — the launch case) or on the
//  next load, by boot(), which runs when @fretworks/design is imported: before
//  any app component has read storage.
// ════════════════════════════════════════════════════════════════════════
import { isSyncedKey, mergeValue } from './merge.js';

const K_META = 'fwsync_meta', K_BASE = 'fwsync_base', K_HELD = 'fwsync_held', K_DIRTY = 'fwsync_dirty';
const MAX_BODY = 1_500_000;     // bytes per request; Vercel's limit is 4.5 MB
const ROUNDS = 6;               // push → merge → push again (or keep paging a big first pull)

export function createSyncEngine({
  storage, fetch: fetchFn, appPrefix = null, now = () => Date.now(),
  reload = () => {}, endpoint = '/api', deviceId = null,
}) {
  // Writes the ENGINE makes must not look like the user's own changes, so it
  // keeps the original methods before boot() wraps them.
  const raw = {
    get: k => { try { return storage.getItem(k); } catch { return null; } },
    set: storage.setItem.bind(storage),
    del: storage.removeItem.bind(storage),
  };
  const rj = (k, d) => { try { const v = raw.get(k); return v === null ? d : JSON.parse(v); } catch { return d; } };
  const wj = (k, v) => { try { raw.set(k, JSON.stringify(v)); } catch { /* quota or private mode */ } };

  let meta = rj(K_META, {}) || {};
  if (!meta.device) meta.device = deviceId || Math.random().toString(36).slice(2, 10);
  let base = rj(K_BASE, {}) || {}, held = rj(K_HELD, {}) || {}, dirty = rj(K_DIRTY, {}) || {};
  const save = () => { wj(K_META, meta); wj(K_BASE, base); wj(K_HELD, held); wj(K_DIRTY, dirty); };

  let state = { status: meta.user ? 'idle' : 'off', last: meta.last || null, held: Object.keys(held).some(owned) };
  const subs = new Set();
  const emit = patch => { state = { ...state, ...patch }; subs.forEach(f => { try { f(state); } catch { /* listener bug */ } }); };
  let interacted = false, inflight = null, again = false, writeTimer = null, onWrite = null;

  function owned(k) { return !!appPrefix && k.startsWith(appPrefix); }
  // The base to merge against. `undefined` means FIRST MERGE — progress this
  // device had before it joined the account, meeting the account's — and only
  // the keys present at sign-in get it (meta.adopt). Any other key with no
  // base was simply created on two devices independently: base "absent"
  // (null), so a setting goes to the later change, as everywhere else.
  function baseFor(k) {
    const b = base[k];
    if (b) return b.v;
    return (meta.adopt || []).includes(k) ? undefined : null;
  }
  function settled(k) { if (meta.adopt && meta.adopt.includes(k)) meta.adopt = meta.adopt.filter(x => x !== k); }
  function syncedKeys() {
    const ks = new Set(Object.keys(base));
    try { for (let i = 0; i < storage.length; i++) { const k = storage.key(i); if (isSyncedKey(k)) ks.add(k); } } catch { /* storage gone */ }
    return [...ks].filter(isSyncedKey);
  }
  function write(k, v) { try { if (v === null) raw.del(k); else raw.set(k, v); } catch { /* quota */ } }

  // ── Boot: runs synchronously at import, before the app reads storage ──
  function boot() {
    // Note WHEN each key changed, so "the most recent change wins" means the
    // change, not the moment we happened to notice it.
    try {
      storage.setItem = (k, v) => { raw.set(k, v); if (isSyncedKey(k)) { dirty[k] = now(); wj(K_DIRTY, dirty); if (onWrite) onWrite(); } };
      storage.removeItem = k => { raw.del(k); if (isSyncedKey(k)) { dirty[k] = now(); wj(K_DIRTY, dirty); if (onWrite) onWrite(); } };
    } catch { /* non-writable Storage: change times fall back to sync time */ }
    applyHeld();
  }
  function applyHeld() {
    const ks = Object.keys(held);
    if (!ks.length) return false;
    for (const k of ks) {
      const R = held[k];
      const local = raw.get(k);
      const merged = mergeValue(baseFor(k), local, R.v, { localT: dirty[k], remoteT: R.t });
      if (merged !== local) write(k, merged);
      base[k] = { v: R.v, rev: R.rev }; settled(k);
      if (merged === R.v) delete dirty[k]; else dirty[k] = dirty[k] || now();
    }
    held = {};
    save();
    emit({ held: false });
    return true;
  }

  // ── What this device changed since it last agreed with the server ──────
  function collect() {
    const out = [];
    let size = 0;
    for (const k of syncedKeys()) {
      if (held[k]) continue;   // stale against the server until the app reloads
      const local = raw.get(k), b = base[k];
      if (local === (b ? b.v : null)) continue;
      const item = { key: k, value: local, baseRev: b ? b.rev : 0, t: dirty[k] || now() };
      size += k.length + (local ? local.length : 0) + 40;
      if (out.length && size > MAX_BODY) break;   // the rest goes next round
      out.push(item);
    }
    return out;
  }

  async function post(path, body) {
    let res;
    try {
      res = await fetchFn(endpoint + path, {
        method: 'POST', credentials: 'same-origin',
        headers: { 'content-type': 'application/json', 'x-fretworks': '1' },
        body: JSON.stringify(body),
      });
    } catch { return { net: true }; }
    let data = null;
    try { data = await res.json(); } catch { /* not our API (e.g. a dev server) */ }
    return { status: res.status, data };
  }

  async function syncOnce() {
    if (!meta.user) { emit({ status: 'off' }); return; }
    emit({ status: 'syncing' });
    let heldNew = false;
    for (let round = 0; round < ROUNDS; round++) {
      const changes = collect();
      const r = await post('/sync', { cursor: meta.cursor || 0, device: meta.device, changes });
      if (r.net) { emit({ status: 'offline' }); return; }
      if (r.status === 401) { emit({ status: 'auth' }); return; }
      if (r.status !== 200 || !r.data || !Array.isArray(r.data.updates)) { emit({ status: 'error' }); return; }
      const sent = Object.fromEntries(changes.map(c => [c.key, c]));
      for (const { key, rev } of r.data.applied || []) {
        base[key] = { v: sent[key].value, rev }; settled(key);
        if (raw.get(key) === sent[key].value) delete dirty[key];
      }
      // Conflicts and other devices' changes look the same from here: the
      // server's current value, which this device has not merged yet.
      const remote = {};
      for (const R of [...(r.data.conflicts || []), ...r.data.updates]) if (!remote[R.key] || remote[R.key].rev < R.rev) remote[R.key] = R;
      let changed = false;
      for (const R of Object.values(remote)) {
        if (!isSyncedKey(R.key)) continue;
        const b = base[R.key];
        if (b && b.rev >= R.rev) continue;
        if (owned(R.key)) { held[R.key] = { v: R.value, rev: R.rev, t: R.t }; heldNew = true; continue; }
        const local = raw.get(R.key);
        const merged = mergeValue(baseFor(R.key), local, R.value, { localT: dirty[R.key], remoteT: R.t });
        if (merged !== local) write(R.key, merged);
        base[R.key] = { v: R.value, rev: R.rev }; settled(R.key);
        if (merged === R.value) delete dirty[R.key];
        else { dirty[R.key] = dirty[R.key] || now(); changed = true; }
      }
      meta.cursor = Math.max(meta.cursor || 0, r.data.cursor || 0);
      save();
      if (!changed && !r.data.more && collect().length === 0) break;
    }
    meta.last = now(); save();
    emit({ status: 'idle', last: meta.last, held: Object.keys(held).some(owned) });
    // Launch case: progress from the other device has arrived for the app on
    // screen, and nobody has touched the page yet — reload now, quietly.
    if (heldNew && !interacted) applyHeldAndReload();
  }

  function sync() {
    if (inflight) { again = true; return inflight; }
    inflight = (async () => {
      try { do { again = false; await syncOnce(); } while (again); }
      finally { inflight = null; }
    })();
    return inflight;
  }

  function applyHeldAndReload() { applyHeld(); reload(); }

  return {
    boot, sync, applyHeld, applyHeldAndReload,
    getState: () => state,
    subscribe(f) { subs.add(f); f(state); return () => subs.delete(f); },
    markInteracted() { interacted = true; },
    resetInteracted() { interacted = false; },
    onLocalWrite(f) { onWrite = f; },
    scheduleSoon(ms = 4000) { clearTimeout(writeTimer); writeTimer = setTimeout(() => sync(), ms); },
    user: () => meta.user || null,
    hasUnsynced: () => collect().length > 0 || Object.keys(held).length > 0,

    // A sign-in succeeded. Progress already on this device joins the account
    // (first merge: no base, so the account's settings win and practice is
    // combined). A DIFFERENT user's progress left on the device is cleared
    // first — it is safe on the server, and must never merge into this one.
    adoptUser(name) {
      if (meta.user && meta.user !== name) clearLocal();
      if (meta.user !== name) { meta.user = name; meta.cursor = 0; base = {}; held = {}; meta.adopt = syncedKeys(); }
      save();
      emit({ status: 'idle', held: false });
      return sync();
    },
    // Signing out leaves the device clean for the next person. The caller
    // checks hasUnsynced() first and asks before throwing anything away.
    signOutLocal() {
      clearLocal();
      meta.user = null; meta.cursor = 0; meta.last = null; meta.adopt = [];
      for (const k of [K_BASE, K_HELD, K_DIRTY]) write(k, null);
      wj(K_META, meta);                // keeps only this device's id
      emit({ status: 'off', last: null, held: false });
    },
    // The server says the session is gone (expired, or signed out elsewhere):
    // keep everything, so signing back in carries straight on.
    forgetSession() { emit({ status: 'auth' }); },
  };

  function clearLocal() {
    for (const k of syncedKeys()) write(k, null);
    base = {}; held = {}; dirty = {};
  }
}
