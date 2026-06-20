// Small chip/tag. Pass `color` to tint the text + border (e.g. a tool accent).
export function Pill({ color, className = "", children, style, ...rest }) {
  const tint = color ? { color, borderColor: color } : undefined;
  return (
    <span
      className={`fw-pill${className ? " " + className : ""}`}
      style={{ ...tint, ...style }}
      {...rest}
    >
      {children}
    </span>
  );
}
