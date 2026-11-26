import Link from "next/link";
import Image from "next/image";
import ClientContactForm from "@/components/client/ClientContactForm";
import ClientLeadForm from "@/components/client/ClientLeadForm";
import ClientCommerceExperience from "@/components/commerce/ClientCommerceExperience";
import ClientCommerceCheckout from "@/components/client/ClientCommerceCheckout";
import FurnitureCheckout from "@/components/furniture/FurnitureCheckout";
import FurnitureExperience from "@/components/furniture/FurnitureExperience";
import FoodBusinessExperience from "@/components/food/FoodBusinessExperience";
import { normalizeFurnitureClientProduct } from "@/lib/furniture-store.mjs";
import { getNicheNavigation, getNichePages } from "@/lib/forge/niche-pages.mjs";
import "./ClientMultiPage.css";

function money(value, config) {
  try { return new Intl.NumberFormat(config.business.locale || "en", { style: "currency", currency: config.business.currency || "ETB", maximumFractionDigits: 0 }).format(value); }
  catch { return `${config.business.currency || "ETB"} ${Number(value || 0).toLocaleString()}`; }
}

function foodBusiness(config) {
  const { brand, business, contact, theme, products, slug, template } = config;
  const isCafe = template === "cafe";
  return {
    slug, name: brand.name, descriptor: config.templateLabel.toUpperCase(), tagline: brand.tagline,
    intro: brand.description, currency: business.currency, locale: business.locale,
    whatsapp: contact.whatsapp, phone: contact.phone, email: contact.email,
    address: business.address, hours: business.hours, fulfillment: business.fulfillment,
    deliveryFee: business.deliveryFee, deliveryLabel: "Delivery fee",
    theme: { background: theme.background, surface: theme.surface, text: theme.text, muted: theme.muted, primary: theme.primary, primaryText: "#ffffff", accent: theme.accent, soft: theme.secondary, line: "#e5e5e5", hero: theme.primary },
    categories: ["All", ...new Set(products.map((item) => item.category))], products,
    siteLinks: getNicheNavigation(template),
    orderMode: isCafe ? "cafe" : "food"
  };
}

const PAGE_COPY = {
  about: { eyebrow: "OUR STORY", title: "A little more behind what we do.", body: "We believe good businesses are built around thoughtful choices, reliable service and people who care about the details. This page is ready for the real story behind the brand: how it started, what guides the work and what customers can expect." },
  faq: { eyebrow: "HERE TO HELP", title: "Frequently asked questions.", body: "A few helpful starting points. Replace these answers with the business's confirmed policies before launch." },
  delivery: { eyebrow: "GOOD TO KNOW", title: "Delivery, collection and fulfilment.", body: "Delivery coverage, fees, timing, installation and pickup arrangements can vary by location and order. Contact the team to confirm the details for your order before checkout." },
  shipping: { eyebrow: "STORE INFORMATION", title: "Shipping, returns and support.", body: "Add the business's approved delivery, returns, exchange, warranty and refund policies here. Customers should review the confirmed terms before placing an order." },
  care: { eyebrow: "CARE & MATERIALS", title: "A little care goes a long way.", body: "Use the care instructions supplied with each product. For wood, fabric, upholstery and finishes, follow the manufacturer's product-specific guidance and ask the showroom before using cleaning chemicals or treatments." },
  "how-to-order": { eyebrow: "HOW IT WORKS", title: "From choosing to confirming.", body: "Browse the menu, select your favorites and add any available options. Share your contact and fulfilment details, then send the prepared order enquiry to the business. Your order is not confirmed until the business replies." }
};

export default function ClientMultiPage({ config, page, categorySlug = "" }) {
  const { brand, business, contact, theme, products, template, slug, integrations, orderEnabled } = config;
  const nav = getNicheNavigation(template);
  const pages = getNichePages(template);
  const definition = pages.find((item) => item.slug === page);
  const title = definition?.title || brand.name;
  const intro = definition?.description || brand.description;
  const style = {
    "--mp-primary": theme.primary, "--mp-secondary": theme.secondary,
    "--mp-bg": theme.background, "--mp-surface": theme.surface,
    "--mp-text": theme.text, "--mp-muted": theme.muted, "--mp-accent": theme.accent,
    "--client-primary": theme.primary, "--client-secondary": theme.secondary,
    "--client-bg": theme.background, "--client-surface": theme.surface,
    "--client-text": theme.text, "--client-muted": theme.muted, "--client-accent": theme.accent
  };
  const mapUrl = business.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}` : "";
  const whatsapp = String(contact.whatsapp || contact.phone || "").replace(/\D/g, "");
  const collectionCategories = [...new Set(products.map((product) => product.category || "Featured"))];
  const selectedCategory = categorySlug ? collectionCategories.find((category) => category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") === categorySlug) : "";
  const filteredProducts = selectedCategory ? products.filter((product) => product.category === selectedCategory) : products;
  const cartKey = `frontendforge:furniture-cart:${slug}`;
  const wishlistKey = `frontendforge:furniture-wishlist:${slug}`;
  const adminKey = `frontendforge:furniture-admin:${slug}`;

  if (page === "cart" || page === "checkout") {
    const pageTitle = page === "cart" ? "Your shopping bag" : "Checkout enquiry";
    const siteHeader = <header className="ff-mp-header"><Link className="ff-mp-brand" href="/"><span className="ff-mp-mark">{brand.name.slice(0,1).toUpperCase()}</span><strong>{brand.name}</strong></Link><nav aria-label="Main navigation"><Link href="/">Home</Link>{nav.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}</nav><div className="ff-mp-actions"><Link href="/shop">Continue shopping ↗</Link></div></header>;
    if (template === "furniture") {
      const store = { brandName: brand.name, whatsappNumber: contact.whatsapp || contact.phone || "", email: contact.email || "", currency: business.currency || "ETB", locale: business.locale || "en-ET", deliveryNote: "Delivery fees, stock and lead times are confirmed by the showroom." };
      return <main className="ff-multipage" style={style}>{siteHeader}<section className="ff-mp-content"><div className="ff-mp-section-head"><span className="ff-mp-eyebrow">{pageTitle}</span><h2>{page === "cart" ? "Review the pieces you selected." : "Send your furniture enquiry."}</h2></div><FurnitureCheckout store={store} cartStorageKey={cartKey} productBasePath=""/></section></main>;
    }
    if (template === "ecommerce" || template === "grocery") {
      return <main className="ff-multipage" style={style}>{siteHeader}<section className="ff-mp-content"><ClientCommerceCheckout config={config} mode={page}/></section></main>;
    }
  }

  if (definition?.type === "food-menu") {
    return <FoodBusinessExperience business={foodBusiness(config)} />;
  }

  return <main className="ff-multipage" style={style}>
    <header className="ff-mp-header">
      <Link className="ff-mp-brand" href="/">
        {brand.logoUrl ? <img src={brand.logoUrl} alt={`${brand.name} logo`}/> : <span className="ff-mp-mark">{brand.name.slice(0,1).toUpperCase()}</span>}
        <strong>{brand.name}</strong>
      </Link>
      <nav aria-label="Main navigation"><Link href="/">Home</Link>{nav.map((item) => <Link key={item.href} href={item.href} aria-current={item.href === `/${page}` ? "page" : undefined}>{item.label}</Link>)}</nav>
      <div className="ff-mp-actions">
        {template === "furniture" ? <Link href="/checkout">Enquiry bag ↗</Link> : ["ecommerce", "grocery"].includes(template) ? <Link href="/cart">Cart ↗</Link> : orderEnabled ? <Link href={`/order/${slug}`}>Order online ↗</Link> : contact.phone ? <a href={`tel:${contact.phone}`}>Call us ↗</a> : <Link href="/contact">Contact ↗</Link>}
      </div>
    </header>

    <section className="ff-mp-hero">
      <div><span className="ff-mp-eyebrow">{brand.name} · {definition?.label || "Explore"}</span><h1>{title}</h1><p>{intro}</p>
        <div className="ff-mp-hero-actions"><Link className="ff-mp-primary" href={template === "furniture" || template === "ecommerce" || template === "grocery" ? "/shop" : "/menu"}>{template === "furniture" || template === "ecommerce" || template === "grocery" ? "Explore the shop" : "Explore the menu"} ↗</Link><Link className="ff-mp-text-link" href="/contact">Talk to the team</Link></div>
      </div>
      {brand.heroImageUrl && <div className="ff-mp-hero-image"><img src={brand.heroImageUrl} alt={`${brand.name} featured image`}/></div>}
    </section>

    {page === "shop" && template === "furniture" && <section className="ff-mp-content"><div className="ff-mp-section-head"><span className="ff-mp-eyebrow">THE COLLECTION</span><h2>Pieces for considered living.</h2><p>Explore the range, inspect product details and add selected pieces to your enquiry bag.</p></div><FurnitureExperience products={filteredProducts.map(normalizeFurnitureClientProduct)} money={(value) => money(value, config)} whatsappNumber={contact.whatsapp || contact.phone} brandName={brand.name} productBasePath="" checkoutPath="/checkout" cartStorageKey={cartKey} wishlistStorageKey={wishlistKey} adminStorageKey={adminKey}/></section>}

    {page === "shop" && ["ecommerce", "grocery"].includes(template) && <section className="ff-mp-content"><div className="ff-mp-section-head"><span className="ff-mp-eyebrow">THE COLLECTION</span><h2>Find what you need.</h2><p>Search the catalog, filter by category, save favorites and add products to your bag.</p></div><ClientCommerceExperience products={products} brand={{...brand, slug}} contact={contact} currency={business.currency} locale={business.locale} template={template}/></section>}

    {page === "collections" && <section className="ff-mp-content"><div className="ff-mp-section-head"><span className="ff-mp-eyebrow">BROWSE BY CATEGORY</span><h2>Explore the collections.</h2><p>Choose a category to see the products grouped for you.</p></div><div className="ff-mp-category-grid">{collectionCategories.map((category) => { const categorySlug = category.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""); const sample = products.find((product) => product.category === category); return <Link className="ff-mp-category-card" href={`/collections/${categorySlug}`} key={category}>{sample?.image && <img src={sample.image} alt=""/>}<span><small>{products.filter((product) => product.category === category).length} items</small><strong>{category}</strong><b>Explore ↗</b></span></Link>; })}</div><div className="ff-mp-inline-link"><Link className="ff-mp-primary" href="/shop">View all products ↗</Link></div></section>}

    {page === "collection-detail" && <section className="ff-mp-content"><div className="ff-mp-section-head"><span className="ff-mp-eyebrow">COLLECTION</span><h2>{selectedCategory || "Collection"}</h2><p>Browse items in this category.</p></div>{!selectedCategory ? <p>No products were found in this collection. <Link href="/collections">Back to collections</Link>.</p> : template === "furniture" ? <FurnitureExperience products={filteredProducts.map(normalizeFurnitureClientProduct)} money={(value) => money(value, config)} whatsappNumber={contact.whatsapp || contact.phone} brandName={brand.name} productBasePath="" checkoutPath="/checkout" cartStorageKey={cartKey} wishlistStorageKey={wishlistKey} adminStorageKey={adminKey}/> : <ClientCommerceExperience products={filteredProducts} brand={{...brand, slug}} contact={contact} currency={business.currency} locale={business.locale} template={template}/>}</section>}

    {page === "about" && <section className="ff-mp-content ff-mp-about"><div className="ff-mp-about-image">{brand.galleryImages?.[0] || brand.heroImageUrl ? <img src={brand.galleryImages?.[0] || brand.heroImageUrl} alt={`${brand.name} brand story`}/> : <span>{brand.name.slice(0,1)}</span>}</div><div><span className="ff-mp-eyebrow">OUR STORY</span><h2>{PAGE_COPY.about.title}</h2><p>{PAGE_COPY.about.body}</p><p>{brand.description}</p><div className="ff-mp-value-grid"><article><b>01</b><strong>Thoughtful choices</strong><small>Quality and care in the details.</small></article><article><b>02</b><strong>People first</strong><small>Helpful, personal service.</small></article><article><b>03</b><strong>Made for everyday</strong><small>Useful experiences customers can trust.</small></article></div></div></section>}

    {(page === "contact" || page === "catering" || page === "reservations") && <section className="ff-mp-content ff-mp-contact"><div><span className="ff-mp-eyebrow">{page === "reservations" ? "PLAN AHEAD" : page === "catering" ? "GROUPS & EVENTS" : "GET IN TOUCH"}</span><h2>{page === "reservations" ? "Send a reservation request." : page === "catering" ? "Let's plan something good." : "We'd love to hear from you."}</h2><p>{page === "reservations" ? "Share your preferred date, time and party size. The business will reply to confirm availability." : page === "catering" ? "Tell us a little about your event and what you have in mind." : "Questions, product enquiries and support requests are welcome."}</p><div className="ff-mp-contact-details">{business.address && <p><b>Address</b>{business.address}</p>}{business.hours && <p><b>Hours</b>{business.hours}</p>}{contact.phone && <p><b>Phone</b><a href={`tel:${contact.phone}`}>{contact.phone}</a></p>}{contact.email && <p><b>Email</b><a href={`mailto:${contact.email}`}>{contact.email}</a></p>}{mapUrl && <a className="ff-mp-text-link" href={mapUrl} target="_blank" rel="noreferrer">Get directions ↗</a>}</div></div><div className="ff-mp-form-card"><h3>{page === "reservations" ? "Reservation request" : page === "catering" ? "Event enquiry" : "Send a message"}</h3>{page === "contact" ? <ClientContactForm brandName={brand.name} email={contact.email} whatsapp={contact.whatsapp || contact.phone}/> : <ClientLeadForm brandName={brand.name} contact={contact} kind={page === "reservations" ? "booking" : "catering"} primary={theme.primary}/>}</div></section>}

    {(page === "visit" || page === "showroom") && <section className="ff-mp-content ff-mp-visit"><div><span className="ff-mp-eyebrow">COME FIND US</span><h2>{page === "showroom" ? "Visit the showroom." : "We'd love to see you."}</h2><p>Plan a visit, explore the space and speak with the team in person.</p><div className="ff-mp-contact-details"><p><b>Location</b>{business.address || "Add the verified business address."}</p><p><b>Opening hours</b>{business.hours || "Add confirmed business hours."}</p>{contact.phone && <p><b>Phone</b><a href={`tel:${contact.phone}`}>{contact.phone}</a></p>}</div>{mapUrl && <a className="ff-mp-primary" href={mapUrl} target="_blank" rel="noreferrer">Get directions ↗</a>}</div><div className="ff-mp-map-card"><span>⌖</span><strong>{brand.name}</strong><p>{business.address || "Business address to be confirmed"}</p><small>Map link opens the address search. Verify the exact pin before publishing.</small></div></section>}

    {page === "delivery" && <section className="ff-mp-content"><div className="ff-mp-section-head"><span className="ff-mp-eyebrow">FULFILMENT</span><h2>{PAGE_COPY.delivery.title}</h2><p>{PAGE_COPY.delivery.body}</p></div><div className="ff-mp-info-grid"><article><b>01 · Delivery</b><p>{business.fulfillment?.includes("delivery") ? `Delivery is offered as a fulfilment option. The current configured delivery fee is ${money(business.deliveryFee || 0, config)}; confirm coverage and the final fee with the business.` : "Delivery has not been enabled in this client configuration. Contact the business to ask about availability."}</p></article><article><b>02 · Pickup</b><p>{business.fulfillment?.includes("pickup") ? "Pickup is available as a configured fulfilment option. Confirm the collection location and ready time with the business." : "Pickup availability has not been confirmed. Contact the business for options."}</p></article><article><b>03 · Need help?</b><p>Contact the team before placing an order if you have questions about delivery areas, timing or special handling.</p><Link href="/contact">Contact the business ↗</Link></article></div></section>}

    {page === "shipping-returns" && <section className="ff-mp-content"><div className="ff-mp-section-head"><span className="ff-mp-eyebrow">CUSTOMER INFORMATION</span><h2>{PAGE_COPY.shipping.title}</h2><p>{PAGE_COPY.shipping.body}</p></div><div className="ff-mp-info-grid"><article><b>Shipping</b><p>Confirm available service areas, costs, dispatch timing and delivery estimates with the store.</p></article><article><b>Returns & exchanges</b><p>Insert the business-approved return window, eligible conditions, exclusions and process before launch.</p></article><article><b>Damaged or incorrect items</b><p>Publish the approved process for reporting an issue and the support contact customers should use.</p></article></div><p className="ff-mp-policy-note">This starter contains policy placeholders, not legal terms. Replace them with approved business policies before taking orders.</p></section>}

    {page === "care-guide" && <section className="ff-mp-content"><div className="ff-mp-section-head"><span className="ff-mp-eyebrow">CARE NOTES</span><h2>{PAGE_COPY.care.title}</h2><p>{PAGE_COPY.care.body}</p></div><div className="ff-mp-info-grid"><article><b>Wood & natural finishes</b><p>Use a soft dry or slightly damp cloth as directed by the maker. Avoid harsh cleaners unless the product instructions approve them.</p></article><article><b>Fabric & upholstery</b><p>Check the upholstery label and manufacturer cleaning code before spot cleaning or applying any product.</p></article><article><b>Assembly & maintenance</b><p>Follow the supplied assembly and maintenance instructions. Ask the showroom about replacement parts and product-specific care.</p></article></div></section>}

    {page === "faq" && <section className="ff-mp-content"><div className="ff-mp-section-head"><span className="ff-mp-eyebrow">HELP & SUPPORT</span><h2>{PAGE_COPY.faq.title}</h2><p>{PAGE_COPY.faq.body}</p></div><div className="ff-mp-faq">{[
      ["How can I ask about a product or menu item?", "Use the product enquiry or contact details on this website. The team can confirm availability and answer questions."],
      ["Are prices and stock always current?", "Prices and availability can change. Ask the business to confirm the latest details before completing an order."],
      ["How do I place an order?", orderEnabled ? "Use the ordering page to prepare your order and send the enquiry. The business must confirm it." : "Contact the business or use its approved external ordering service to confirm how orders are accepted."],
      ["How can I ask about delivery or returns?", "See the delivery or shipping information page and contact the business for its confirmed policies."]
    ].map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>}

    {page === "how-to-order" && <section className="ff-mp-content"><div className="ff-mp-section-head"><span className="ff-mp-eyebrow">ORDERING GUIDE</span><h2>{PAGE_COPY[page].title}</h2><p>{PAGE_COPY[page].body}</p></div><div className="ff-mp-info-grid"><article><b>01 · Browse</b><p>Explore the menu and select the products you would like.</p></article><article><b>02 · Customize</b><p>Choose available sizes, options or extras and add them to your order.</p></article><article><b>03 · Send & confirm</b><p>Review your details and send the prepared enquiry. Wait for the business to confirm your order.</p><Link href={orderEnabled ? `/order/${slug}` : "/menu"}>Start an order ↗</Link></article></div></section>}

    <footer className="ff-mp-footer"><div><Link href="/" className="ff-mp-footer-brand">{brand.name}</Link><p>{brand.tagline}</p></div><div className="ff-mp-footer-links"><Link href="/">Home</Link>{nav.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}{template === "furniture" && <Link href="/checkout">Enquiry bag</Link>}{["ecommerce","grocery"].includes(template) && <Link href="/cart">Shopping cart</Link>}</div><small>© {new Date().getFullYear()} {brand.name}. Confirm all business details and policies before launch.</small></footer>
  </main>;
}
