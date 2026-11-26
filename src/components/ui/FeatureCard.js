export default function FeatureCard({ number, title, description, icon }) {
  return <article className="feature-card">{icon && <span className="feature-icon" aria-hidden="true">{icon}</span>}{number && <span className="feature-number">{number}</span>}<h3>{title}</h3><p>{description}</p></article>;
}