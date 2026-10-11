const $ = id => document.getElementById(id);
const money = value => `₹${(value / 100).toFixed(2)}`;
let products = [], cart = [], coupon = '';
const key = 'cartwise-demo-cart';
try { cart = JSON.parse(localStorage.getItem(key) || '[]'); if (!Array.isArray(cart)) cart = []; } catch { cart = []; }
function message(id, text, error = false) { $(id).textContent = text; $(id).className = error ? 'error' : 'success'; }
function persist() { localStorage.setItem(key, JSON.stringify(cart)); }
function renderCatalog() {
  $('products').replaceChildren();
  const filtered = products.filter(p => p.name.toLowerCase().includes($('search').value.trim().toLowerCase()) && ($('category').value === 'All' || p.category === $('category').value));
  $('catalog-status').textContent = filtered.length ? `${filtered.length} products found` : 'No products found';
  for (const p of filtered) {
    const article = document.createElement('article'); article.className = 'product'; article.setAttribute('aria-label', p.name);
    const icon = document.createElement('div'); icon.className = 'product-icon'; icon.textContent = p.icon; icon.setAttribute('aria-hidden', 'true');
    const title = document.createElement('h3'); title.textContent = p.name;
    const category = document.createElement('p'); category.textContent = p.category;
    const price = document.createElement('strong'); price.textContent = money(p.price);
    const button = document.createElement('button'); button.textContent = p.stock ? `Add ${p.name}` : 'Out of stock'; button.disabled = !p.stock;
    button.onclick = () => {
      const item = cart.find(i => i.id === p.id);
      if (item && item.quantity >= p.stock) return message('cart-message', 'Maximum quantity reached.', true);
      if (item) item.quantity++; else cart.push({ id: p.id, quantity: 1 });
      message('cart-message', `${p.name} added.`); persist(); renderCart();
    };
    article.append(icon, title, category, price, button); $('products').append(article);
  }
}
function renderCart() {
  $('cart-items').replaceChildren();
  if (!cart.length) $('cart-items').textContent = 'Your cart is empty.';
  let subtotal = 0;
  for (const item of cart) {
    const p = products.find(p => p.id === item.id); subtotal += p.price * item.quantity;
    const row = document.createElement('div'); row.className = 'cart-line'; row.setAttribute('role','group'); row.setAttribute('aria-label', `${p.name} cart item`);
    const title = document.createElement('strong'); title.textContent = p.name;
    const controls = document.createElement('div'); controls.className = 'cart-controls';
    const minus = document.createElement('button'); minus.textContent = '−'; minus.setAttribute('aria-label', `Decrease ${p.name}`);
    minus.onclick = () => { if (--item.quantity === 0) cart = cart.filter(i => i.id !== p.id); persist(); renderCart(); };
    const quantity = document.createElement('span'); quantity.textContent = String(item.quantity); quantity.setAttribute('data-testid','quantity');
    const plus = document.createElement('button'); plus.textContent = '+'; plus.setAttribute('aria-label', `Increase ${p.name}`); plus.disabled = item.quantity >= p.stock;
    plus.onclick = () => { item.quantity++; persist(); renderCart(); };
    const remove = document.createElement('button'); remove.textContent = 'Remove'; remove.setAttribute('aria-label', `Remove ${p.name}`);
    remove.onclick = () => { cart = cart.filter(i => i.id !== p.id); persist(); renderCart(); };
    controls.append(minus, quantity, plus, remove); row.append(title, controls); $('cart-items').append(row);
  }
  const discount = coupon === 'QA10' ? Math.round(subtotal * .1) : 0;
  $('cart-count').textContent = String(cart.reduce((n,i) => n + i.quantity,0));
  $('subtotal').textContent = money(subtotal); $('discount').textContent = money(discount); $('total').textContent = money(subtotal - discount);
}
$('search').oninput = renderCatalog; $('category').onchange = renderCatalog;
$('apply-coupon').onclick = () => {
  const code = $('coupon').value.trim().toUpperCase();
  if (code !== 'QA10') { coupon = ''; message('cart-message','Invalid coupon.',true); } else { coupon = code; message('cart-message','10% discount applied.'); }
  renderCart();
};
$('checkout').onsubmit = async event => {
  event.preventDefault(); const button = $('place-order'); button.disabled = true;
  try {
    const response = await fetch('/api/orders', { method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:$('name').value,email:$('email').value,items:cart,coupon}) });
    const order = await response.json();
    if (!response.ok) return message('order-message',order.error,true);
    message('order-message',`Order confirmed: ${order.id} · ${money(order.total)}`);
    cart = []; coupon = ''; $('coupon').value = ''; persist(); renderCart();
  } catch { message('order-message','Service unavailable. Please try again.',true); } finally { button.disabled = false; }
};
try {
  const response = await fetch('/api/products'); if (!response.ok) throw new Error('Unavailable'); products = (await response.json()).products;
  const seen = new Set(); cart = cart.filter(i => { const p = products.find(p => p.id === i?.id); if (!p || !Number.isInteger(i.quantity) || i.quantity < 1 || i.quantity > p.stock || seen.has(i.id)) return false; seen.add(i.id); return true; });
  persist(); renderCatalog(); renderCart();
} catch { message('catalog-status','Catalog unavailable. Please refresh.',true); }
