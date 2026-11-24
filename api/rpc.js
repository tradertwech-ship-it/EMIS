'use strict';
// POST /api/rpc {m, a, d, t, nv} -> runs one app action on the server and returns {result, view, token, pass}.
// If the server cannot start, the reason is returned (no secrets) so the owner can fix it.
let L, E, loadErr = '';
try { L = require('./_lib'); E = require('./_engine'); } catch (e) { loadErr = String((e && e.message) || e).slice(0, 300); }
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (loadErr) return res.status(500).json({ error: 'Server files are incomplete: ' + loadErr });
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  try {
    const ip = String((req.headers && (req.headers['x-forwarded-for'] || '')) || '').split(',')[0].trim() || 'x';
    if (L.limited('rpc:' + ip, 240, 60000)) return res.status(429).json({ error: 'Too many requests. Please slow down.' });
    const b = await L.body(req); const r = await E.handle(b);
    res.status(r.status).json(r.json);
  } catch (e) { res.status(500).json({ error: 'Server problem: ' + String((e && e.message) || e).slice(0, 300) }); }
};
