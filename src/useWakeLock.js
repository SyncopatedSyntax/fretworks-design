// Keep the screen awake while practising.
//
// Reading a chord chart with a guitar in your hands means not touching the
// phone for minutes at a time, which is exactly when iOS dims and locks it.
// The Screen Wake Lock API fixes that.
//
// Support notes, because this one has a trap. Safari has had the API since iOS
// 16.4 — the same baseline the audio stack's `navigator.audioSession` fix
// assumes — but a WebKit bug meant it did nothing in *installed* PWAs until iOS
// 18.4 (webkit.org/b/254545). Standalone is how this toolbox is meant to be
// used, so on an older iPhone the toggle would be a switch that lies. Hence
// `wakeLockSupported()` and a control that hides itself rather than pretending.
// A `<video>`-loop shim for those older versions is deliberately not here: it
// would fight the silent looping <audio> element the iOS audio fix already
// keeps alive, for a version that is well over a year old.
//
// The lock lives on the document that holds it. Trainers are separate zones
// reached by a real navigation, so each page acquires its own — which is why
// this ships to every trainer rather than living in the shell like the backup
// screen does. The preference is per-origin localStorage, and every trainer is
// proxied onto one origin, so turning it on in one turns it on in all of them.

import { useCallback, useEffect, useRef, useState } from "react";

const KEY = "fw_wakelock";

export function wakeLockSupported() {
  return typeof navigator !== "undefined" && "wakeLock" in navigator;
}

function readPref() {
  try { return localStorage.getItem(KEY) === "1"; } catch { return false; }
}
function writePref(on) {
  try { localStorage.setItem(KEY, on ? "1" : "0"); } catch { /* private mode */ }
}

export function useWakeLock() {
  const supported = wakeLockSupported();
  const [enabled, setEnabled] = useState(() => supported && readPref());
  const [active, setActive] = useState(false);
  const sentinel = useRef(null);

  const release = useCallback(async () => {
    const s = sentinel.current;
    sentinel.current = null;
    setActive(false);
    if (s && !s.released) { try { await s.release(); } catch { /* already gone */ } }
  }, []);

  useEffect(() => {
    if (!supported || !enabled) { release(); return undefined; }
    let cancelled = false;

    const acquire = async () => {
      // request() rejects outright unless the document is visible, and can also
      // reject for reasons outside our control (low battery, power saving).
      if (document.visibilityState !== "visible") return;
      if (sentinel.current && !sentinel.current.released) return;
      try {
        const s = await navigator.wakeLock.request("screen");
        if (cancelled) { try { await s.release(); } catch { /* raced */ } return; }
        sentinel.current = s;
        setActive(true);
        // The browser drops the lock on its own terms — backgrounding, a call,
        // the screen being locked manually. Reflect that instead of showing a
        // lock we no longer hold.
        s.addEventListener("release", () => { if (sentinel.current === s) sentinel.current = null; setActive(false); });
      } catch {
        setActive(false);
      }
    };

    // Re-acquire whenever the page comes back. Without this the lock works
    // exactly once and then quietly stops after the first app switch, which is
    // the classic way this feature ships broken.
    const onVisibility = () => { if (document.visibilityState === "visible") acquire(); };

    acquire();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      release();
    };
  }, [supported, enabled, release]);

  const toggle = useCallback(() => {
    setEnabled((prev) => { const next = !prev; writePref(next); return next; });
  }, []);

  return { supported, enabled, active, toggle };
}
