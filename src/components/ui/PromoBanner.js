import Button from "@/components/ui/Button";
export default function PromoBanner({ eyebrow, title, description, cta, href = "#contact" }) {
  return <aside className="promo-banner">{eyebrow && <span>{eyebrow}</span>}<div><h2>{title}</h2>{description && <p>{description}</p>}</div>{cta && <Button href={href} variant="light">{cta}</Button>}</aside>;
}