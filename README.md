# @fretworks/design

Shared design system for the Fretworks toolbox — one source of truth for colours,
typography, spacing, the degree-colour language, the tool registry, and the
cross-zone chrome (top bar, tool drawer, install prompt).

## What's inside

| Export | What |
| --- | --- |
| `tokens` | Flat JS object of every token (for inline styles): `tokens.bg`, `tokens.fsXl`, … |
| `@fretworks/design/tokens.css` | The same tokens as CSS custom properties (`--bg`, `--fs-xl`, …) |
| `@fretworks/design/fonts.css` | Brand webfonts (Fraunces / Space Grotesk / JetBrains Mono) |
| `@fretworks/design/components.css` | Styles for the `fw-*` components |
| `@fretworks/design/styles.css` | Convenience bundle = fonts + tokens + components |
| `DC`, `NOTE_NAMES`, `OPEN_MIDI`, … | Music-theory constants (from `theory.js`) |
| `TOOLS`, `HOME_PATH`, `LEARNING_PATH`, `KOFI`, `BRAND` | Tool registry (`tools.js`) |
| `TopBar`, `ToolDrawer`, `Button`, `Card`, `Pill`, `InstallPrompt`, `LogoMark` | React components |

## Usage

```jsx
import "@fretworks/design/styles.css";
import { TopBar, tokens, DC } from "@fretworks/design";

export default function App() {
  return (
    <div style={{ background: tokens.bg, color: tokens.text }}>
      <TopBar current="chord" />
      {/* … */}
    </div>
  );
}
```

The shell (fretworks) additionally renders `<InstallPrompt />` — exactly one per
origin.

## Editing tokens

Edit **`tokens.json`** only, then `npm run build`. The generator
(`scripts/gen-tokens.mjs`) rewrites both `src/tokens.css` and `src/tokens.js`
from it, so the CSS variables and the JS object can never drift.

## Distribution / deploy ⚠️

The five apps are **separate repos** built independently on Vercel, so a local
`file:../fretworks-design` link works for **local dev only**. Before deploying,
publish this package so each repo can resolve it on Vercel:

- **npm** (recommended): `npm publish --access public`, then each app depends on
  `"@fretworks/design": "^0.1.0"`.
- **git** (no registry): each app depends on
  `"@fretworks/design": "github:<owner>/fretworks-design#<tag>"`.

Bump the version here and in each app to roll out a design change.
