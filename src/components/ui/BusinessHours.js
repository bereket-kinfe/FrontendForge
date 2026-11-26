export default function BusinessHours({ rows = [] }) {
  return <div className="business-hours"><h3>Opening hours</h3><dl>{rows.map((row) => <div key={row.day}><dt>{row.day}</dt><dd>{row.hours}</dd></div>)}</dl></div>;
}