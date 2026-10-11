export const products = Object.freeze([
  { id: 'notebook', name: 'Everyday Notebook', category: 'Stationery', price: 25000, stock: 5, icon: '📓' },
  { id: 'bottle', name: 'Steel Water Bottle', category: 'Lifestyle', price: 80000, stock: 5, icon: '🥤' },
  { id: 'headphones', name: 'Studio Headphones', category: 'Electronics', price: 150000, stock: 5, icon: '🎧' },
  { id: 'keyboard', name: 'Compact Keyboard', category: 'Electronics', price: 220000, stock: 0, icon: '⌨️' }
]);

export function quote(items, coupon = '') {
  if (!Array.isArray(items) || items.length === 0 || items.length > products.length) throw new Error('Cart must contain 1–4 unique products.');
  const seen = new Set();
  let subtotal = 0;
  for (const item of items) {
    const product = products.find(p => p.id === item?.id);
    if (!product || seen.has(item.id)) throw new Error('Unknown or duplicate product.');
    seen.add(item.id);
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > product.stock) throw new Error('Quantity exceeds available stock or is invalid.');
    subtotal += product.price * item.quantity;
  }
  if (typeof coupon !== 'string') throw new Error('Invalid coupon.');
  const code = coupon.trim().toUpperCase();
  if (code && code !== 'QA10') throw new Error('Invalid coupon.');
  const discount = code === 'QA10' ? Math.round(subtotal * 0.1) : 0;
  return { subtotal, discount, total: subtotal - discount, currency: 'INR' };
}

export function checkout(payload) {
  if (!payload || typeof payload !== 'object') throw new Error('Invalid order.');
  if (typeof payload.name !== 'string' || payload.name.trim().length < 2 || payload.name.length > 100) throw new Error('Enter a name of 2–100 characters.');
  if (typeof payload.email !== 'string' || payload.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) throw new Error('Enter a valid email address.');
  return quote(payload.items, payload.coupon);
}
