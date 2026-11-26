export default function Price({ amount, note, className = "" }) {
  return <span className={`price ${className}`.trim()}><strong>{amount}</strong>{note && <small>{note}</small>}</span>;
}