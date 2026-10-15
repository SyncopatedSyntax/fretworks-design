// The sync line at the top of the tool drawer, and the "updated from another
// device" note. Both read the page's sync engine (sync/client.js).
import { useEffect, useState } from 'react';
import { useSyncState, getSync } from '../sync/client.js';

export const ACCOUNT_PATH = '/account';

function ago(t) {
  if (!t) return '';
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 45) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return new Date(t).toLocaleDateString();
}

export function SyncStatus() {
  const s = useSyncState();
  // Re-render once a minute so "2 min ago" does not freeze.
  const [, tick] = useState(0);
  useEffect(() => { const id = setInterval(() => tick(n => n + 1), 60000); return () => clearInterval(id); }, []);
  if (s.status === 'unavailable') return null;

  let icon = '☁', line, sub = null, warn = false;
  if (!s.user) { line = 'Sign in to sync'; sub = 'Keep your progress on every device'; }
  else {
    line = s.user;
    if (s.status === 'syncing') sub = 'Syncing…';
    else if (s.status === 'offline') sub = 'Offline — will sync when you’re back online';
    else if (s.status === 'auth') { sub = 'Signed out on the server — sign in again'; warn = true; icon = '⚠'; }
    else if (s.status === 'error') { sub = 'Couldn’t sync — will try again'; warn = true; }
    else sub = s.last ? `Synced ${ago(s.last)}` : 'Not synced yet';
  }
  return (
    <a className={`fw-drawer-sync${warn ? ' is-warn' : ''}`} href={ACCOUNT_PATH}>
      <span className="fw-drawer-sync-icon" aria-hidden="true">{icon}</span>
      <span className="fw-drawer-sync-text">
        <span className="fw-drawer-sync-line">{line}</span>
        {sub && <span className="fw-drawer-sync-sub">{sub}</span>}
      </span>
      <span className="fw-drawer-sync-go" aria-hidden="true">›</span>
    </a>
  );
}

// Progress for the app on screen came in from another device after you had
// started using it. It is held, never merged under the running app (see
// sync/engine.js), until you choose to refresh — so it can never interrupt a
// drill.
export function SyncHeldNote() {
  const s = useSyncState();
  if (!s.held) return null;
  return (
    <div className="fw-sync-note" role="status">
      <span>Progress from another device is ready.</span>
      <button onClick={() => getSync()?.applyHeldAndReload()}>Refresh</button>
    </div>
  );
}
