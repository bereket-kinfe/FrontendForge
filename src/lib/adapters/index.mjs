/**
 * FrontendForge Provider Integration Adapters
 * Standardized interfaces for WhatsApp, Bookings, Payments, Delivery, and Maps.
 */

export const WhatsAppAdapter = {
  formatPhoneNumber(raw) {
    return String(raw || "").replace(/\D/g, "");
  },

  buildUrl(rawPhone, message = "") {
    const digits = this.formatPhoneNumber(rawPhone);
    if (!digits) return "";
    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
  },

  buildOrderMessage({ businessName, cart = [], subtotal = 0, deliveryFee = 0, total = 0, currency = "ETB", fulfillment = "pickup", customer = {} }) {
    const lines = cart.map((item) => {
      const details = [item.sizeLabel, ...(item.addonLabels || [])].filter(Boolean).join(", ");
      return `• ${item.quantity} × ${item.name}${details ? ` (${details})` : ""} — ${currency} ${Number(item.unitPrice * item.quantity).toLocaleString()}`;
    });

    const sections = [
      `Hello ${businessName}! I'd like to place an order:`,
      "",
      ...lines,
      "",
      `Subtotal: ${currency} ${Number(subtotal).toLocaleString()}`,
      `Fulfillment: ${fulfillment === "delivery" ? "Delivery" : "Pickup"}`,
      ...(fulfillment === "delivery" ? [
        `Delivery fee: ${currency} ${Number(deliveryFee).toLocaleString()}`,
        `Delivery address: ${customer.address || "As provided"}`
      ] : []),
      `Total: ${currency} ${Number(total).toLocaleString()}`,
      `Payment preference: ${customer.payment || "Cash on pickup / delivery"}`,
      ...(customer.name ? [`Customer name: ${customer.name}`] : []),
      ...(customer.note ? [`Note: ${customer.note}`] : [])
    ];
    return sections.join("\n");
  },

  buildEnquiryMessage({ brandName, items = [], total = 0, currency = "ETB" }) {
    const lines = items.map((item) => `• ${item.quantity} × ${item.name} — ${currency} ${Number((item.price || item.unitPrice || 0) * item.quantity).toLocaleString()}`);
    return [
      `Hello ${brandName || "there"}, I would like to enquire about these items:`,
      "",
      ...lines,
      "",
      `Estimated total: ${currency} ${Number(total).toLocaleString()}`,
      "Please confirm item availability, delivery timeline, and payment details."
    ].join("\n");
  }
};

export const BookingAdapter = {
  resolveAction({ provider = "Not selected", publicUrl = "", phone = "", email = "" }) {
    const p = provider.toLowerCase();
    if (p.includes("calendly") || p.includes("setmore") || publicUrl) {
      return {
        type: "external_link",
        label: `Book via ${provider !== "Not selected" ? provider : "Online Scheduler"} ↗`,
        url: publicUrl || "#booking",
        isConfigured: Boolean(publicUrl)
      };
    }
    if (p.includes("whatsapp") || phone) {
      const waUrl = WhatsAppAdapter.buildUrl(phone, "Hello, I would like to make an appointment or reservation.");
      return {
        type: "whatsapp",
        label: "Book via WhatsApp ↗",
        url: waUrl || (phone ? `tel:${phone}` : "#contact"),
        isConfigured: Boolean(waUrl || phone)
      };
    }
    return {
      type: "enquiry",
      label: "Enquire about a booking ↗",
      url: email ? `mailto:${email}` : "#contact",
      isConfigured: Boolean(email || phone)
    };
  }
};

export const PaymentAdapter = {
  resolveAction({ provider = "Not selected", publicUrl = "", currency = "ETB" }) {
    const p = provider.toLowerCase();
    if (p.includes("telebirr")) {
      return {
        provider: "Telebirr",
        type: "regional_gateway",
        badge: "Telebirr Merchant",
        instructions: "Pay with Telebirr SuperApp at counter, via QR code, or through approved merchant gateway.",
        checkoutUrl: publicUrl || null,
        isSandbox: !publicUrl
      };
    }
    if (p.includes("chapa")) {
      return {
        provider: "Chapa",
        type: "regional_gateway",
        badge: "Chapa Payment Gateway",
        instructions: "Secure checkout powered by Chapa (Cards, Telebirr, CBE Birr).",
        checkoutUrl: publicUrl || null,
        isSandbox: !publicUrl
      };
    }
    if (p.includes("stripe")) {
      return {
        provider: "Stripe",
        type: "card_gateway",
        badge: "Stripe Checkout",
        instructions: "Credit and debit cards processed securely via Stripe Checkout.",
        checkoutUrl: publicUrl || null,
        isSandbox: !publicUrl
      };
    }
    return {
      provider: provider || "Cash / In-store",
      type: "manual",
      badge: "Pay at store / delivery",
      instructions: `Cash, mobile transfer, or POS terminal on pickup or delivery (${currency}).`,
      checkoutUrl: null,
      isSandbox: false
    };
  }
};

export const MapsAdapter = {
  getDirectionsUrl(address = "") {
    if (!address.trim()) return "";
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.trim())}`;
  },

  getEmbedUrl(address = "") {
    if (!address.trim()) return "";
    return `https://maps.google.com/maps?q=${encodeURIComponent(address.trim())}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }
};
