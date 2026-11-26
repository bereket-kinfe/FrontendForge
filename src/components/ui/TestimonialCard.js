export default function TestimonialCard({ quote, author, role }) {
  return <figure className="testimonial-card"><blockquote>“{quote}”</blockquote><figcaption><strong>{author}</strong>{role && <span>{role}</span>}</figcaption></figure>;
}