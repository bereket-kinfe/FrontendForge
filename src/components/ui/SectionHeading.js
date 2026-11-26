export default function SectionHeading({ eyebrow, title, description, centered = false, light = false }) {
  return <div className={`section-heading ${centered ? "is-centered" : ""} ${light ? "heading-light" : ""}`}>
    {eyebrow && <span className="eyebrow">{eyebrow}</span>}
    <h2>{title}</h2>
    {description && <p>{description}</p>}
  </div>;
}