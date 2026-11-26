export function getPriceAmount(price) {
  if (typeof price === "number" && Number.isFinite(price)) return price;
  const match = String(price || "").match(/[\d,.]+/);
  return match ? Number(match[0].replace(/,/g, "")) : 0;
}

export function addOrIncrementCartItem(items, item) {
  const found = items.some((entry) => entry.id === item.id);
  if (found) {
    return items.map((entry) => entry.id === item.id
      ? { ...entry, quantity: (entry.quantity || 1) + (item.quantity || 1) }
      : entry);
  }
  return [...items, { ...item, quantity: item.quantity || 1 }];
}

export function setCartItemQuantity(items, id, quantity) {
  if (quantity <= 0) return items.filter((item) => item.id !== id);
  return items.map((item) => item.id === id ? { ...item, quantity } : item);
}

export function removeCartItem(items, id) {
  return items.filter((item) => item.id !== id);
}

export function getCartCount(items) {
  return items.reduce((total, item) => total + (item.quantity || 1), 0);
}

export function getCartTotal(items) {
  return items.reduce((total, item) => total + getPriceAmount(item.unitPrice ?? item.price) * (item.quantity || 1), 0);
}
