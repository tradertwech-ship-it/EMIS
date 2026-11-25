'use strict';
const L = require('./_lib');
// POST /api/tts {text, voice, pass} -> speech from Google Gemini (the only voice the tutor uses), returned as a base64 WAV.
// Key from aistudio.google.com: set GEMINI_API_KEY (GOOGLE_API_KEY is also accepted).
const VOICES = ['Kore', 'Puck', 'Zephyr', 'Charon', 'Aoede', 'Leda', 'Sulafat'];
const findAudio = o => { if (!o || typeof o !== 'object') return ''; if (typeof o.data === 'string' && o.data.length > 800) return o.data; for (const k of Object.keys(o)) { const r = findAudio(o[k]); if (r) return r; } return ''; };
const toWav = b64 => { if (b64.startsWith('UklGR')) return b64; const pcm = Buffer.from(b64, 'base64'), h = Buffer.alloc(44); h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVEfmt ', 8); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(24000, 24); h.writeUInt32LE(48000, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(pcm.length, 40); return Buffer.concat([h, pcm]).toString('base64'); };
module.exports = async (req, res, deps) => {
  const f = (deps && deps.fetch) || fetch; res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method' });
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || ''; if (!key) return res.status(501).json({ ok: false, error: 'not_configured' });
  const b = await L.body(req);
  if (!(deps && deps.skipPass) && !L.checkPass(L.cfg().secret, b.pass)) return res.status(401).json({ ok: false, error: 'login' });
  const text = String(b.text || '').replace(/\s+/g, ' ').trim().slice(0, 700); if (!text) return res.status(400).json({ ok: false, error: 'No text.' });
  if (L.limited('tts:' + (req.headers && (req.headers['x-forwarded-for'] || '')), 200, 10 * 60000)) return res.status(429).json({ ok: false, error: 'Too many requests.' });
  const voice = VOICES.includes(b.voice) ? b.voice : (VOICES.includes(process.env.GEMINI_VOICE) ? process.env.GEMINI_VOICE : 'Kore');
  try {
    const r = await f('https://generativelanguage.googleapis.com/v1beta/interactions', { method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify({ model: process.env.GEMINI_TTS_MODEL || 'gemini-3.8-flash-tts', input: [{ type: 'user_input', content: [{ type: 'text', text }] }], response_format: { type: 'audio' }, generation_config: { speech_config: [{ voice }] } }) });
    if (!r.ok) return res.status(502).json({ ok: false, error: 'voice_failed' });
    const a = findAudio(await r.json()); if (!a) return res.status(502).json({ ok: false, error: 'voice_failed' });
    res.status(200).json({ ok: true, audio: toWav(a), mime: 'audio/wav' });
  } catch (e) { res.status(502).json({ ok: false, error: 'voice_failed' }); }
};
