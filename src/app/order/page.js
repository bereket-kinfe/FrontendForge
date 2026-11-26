import Link from "next/link";
import { foodBusinesses } from "@/config/food-businesses";
import Container from "@/components/ui/Container";

export const metadata = { title: "Food Business Ordering Studio | FrontendForge", description: "Reusable ordering storefront demonstrations for cafes, restaurants, burgers and bakeries." };

export default function OrderStudioPage() {
  return <main className="order-studio-page"><Container><div className="order-studio-top"><Link href="/">← FrontendForge</Link><span>REUSABLE FOOD BUSINESS SYSTEM</span></div><div className="order-studio-heading"><span>ONE SYSTEM · MANY BRANDS</span><h1>Choose a storefront.<br/><em>Make it yours.</em></h1><p>Each demo uses the same menu, cart and WhatsApp checkout engine with its own colors, content and product catalog.</p></div><div className="order-studio-grid">{foodBusinesses.map((business) => <Link href={`/order/${business.slug}`} className="order-studio-card" key={business.slug} style={{ "--studio-primary": business.theme.primary, "--studio-bg": business.theme.soft }}><span className="order-studio-swatch"/><span className="order-studio-type">{business.descriptor}</span><h2>{business.name}</h2><p>{business.tagline}</p><span className="order-studio-open">Open storefront ↗</span></Link>)}</div><p className="order-studio-footnote">Sample businesses, prices, phone numbers and delivery charges are placeholders. Replace them with verified client details before launch.</p></Container></main>;
}
