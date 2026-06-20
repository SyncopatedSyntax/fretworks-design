// Shared button. Renders an <a> when `href` is given, else a <button>.
// variant: "primary" | "ghost" | "kofi".
export function Button({ variant = "primary", href, className = "", children, ...rest }) {
  const cls = `fw-btn fw-btn-${variant}${className ? " " + className : ""}`;
  if (href != null) {
    return (
      <a className={cls} href={href} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
