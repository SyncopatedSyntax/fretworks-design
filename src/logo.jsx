// Fretworks wordmark + mark. The mark is a small fretboard fragment with three
// colour-coded dots (root / colour / tension) — a miniature of the toolbox idea.
export function LogoMark({ size = 28, title = "Fretworks" }) {
  const w = (size / 28) * 36;
  return (
    <svg
      width={w}
      height={size}
      viewBox="0 0 36 28"
      role="img"
      aria-label={title}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* strings */}
      {[4, 10, 16, 22].map((y) => (
        <line key={y} x1="2" y1={y} x2="34" y2={y} stroke="#2a2840" strokeWidth="1.5" />
      ))}
      {/* nut + frets */}
      <line x1="3" y1="2" x2="3" y2="24" stroke="#c8c4dc" strokeWidth="2.5" />
      {[13, 24].map((x) => (
        <line key={x} x1={x} y1="2" x2={x} y2="24" stroke="#2a2840" strokeWidth="1.5" />
      ))}
      {/* colour-coded dots: root, colour, tension */}
      <circle cx="8" cy="10" r="3.4" fill="#ff4757" />
      <circle cx="18.5" cy="16" r="3.4" fill="#2ed573" />
      <circle cx="29" cy="4" r="3.4" fill="#7c5cbf" />
    </svg>
  );
}
