import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { products, quote, checkout } from './pricing.mjs';

const assets = new Map([
  ['/', ['index.html', 'text/html']],
  ['/app.js', ['app.js', 'text/javascript']],
  ['/styles.css', ['styles.css', 'text/css']]
]);
const send = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
};
async function jsonBody(req) {
  if (!(req.headers['content-type'] || '').startsWith('application/json')) throw new Error('Use application/json.');
  let text = '';
  for await (const chunk of req) {
    text += chunk;
    if (Buffer.byteLength(text) > 16384) throw new Error('Request too large.');
  }
  try { return JSON.parse(text); } catch { throw new Error('Invalid JSON.'); }
}
const server = http.createServer(async (req, res) => {
  try {
    const path = new URL(req.url, 'http://localhost').pathname;
    if (req.method === 'GET' && assets.has(path)) {
      const [file, type] = assets.get(path);
      res.writeHead(200, { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff' });
      return res.end(await readFile(new URL(file, import.meta.url)));
    }
    if (req.method === 'GET' && path === '/health') return send(res, 200, { status: 'ok', mode: 'demo' });
    if (req.method === 'GET' && path === '/api/products') return send(res, 200, { products });
    if (req.method === 'POST' && path === '/api/quote') {
      const body = await jsonBody(req);
      return send(res, 200, quote(body.items, body.coupon));
    }
    if (req.method === 'POST' && path === '/api/orders') {
      const body = await jsonBody(req);
      const totals = checkout(body);
      return send(res, 201, { id: `DEMO-${randomUUID()}`, status: 'confirmed', ...totals });
    }
    return send(res, 404, { error: 'Not found.' });
  } catch (error) { send(res, 400, { error: error.message }); }
});
server.listen(4173, '127.0.0.1', () => console.log('CartWise demo: http://127.0.0.1:4173'));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
