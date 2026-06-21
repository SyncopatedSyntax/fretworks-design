// Unified app banner for every trainer. Same chrome as the shell's TopBar
// (hamburger + drawer + Ko-fi), but identifies the current tool with the brand
// LogoMark + the tool's registry name. `children` is the app-specific control
// slot (e.g. a Degrees toggle). Ko-fi collapses to a ☕ icon on narrow screens.
import { useState } from "react";
import { ToolDrawer } from "./ToolDrawer.jsx";
import { KOFI, HOME_PATH, toolByKey } from "../tools.js";

export function AppHeader({ toolKey, children }) {
  const [open, setOpen] = useState(false);
  const tool = toolByKey(toolKey);

  return (
    <>
      <header className="fw-topbar fw-appheader" style={tool?.accent ? { "--accent": tool.accent } : undefined}>
        <button
          className="fw-hamburger"
          onClick={() => setOpen(true)}
          aria-label="Open tools menu"
          aria-expanded={open}
        >
          <span /><span /><span />
        </button>

        <a className="fw-appheader-brand" href={HOME_PATH} aria-label={`${tool?.name || "Fretworks"} — all tools`}>
          <span className="fw-appheader-emoji" aria-hidden="true">{tool?.emoji}</span>
          <span className="fw-appheader-name">{tool?.name}</span>
        </a>

        <div className="fw-appheader-right">
          {children ? <div className="fw-appheader-actions">{children}</div> : null}
          <a
            className="fw-appheader-kofi"
            href={KOFI}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Support on Ko-fi"
          >
            <span className="fw-kofi-full">☕ Ko-fi</span>
            <span className="fw-kofi-icon" aria-hidden="true">☕</span>
          </a>
        </div>
      </header>

      <ToolDrawer open={open} onClose={() => setOpen(false)} current={toolKey} />
    </>
  );
}
