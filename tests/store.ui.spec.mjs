import { test, expect } from 'playwright/test';
import { StorePage } from './pages/store.page.mjs';
test.beforeEach(async ({page}) => { await new StorePage(page).open(); });
test('UI-01 catalog and sold-out product', async ({page}) => {
  await expect(page.getByRole('article')).toHaveCount(4);
  await expect(page.getByRole('article',{name:'Compact Keyboard'}).getByRole('button')).toBeDisabled();
});
test('UI-02 search is case insensitive', async ({page}) => {
  await new StorePage(page).search('HEADPHONES');
  await expect(page.getByRole('article')).toHaveCount(1);
  await expect(page.getByRole('heading',{name:'Studio Headphones',exact:true})).toBeVisible();
});
test('UI-03 empty search result and recovery', async ({page}) => {
  const store = new StorePage(page); await store.search('missing-product');
  await expect(page.getByText('No products found',{exact:true})).toBeVisible();
  await store.search(''); await expect(page.getByRole('article')).toHaveCount(4);
});
test('UI-04 category filter', async ({page}) => {
  await page.getByRole('combobox',{name:'Category',exact:true}).selectOption('Electronics');
  await expect(page.getByRole('article')).toHaveCount(2);
  await expect(page.getByRole('article',{name:'Everyday Notebook'})).toHaveCount(0);
});
test('UI-05 multiple products and independent price oracle', async ({page}) => {
  const store = new StorePage(page); await store.add('Everyday Notebook'); await store.add('Steel Water Bottle');
  await expect(page.getByTestId('cart-count')).toHaveText('2');
  await expect(page.getByTestId('total')).toHaveText('₹1050.00');
});
test('UI-06 quantity and removal', async ({page}) => {
  await new StorePage(page).add('Everyday Notebook');
  await page.getByRole('button',{name:'Increase Everyday Notebook',exact:true}).click();
  await expect(page.getByTestId('total')).toHaveText('₹500.00');
  await page.getByRole('button',{name:'Decrease Everyday Notebook',exact:true}).click();
  await expect(page.getByTestId('total')).toHaveText('₹250.00');
  await page.getByRole('button',{name:'Remove Everyday Notebook',exact:true}).click();
  await expect(page.getByText('Your cart is empty.',{exact:true})).toBeVisible();
});
test('UI-07 stock limit prevents sixth unit', async ({page}) => {
  const store = new StorePage(page); for(let i=0;i<6;i++) await store.add('Everyday Notebook');
  await expect(page.getByTestId('cart-count')).toHaveText('5');
  await expect(page.getByText('Maximum quantity reached.',{exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Increase Everyday Notebook',exact:true})).toBeDisabled();
});
test('UI-08 coupon calculates discount and rejects unknown code', async ({page}) => {
  const store = new StorePage(page); await store.add('Steel Water Bottle'); await store.applyCoupon(' qa10 ');
  await expect(page.getByTestId('discount')).toHaveText('₹80.00'); await expect(page.getByTestId('total')).toHaveText('₹720.00');
  await store.applyCoupon('NOPE'); await expect(page.getByText('Invalid coupon.',{exact:true})).toBeVisible();
  await expect(page.getByTestId('discount')).toHaveText('₹0.00');
});
test('UI-09 cart survives reload', async ({page}) => {
  await new StorePage(page).add('Studio Headphones'); await page.reload();
  await expect(page.getByTestId('cart-count')).toHaveText('1'); await expect(page.getByTestId('total')).toHaveText('₹1500.00');
});
test('UI-10 validation rejects invalid email', async ({page}) => {
  const store = new StorePage(page); await store.add('Everyday Notebook'); await store.placeOrder('Demo Tester','invalid');
  await expect(page.getByText('Enter a valid email address.',{exact:true})).toBeVisible();
  await expect(page.getByTestId('cart-count')).toHaveText('1');
});
test('UI-11 checkout integrates UI, API and cart reset', async ({page}) => {
  const store = new StorePage(page); await store.add('Steel Water Bottle'); await store.applyCoupon('QA10');
  const result = page.waitForResponse(r => r.url().endsWith('/api/orders') && r.request().method() === 'POST');
  await store.placeOrder(); const response = await result;
  expect(response.status()).toBe(201); expect(await response.json()).toMatchObject({status:'confirmed',total:72000,currency:'INR'});
  await expect(page.getByText(/Order confirmed: DEMO-/)).toBeVisible(); await expect(page.getByTestId('cart-count')).toHaveText('0');
});
test('UI-12 empty cart checkout rejected', async ({page}) => {
  await new StorePage(page).placeOrder(); await expect(page.getByText('Cart must contain 1–4 unique products.',{exact:true})).toBeVisible();
});
test('UI-13 network failure preserves cart for retry', async ({page}) => {
  const store = new StorePage(page); await store.add('Everyday Notebook');
  await page.route('**/api/orders', route => route.abort()); await store.placeOrder();
  await expect(page.getByText('Service unavailable. Please try again.',{exact:true})).toBeVisible();
  await expect(page.getByTestId('cart-count')).toHaveText('1');
  await expect(page.getByRole('button',{name:'Place demo order',exact:true})).toBeEnabled();
});
test('UI-14 responsive layout has no horizontal overflow', async ({page}) => {
  await new StorePage(page).add('Studio Headphones');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
