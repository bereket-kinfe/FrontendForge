import Container from "@/components/ui/Container";
import { siteDefaults } from "@/config/site";

export default function SiteFooter({ brand, tagline, email = siteDefaults.email, phone = siteDefaults.phoneDisplay, theme = "dark" }) {
  return <footer className={`site-footer footer-${theme}`}><Container><div className="footer-main">
    <div><a href="#top" className="footer-brand">{brand}</a><p>{tagline}</p></div>
    <div className="footer-contact"><span>Get in touch</span><a href={`mailto:${email}`}>{email}</a><a href={`tel:${phone.replace(/[^+\d]/g, "")}`}>{phone}</a></div>
  </div><div className="footer-bottom"><span>© {new Date().getFullYear()} {brand}. Replace demo details before launch.</span><a href="#top">Back to top ↑</a></div></Container></footer>;
}