// Unified tab bar for every trainer. Full-bleed bottom border; tabs are
// left-aligned at natural width and scroll horizontally when they overflow.
// The active tab is tinted with the tool's registry accent, so every app shares
// one structure while keeping a subtle per-tool identity.
//   tabs: [{ id, icon, label }]
import { useEffect, useRef } from "react";
import { toolByKey } from "../tools.js";

export function TabBar({ toolKey, tabs, active, onChange, accent }) {
  const tint = accent || toolByKey(toolKey)?.accent || "var(--accent)";
  const innerRef = useRef(null);

  // One-time scroll hint: if the tabs overflow, ease the strip forward and back
  // on mount so it's obvious the bar scrolls. A hand-driven rAF tween (rather
  // than scrollTo: "smooth") so the easing is identical everywhere. Skipped when
  // there is nothing to scroll, the user already scrolled, or reduced motion is set.
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const start = setTimeout(() => {
      const overflow = el.scrollWidth - el.clientWidth;
      if (overflow <= 8 || el.scrollLeft > 4) return;
      const peek = Math.min(56, overflow);
      const FWD = 440, HOLD = 160, BACK = 520, END = FWD + HOLD + BACK;
      const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
      const t0 = performance.now();
      const tick = (now) => {
        const e = now - t0;
        let x;
        if (e < FWD) x = peek * ease(e / FWD);
        else if (e < FWD + HOLD) x = peek;
        else if (e < END) x = peek * (1 - ease((e - FWD - HOLD) / BACK));
        else x = 0;
        el.scrollLeft = x;
        if (e < END) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, 600);
    return () => { clearTimeout(start); if (raf) cancelAnimationFrame(raf); };
  }, []);

  return (
    <div className="fw-tabbar" style={{ "--tab-accent": tint }}>
      <div className="fw-tabbar-inner" ref={innerRef}>
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`fw-tab${t.id === active ? " is-active" : ""}`}
            onClick={() => onChange(t.id)}
            aria-current={t.id === active ? "page" : undefined}
          >
            {t.icon ? <span className="fw-tab-icon" aria-hidden="true">{t.icon}</span> : null}
            <span className="fw-tab-label">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
