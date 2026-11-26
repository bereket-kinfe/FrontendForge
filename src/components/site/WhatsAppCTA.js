import { getWhatsAppUrl } from "@/config/site";

export default function WhatsAppCTA({ children = "Chat on WhatsApp", message }) {
  const url = getWhatsAppUrl(message);
  if (!url) return <span className="setup-note">Set NEXT_PUBLIC_WHATSAPP_NUMBER to activate WhatsApp</span>;
  return <a className="button button-whatsapp" href={url} target="_blank" rel="noreferrer">{children}</a>;
}