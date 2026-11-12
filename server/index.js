/* Қоян chat server for Render (or any Node 22 host). The Kimi key comes only from the environment.
   Routes: GET /health — status for monitoring; GET / — {configured}; POST / — the chat (server-sent events).
   `node server/index.js --local` runs a local test server on 127.0.0.1 that also accepts a one-time
   test token written to server/.dev-token (for scripts; never use --local on Render). */
import http from 'node:http';
import { randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { createKoyan, DEFAULTS } from './src/core.js';
import { firestoreStore, memoryStore } from './store.js';

const env = process.env;
const LOCAL = process.argv.includes('--local');
const num = (v, d) => v !== undefined && v !== '' && !Number.isNaN(Number(v)) ? Number(v) : d;
/* The verified database snapshot. Rebuilt from src/data at startup when the full repository is present,
   so the server never depends on a separate build step; otherwise the committed server/kb.json is used. */
try { await import('../scripts/build-kb.mjs'); }
catch (e) { console.warn('using the committed server/kb.json (could not rebuild it: ' + (e.code || e.message) + ')'); }
const kb = JSON.parse(readFileSync(new URL('./kb.json', import.meta.url), 'utf8'));

const cfg = {
  enabled:env.KOYAN_ENABLED !== 'false', apiKey:env.KIMI_API_KEY || '',
  model:env.KIMI_MODEL || DEFAULTS.model, baseUrl:env.KIMI_BASE_URL || DEFAULTS.baseUrl, reasoningEffort:env.KIMI_REASONING_EFFORT || DEFAULTS.reasoningEffort,
  origins:(env.KOYAN_ALLOWED_ORIGINS || DEFAULTS.origins.join(',')).split(',').map(s => s.trim()).filter(Boolean),
  salt:env.KOYAN_HASH_SALT || DEFAULTS.salt,
  maxInputChars:num(env.KOYAN_MAX_INPUT_CHARS, DEFAULTS.maxInputChars), historyTurns:num(env.KOYAN_HISTORY_TURNS, DEFAULTS.historyTurns),
  historyChars:num(env.KOYAN_HISTORY_CHARS, DEFAULTS.historyChars), maxOutputTokens:num(env.KOYAN_MAX_OUTPUT_TOKENS, DEFAULTS.maxOutputTokens),
  maxToolRounds:num(env.KOYAN_MAX_TOOL_ROUNDS, DEFAULTS.maxToolRounds), maxRetries:num(env.KOYAN_MAX_RETRIES, DEFAULTS.maxRetries),
  userDaily:num(env.KOYAN_USER_DAILY_MESSAGES, DEFAULTS.userDaily), ipDaily:num(env.KOYAN_IP_DAILY_MESSAGES, DEFAULTS.ipDaily),
  maxConcurrent:num(env.KOYAN_MAX_CONCURRENT_PER_USER, DEFAULTS.maxConcurrent),
  dailyTokenCap:num(env.KOYAN_DAILY_TOKEN_CAP, DEFAULTS.dailyTokenCap), monthlyTokenCap:num(env.KOYAN_MONTHLY_TOKEN_CAP, DEFAULTS.monthlyTokenCap),
  priceInPerM:num(env.KIMI_PRICE_INPUT_PER_M, 0), priceOutPerM:num(env.KIMI_PRICE_OUTPUT_PER_M, 0), monthlyUsdCap:num(env.KOYAN_MONTHLY_USD_CAP, 0)
};

/* Firebase: verify Google sign-in (needs only the project id) and, with a service account, count limits in Firestore. */
const projectId = env.FIREBASE_PROJECT_ID || 'unihop-88ba6';
let verifyGoogle = async () => { throw new Error('auth unavailable'); }, store = memoryStore();
try {
  const { initializeApp, cert } = await import('firebase-admin/app');
  const { getAuth } = await import('firebase-admin/auth');
  let credential;
  if (env.FIREBASE_SERVICE_ACCOUNT) credential = cert(JSON.parse(env.FIREBASE_SERVICE_ACCOUNT));
  initializeApp(credential ? {credential, projectId} : {projectId});
  verifyGoogle = t => getAuth().verifyIdToken(t);
  if (credential) {
    const { getFirestore, FieldValue } = await import('firebase-admin/firestore');
    store = firestoreStore(getFirestore(), FieldValue);
  }
} catch (e) {
  console.error('firebase setup failed:', e.code || e.message);
}
if (store.kind === 'memory' && !LOCAL) console.warn('FIREBASE_SERVICE_ACCOUNT is not set: limits are kept in memory and reset when the service restarts or sleeps.');

/* Local test mode: a random token accepted as a signed-in student. */
let devToken = null;
if (LOCAL) {
  devToken = randomBytes(24).toString('hex');
  writeFileSync(new URL('./.dev-token', import.meta.url), devToken);
}
const verifyToken = async t => devToken && t === devToken ? {uid:'local-test', firebase:{sign_in_provider:'google.com'}} : verifyGoogle(t);

const log = e => console.log(JSON.stringify(e));   // counters and codes only — never message text
const handle = createKoyan(cfg, {kb, store, verifyToken, log});

/* Minimal Express-like wrapper around Node's request/response. */
const server = http.createServer((req, res) => {
  const path = (req.url || '/').split('?')[0];
  if (req.method === 'GET' && path === '/health') {
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ok:true, configured:!!(cfg.enabled && cfg.apiKey), model:cfg.model, limits:store.kind, data:kb.built}));
  }
  if (path !== '/') { res.statusCode = 404; return res.end(); }
  let size = 0, data = '';
  req.on('data', c => {
    size += c.length;
    if (size > 64 * 1024) { res.statusCode = 413; res.end(); req.destroy(); return; }
    data += c;
  });
  req.on('end', async () => {
    if (res.writableEnded) return;
    try { req.body = data ? JSON.parse(data) : {}; } catch (e) { req.body = {}; }
    req.ip = req.socket.remoteAddress;
    const r = {
      status(c){ res.statusCode = c; return r; }, set(k, v){ res.setHeader(k, v); },
      json(o){ res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); return r; },
      write(s){ res.write(s); }, end(){ res.end(); }, flushHeaders(){ res.flushHeaders(); }, on(ev, fn){ res.on(ev, fn); }
    };
    try { await handle(req, r); }
    catch (e) { log({event:'koyan', code:'crash', err:e.code || e.name}); if (!res.headersSent) { res.statusCode = 500; res.end(); } else res.end(); }
  });
});

const port = num(env.PORT, 8787);
server.listen(port, LOCAL ? '127.0.0.1' : '0.0.0.0', () => {
  console.log(`Қоян server on port ${port} — model ${cfg.model}, key ${cfg.apiKey ? 'set' : 'MISSING'}, limits in ${store.kind}${LOCAL ? ', local test mode' : ''}`);
});
