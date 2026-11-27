'use strict';
// GET  /api/push                          -> {key}   the public key a phone needs to subscribe
// POST /api/push {op:'pending', endpoint} -> {items}  what to show when a silent ping arrives (used by sw.js)
let L, E, loadErr = '';
try { L = require('./_lib'); E = require('./_engine'); } catch (e) { loadErr = String((e && e.message) || e).slice(0, 300); }
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (loadErr) return res.status(500).json({ error: 'Server files are incomplete: ' + loadErr });
  try {
    if (req.method === 'GET') return res.status(200).json({ key: E.pushKey() });
    if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
    const ip = String((req.headers && (req.headers['x-forwarded-for'] || '')) || '').split(',')[0].trim() || 'x';
    if (L.limited('push:' + ip, 120, 60000)) return res.status(429).json({ error: 'slow down' });
    const b = await L.body(req);
    if (b && b.op === 'pending' && typeof b.endpoint === 'string' && b.endpoint.length < 700) return res.status(200).json({ items: await E.pushPending(b.endpoint) });
    return res.status(400).json({ error: 'bad request' });
  } catch (e) { return res.status(500).json({ error: 'Server problem: ' + String((e && e.message) || e).slice(0, 200) }); }
};
