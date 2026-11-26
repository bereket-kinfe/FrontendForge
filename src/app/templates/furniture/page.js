import Image from "next/image";
import Link from "next/link";
import FurnitureExperience from "@/components/furniture/FurnitureExperience";
import { furnitureProducts, furnitureMoney } from "@/config/furniture-products";
import { furnitureStore } from "@/config/furniture-store";

export const metadata = {
  title: `${furnitureStore.brandName} | ${furnitureStore.tagline}`,
  description: "Thoughtful furniture, natural materials and calm spaces. Explore sofas, chairs, tables and home accessories.",
  alternates: { canonical: "/templates/furniture" },
  openGraph: {
    title: `${furnitureStore.brandName} — Furniture for considered living`,
    description: furnitureStore.tagline,
    images: [{ url: "/images/furniture/hero-lounge-chair.jpg", width: 1200, height: 900, alt: "Sculptural lounge chair" }]
  }
};

const categories = [
  { name: "Living room", note: "Sofas, lounge chairs & tables", image: "/images/furniture/living-room-detail.jpg" },
  { name: "Bedroom", note: "Beds, bedside & storage", image: "/images/furniture/hero-lounge-chair.jpg" },
  { name: "Dining", note: "Tables made for gathering", image: "/images/furniture/living-room.jpg" },
  { name: "Lighting", note: "The finishing touches", image: "/images/furniture/reading-corner.jpg" }
];

export default function FurniturePage() {
  return <div className="furniture-site" id="home">
    <header className="furniture-header">
      <Link className="furniture-wordmark" href="#home">BEETLE <span>PRO</span></Link>
      <nav aria-label="Main navigation"><a href="#shop">Shop</a><a href="#collections">Collections</a><a href="#journal">Journal</a><a href="#about">About</a><a href="#contact">Contact</a></nav>
      <div className="furniture-header-actions"><a href="#shop" aria-label="Search furniture">⌕</a><a href="#shortlist" aria-label="View shortlist">♡</a><a href="#shortlist">Bag</a><Link className="furniture-header-cta" href="/templates/furniture/admin">Store admin ↗</Link></div>
    </header>
    <main>
      <section className="furniture-hero">
        <div className="furniture-hero-copy">
          <span className="furniture-kicker">FURNITURE · OBJECTS · EVERYDAY LIVING</span>
          <h1>Crafted calm<br/><em>for every room.</em></h1>
          <p>Solid wood, natural fabrics and honest prices — furniture made to be lived with, and kept for years.</p>
          <div className="furniture-hero-actions"><a className="furniture-button dark" href="#shop">Shop the collection ↗</a><a className="furniture-underlink" href="#collections">Explore our rooms ↓</a></div>
          <div className="furniture-hero-picks">
            <Link href="/templates/furniture/products/mira-chair"><span className="furniture-mini-image"><Image src="/images/furniture/hero-lounge-chair.jpg" alt="Mira lounge chair" fill sizes="70px"/></span><span><small>THE SIGNATURE CHAIR</small><strong>Mira Lounge Chair</strong><b>From {furnitureMoney(24900)}</b></span></Link>
            <Link href="/templates/furniture/products/tove-table"><span className="furniture-mini-image second"><Image src="/images/furniture/living-room-detail.jpg" alt="Natural wood furniture detail" fill sizes="70px"/></span><span><small>MADE FOR SLOW MORNINGS</small><strong>Tove Side Table</strong><b>From {furnitureMoney(12900)}</b></span></Link>
          </div>
        </div>
        <div className="furniture-hero-visual"><Image src="/images/furniture/hero-lounge-chair.jpg" alt="Sculptural cream lounge chair with dark tapered legs" fill priority sizes="(max-width: 760px) 100vw, 55vw"/><div className="furniture-hero-stamp"><span>DESIGNED TO</span><strong>LIVE<br/>WITH</strong><span>✳</span></div><div className="furniture-image-caption">TIMELESS SHAPES. NATURAL TEXTURES.</div></div>
      </section>
      <section className="furniture-benefits"><div><span>01</span><strong>Thoughtful materials</strong><small>Natural finishes, chosen to last.</small></div><div><span>02</span><strong>Made with intention</strong><small>Considered details, honest design.</small></div><div><span>03</span><strong>Room to feel at home</strong><small>Pieces for everyday moments.</small></div><div><span>04</span><strong>Here to help</strong><small>Friendly support, from choice to delivery.</small></div></section>
      <section className="furniture-collections" id="collections"><div className="furniture-section-head"><div><span className="furniture-kicker">FIND YOUR FEELING</span><h2>Make room for<br/><em>what matters.</em></h2></div><p>Explore considered pieces for the places where life happens — from slow Sunday mornings to evenings around the table.</p></div><div className="furniture-category-grid">{categories.map((item,index)=><a className="furniture-category-card" href="#shop" key={item.name}><div className="furniture-category-photo"><Image src={item.image} alt={`${item.name} furniture inspiration`} fill sizes="(max-width: 700px) 90vw, 25vw"/><span>0{index+1}</span></div><div><strong>{item.name}</strong><small>{item.note}</small><b>↗</b></div></a>)}</div></section>
      <section className="furniture-shop" id="shop"><div className="furniture-shop-head"><div><span className="furniture-kicker">THE PIECES YOU LOVE</span><h2>Good design.<br/><em>Everyday living.</em></h2></div><a href="#contact" className="furniture-underlink">Ask about the collection ↗</a></div><FurnitureExperience products={furnitureProducts} currency={furnitureStore.currency} locale={furnitureStore.locale} whatsappNumber={furnitureStore.whatsappNumber} brandName={furnitureStore.brandName}/><p className="furniture-disclaimer">Demonstration catalog and ETB prices only. Confirm product specifications, stock, delivery and final prices with the business before publishing.</p></section>
      <section className="furniture-room" id="journal"><div className="furniture-room-image"><Image src="/images/furniture/living-room.jpg" alt="A calm living room with a soft sofa, lounge chair and warm natural accents" fill sizes="(max-width: 760px) 100vw, 55vw"/></div><div className="furniture-room-copy"><span className="furniture-kicker">THE ART OF FEELING AT HOME</span><h2>Everything has<br/>its <em>place.</em></h2><p>A room comes together one thoughtful choice at a time. Start with the piece you love, add the textures that feel like you, and let the rest follow naturally.</p><a className="furniture-button dark" href="#collections">Shop by room ↗</a><div className="furniture-room-note"><span>THE BEETLE PRO EDIT</span><strong>Less, but better.<br/>Always.</strong></div></div></section>
      <section className="furniture-about" id="about"><div><span className="furniture-kicker">A MORE CONSIDERED HOME</span><h2>Objects with purpose.<br/><em>Spaces with soul.</em></h2></div><p>We believe the things we live with should feel good, work hard and stay beautiful over time. Our collection brings together welcoming shapes, useful details and materials that grow more character with every year.</p></section>
      <section className="furniture-contact" id="contact"><div><span className="furniture-kicker">LET'S MAKE YOUR SPACE YOURS</span><h2>Need a little<br/><em>help choosing?</em></h2><p>Talk to our team about dimensions, finishes, availability or delivery. We'll help you find the right piece for your space.</p><a className="furniture-button light" href={`https://wa.me/${String(furnitureStore.whatsappNumber).replace(/\D/g, "")}?text=${encodeURIComponent(`Hello ${furnitureStore.brandName}, I'd like help choosing furniture.`)}`} target="_blank" rel="noreferrer">Chat with our team ↗</a></div><div className="furniture-contact-card"><span>VISIT OUR SHOWROOM</span><strong>{furnitureStore.address}</strong><hr/><span>OPENING HOURS</span><strong>{furnitureStore.hours}</strong><hr/><span>GET IN TOUCH</span><strong>{furnitureStore.email}</strong></div></section>
    </main>
    <footer className="furniture-footer"><div><Link className="furniture-wordmark" href="#home">BEETLE <span>PRO</span></Link><p>Furniture for considered living.<br/>Designed to be lived with.</p></div><div><span>EXPLORE</span><a href="#shop">Shop all</a><a href="#collections">Shop by room</a><a href="#about">Our story</a></div><div><span>HELP</span><a href="#contact">Contact</a><a href="#contact">Delivery information</a><a href="#contact">Care guide</a></div><div><span>FOLLOW ALONG</span><a href="#contact">Instagram ↗</a><a href="#contact">Pinterest ↗</a><a href="#contact">Facebook ↗</a></div><div className="furniture-footer-bottom">© 2026 BEETLE PRO · DEMO BRAND — REPLACE SAMPLE BUSINESS DETAILS BEFORE LAUNCH.</div></footer>
  </div>;
}
