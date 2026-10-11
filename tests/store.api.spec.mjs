import { test, expect } from 'playwright/test';
const valid = { name:'Demo Tester',email:'qa@example.test',items:[{id:'bottle',quantity:1}],coupon:'QA10' };
test('API-01 catalog contract', async ({request}) => {
  const res = await request.get('/api/products'); expect(res.status()).toBe(200);
  const {products} = await res.json(); expect(products).toHaveLength(4);
  for(const p of products) { expect(typeof p.id).toBe('string'); expect(Number.isInteger(p.price)).toBe(true); expect(p.price).toBeGreaterThan(0); expect(Number.isInteger(p.stock)).toBe(true); }
});
test('API-02 price tampering ignored; server computes total', async ({request}) => {
  const res = await request.post('/api/orders',{data:{...valid,total:1,items:[{id:'bottle',quantity:1,price:1}]}});
  expect(res.status()).toBe(201); expect(await res.json()).toMatchObject({total:72000,subtotal:80000,discount:8000,status:'confirmed'});
});
for(const [title,items] of [
  ['empty cart',[]],['unknown product',[{id:'unknown',quantity:1}]],['zero quantity',[{id:'bottle',quantity:0}]],
  ['negative quantity',[{id:'bottle',quantity:-1}]],['fractional quantity',[{id:'bottle',quantity:1.5}]],
  ['sold out',[{id:'keyboard',quantity:1}]],['over stock',[{id:'bottle',quantity:6}]],
  ['duplicate items',[{id:'bottle',quantity:1},{id:'bottle',quantity:1}]]
]) test(`API-03 rejects ${title}`,async ({request}) => {
  const res = await request.post('/api/orders',{data:{...valid,items}}); expect(res.status()).toBe(400); expect((await res.json()).error).toEqual(expect.any(String));
});
test('API-04 rejects invalid coupon',async ({request}) => {
  const res = await request.post('/api/quote',{data:{items:valid.items,coupon:'INVALID'}}); expect(res.status()).toBe(400); expect(await res.json()).toEqual({error:'Invalid coupon.'});
});
test('API-05 rejects malformed JSON',async ({request}) => {
  const res = await request.post('/api/orders',{data:Buffer.from('{broken'),headers:{'Content-Type':'application/json'}}); expect(res.status()).toBe(400); expect(await res.json()).toEqual({error:'Invalid JSON.'});
});
test('API-06 quote has exact monetary values',async ({request}) => {
  const res = await request.post('/api/quote',{data:{items:[{id:'notebook',quantity:2},{id:'bottle',quantity:1}],coupon:'QA10'}});
  expect(res.status()).toBe(200); expect(await res.json()).toEqual({subtotal:130000,discount:13000,total:117000,currency:'INR'});
});
test('API-07 invalid email rejected',async ({request}) => {
  const res = await request.post('/api/orders',{data:{...valid,email:'bad'}}); expect(res.status()).toBe(400);
});
test('API-08 missing route returns 404',async ({request}) => { expect((await request.get('/api/missing')).status()).toBe(404); });
