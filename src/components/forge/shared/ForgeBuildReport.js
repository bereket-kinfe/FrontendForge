export default function ForgeBuildReport({ report }) {
  if (!report) return null;

  return (
    <div className={`forge-build-report ${report.ok ? "ok" : "error"}`}>
      <strong>{report.ok ? "Production build succeeded" : "Production build failed"} · {report.slug}</strong>
      <p>{report.message || report.error}</p>
      <pre>{report.output || report.details || ""}</pre>
    </div>
  );
}
