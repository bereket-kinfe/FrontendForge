export function addCommerceItem(cart, product) {
  const existing = cart.find((item) => item.id === product.id);
  return existing
    ? cart.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
    : [...cart, { id: product.id, name: product.name, price: Number(product.price), image: product.image || "", quantity: 1 }];
}

export function changeCommerceQuantity(cart, id, amount) {
  return cart.map((item) => item.id === id ? { ...item, quantity: Math.max(0, item.quantity + amount) } : item).filter((item) => item.quantity > 0);
}

export function commerceCartTotals(cart) {
  return cart.reduce((result, item) => ({ count: result.count + item.quantity, subtotal: result.subtotal + item.price * item.quantity }), { count: 0, subtotal: 0 });
}

export function filterCommerceProducts(products, category = "All", query = "") {
  const term = query.toLowerCase().trim();
  return products.filter((product) => (category === "All" || (product.category || "Featured") === category) && `${product.name} ${product.description || ""}`.toLowerCase().includes(term));
}
