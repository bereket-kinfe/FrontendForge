export const siteDefaults = {
  businessName: "Your Business",
  email: "hello@example.com",
  phoneDisplay: "+251 900 000 000",
  address: "Add your business address",
  hours: "Add opening hours",
  currency: "ETB"
};

export function getWhatsAppUrl(message = "Hello, I would like to know more.") {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
