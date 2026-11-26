const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const cut = (value, max) => String(value ?? "").trim().slice(0, max);

export function normalizePublicOrderPayload(input = {}) {
  const customerInput = input?.customer && typeof input.customer === "object" && !Array.isArray(input.customer) ? input.customer : {};
  const customer = {
    name: cut(customerInput.name, 120),
    phone: cut(customerInput.phone, 40),
    email: cut(customerInput.email, 254),
    address: cut(customerInput.address, 500),
    notes: cut(customerInput.notes, 1000),
    fulfillment: customerInput.fulfillment === "delivery" ? "delivery" : "pickup"
  };
  if (customer.name.length < 2 || customer.phone.length < 5) return { ok: false, error: "Enter a valid customer name and phone number." };
  if (customer.email && !EMAIL.test(customer.email)) return { ok: false, error: "Enter a valid email address." };
  if (customer.fulfillment === "delivery" && !customer.address) return { ok: false, error: "A delivery address is required." };
  if (!Array.isArray(input.items) || input.items.length < 1 || input.items.length > 40) return { ok: false, error: "An order must contain between 1 and 40 items." };
  const items = [];
  for (const entry of input.items) {
    const productId = String(entry?.product_id || "");
    const quantity = Number(entry?.quantity);
    if (!UUID.test(productId) || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return { ok: false, error: "An order item has an invalid product or quantity." };
    }
    const options = entry.options && typeof entry.options === "object" && !Array.isArray(entry.options) ? entry.options : {};
    items.push({ product_id: productId, quantity, options });
  }
  return { ok: true, customer, items };
}
