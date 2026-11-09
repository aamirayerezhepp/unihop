/* Firebase Cloud Function for the Қоян chat (2nd gen, needs the Blaze plan).
   The Kimi API key lives in Secret Manager (`firebase functions:secrets:set KIMI_API_KEY`), never in code or logs.
   Model, address and limits are parameters: defaults below, overrides in functions/.env (see .env.example). */
import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret, defineString, defineInt } from 'firebase-functions/params';
import { logger } from 'firebase-functions';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'node:fs';
import { createKoyan, DEFAULTS } from './src/core.js';

const KIMI_API_KEY = defineSecret('KIMI_API_KEY');
const P = {
  enabled:defineString('KOYAN_ENABLED', {default:'true'}),
  model:defineString('KIMI_MODEL', {default:DEFAULTS.model}),
  baseUrl:defineString('KIMI_BASE_URL', {default:DEFAULTS.baseUrl}),
  reasoningEffort:defineString('KIMI_REASONING_EFFORT', {default:DEFAULTS.reasoningEffort}),
  origins:defineString('KOYAN_ALLOWED_ORIGINS', {default:DEFAULTS.origins.join(',')}),
  salt:defineString('KOYAN_HASH_SALT', {default:'unihop-koyan'}),
  maxInputChars:defineInt('KOYAN_MAX_INPUT_CHARS', {default:DEFAULTS.maxInputChars}),
  historyTurns:defineInt('KOYAN_HISTORY_TURNS', {default:DEFAULTS.historyTurns}),
  historyChars:defineInt('KOYAN_HISTORY_CHARS', {default:DEFAULTS.historyChars}),
  maxOutputTokens:defineInt('KOYAN_MAX_OUTPUT_TOKENS', {default:DEFAULTS.maxOutputTokens}),
  maxToolRounds:defineInt('KOYAN_MAX_TOOL_ROUNDS', {default:DEFAULTS.maxToolRounds}),
  maxRetries:defineInt('KOYAN_MAX_RETRIES', {default:DEFAULTS.maxRetries}),
  userDaily:defineInt('KOYAN_USER_DAILY_MESSAGES', {default:DEFAULTS.userDaily}),
  ipDaily:defineInt('KOYAN_IP_DAILY_MESSAGES', {default:DEFAULTS.ipDaily}),
  maxConcurrent:defineInt('KOYAN_MAX_CONCURRENT_PER_USER', {default:DEFAULTS.maxConcurrent}),
  dailyTokenCap:defineInt('KOYAN_DAILY_TOKEN_CAP', {default:DEFAULTS.dailyTokenCap}),
  monthlyTokenCap:defineInt('KOYAN_MONTHLY_TOKEN_CAP', {default:DEFAULTS.monthlyTokenCap}),
  // Prices in US dollars per 1M tokens, copied from the current Kimi price page. 0 = cost is not tracked, only tokens.
  priceInPerM:defineString('KIMI_PRICE_INPUT_PER_M', {default:'0'}),
  priceOutPerM:defineString('KIMI_PRICE_OUTPUT_PER_M', {default:'0'}),
  monthlyUsdCap:defineString('KOYAN_MONTHLY_USD_CAP', {default:'0'})
};

initializeApp();
const db = getFirestore();
const kb = JSON.parse(readFileSync(new URL('./kb.json', import.meta.url), 'utf8'));

/* Limits in Firestore. Clients cannot read or write these collections (firestore.rules closes everything but users/{uid}). */
const store = {
  async reserve({uid, ipHash, day, month, at, cfg}){
    const uRef = db.doc(`koyan_limits/u_${uid}`), iRef = db.doc(`koyan_limits/ip_${ipHash}`);
    const dRef = db.doc(`koyan_usage/d_${day}`), mRef = db.doc(`koyan_usage/m_${month}`);
    return db.runTransaction(async tx => {
      const [u, i, d, m] = await Promise.all([tx.get(uRef), tx.get(iRef), tx.get(dRef), tx.get(mRef)]);
      const ud = u.data() || {}, id = i.data() || {}, dd = d.data() || {}, md = m.data() || {};
      const locks = (ud.locks || []).filter(t => t > at);
      if ((dd.tokens || 0) >= cfg.dailyTokenCap || (md.tokens || 0) >= cfg.monthlyTokenCap || (cfg.monthlyUsdCap > 0 && (md.costMicro || 0) >= cfg.monthlyUsdCap * 1e6)) return {ok:false, code:'budget'};
      if (locks.length >= cfg.maxConcurrent) return {ok:false, code:'concurrent'};
      const uCount = ud.day === day ? ud.count || 0 : 0, iCount = id.day === day ? id.count || 0 : 0;
      if (uCount >= cfg.userDaily) return {ok:false, code:'limit'};
      if (iCount >= cfg.ipDaily) return {ok:false, code:'limit'};
      tx.set(uRef, {day, count:uCount + 1, locks:[...locks, at + cfg.lockMs]});
      tx.set(iRef, {day, count:iCount + 1});
      return {ok:true};
    });
  },
  async release({uid, day, month, tokens, costMicro, at}){
    const uRef = db.doc(`koyan_limits/u_${uid}`);
    await db.runTransaction(async tx => {
      const u = await tx.get(uRef), ud = u.data() || {};
      const locks = (ud.locks || []); const i = locks.findIndex(t => t > at); if (i >= 0) locks.splice(i, 1);
      tx.set(uRef, {...ud, locks});
    });
    const inc = {tokens:FieldValue.increment(tokens), costMicro:FieldValue.increment(costMicro), requests:FieldValue.increment(1)};
    await Promise.all([db.doc(`koyan_usage/d_${day}`).set(inc, {merge:true}), db.doc(`koyan_usage/m_${month}`).set(inc, {merge:true})]);
  }
};

let handler = null;
function getHandler(){
  if (handler) return handler;
  const n = v => Number(v) || 0;
  handler = createKoyan({
    enabled:P.enabled.value() !== 'false', apiKey:KIMI_API_KEY.value(), model:P.model.value(), baseUrl:P.baseUrl.value(), reasoningEffort:P.reasoningEffort.value(),
    origins:P.origins.value().split(',').map(s => s.trim()).filter(Boolean), salt:P.salt.value(),
    maxInputChars:P.maxInputChars.value(), historyTurns:P.historyTurns.value(), historyChars:P.historyChars.value(), maxOutputTokens:P.maxOutputTokens.value(),
    maxToolRounds:P.maxToolRounds.value(), maxRetries:P.maxRetries.value(), userDaily:P.userDaily.value(), ipDaily:P.ipDaily.value(), maxConcurrent:P.maxConcurrent.value(),
    dailyTokenCap:P.dailyTokenCap.value(), monthlyTokenCap:P.monthlyTokenCap.value(),
    priceInPerM:n(P.priceInPerM.value()), priceOutPerM:n(P.priceOutPerM.value()), monthlyUsdCap:n(P.monthlyUsdCap.value())
  }, {kb, store, verifyToken:t => getAuth().verifyIdToken(t), log:e => logger.info('koyan', e)});
  return handler;
}

export const koyan = onRequest({region:'europe-west1', secrets:[KIMI_API_KEY], timeoutSeconds:120, memory:'512MiB', maxInstances:5, concurrency:40},
  (req, res) => getHandler()(req, res));
