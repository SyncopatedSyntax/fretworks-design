// Slide-out tool switcher. Lists every tool plus Home. Links are plain anchors
// because tools live in separate Vercel zones — switching is a full navigation
// to another same-origin path (/chord, /diatonic, …). `current` highlights the
// active tool. Controlled via `open` / `onClose`.
import { useEffect, useState } from "react";
import { TOOLS, HOME_PATH, BRAND, KOFI } from "../tools.js";

// Force-fetch the latest deploy: ask the (shell-owned, scope "/") service worker
// to check for a new version, then reload. Navigations are network-first, so the
// reload pulls fresh HTML + assets even before the new worker fully takes over.
function updateApp(setBusy) {
  setBusy(true);
  const reload = () => window.location.reload();
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .getRegistration()
      .then((reg) => (reg ? reg.update() : null))
      .catch(() => {})
      .finally(reload);
  } else {
    reload();
  }
}

// Share the toolbox: native share sheet where available (iOS/Android), else copy
// the link to the clipboard with a brief confirmation.
function shareToolbox(setCopied) {
  const url = window.location.origin + "/";
  const data = { title: BRAND, text: `${BRAND} — a free toolbox of guitar trainers.`, url };
  if (navigator.share) {
    navigator.share(data).catch(() => {});
    return;
  }
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }
}

export function ToolDrawer({ open, onClose, current }) {
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  // Close on Escape; lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <div className={`fw-drawer-root${open ? " is-open" : ""}`} aria-hidden={!open}>
      <div className="fw-drawer-overlay" onClick={onClose} />
      <nav className="fw-drawer" aria-label="Tools">
        <div className="fw-drawer-head">
          <a className="fw-drawer-title" href="/" aria-label={`${BRAND} home`}>{BRAND}</a>
          <button className="fw-drawer-close" onClick={onClose} aria-label="Close menu">
            ✕
          </button>
        </div>
        <ul className="fw-drawer-list">
          {TOOLS.map((t) => {
            const active = t.key === current;
            return (
              <li key={t.key}>
                <a
                  className={`fw-drawer-item${active ? " is-active" : ""}`}
                  href={t.path}
                  aria-current={active ? "page" : undefined}
                  style={{ "--accent": t.accent }}
                >
                  <span className="fw-drawer-emoji" aria-hidden="true">
                    {t.emoji}
                  </span>
                  <span className="fw-drawer-name">{t.name}</span>
                </a>
              </li>
            );
          })}
          <li className="fw-drawer-sep" />
          <li>
            <a className="fw-drawer-item" href={HOME_PATH}>
              <span className="fw-drawer-emoji" aria-hidden="true">
                🏠
              </span>
              <span className="fw-drawer-name">All tools</span>
            </a>
          </li>
        </ul>
        <div className="fw-drawer-foot">
          <button
            className="fw-drawer-update"
            onClick={() => updateApp(setBusy)}
            disabled={busy}
            aria-label="Update the app to the latest version"
          >
            {busy ? "↻ Updating…" : "↻ Update app"}
          </button>
          <button
            className="fw-drawer-share"
            onClick={() => shareToolbox(setCopied)}
            aria-label="Share Fretworks with others"
          >
            {copied ? "✓ Link copied" : "↗ Share toolbox"}
          </button>
          <a
            className="fw-drawer-kofi"
            href={KOFI}
            target="_blank"
            rel="noopener noreferrer"
          >
            ☕ Support on Ko-fi
          </a>
        </div>
      </nav>
    </div>
  );
}
