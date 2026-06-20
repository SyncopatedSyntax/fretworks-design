// Unified tab bar for every trainer. Full-bleed bottom border; tabs are
// left-aligned at natural width and scroll horizontally when they overflow.
// The active tab is tinted with the tool's registry accent, so every app shares
// one structure while keeping a subtle per-tool identity.
//   tabs: [{ id, icon, label }]
import { toolByKey } from "../tools.js";

export function TabBar({ toolKey, tabs, active, onChange, accent }) {
  const tint = accent || toolByKey(toolKey)?.accent || "var(--accent)";
  return (
    <div className="fw-tabbar" style={{ "--tab-accent": tint }}>
      <div className="fw-tabbar-inner">
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
