import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import CartSummary from "@/components/ui/CartSummary";

export default function SiteHeader({ brand, nav = [], cta = "Contact", ctaHref = "#contact", theme = "light", cartKey }) {
  return <header className={`site-header theme-${theme}`}>
    <Container><nav className="navbar" aria-label="Main navigation">
      <Link className="site-brand" href="/">{brand}</Link>
      <div className="nav-links">{nav.map((item) => <a href={item.href} key={item.label}>{item.label}</a>)}</div>
      <div className="nav-actions">{cartKey && <CartSummary cartKey={cartKey}/>}<div className="nav-action"><Button href={ctaHref} variant={theme === "dark" ? "light" : "primary"}>{cta}</Button></div></div>
      <details className="mobile-menu"><summary aria-label="Open navigation">Menu</summary><div className="mobile-menu-panel">{nav.map((item) => <a href={item.href} key={item.label}>{item.label}</a>)}<a href={ctaHref}>{cta}</a></div></details>
    </nav></Container>
  </header>;
}