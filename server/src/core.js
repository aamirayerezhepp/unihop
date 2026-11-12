/* The Қоян endpoint, independent of Firebase so it can be tested with fakes.
   POST: check origin, sign-in, input and limits -> find relevant database fragments -> call Kimi (one assistant,
   at most `maxToolRounds` searches) -> stream the answer back as server-sent events.
   GET: tells the site whether the chat is configured. Message text is never logged. */
import { createHash } from 'node:crypto';
import { createRetriever, contextText, sourcesOf } from './retrieve.js';
import { systemPrompt, letterPrompt, carePrompt } from './prompt.js';
import { isCrisis, CRISIS_TEXT } from './crisis.js';
import { streamChat, errorCode, retryable, KimiError } from './kimi.js';

const TOOLS = [{type:'function', function:{
  name:'search_database',
  description:'Поиск по проверенной базе UniHop: программы, стипендии, каталог вузов, факты о поступлении. Возвращает фрагменты с источниками и датой проверки.',
  parameters:{type:'object', properties:{query:{type:'string', description:'Что искать: вуз, страна, направление, стипендия, экзамен'}}, required:['query'], additionalProperties:false}
}}];

export const DEFAULTS = {
  enabled:true, model:'kimi-k3.1-pro', baseUrl:'https://api.moonshot.ai/v1', reasoningEffort:'low',
  origins:['https://unihop-88ba6.web.app', 'https://unihop-88ba6.firebaseapp.com', 'http://localhost:5173'],
  requireGoogle:true,
  maxInputChars:1200, maxDraftChars:5000, letterHistoryChars:14000, maxAssistantChars:2000, historyTurns:8, historyChars:8000, maxOutputTokens:2500,
  maxToolRounds:2, maxRetries:1, toolResultChars:6000,
  userDaily:30, ipDaily:60, maxConcurrent:1, lockMs:120000,
  dailyTokenCap:1000000, monthlyTokenCap:10000000, priceInPerM:0, priceOutPerM:0, monthlyUsdCap:0, salt:'unihop'
};

const sha = s => createHash('sha256').update(s).digest('hex').slice(0, 20);

export function createKoyan(config, deps){
  const cfg = {...DEFAULTS, ...config};
  const retrieve = createRetriever(deps.kb);
  const now = deps.now || (() => new Date());
  const log = deps.log || (() => {});
  const fetchImpl = deps.fetchImpl || fetch;

  return async function handle(req, res){
    const origin = req.headers.origin || '';
    const allowed = cfg.origins.includes(origin);
    if (allowed) {
      res.set('Access-Control-Allow-Origin', origin); res.set('Vary', 'Origin');
      res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type'); res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    }
    if (req.method === 'OPTIONS') return res.status(allowed ? 204 : 403).end();
    if (req.method === 'GET') return res.status(200).json({configured:!!(cfg.enabled && cfg.apiKey)});
    if (req.method !== 'POST') return res.status(405).json({code:'method'});
    if (!allowed) return res.status(403).json({code:'origin'});
    if (!cfg.enabled || !cfg.apiKey) return res.status(503).json({code:'not_configured'});

    /* sign-in: a Firebase ID token from Google sign-in */
    let uid;
    try {
      const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
      const d = await deps.verifyToken(token);
      if (cfg.requireGoogle && !(d.firebase && d.firebase.sign_in_provider === 'google.com')) throw new Error('provider');
      uid = d.uid;
    } catch (e) { return res.status(401).json({code:'auth'}); }

    /* input: shape and size. Three assistants share this endpoint: Қоян (questions), the letter coach, support. */
    const b = req.body && typeof req.body === 'object' ? req.body : {};
    const lang = ['ru', 'kz', 'en'].includes(b.lang) ? b.lang : 'ru';
    const mode = ['koyan', 'letter', 'care'].includes(b.mode) ? b.mode : 'koyan';
    const maxIn = mode === 'letter' ? cfg.maxDraftChars : cfg.maxInputChars;
    const maxHist = mode === 'letter' ? cfg.letterHistoryChars : cfg.historyChars;
    let msgs = (Array.isArray(b.messages) ? b.messages : []).filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string');
    if (!msgs.length || msgs[msgs.length - 1].role !== 'user') return res.status(400).json({code:'input'});
    const question = msgs[msgs.length - 1].content.trim();
    if (!question || question.length > maxIn) return res.status(400).json({code:'input'});
    msgs = msgs.slice(-cfg.historyTurns).map(m => ({role:m.role, content:m.content.slice(0, m.role === 'user' ? maxIn : cfg.maxAssistantChars)}));
    while (msgs.length > 1 && msgs.reduce((n, m) => n + m.content.length, 0) > maxHist) msgs.shift();
    while (msgs.length && msgs[0].role !== 'user') msgs.shift();

    const t0 = now(), day = t0.toISOString().slice(0, 10), month = day.slice(0, 7);
    const ip = String((req.headers['x-forwarded-for'] || '').split(',')[0] || req.ip || '').trim();
    const ipHash = sha(cfg.salt + '|' + ip), uidHash = sha(cfg.salt + '|' + uid);
    const startStream = () => {
      res.status(200);
      res.set('Content-Type', 'text/event-stream; charset=utf-8'); res.set('Cache-Control', 'no-cache, no-transform'); res.set('X-Accel-Buffering', 'no');
      if (res.flushHeaders) res.flushHeaders();
    };
    const send = o => res.write(`data: ${JSON.stringify(o)}\n\n`);

    /* crisis words: help numbers at once, without the model, without counting against limits or caps */
    if (isCrisis(question)) {
      startStream();
      send({t:'delta', text:CRISIS_TEXT[lang]}); send({t:'crisis'}); send({t:'done'});
      res.end();
      log({event:'koyan', uid:uidHash, mode, code:'crisis'});
      return;
    }

    /* limits: per user, per network address, concurrency and the overall spending cap */
    const lock = await deps.store.reserve({uid, ipHash, day, month, at:t0.getTime(), cfg});
    if (!lock.ok) { log({event:'koyan', uid:uidHash, mode, code:lock.code}); return res.status(lock.code === 'budget' ? 503 : 429).json({code:lock.code}); }

    /* relevant fragments of the verified database (not for the support chat) */
    const apps = Array.isArray(b.apps) ? b.apps.slice(0, 10) : [];
    const programIds = [...(Array.isArray(b.focus) ? b.focus : []), ...apps.map(a => a && a.programId)].filter(x => typeof x === 'string').slice(0, 4);
    const prev = msgs.length > 1 ? msgs[msgs.length - 2].content.slice(0, 300) : '';
    const found = mode === 'care' ? {programs:[], grants:[], catalog:[], facts:[]}
      : retrieve(mode === 'letter' ? 'мотивационное письмо motivation letter' : question + ' ' + prev, {programIds, limit:mode === 'letter' ? {programs:0, grants:0, catalog:0, facts:0} : undefined});
    let sources = sourcesOf(found);
    const ctx = {lang, today:day, profile:b.profile, apps, names:deps.kb.names, context:contextText(found)};
    const system = mode === 'letter' ? letterPrompt({...ctx, draftChars:question.length})
      : mode === 'care' ? carePrompt({lang, today:day, profile:b.profile, checkin:b.checkin})
      : systemPrompt({...ctx, matches:b.matches});
    const toolRounds = mode === 'care' ? 0 : cfg.maxToolRounds;

    startStream();
    const ctl = new AbortController();
    let finished = false;
    // The browser went away (tab closed or "Stop"): stop paying for the rest of the answer.
    // Watch the response, not the request — Node closes the request as soon as its body has been read.
    if (res.on) res.on('close', () => { if (!finished) ctl.abort(); });

    const usage = {in:0, out:0};
    let answer = '', rounds = 0, tools = 0, code = null;
    const conv = [{role:'system', content:system}, ...msgs];
    try {
      for (;;) {
        rounds++;
        const body = {model:cfg.model, messages:conv, stream:true, stream_options:{include_usage:true}, max_completion_tokens:cfg.maxOutputTokens,
          reasoning_effort:cfg.reasoningEffort, ...(tools < toolRounds ? {tools:TOOLS} : {})};
        const r = await callWithRetry(body);
        if (r.finish === 'tool_calls' && r.toolCalls.length && tools < toolRounds) {
          tools++;
          conv.push({role:'assistant', content:r.content || '', ...(r.reasoning ? {reasoning_content:r.reasoning} : {}), tool_calls:r.toolCalls});
          for (const tc of r.toolCalls) {
            let args = {};
            try { args = JSON.parse(tc.function.arguments || '{}'); } catch (e) { /* bad arguments: empty search */ }
            const f2 = retrieve(String(args.query || '').slice(0, 200));
            sources = [...sources, ...sourcesOf(f2).filter(s => !sources.some(x => x.url === s.url))];
            conv.push({role:'tool', tool_call_id:tc.id, name:tc.function.name, content:contextText(f2).slice(0, cfg.toolResultChars)});
          }
          continue;
        }
        if (r.finish === 'length') send({t:'note', code:'truncated'});
        break;
      }
      send({t:'sources', items:citedSources(answer, sources)});
      send({t:'done'});
    } catch (e) {
      code = errorCode(e);
      if (code !== 'cancelled') send({t:'error', code});
    } finally {
      finished = true;
      res.end();
      const costMicro = Math.round(usage.in * cfg.priceInPerM + usage.out * cfg.priceOutPerM);
      await deps.store.release({uid, day, month, tokens:usage.in + usage.out, costMicro, at:t0.getTime()}).catch(() => {});
      log({event:'koyan', uid:uidHash, mode, ms:now().getTime() - t0.getTime(), rounds, tools, tokensIn:usage.in, tokensOut:usage.out, code:code || 'ok'});
    }

    /* one model call with streaming; content goes to the browser as it arrives */
    async function callOnce(body){
      const out = {content:'', reasoning:'', toolCalls:[], finish:null, streamed:false};
      for await (const ch of streamChat({baseUrl:cfg.baseUrl, apiKey:cfg.apiKey, body, signal:ctl.signal, fetchImpl})) {
        if (ch.usage) { usage.in += ch.usage.prompt_tokens || 0; usage.out += ch.usage.completion_tokens || 0; }
        const c = ch.choices && ch.choices[0];
        if (!c) continue;
        if (c.usage) { usage.in += c.usage.prompt_tokens || 0; usage.out += c.usage.completion_tokens || 0; }
        const d = c.delta || {};
        if (d.reasoning_content) out.reasoning += d.reasoning_content;
        if (d.content) { out.content += d.content; answer += d.content; out.streamed = true; send({t:'delta', text:d.content}); }
        for (const tc of d.tool_calls || []) {
          const i = tc.index ?? 0;
          out.toolCalls[i] = out.toolCalls[i] || {id:'', type:'function', function:{name:'', arguments:''}};
          if (tc.id) out.toolCalls[i].id = tc.id;
          if (tc.function && tc.function.name) out.toolCalls[i].function.name = tc.function.name;
          if (tc.function && tc.function.arguments) out.toolCalls[i].function.arguments += tc.function.arguments;
        }
        if (c.finish_reason) out.finish = c.finish_reason;
      }
      out.toolCalls = out.toolCalls.filter(Boolean);
      return out;
    }
    async function callWithRetry(body){
      for (let attempt = 0; ; attempt++) {
        const before = answer.length;
        try { return await callOnce(body); }
        catch (e) {
          if (answer.length > before || attempt >= cfg.maxRetries || !retryable(e)) throw e;
          await new Promise(r => setTimeout(r, 700 * (attempt + 1)));
        }
      }
    }
  };
}

/* Only sources the answer actually used: its links, or names it mentions. */
function citedSources(text, sources){
  const low = text.toLowerCase();
  const names = s => {
    const t = s.title.split(/ — |: /)[0].toLowerCase(), short = t.match(/\(([^)]+)\)/);
    return [t.split(' (')[0], short && short[1]].filter(n => n && n.length > 2);
  };
  return sources.filter(s => low.includes(s.url.toLowerCase().replace(/\/$/, '')) || names(s).some(n => low.includes(n))).slice(0, 5);
}

export { KimiError };
