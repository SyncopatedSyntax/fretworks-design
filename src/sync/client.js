// The page's sync engine, and the account calls that drive it.
//
// The engine is created and booted WHEN THIS PACKAGE IS IMPORTED — that is
// the point. Every trainer imports @fretworks/design before any of its
// components render, so boot() applies progress held for the open app before
// the app reads localStorage. (Verified: no trainer reads storage at module
// load; they all read inside components.) startSync() — the network side —
// is started by ToolDrawer, which every page mounts.
import { useEffect, useState } from 'react';
import { createSyncEngine } from './engine.js';
import { TOOLS } from '../tools.js';

const API = '/api';
let engine = null;

if (typeof window !== 'undefined') {
  try {
    const path = window.location.pathname;
    const tool = TOOLS.find(t => { const b = t.path.replace(/\/$/, ''); return path === b || path.startsWith(b + '/'); });
    engine = createSyncEngine({
      storage: window.localStorage,
      fetch: (...a) => window.fetch(...a),
      appPrefix: tool?.storage || null,
      reload: () => window.location.reload(),
      endpoint: API,
    });
    engine.boot();
  } catch { engine = null; }   // private mode or no storage: the apps work as before, unsynced
}

export const getSync = () => engine;

let started = false;
export function startSync() {
  if (!engine || started) return;
  started = true;
  const kick = () => { engine.sync(); };
  engine.onLocalWrite(() => engine.scheduleSoon());
  const touched = () => engine.markInteracted();
  window.addEventListener('pointerdown', touched, { capture: true, passive: true });
  window.addEventListener('keydown', touched, { capture: true, passive: true });
  // Coming back after a while counts as a fresh launch: if another device's
  // progress for this app arrives before you touch anything, reload quietly.
  // Back after a moment (a glance at a message mid-drill) does not.
  let hiddenAt = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') { hiddenAt = Date.now(); kick(); return; }
    if (hiddenAt && Date.now() - hiddenAt > 10 * 60 * 1000) engine.resetInteracted();
    kick();
  });
  window.addEventListener('online', kick);
  setInterval(() => { if (document.visibilityState === 'visible') kick(); }, 2 * 60 * 1000);
  kick();
}

export function useSyncState() {
  const [s, set] = useState(() => (engine ? engine.getState() : { status: 'unavailable' }));
  useEffect(() => (engine ? engine.subscribe(set) : undefined), []);
  return { ...s, user: engine ? engine.user() : null };
}

// ── Account ──────────────────────────────────────────────────────────────
async function call(op, body = {}) {
  try {
    const res = await window.fetch(API + '/auth', {
      method: 'POST', credentials: 'same-origin',
      headers: { 'content-type': 'application/json', 'x-fretworks': '1' },
      body: JSON.stringify({ op, ...body }),
    });
    let data = {};
    try { data = await res.json(); } catch { data = { error: 'The account service is not available here.' }; }
    return { ok: res.ok, status: res.status, ...data };
  } catch {
    return { ok: false, status: 0, error: 'You are offline. Connect to the internet and try again.' };
  }
}

export const account = {
  async me() {
    try {
      const res = await window.fetch(API + '/auth', { credentials: 'same-origin', headers: { 'x-fretworks': '1' } });
      if (!res.ok) return null;
      return (await res.json()).user || null;
    } catch { return null; }
  },
  async signUp(username, password) {
    const r = await call('signup', { username, password });
    if (r.ok && engine) await engine.adoptUser(r.user.name);
    return r;
  },
  async signIn(username, password) {
    const r = await call('login', { username, password });
    if (r.ok && engine) await engine.adoptUser(r.user.name);
    return r;
  },
  // `force` signs out even with changes that have not reached the server.
  async signOut({ force = false } = {}) {
    if (engine) {
      await engine.sync();
      if (!force && engine.hasUnsynced()) return { ok: false, unsynced: true };
    }
    await call('logout');
    if (engine) engine.signOutLocal();
    return { ok: true };
  },
  changePassword: (current, next) => call('password', { current, next }),
  newRecoveryCode: password => call('newcode', { password }),
  async recover(username, code, next) {
    const r = await call('recover', { username, code, next });
    if (r.ok && engine) await engine.adoptUser(r.user.name);
    return r;
  },
  async deleteAccount(password) {
    const r = await call('delete', { password });
    if (r.ok && engine) engine.signOutLocal();
    return r;
  },
  adminReset: (username, next) => call('admin-reset', { username, next }),
  syncNow: () => (engine ? engine.sync() : Promise.resolve()),
  hasUnsynced: () => (engine ? engine.hasUnsynced() : false),
  deviceUser: () => (engine ? engine.user() : null),
};
