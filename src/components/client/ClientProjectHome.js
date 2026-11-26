import "./ClientProjectHome.css";
import "./ClientProjectHomeArtDirection.css";
import ClientContactForm from "@/components/client/ClientContactForm";
import FurnitureExperience from "@/components/furniture/FurnitureExperience";
import { normalizeFurnitureClientProduct } from "@/lib/furniture-store.mjs";
import ClientCommerceExperience from "@/components/commerce/ClientCommerceExperience";
import Link from "next/link";
import { getNicheNavigation } from "@/lib/forge/niche-pages.mjs";
import { getSectionStyleValues } from "@/lib/forge/editor-config.mjs";

function money(value, currency) {
  try { return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(value); }
  catch { return `${currency} ${Number(value || 0).toLocaleString()}`; }
}

function whatsappHref(number, message) {
  const digits = String(number || "").replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : "";
}

export default function ClientProjectHome({ config }) {
  const { brand, business, contact, theme, sections, products, integrations, orderEnabled, template, slug } = config;
  const componentStyles = config.componentStyles || { header: "standard", hero: "split", catalog: "cards", buttons: "pill" };
  const sectionContent = config.sectionContent || {};
  const sectionStyles = config.sectionStyles || {};
  const content = (sectionId, field, fallback = "") => sectionContent[sectionId]?.[field] || fallback;
  const sectionAttributes = (sectionId) => {
    const style = getSectionStyleValues(sectionId, sectionStyles);
    const spacing = { compact: 34, comfortable: 62, spacious: 88 }[style.spacing] || 62;
    const backgrounds = {
      default: undefined,
      surface: "var(--client-surface)",
      secondary: "var(--client-secondary)",
      primary: "var(--client-primary)"
    };
    return {
      "data-forge-section": sectionId,
      "data-forge-heading-size": style.headingSize || "normal",
      "data-forge-width": style.width || "standard",
      "data-forge-alignment": style.alignment || "left",
      style: {
        paddingTop: `${spacing}px`,
        paddingBottom: `${spacing}px`,
        textAlign: style.alignment || "left",
        ...(backgrounds[style.background] ? { background: backgrounds[style.background] } : {})
      }
    };
  };
  const has = (section) => (sections || []).includes(section);
  const orderHref = `/order/${slug}`;
  const orderExternalUrl = integrations.ordering?.publicUrl || "";
  const bookingUrl = integrations.booking?.publicUrl || "";
  const paymentUrl = integrations.payment?.publicUrl || "";
  const deliveryUrl = integrations.delivery?.publicUrl || "";
  const contactPortalUrl = integrations.contact?.publicUrl || "";
  const orderMessage = `Hello ${brand.name}, I would like to ask about your products and services.`;
  const waLink = whatsappHref(contact.whatsapp || contact.phone, orderMessage);

  const cssVars = {
    "--client-primary": theme.primary,
    "--client-secondary": theme.secondary,
    "--client-bg": theme.background,
    "--client-surface": theme.surface,
    "--client-text": theme.text,
    "--client-muted": theme.muted,
    "--client-accent": theme.accent,
    "--client-font-body": config.font === "System sans-serif" ? "Arial, sans-serif" : config.font === "Georgia + DM Sans" ? "'DM Sans', sans-serif" : config.font === "DM Sans" ? "'DM Sans', sans-serif" : "Manrope, sans-serif",
    "--client-font-heading": config.font === "Georgia + DM Sans" ? "Georgia, serif" : config.font === "DM Sans" || config.font === "System sans-serif" ? (config.font === "DM Sans" ? "'DM Sans', sans-serif" : "Arial, sans-serif") : "Manrope, sans-serif"
  };

  const navItems = getNicheNavigation(template).map((item) => [item.label, item.href]);

  const title = brand.tagline || `Welcome to ${brand.name}`;
  const description = brand.description || `Discover what makes ${brand.name} special.`;
  const furnitureCatalog = template === "furniture" ? products.map(normalizeFurnitureClientProduct) : products;
  const furnitureCartKey = `frontendforge:furniture-cart:${slug}`;

  // Render individual sections
  function renderSection(sectionId) {
    if (!has(sectionId)) return null;

    switch (sectionId) {
      case "hero":
        return <section className="client-project-hero" key="hero" {...sectionAttributes("hero")}>
          <div className="client-project-hero-copy">
            <span className="client-project-kicker">{content("hero", "eyebrow", `${brand.name} · ${config.templateLabel}`)}</span>
            <h1>{content("hero", "heading", title)}</h1>
            <p>{content("hero", "body", description)}</p>
            <div className="client-project-actions">
              {has("catalog") && <a className="client-project-button" href="#catalog">Explore {template === "furniture" ? "collection" : template === "ecommerce" || template === "grocery" ? "products" : "the menu"} ↓</a>}
              {orderEnabled ? <Link className="client-project-textlink" href={orderHref}>Start an order ↗</Link> : orderExternalUrl ? <a className="client-project-textlink" href={orderExternalUrl} target="_blank" rel="noreferrer">Start an order ↗</a> : has("contact") && <a className="client-project-textlink" href="#contact">Get in touch ↗</a>}
            </div>
            <div className="client-project-proof">
              <span>✳</span> {template === "furniture" ? "SOLID WOOD · NATURAL FABRICS · HONEST PRICES" : template === "ecommerce" ? "THOUGHTFULLY SELECTED · MADE FOR EVERYDAY" : "MADE WITH CARE · HERE FOR THE EVERYDAY"}
            </div>
          </div>
          <div className="client-project-hero-media">
            {brand.heroImageUrl ? <img src={brand.heroImageUrl} alt={`${brand.name} featured display`} /> : <div className="client-project-image-placeholder"><span>{template === "furniture" ? "🛋️" : template === "ecommerce" ? "✦" : template === "grocery" ? "✿" : "☼"}</span><small>ADD AN APPROVED HERO PHOTO</small></div>}
            <div className="client-project-image-caption">{brand.name.toUpperCase()} · {business.address || "YOUR NEIGHBORHOOD FAVORITE"}</div>
          </div>
        </section>;

      case "collections": {
        const collectionCards = template === "furniture"
          ? [{ title: "Living room", desc: "Sofas, lounge seating & side tables", emoji: "🛋️" }, { title: "Bedroom", desc: "Beds, bedside storage & calm accents", emoji: "🛏️" }, { title: "Dining", desc: "Gathering tables, chairs & benches", emoji: "🪑" }, { title: "Lighting & decor", desc: "Pendants, vessels & finishing touches", emoji: "💡" }]
          : template === "grocery"
            ? [{ title: "Fresh produce", desc: "Fruit, vegetables and seasonal picks", emoji: "🥑" }, { title: "Pantry staples", desc: "Everyday ingredients and essentials", emoji: "🥫" }, { title: "Bakery & dairy", desc: "Freshly stocked daily favorites", emoji: "🥖" }, { title: "Home essentials", desc: "Useful things for your household", emoji: "🧺" }]
            : template === "ecommerce"
              ? [{ title: "Clothing", desc: "Everyday pieces and new silhouettes", emoji: "👕" }, { title: "Accessories", desc: "Finishing touches for every day", emoji: "👜" }, { title: "Footwear", desc: "Comfortable styles to go places", emoji: "👟" }, { title: "New arrivals", desc: "Fresh finds from the latest edit", emoji: "✦" }]
              : template === "cafe"
                ? [{ title: "Coffee favorites", desc: "Espresso, cold brew and lattes", emoji: "☕" }, { title: "Iced drinks", desc: "Cool sips for sunny afternoons", emoji: "🧋" }, { title: "Tea & matcha", desc: "A little pause in every cup", emoji: "🍵" }, { title: "Bakery", desc: "Fresh bakes and sweet treats", emoji: "🥐" }]
                : [{ title: "Signature mains", desc: "Kitchen favorites made fresh", emoji: "🍔" }, { title: "Sides & snacks", desc: "The perfect extras for your meal", emoji: "🍟" }, { title: "Drinks", desc: "Refreshing sips and coolers", emoji: "🥤" }, { title: "Meal deals", desc: "Good-value combinations to share", emoji: "🍽️" }];
        const collectionHeading = template === "furniture" ? "Shop the room." : template === "grocery" ? "Good things, grouped for you." : template === "ecommerce" ? "Find your kind of everyday." : template === "cafe" ? "A menu for every mood." : "Something good for every craving.";
        return <section className="client-project-section client-collections-section" id="collections" key="collections" {...sectionAttributes("collections")}>
          <div className="client-project-section-head"><div><span className="client-project-kicker">{content("collections", "eyebrow", "EXPLORE THE COLLECTIONS")}</span><h2>{content("collections", "heading", collectionHeading)}</h2><p>{content("collections", "body", description)}</p></div></div>
          <div className="client-project-products client-project-collection-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}>
            {collectionCards.map((col) => <div className="client-project-product" key={col.title} style={{ padding: "20px", display: "grid", gap: "10px", background: "var(--client-surface)" }}><div style={{ fontSize: "36px" }}>{col.emoji}</div><h3 style={{ margin: "4px 0 0", fontSize: "16px", fontWeight: "700" }}>{col.title}</h3><p style={{ margin: 0, fontSize: "11px", color: "var(--client-muted)" }}>{col.desc}</p><a href="#catalog" style={{ fontSize: "10px", fontWeight: "700", color: "var(--client-primary)", marginTop: "6px" }}>Explore ↗</a></div>)}
          </div>
        </section>;
      }

      case "catalog":
        return <section className="client-project-section" id="catalog" key="catalog" {...sectionAttributes("catalog")}>
          <div className="client-project-section-head">
            <div>
              <span className="client-project-kicker">{content("catalog", "eyebrow", template === "furniture" ? "THE COLLECTION" : template === "ecommerce" || template === "grocery" ? "THE COLLECTION" : "MADE FRESH FOR YOU")}</span>
              <h2>{content("catalog", "heading", template === "furniture" ? "Pieces made for considered living." : template === "ecommerce" ? "Find your next favorite." : template === "grocery" ? "Good things for your home." : "A few favorites to get you started.")}</h2>
              <p>{content("catalog", "body", template === "furniture" ? "Select a piece to inspect details, add to your shortlist, and submit an enquiry." : "Update names, descriptions, images, availability and prices with client-approved information.")}</p>
            </div>
            {orderEnabled ? <Link className="client-project-outline" href={orderHref}>Open full ordering menu ↗</Link> : orderExternalUrl ? <a className="client-project-outline" href={orderExternalUrl} target="_blank" rel="noreferrer">Open ordering service ↗</a> : null}
          </div>

          {template === "furniture" ? (
            <FurnitureExperience
              products={furnitureCatalog}
              money={(val) => money(val, business.currency)}
              whatsappNumber={contact.whatsapp || contact.phone}
              brandName={brand.name}
              productBasePath=""
              checkoutPath="/checkout"
              cartStorageKey={furnitureCartKey}
              wishlistStorageKey={`frontendforge:furniture-wishlist:${slug}`}
              adminStorageKey={`frontendforge:furniture-admin:${slug}`}
            />
          ) : (template === "ecommerce" || template === "grocery") ? (
            <ClientCommerceExperience
              products={products}
              brand={{ ...brand, slug }}
              contact={contact}
              currency={business.currency}
              locale={business.locale}
              template={template}
              orderProviderUrl={orderExternalUrl}
            />
          ) : (
            <div className="client-project-products">
              {products.map((product) => (
                <article className="client-project-product" key={product.id}>
                  <Link className="client-project-product-image" href={`/products/${product.id}`} aria-label={`View ${product.name}`}>
                    {product.image ? <img src={product.image} alt={product.alt || product.name} /> : <span>{product.emoji || "✳"}</span>}
                  </Link>
                  <div className="client-project-product-body">
                    <small>{product.category || "FEATURED"}</small>
                    <h3><Link href={`/products/${product.id}`}>{product.name}</Link></h3>
                    <p>{product.description}</p>
                    <div className="client-project-product-bottom">
                      <strong>{money(product.price, business.currency)}</strong>
                      {orderEnabled ? <Link href={orderHref}>Customize ↗</Link> : orderExternalUrl ? <a href={orderExternalUrl} target="_blank" rel="noreferrer">Order ↗</a> : waLink ? <a href={whatsappHref(contact.whatsapp || contact.phone, `Hello ${brand.name}, please share details about ${product.name}.`)} target="_blank" rel="noreferrer">Enquire ↗</a> : <a href="#contact">Enquire ↗</a>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>;

      case "roomInspiration":
        return <section className="client-project-about" key="roomInspiration" {...sectionAttributes("roomInspiration")}>
          <div className="client-project-about-placeholder" style={{ borderRadius: "20px" }}>
            <span>🌿</span>
          </div>
          <div className="client-project-about-copy">
            <span className="client-project-kicker">{content("roomInspiration", "eyebrow", "THE ART OF FEELING AT HOME")}</span>
            <h2>{content("roomInspiration", "heading", "Everything has its place.")}</h2>
            <p>{content("roomInspiration", "body", "A room comes together one thoughtful choice at a time. Start with the piece you love, add textures that feel genuine, and let the rest follow naturally.")}</p>
            <p>{content("roomInspiration", "secondaryBody", "Solid wood, natural fabrics, and honest details — crafted to be lived with and kept for years.")}</p>
            <a className="client-project-button" href="#catalog">View our catalog ↗</a>
          </div>
        </section>;

      case "about":
        return <section className="client-project-about" id="about" key="about" {...sectionAttributes("about")}>
          {brand.galleryImages?.[0] ? <img className="client-project-about-image" src={brand.galleryImages[0]} alt={`${brand.name} brand and products`} /> : brand.heroImageUrl ? <img className="client-project-about-image" src={brand.heroImageUrl} alt={`${brand.name} featured image`} /> : <div className="client-project-about-placeholder">{brand.name}</div>}
          <div className="client-project-about-copy">
            <span className="client-project-kicker">{content("about", "eyebrow", "A LITTLE ABOUT US")}</span>
            <h2>{content("about", "heading", "More than what we make. A feeling to come back to.")}</h2>
            <p>{content("about", "body", description)}</p>
            <p>{content("about", "secondaryBody", "Use this space for the real story: what the business believes, how it works, and what customers can expect.")}</p>
            {has("contact") && <a className="client-project-button" href="#contact">Get to know us ↗</a>}
          </div>
        </section>;

      case "gallery":
        return <section className="client-project-gallery" id="gallery" key="gallery" {...sectionAttributes("gallery")}>
          <div className="client-project-section-head">
            <div><span className="client-project-kicker">{content("gallery", "eyebrow", "A CLOSER LOOK")}</span><h2>{content("gallery", "heading", "Made to be experienced.")}</h2><p>{content("gallery", "body", "A closer look at the details, products and moments that define the brand.")}</p></div>
          </div>
          <div className="client-project-gallery-grid">
            {(brand.galleryImages?.length ? brand.galleryImages : [brand.heroImageUrl, brand.heroImageUrl, brand.heroImageUrl].filter(Boolean)).slice(0, 3).map((src, index) => (
              <div key={`${src}-${index}`} className={`client-project-gallery-image gallery-${index}`}>
                {src ? <img src={src} alt={`${brand.name} gallery ${index + 1}`} /> : <span>ADD PHOTO {index + 1}</span>}
              </div>
            ))}
          </div>
        </section>;

      case "testimonials":
        return <section className="client-project-testimonials" key="testimonials" {...sectionAttributes("testimonials")}>
          <span className="client-project-kicker">{content("testimonials", "eyebrow", "CUSTOMER LOVE")}</span>
          <h2>{content("testimonials", "heading", "Let your customers tell the story.")}</h2>
          <p>{content("testimonials", "body", "Add genuine, client-approved reviews here before publishing. Never publish invented testimonials.")}</p>
        </section>;

      case "faq":
        return <section className="client-project-faq" key="faq" {...sectionAttributes("faq")}>
          <span className="client-project-kicker">{content("faq", "eyebrow", "GOOD TO KNOW")}</span>
          <h2>{content("faq", "heading", "Frequently asked questions")}</h2>
          <details>
            <summary>How can customers get in touch?</summary>
            <p>Use the contact details below to speak directly with the business.</p>
          </details>
          <details>
            <summary>Can I order or book ahead?</summary>
            <p>{orderEnabled ? "Use the online ordering link to customize an order, then follow the available checkout instructions." : "Contact the business to confirm ordering or booking availability."}</p>
          </details>
          <details>
            <summary>Are opening hours and prices always current?</summary>
            <p>Check the business contact details for the latest availability. Keep this website updated whenever hours or prices change.</p>
          </details>
        </section>;

      case "booking":
        return <section className="client-project-booking" key="booking" {...sectionAttributes("booking")}>
          <div>
            <span className="client-project-kicker">{content("booking", "eyebrow", "PLAN AHEAD")}</span>
            <h2>{content("booking", "heading", "Make a plan with us.")}</h2>
            <p>{content("booking", "body", `Booking tool selected: ${integrations.booking?.provider || "Not selected"}. Confirm the provider connection before accepting live reservations.`)}</p>
          </div>
          {bookingUrl ? <a className="client-project-button" href={bookingUrl} target="_blank" rel="noreferrer">Open booking service ↗</a> : <a className="client-project-button" href={contact.phone ? `tel:${contact.phone}` : `mailto:${contact.email}`}>Enquire about a booking ↗</a>}
        </section>;

      case "location":
        return <section className="client-project-location" id="location" key="location" {...sectionAttributes("location")}>
          <div>
            <span className="client-project-kicker">{content("location", "eyebrow", "COME FIND US")}</span>
            <h2>{content("location", "heading", "Good things are closer than you think.")}</h2>
            <p>{content("location", "body", business.address || "Add the verified business address.")}</p>
            <p>{business.hours || "Add confirmed business hours."}</p>
            <div className="client-project-location-actions">
              {contact.phone && <a href={`tel:${contact.phone}`}>Call {contact.phone}</a>}
              {contact.website && <a href={contact.website} target="_blank" rel="noreferrer">Website ↗</a>}
              {deliveryUrl && <a href={deliveryUrl} target="_blank" rel="noreferrer">Delivery partner ↗</a>}
            </div>
          </div>
          <div className="client-project-map-placeholder">
            <span>⌖</span>
            <strong>{brand.name}</strong>
            <small>{business.address || "Verified business address goes here"}</small>
            <em>Add a verified Google Maps or OpenStreetMap embed before launch.</em>
          </div>
        </section>;

      case "contact":
        return <section className="client-project-contact" id="contact" key="contact" {...sectionAttributes("contact")}>
          <div>
            <span className="client-project-kicker">{content("contact", "eyebrow", "LET'S TALK")}</span>
            <h2>{content("contact", "heading", "We'd love to hear from you.")}</h2>
            <p>{content("contact", "body", "Questions, bookings and order enquiries are welcome.")}</p>
          </div>
          <div className="client-project-contact-side">
            <div className="client-project-contact-links">
              {contact.phone && <a href={`tel:${contact.phone}`}>Phone <strong>{contact.phone}</strong></a>}
              {contact.email && <a href={`mailto:${contact.email}`}>Email <strong>{contact.email}</strong></a>}
              {contact.whatsapp && <a href={waLink} target="_blank" rel="noreferrer">WhatsApp <strong>Start a conversation ↗</strong></a>}
              {paymentUrl && <a href={paymentUrl} target="_blank" rel="noreferrer">Payment portal <strong>Continue on provider site ↗</strong></a>}
              {contactPortalUrl && <a href={contactPortalUrl} target="_blank" rel="noreferrer">Contact portal <strong>Open support service ↗</strong></a>}
            </div>
            <ClientContactForm brandName={brand.name} email={contact.email} whatsapp={contact.whatsapp}/>
          </div>
        </section>;

      default:
        return null;
    }
  }

  // Determine section render sequence
  const renderSequence = Array.isArray(config.orderedSections) && config.orderedSections.length
    ? config.orderedSections.filter((s) => s !== "header" && s !== "footer")
    : ["hero", "collections", "catalog", "roomInspiration", "about", "gallery", "testimonials", "faq", "booking", "location", "contact"];

  return <main className={`client-project client-project-${template} client-header-${componentStyles.header} client-hero-${componentStyles.hero} client-catalog-${componentStyles.catalog} client-buttons-${componentStyles.buttons}`} style={cssVars}>
    {has("header") && <header className="client-project-header">
      <Link href="/" className="client-project-brand">
        {brand.logoUrl ? <img src={brand.logoUrl} alt={`${brand.name} logo`} /> : <span className="client-project-mark">{brand.name.slice(0, 1).toUpperCase()}</span>}
        <strong>{brand.name}</strong>
      </Link>
      <nav className="client-project-desktop-nav" aria-label="Main navigation">{navItems.map(([label, href]) => <a href={href} key={href}>{label}</a>)}</nav>
      <details className="client-project-mobile-menu">
        <summary aria-label="Open navigation menu"><span>Menu</span><span aria-hidden="true">☰</span></summary>
        <nav aria-label="Mobile navigation">{navItems.map(([label, href]) => <a href={href} key={href}>{label}</a>)}</nav>
      </details>
      <div className="client-project-header-action">
        {orderEnabled ? <Link href={orderHref} className="client-project-pill">Order online ↗</Link> : orderExternalUrl ? <a className="client-project-pill" href={orderExternalUrl} target="_blank" rel="noreferrer">Order online ↗</a> : waLink ? <a className="client-project-pill" href={waLink} target="_blank" rel="noreferrer">Contact us ↗</a> : <a className="client-project-pill" href="#contact">Contact us ↗</a>}
      </div>
    </header>}

    {renderSequence.map((secId) => renderSection(secId))}

    {has("footer") && <footer className="client-project-footer">
      <div>
        <Link href="/" className="client-project-footer-brand">{brand.name}</Link>
        <p>{content("footer", "heading", brand.tagline)}</p>
      </div>
      <div className="client-project-footer-links">
        {navItems.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
        {orderEnabled ? <Link href={orderHref}>Order online</Link> : orderExternalUrl ? <a href={orderExternalUrl} target="_blank" rel="noreferrer">Order online</a> : null}
        {bookingUrl && <a href={bookingUrl} target="_blank" rel="noreferrer">Bookings ↗</a>}
        {paymentUrl && <a href={paymentUrl} target="_blank" rel="noreferrer">Payment portal ↗</a>}
        {deliveryUrl && <a href={deliveryUrl} target="_blank" rel="noreferrer">Delivery ↗</a>}
        {contactPortalUrl && <a href={contactPortalUrl} target="_blank" rel="noreferrer">Support ↗</a>}
      </div>
      <small>© {new Date().getFullYear()} {brand.name}. All rights reserved.</small>
    </footer>}
  </main>;
}
