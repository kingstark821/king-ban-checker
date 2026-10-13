// KING BAN CHECKER - serveur sans dependance (Node 18+)
const http = require('http');
const fs = require('fs');
const path = require('path');

const E = process.env;
const PORT = E.PORT || 3000;
const API_URL = E.CHECK_API_URL || '';
const API_KEY = E.CHECK_API_KEY || '';
const KEY_HEADER = E.CHECK_API_KEY_HEADER || 'Authorization';
// Noms des champs JSON renvoyes par ton fournisseur (modifiables dans Render > Environment)
const F = {
  banned: E.BANNED_FIELD || 'banned',
  type: E.TYPE_FIELD || 'ban_type',
  violation: E.VIOLATION_FIELD || 'violation',
  category: E.CATEGORY_FIELD || 'category',
  appeal: E.APPEAL_FIELD || 'appeal',
  eu: E.EU_FIELD || 'eu',
  bannedAt: E.BANNED_AT_FIELD || 'banned_at',
  appealFiled: E.APPEAL_FILED_FIELD || 'appeal_filed',
  hours: E.DURATION_HOURS_FIELD || 'duration_hours',
  until: E.BANNED_UNTIL_FIELD || 'banned_until',
};
// A partir de combien de jours un ban est affiche "ban permanent" (3 mois ~ 90 jours)
const PERM_HOURS = (Number(E.PERMANENT_AFTER_DAYS) || 80) * 24;

const HITS = new Map(); // ip -> timestamps (limite 10 requetes / minute)
function limited(ip) {
  const now = Date.now();
  const recent = (HITS.get(ip) || []).filter((t) => now - t < 60000);
  recent.push(now);
  HITS.set(ip, recent);
  return recent.length > 10;
}

function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

const pick = (obj, dotted) => dotted.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
const clean = (v) => (v == null || v === '' || typeof v === 'object' ? null : typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v).slice(0, 80));

function durationHours(data) {
  const raw = pick(data, F.hours);
  if (raw != null && raw !== '' && isFinite(Number(raw))) return Number(raw);
  const a = Date.parse(pick(data, F.bannedAt));
  const b = Date.parse(pick(data, F.until));
  return isFinite(a) && isFinite(b) && b >= a ? (b - a) / 36e5 : null;
}

async function checkNumber(number) {
  if (!API_URL) {
    const err = new Error('Checker non configure: ajoute CHECK_API_URL dans les variables Render.');
    err.status = 503;
    throw err;
  }
  const headers = { Accept: 'application/json' };
  if (API_KEY) headers[KEY_HEADER] = API_KEY;
  const r = await fetch(API_URL.replace('{number}', encodeURIComponent(number)), { headers, signal: AbortSignal.timeout(10000) });
  if (!r.ok) {
    const err = new Error('Le fournisseur a repondu avec une erreur (' + r.status + ').');
    err.status = 502;
    throw err;
  }
  const data = await r.json();
  const banned = pick(data, F.banned);
  if (typeof banned !== 'boolean') {
    const err = new Error('Reponse du fournisseur invalide: le champ "' + F.banned + '" doit etre true ou false.');
    err.status = 502;
    throw err;
  }
  if (!banned) return { banned: false };
  const hours = durationHours(data);
  return {
    banned: true,
    permanent: hours != null && hours >= PERM_HOURS, // ban de 3 mois ou plus
    details: {
      type: clean(pick(data, F.type)),
      violation: clean(pick(data, F.violation)),
      category: clean(pick(data, F.category)),
      appeal: clean(pick(data, F.appeal)),
      eu: clean(pick(data, F.eu)),
      bannedAt: clean(pick(data, F.bannedAt)),
      appealFiled: clean(pick(data, F.appealFiled)),
    },
  };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (req.method === 'GET' && url.pathname === '/') {
      return send(res, 200, fs.readFileSync(path.join(__dirname, 'index.html')), 'text/html; charset=utf-8');
    }
    if (req.method === 'GET' && url.pathname === '/health') return send(res, 200, { ok: true });
    if (req.method === 'GET' && url.pathname === '/api/check') {
      const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
      if (limited(ip)) return send(res, 429, { error: 'Trop de recherches. Attends une minute.' });
      const number = (url.searchParams.get('number') || '').replace(/\D/g, '');
      if (number.length < 7 || number.length > 15) {
        return send(res, 400, { error: 'Entre un numero valide avec l\'indicatif pays (7 a 15 chiffres).' });
      }
      return send(res, 200, { number, ...(await checkNumber(number)) });
    }
    send(res, 404, { error: 'Introuvable' });
  } catch (e) {
    send(res, e.status || 500, { error: e.status ? e.message : 'Erreur serveur. Reessaie.' });
  }
});

server.listen(PORT, () => console.log('KING BAN CHECKER en ligne sur le port ' + PORT));
