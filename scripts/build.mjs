// Builds the publishable dist/ from src/. Components are authored in JSX and
// bundled to ESM so the 5 consuming apps can import plain JS (no JSX transform
// needed inside node_modules). CSS files are concatenated/copied as-is.
import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const src = join(root, "src");
const dist = join(root, "dist");
mkdirSync(dist, { recursive: true });

await build({
  entryPoints: [join(src, "index.js")],
  bundle: true,
  format: "esm",
  outfile: join(dist, "index.js"),
  jsx: "automatic",
  external: ["react", "react-dom", "react/jsx-runtime"],
  logLevel: "info",
});

// CSS: copy the three layers, then emit a convenience styles.css that pulls
// them in the right cascade order (fonts -> tokens -> components).
for (const f of ["tokens.css", "fonts.css", "components.css"]) {
  copyFileSync(join(src, f), join(dist, f));
}
writeFileSync(
  join(dist, "styles.css"),
  `@import "./fonts.css";\n@import "./tokens.css";\n@import "./components.css";\n`
);

console.log("build: wrote dist/index.js + css layers");
