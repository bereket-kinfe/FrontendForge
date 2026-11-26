export default function Notice({ title, children, tone = "info" }) {
  return <aside className={`notice notice-${tone}`} role="note">{title && <strong>{title}</strong>}<div>{children}</div></aside>;
}