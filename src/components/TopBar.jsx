// Global top bar shown at the top of every zone (shell + each trainer) so the
// chrome is identical everywhere. Holds the brand mark, a hamburger that opens
// the cross-tool drawer, and the Ko-fi link. `current` is the active tool key
// (or undefined on the shell). Drawer state is managed internally.
import { useState } from "react";
import { LogoMark } from "../logo.jsx";
import { ToolDrawer } from "./ToolDrawer.jsx";
import { BRAND, KOFI, HOME_PATH, toolByKey } from "../tools.js";

export function TopBar({ current, homeHref = HOME_PATH }) {
  const [open, setOpen] = useState(false);
  const tool = current ? toolByKey(current) : null;

  return (
    <>
      <header className="fw-topbar">
        <button
          className="fw-hamburger"
          onClick={() => setOpen(true)}
          aria-label="Open tools menu"
          aria-expanded={open}
        >
          <span /><span /><span />
        </button>

        <a className="fw-brand" href={homeHref} aria-label={`${BRAND} home`}>
          <LogoMark size={26} />
          <span className="fw-brand-name">{BRAND}</span>
          {tool ? <span className="fw-brand-tool">{tool.name}</span> : null}
        </a>

        <a
          className="fw-kofi-link"
          href={KOFI}
          target="_blank"
          rel="noopener noreferrer"
        >
          ☕ Ko-fi
        </a>
      </header>

      {/* Rendered OUTSIDE the backdrop-filtered topbar so the fixed drawer
          sizes against the viewport, not the 58px-tall header. */}
      <ToolDrawer open={open} onClose={() => setOpen(false)} current={current} />
    </>
  );
}
