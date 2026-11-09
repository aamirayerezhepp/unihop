// Local Қоян endpoint with a fake Kimi, for testing the site's chat client: node functions/test/mock-server.mjs
// Token "dev" counts as a Google sign-in. Questions containing "ошибка-баланс" / "ошибка-сеть" simulate failures.
import http from 'node:http';
import { readFileSync } from 'node:fs';
import { createKoyan } from '../src/core.js';

const kb = JSON.parse(readFileSync(new URL('../kb.json', import.meta.url), 'utf8'));
const enc = new TextEncoder();
const fakeKimi = async (url, init) => {
  const body = JSON.parse(init.body);
  const q = body.messages[body.messages.length - 1].content;
  if (q.includes('ошибка-баланс')) return new Response(JSON.stringify({error:{type:'exceeded_current_quota_error', message:'x'}}), {status:429});
  if (q.includes('ошибка-сеть')) throw new TypeError('fetch failed');
  const words = `Подтверждено: в ELTE нужен IELTS 6.5 (данные проверены 8 ноября 2026). Общий совет: начни с черновика мотивационного письма. Источники: https://apply.elte.hu/enter/200`.split(' ');
  return new Response(new ReadableStream({async start(c){
    for (const w of words) { c.enqueue(enc.encode(`data: ${JSON.stringify({choices:[{index:0, delta:{content:w + ' '}}]})}\n\n`)); await new Promise(r => setTimeout(r, 40)); }
    c.enqueue(enc.encode(`data: ${JSON.stringify({choices:[{index:0, delta:{}, finish_reason:'stop'}]})}\n\n`));
    c.enqueue(enc.encode(`data: ${JSON.stringify({choices:[], usage:{prompt_tokens:10, completion_tokens:10}})}\n\n`));
    c.enqueue(enc.encode('data: [DONE]\n\n')); c.close();
  }}), {status:200});
};
const store = {reserve:async () => ({ok:true}), release:async () => {}};
const handle = createKoyan({apiKey:'mock'}, {kb, store, fetchImpl:fakeKimi, verifyToken:async t => { if (t !== 'dev') throw new Error('bad'); return {uid:'dev', firebase:{sign_in_provider:'google.com'}}; }});

http.createServer((req, res) => {
  let data = '';
  req.on('data', c => { data += c; });
  req.on('end', async () => {
    try { req.body = data ? JSON.parse(data) : {}; } catch (e) { req.body = {}; }
    const r = {status(c){ res.statusCode = c; return r; }, set(k, v){ res.setHeader(k, v); }, json(o){ res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); return r; },
      write(s){ res.write(s); }, end(){ res.end(); }, flushHeaders(){ res.flushHeaders(); }};
    await handle(req, r);
  });
}).listen(8787, () => console.log('mock Қоян on http://localhost:8787'));
