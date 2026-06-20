// Slide-out tool switcher. Lists every tool plus Home. Links are plain anchors
// because tools live in separate Vercel zones — switching is a full navigation
// to another same-origin path (/chord, /diatonic, …). `current` highlights the
// active tool. Controlled via `open` / `onClose`.
import { useEffect } from "react";
import { TOOLS, HOME_PATH, BRAND, KOFI } from "../tools.js";

export function ToolDrawer({ open, onClose, current }) {
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
          <span className="fw-drawer-title">{BRAND}</span>
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
        <a
          className="fw-drawer-kofi"
          href={KOFI}
          target="_blank"
          rel="noopener noreferrer"
        >
          ☕ Support on Ko-fi
        </a>
      </nav>
    </div>
  );
}
