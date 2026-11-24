'use strict';
// GET /api/status -> which services are configured (booleans only, no secrets) and whether the server files load.
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  let out = { ok: true };
  try { const L = require('./_lib'); const c = L.cfg(); out = { ok: true, database: L.storeReady(c), has_url: !!c.sbUrl, has_service_key: !!c.sbService, has_app_secret: !!c.secret, sms: L.smsReady(c), email: L.emailReady(c), payments: L.payReady(c), whatsapp: L.waProvider(c) || false }; } catch (e) { out.lib_error = String((e && e.message) || e).slice(0, 200); }
  try { require('./_engine'); out.engine = 'loaded'; } catch (e) { out.engine = 'FAILED: ' + String((e && e.message) || e).slice(0, 300); }
  res.status(200).json(out);
};
