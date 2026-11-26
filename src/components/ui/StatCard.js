export default function StatCard({ value, label, note }) {
  return <article className="stat-card"><strong>{value}</strong><span>{label}</span>{note && <small>{note}</small>}</article>;
}