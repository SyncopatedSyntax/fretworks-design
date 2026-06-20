// Generic surface card with an optional left accent bar. Render as a link by
// passing `href`. `accent` colours the bar + hover glow (a tool's accent).
export function Card({ href, accent, className = "", style, children, ...rest }) {
  const vars = accent ? { "--accent": accent } : undefined;
  const cls = `fw-card${className ? " " + className : ""}`;
  const inner = (
    <>
      {accent ? <span className="fw-card-bar" aria-hidden="true" /> : null}
      {children}
    </>
  );
  if (href != null) {
    return (
      <a className={cls} href={href} style={{ ...vars, ...style }} {...rest}>
        {inner}
      </a>
    );
  }
  return (
    <div className={cls} style={{ ...vars, ...style }} {...rest}>
      {inner}
    </div>
  );
}
