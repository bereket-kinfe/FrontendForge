import Image from "next/image";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { coffeeShop } from "@/config/coffee-shop";

export const metadata = {
  title: "MACHI Coffee | Cold Brew for Sunny Days",
  description: "Slow-steeped cold brew, creamy iced lattes and feel-good matcha. Find your new everyday favorite at MACHI Coffee."
};

const nav = [
  { label: "Drinks", href: "#drinks" },
  { label: "Our story", href: "#story" },
  { label: "Visit us", href: "#visit" }
];

export default function CafePage() {
  return (
    <div className="machi-site" id="top">
      <SiteHeader brand={coffeeShop.brand} nav={nav} cta="Order online" ctaHref="/order/machi" />
      <main>
        <section className="machi-hero" aria-labelledby="machi-title">
          <div className="machi-hero-sky" aria-hidden="true" />
          <Container>
            <div className="machi-hero-copy">
              <Badge className="machi-badge">{coffeeShop.descriptor}</Badge>
              <h1 id="machi-title">A little more <em>sunshine</em> in every sip.</h1>
              <p>Slow-steeped cold brew, creamy iced lattes and feel-good matcha. Made for the long way round, the catch-up and the everyday.</p>
              <div className="machi-hero-actions">
                <Button href="#drinks" className="machi-button-dark">Explore the drinks <span aria-hidden="true">↗</span></Button>
                <a className="machi-text-link" href="#story">Get to know us <span aria-hidden="true">↓</span></a>
              </div>
              <div className="machi-hero-note"><span className="machi-note-dot" /> BREWED SLOW. SERVED COLD. ALWAYS GOOD.</div>
            </div>
            <div className="machi-hero-visual">
              <div className="machi-hero-image-wrap"><Image src={coffeeShop.heroImage} alt="Iced cold brew and creamy latte on a sunny blue background" fill priority sizes="(max-width: 760px) 100vw, 54vw" className="machi-hero-image" /></div>
              <div className="machi-sticker" aria-label="Good days start here"><span>GOOD DAYS</span><strong>START<br/>HERE</strong><span className="machi-sticker-star">✳</span></div>
              <div className="machi-hero-caption">YOUR NEW EVERYDAY FAVORITE.</div>
            </div>
          </Container>
        </section>

        <section className="machi-favorites" id="drinks" aria-labelledby="machi-favorites-title">
          <Container>
            <div className="machi-section-topline"><span className="machi-eyebrow">THE GOOD STUFF · MADE FRESH</span><span className="machi-section-index">01 / THE MENU</span></div>
            <div className="machi-section-heading"><div><h2 id="machi-favorites-title">Refreshingly good.<br/><em>Always.</em></h2></div><p>Meet the drinks people come back for. Pick your favorite, then make it your own.</p></div>
            <div className="machi-drink-grid">
              {coffeeShop.drinks.map((drink) => (
                <article className={`machi-drink-card machi-${drink.tone}`} key={drink.name}>
                  <div className="machi-drink-card-top"><span>{drink.category}</span><span>{drink.number}</span></div>
                  <div className="machi-drink-photo"><Image src={drink.image} alt={drink.name} fill sizes="(max-width: 760px) 90vw, 25vw" /></div>
                  <div className="machi-drink-copy"><h3>{drink.name}</h3><p>{drink.description}</p></div>
                  <div className="machi-drink-bottom"><strong>{drink.price}</strong><a href="/order/machi" className="machi-order-link">Order now <span aria-hidden="true">↗</span></a></div>
                </article>
              ))}
            </div>
            <p className="machi-menu-note">*Sample prices for layout demonstration only. Confirm the real menu, prices, sizes and availability with the business before publishing.</p>
          </Container>
        </section>

        <section className="machi-story" id="story" aria-labelledby="machi-story-title">
          <Container>
            <div className="machi-story-photo"><Image src={coffeeShop.storyImage} alt="Freshly roasted coffee beans ready for brewing" fill sizes="(max-width: 760px) 100vw, 48vw" /><span className="machi-photo-label">A GOOD THING TAKES TIME</span></div>
            <div className="machi-story-copy"><span className="machi-eyebrow">A LITTLE ABOUT OUR BREW</span><h2 id="machi-story-title">More than coffee.<br/><em>A community.</em></h2><p>At MACHI, we believe great coffee brings people together. From carefully chosen beans to expertly crafted drinks, every cup is an invitation to slow down, catch up and enjoy the moment.</p>
              <div className="machi-values"><div><span>01</span><strong>Good beans</strong><small>Start with coffee worth tasting.</small></div><div><span>02</span><strong>Made with care</strong><small>Thoughtful preparation, every time.</small></div><div><span>03</span><strong>Good company</strong><small>A welcoming place to connect.</small></div></div>
              <Button href="#visit" className="machi-button-dark">Come say hello <span aria-hidden="true">↗</span></Button>
            </div>
          </Container>
        </section>

        <section className="machi-lifestyle" aria-labelledby="machi-lifestyle-title">
          <Image src={coffeeShop.lifestyleImage} alt="Friends sharing iced coffee outdoors on a sunny day" fill sizes="100vw" className="machi-lifestyle-image" />
          <div className="machi-lifestyle-overlay" />
          <Container><div className="machi-lifestyle-copy"><span className="machi-eyebrow">YOUR TABLE IS WAITING</span><h2 id="machi-lifestyle-title">Good coffee.<br/><em>Good vibes.</em></h2><p>First sip on the way to work. Long catch-ups that turn into afternoons. Your kind of coffee moment starts here.</p><Button href="#visit" className="machi-button-light">Visit our cafe <span aria-hidden="true">↗</span></Button></div><span className="machi-lifestyle-stamp">SIP<br/>SLOW<br/>REPEAT</span></Container>
        </section>

        <section className="machi-visit" id="visit" aria-labelledby="machi-visit-title">
          <Container>
            <div className="machi-visit-heading"><span className="machi-eyebrow">COME ON IN</span><h2 id="machi-visit-title">Find your coffee shop<br/><em>near you.</em></h2><p>We'd love to see you. Stop by for a fresh cup and a warm welcome.</p></div>
            <div className="machi-visit-details">
              <div><span>FIND THE CAFE</span><strong>{coffeeShop.address}</strong></div>
              <div><span>WHEN TO DROP BY</span><strong>{coffeeShop.hours}</strong></div>
              <div><span>SAY HELLO</span><strong><a href={`mailto:${coffeeShop.email}`}>{coffeeShop.email}</a></strong></div>
              <div><span>GIVE US A CALL</span><strong><a href={`tel:${coffeeShop.phone.replace(/[^+\d]/g, "")}`}>{coffeeShop.phone}</a></strong></div>
              <div className="machi-map-card" aria-label="Illustrative map placeholder"><div className="machi-map-road road-one"/><div className="machi-map-road road-two"/><div className="machi-map-road road-three"/><div className="machi-map-park">GREEN SPACE</div><span className="machi-map-pin">✦</span><strong>MACHI Coffee</strong><small>Replace with the verified shop location</small></div>
              <div className="machi-visit-social"><span>FOLLOW ALONG</span><div><a href="#visit" aria-label="Instagram">ig</a><a href="#visit" aria-label="TikTok">tt</a><a href="#visit" aria-label="Facebook">f</a></div><p>Follow for new drinks, cafe moments and seasonal specials.</p></div>
              <Button href={`mailto:${coffeeShop.email}?subject=${encodeURIComponent("Directions to MACHI Coffee")}`} className="machi-button-dark">Get in touch <span aria-hidden="true">↗</span></Button>
              <p className="machi-contact-note">Business address, hours, phone, social profiles and map are placeholders. Replace with verified client information before launch.</p>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter brand={coffeeShop.brand} tagline="Good coffee. Bright days. Come as you are." email={coffeeShop.email} phone={coffeeShop.phone} theme="light" />
    </div>
  );
}
