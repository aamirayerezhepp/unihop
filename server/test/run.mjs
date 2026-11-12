// Tests for the Қоян server without Firebase or a real Kimi key: node server/test/run.mjs
// (run `node scripts/build-kb.mjs` first). A fake Kimi server streams answers, tool calls and errors.
import { readFileSync } from 'node:fs';
import { createKoyan } from '../src/core.js';
import { createRetriever } from '../src/retrieve.js';

const kb = JSON.parse(readFileSync(new URL('../kb.json', import.meta.url), 'utf8'));
let failed = 0, passed = 0;
const ok = (cond, name) => { if (cond) passed++; else { failed++; console.log('FAIL', name); } };

/* ---------- 1. retrieval: 30 representative questions in three languages ---------- */
const retrieve = createRetriever(kb);
const Q = [
  ['ru', 'Какие требования к английскому в Гронингене на психологию?', {p:'rug-psy'}],
  ['ru', 'Сколько стоит учёба в ELTE на психологии?', {p:'elte-psy'}],
  ['ru', 'Можно ли бесплатно учиться в Чехии на психолога?', {p:'cuni-psy'}],
  ['ru', 'Какие сроки подачи в Назарбаев Университет?', {p:'nu-cs'}],
  ['ru', 'Что покрывает стипендия KAIST?', {p:'kaist-ug'}],
  ['ru', 'Что такое Stipendium Hungaricum и кому он подходит?', {g:'sh'}],
  ['ru', 'Когда дедлайн UCAS для Оксфорда?', {f:'ucas'}],
  ['ru', 'Сколько стоит IELTS в Казахстане?', {f:'ielts-cost'}],
  ['ru', 'Нужен ли Studienkolleg для Германии после 11 класса?', {f:'germany'}],
  ['ru', 'Какие вузы США need-blind для иностранцев?', {f:'us-needblind'}],
  ['ru', 'Расскажи про Болашак для бакалавриата', {g:'bol'}],
  ['ru', 'Когда подавать на госгрант после ЕНТ?', {f:'kz-grant'}],
  ['ru', 'Есть ли стипендия Türkiye Bursları для школьников из Казахстана?', {g:'tb'}],
  ['ru', 'Какие документы нужны для поступления за рубеж?', {f:'docs'}],
  ['ru', 'Сколько стоит SAT и где готовиться?', {f:'sat'}],
  ['kz', 'Гронинген университетінде психологияға IELTS қанша керек?', {p:'rug-psy'}],
  ['kz', 'ELTE психология бағдарламасының оқу ақысы қанша?', {p:'elte-psy'}],
  ['kz', 'Назарбаев Университетіне грант қалай аламын?', {p:'nu-cs'}],
  ['kz', 'KAIST стипендиясы нені өтейді?', {p:'kaist-ug'}],
  ['kz', 'Ұлыбританияға UCAS мерзімі қашан?', {f:'ucas'}],
  ['kz', 'Мемлекеттік грант ҰБТ-дан кейін қашан беріледі?', {f:'kz-grant'}],
  ['kz', 'Чехияда тегін оқуға бола ма?', {f:'czech'}],
  ['kz', 'Stipendium Hungaricum Қазақстан үшін ашық па?', {g:'sh'}],
  ['en', 'What IELTS score do I need for Psychology at Groningen?', {p:'rug-psy'}],
  ['en', 'How much is tuition at ELTE for the Psychology BA?', {p:'elte-psy'}],
  ['en', 'Is Charles University free if I study in Czech?', {p:'cuni-psy'}],
  ['en', 'When is the KAIST regular round deadline?', {p:'kaist-ug'}],
  ['en', 'What does the Stipendium Hungaricum cover?', {g:'sh'}],
  ['en', 'When is the UCAS deadline for Oxford and Cambridge?', {f:'ucas'}],
  ['en', 'Do US universities like Harvard require the SAT for 2027?', {f:'us-needblind'}]
];
let hits = 0;
for (const [lang, q, want] of Q) {
  const r = retrieve(q);
  const hit = want.p ? r.programs.some(p => p.id === want.p) : want.g ? r.grants.some(g => g.id === want.g) : r.facts.some(f => f.id === want.f);
  if (hit) hits++; else console.log(`  miss [${lang}] ${q} -> programs ${r.programs.map(p => p.id)} grants ${r.grants.map(g => g.id)} facts ${r.facts.map(f => f.id)}`);
}
console.log(`retrieval: ${hits}/${Q.length} questions found the expected fragment`);
ok(hits >= 27, 'retrieval finds the expected fragment for at least 27 of 30 questions');
ok(retrieve('расскажи анекдот про котов').programs.length === 0, 'an off-topic question pulls in no programmes');

/* ---------- 2. the endpoint with a fake Kimi ---------- */
const sse = chunks => new Response(new ReadableStream({start(c){ const e = new TextEncoder(); for (const ch of chunks) c.enqueue(e.encode(`data: ${JSON.stringify(ch)}\n\n`)); c.enqueue(e.encode('data: [DONE]\n\n')); c.close(); }}),
  {status:200, headers:{'Content-Type':'text/event-stream'}});
const delta = (content, extra = {}) => ({choices:[{index:0, delta:{content, ...extra}, finish_reason:null}]});
const finish = (reason, usage) => [{choices:[{index:0, delta:{}, finish_reason:reason}]}, {choices:[], usage}];
const errorRes = (status, type) => new Response(JSON.stringify({error:{type, message:'x'}}), {status, headers:{'Content-Type':'application/json'}});

function fakeRes(){
  const r = {code:0, headers:{}, body:'', ended:false, jsonBody:null};
  r.status = c => { r.code = c; return r; };
  r.set = (k, v) => { r.headers[k] = v; };
  r.json = o => { r.jsonBody = o; r.ended = true; return r; };
  r.write = s => { r.body += s; };
  r.end = () => { r.ended = true; };
  r.events = () => r.body.split('\n\n').filter(Boolean).map(l => JSON.parse(l.replace(/^data: /, '')));
  return r;
}
function memStore(){
  const s = {users:{}, usage:{tokens:0}, reserveCalls:0, releases:[]};
  s.reserve = async ({uid, day, at, cfg}) => {
    s.reserveCalls++;
    const u = s.users[uid] = s.users[uid] || {day, count:0, locks:[]};
    u.locks = u.locks.filter(t => t > at);
    if (s.usage.tokens >= cfg.dailyTokenCap) return {ok:false, code:'budget'};
    if (u.locks.length >= cfg.maxConcurrent) return {ok:false, code:'concurrent'};
    if (u.count >= cfg.userDaily) return {ok:false, code:'limit'};
    u.count++; u.locks.push(at + cfg.lockMs); return {ok:true};
  };
  s.release = async ({uid, tokens, at}) => { s.releases.push(tokens); s.usage.tokens += tokens; const u = s.users[uid]; const i = u.locks.findIndex(t => t > at); if (i >= 0) u.locks.splice(i, 1); };
  return s;
}
const req = (body, extra = {}) => ({method:'POST', headers:{origin:'http://localhost:5173', authorization:'Bearer good', ...(extra.headers || {})}, body, ip:'1.2.3.4', on:() => {}, ...extra});
const verifyToken = async t => { if (t !== 'good') throw new Error('bad'); return {uid:'u1', firebase:{sign_in_provider:'google.com'}}; };
const profile = {grade:11, intake:2027, country:'kz', field:'psy', regions:['eu'], langs:['en'], english:'6.5', grades:'mid', extra:['project'], funding:'full', budget:{amount:0, currency:'KZT'}};
const body = text => ({lang:'ru', profile, apps:[{name:'ELTE — Psychology BA', programId:'elte-psy'}], messages:[{role:'user', content:text}]});
const make = (fetchImpl, extra = {}) => { const store = memStore(); const logs = []; return {store, logs, h:createKoyan({apiKey:'test-key', ...extra}, {kb, store, verifyToken, fetchImpl, log:e => logs.push(e)})}; };

{ // GET reports configuration; no key -> not configured
  const a = make(async () => sse([])); const r1 = fakeRes(); await a.h({method:'GET', headers:{}}, r1);
  ok(r1.jsonBody && r1.jsonBody.configured === true, 'GET says configured with a key');
  const b = createKoyan({apiKey:''}, {kb, store:memStore(), verifyToken}); const r2 = fakeRes(); await b({method:'GET', headers:{}}, r2);
  ok(r2.jsonBody.configured === false, 'GET says not configured without a key');
  const r3 = fakeRes(); await b(req(body('привет')), r3);
  ok(r3.code === 503 && r3.jsonBody.code === 'not_configured', 'POST without a key -> 503 not_configured');
}
{ // origin, sign-in, input checks
  const a = make(async () => sse([]));
  const r1 = fakeRes(); await a.h(req(body('hi'), {headers:{origin:'https://evil.example', authorization:'Bearer good'}}), r1); ok(r1.code === 403, 'unknown origin is refused');
  const r2 = fakeRes(); await a.h(req(body('hi'), {headers:{origin:'http://localhost:5173', authorization:'Bearer bad'}}), r2); ok(r2.code === 401 && r2.jsonBody.code === 'auth', 'bad token -> 401');
  const anon = createKoyan({apiKey:'k'}, {kb, store:memStore(), verifyToken:async () => ({uid:'x', firebase:{sign_in_provider:'anonymous'}})});
  const r3 = fakeRes(); await anon(req(body('hi')), r3); ok(r3.code === 401, 'anonymous sign-in is refused');
  const r4 = fakeRes(); await a.h(req(body('x'.repeat(1300))), r4); ok(r4.code === 400 && r4.jsonBody.code === 'input', 'too long input -> 400');
  const r5 = fakeRes(); await a.h(req({lang:'ru', messages:[{role:'assistant', content:'hi'}]}), r5); ok(r5.code === 400, 'last message must be from the student');
  ok(a.store.reserveCalls === 0, 'rejected requests do not count against limits');
}
{ // a normal streamed answer: system prompt carries data, deltas stream, sources and usage are recorded, no text in logs
  let sent;
  const a = make(async (url, init) => { sent = JSON.parse(init.body); return sse([delta('Подтверждено: '), delta('в ELTE нужен IELTS 6.5. Источник: https://apply.elte.hu/enter/200'), ...finish('stop', {prompt_tokens:900, completion_tokens:150, total_tokens:1050})]); });
  const r = fakeRes(); await a.h(req(body('Какой IELTS нужен в ELTE?')), r);
  const ev = r.events();
  ok(r.code === 200 && r.headers['Content-Type'].startsWith('text/event-stream'), 'answer is a stream');
  ok(ev.filter(e => e.t === 'delta').map(e => e.text).join('').includes('IELTS 6.5'), 'answer text streams to the browser');
  ok(ev.some(e => e.t === 'sources' && e.items.some(s => s.url === 'https://apply.elte.hu/enter/200')), 'cited source is returned');
  ok(ev[ev.length - 1].t === 'done', 'stream ends with done');
  ok(sent.model === 'kimi-k3.1-pro' && sent.stream === true && sent.reasoning_effort === 'low' && sent.max_completion_tokens === 2500 && !('temperature' in sent), 'request uses configured model and limits, no fixed params');
  ok(sent.messages[0].role === 'system' && sent.messages[0].content.includes('[программа id=elte-psy]') && sent.messages[0].content.includes('IELTS 6.5'), 'system prompt carries the saved programme data');
  ok(sent.messages[0].content.includes('хочет начать учёбу осенью 2027'), 'system prompt carries the profile');
  ok(a.store.releases[0] === 1050, 'token usage is counted toward the cap');
  ok(!JSON.stringify(a.logs).includes('IELTS'), 'logs contain no message text');
}
{ // a tool call round, then the answer
  let calls = 0, second;
  const a = make(async (url, init) => {
    calls++;
    if (calls === 1) return sse([{choices:[{index:0, delta:{reasoning_content:'думаю', tool_calls:[{index:0, id:'search:0', type:'function', function:{name:'search_database', arguments:'{"query":'}}]}}]},
      {choices:[{index:0, delta:{tool_calls:[{index:0, function:{arguments:'"KAIST scholarship"}'}}]}}]}, ...finish('tool_calls', {prompt_tokens:500, completion_tokens:40})]);
    second = JSON.parse(init.body);
    return sse([delta('KAIST даёт 350 000 ₩ в месяц.'), ...finish('stop', {prompt_tokens:1500, completion_tokens:60})]);
  });
  const r = fakeRes(); await a.h(req(body('А что с KAIST?')), r);
  const tool = second.messages.find(m => m.role === 'tool');
  const asst = second.messages.find(m => m.role === 'assistant' && m.tool_calls);
  ok(calls === 2 && tool && tool.tool_call_id === 'search:0' && tool.content.includes('kaist-ug'), 'tool call is executed against the database');
  ok(asst && asst.reasoning_content === 'думаю' && asst.tool_calls[0].function.arguments === '{"query":"KAIST scholarship"}', 'assistant tool-call message is passed back unchanged');
  ok(a.store.releases[0] === 2100, 'usage of both rounds is counted');
}
{ // tool rounds are capped
  let calls = 0, last;
  const toolChunk = () => sse([{choices:[{index:0, delta:{tool_calls:[{index:0, id:'s' + calls, type:'function', function:{name:'search_database', arguments:'{"query":"x"}'}}]}}]}, ...finish('tool_calls', {prompt_tokens:1, completion_tokens:1})]);
  const a = make(async (url, init) => { calls++; last = JSON.parse(init.body); return calls <= 2 ? toolChunk() : sse([delta('ok'), ...finish('stop', {prompt_tokens:1, completion_tokens:1})]); });
  const r = fakeRes(); await a.h(req(body('вопрос')), r);
  ok(calls === 3 && !last.tools, 'after two searches the model must answer without tools');
}
{ // errors: balance, overload with one retry, content filter
  const a = make(async () => errorRes(429, 'exceeded_current_quota_error'));
  const r = fakeRes(); await a.h(req(body('вопрос')), r);
  ok(r.events().some(e => e.t === 'error' && e.code === 'balance'), 'empty balance -> balance error');
  ok(a.store.users.u1.locks.length === 0, 'lock is released after an error');
  let n = 0;
  const b = make(async () => { n++; return n === 1 ? errorRes(429, 'engine_overloaded_error') : sse([delta('ответ'), ...finish('stop', {prompt_tokens:1, completion_tokens:1})]); });
  const r2 = fakeRes(); await b.h(req(body('вопрос')), r2);
  ok(n === 2 && r2.events().some(e => e.t === 'done'), 'overload is retried once');
  const c = make(async () => errorRes(429, 'rate_limit_reached_error'));
  const r3 = fakeRes(); await c.h(req(body('вопрос')), r3);
  ok(r3.events().some(e => e.code === 'busy'), 'rate limit -> busy');
  const d = make(async () => errorRes(400, 'content_filter'));
  const r4 = fakeRes(); await d.h(req(body('вопрос')), r4);
  ok(r4.events().some(e => e.code === 'filter'), 'content filter -> filter');
  const e2 = make(async () => { throw new TypeError('fetch failed'); });
  const r5 = fakeRes(); await e2.h(req(body('вопрос')), r5);
  ok(r5.events().some(e => e.code === 'unavailable'), 'network failure -> unavailable');
}
{ // limits: daily per user, concurrency, spending cap
  const a = make(async () => sse([delta('ok'), ...finish('stop', {prompt_tokens:10, completion_tokens:10})]), {userDaily:2});
  for (let i = 0; i < 2; i++) await a.h(req(body('вопрос')), fakeRes());
  const r = fakeRes(); await a.h(req(body('вопрос')), r);
  ok(r.code === 429 && r.jsonBody.code === 'limit', 'daily message limit');
  let release;
  const slow = make(async () => new Promise(res => { release = () => res(sse([delta('ok'), ...finish('stop', {prompt_tokens:1, completion_tokens:1})])); }));
  const p1 = slow.h(req(body('первый')), fakeRes());
  await new Promise(r0 => setTimeout(r0, 10));
  const r2 = fakeRes(); await slow.h(req(body('второй')), r2);
  ok(r2.code === 429 && r2.jsonBody.code === 'concurrent', 'one request at a time per student');
  release(); await p1;
  const cap = make(async () => sse([delta('ok'), ...finish('stop', {prompt_tokens:600, completion_tokens:600})]), {dailyTokenCap:1000});
  await cap.h(req(body('вопрос')), fakeRes());
  const r3 = fakeRes(); await cap.h(req(body('вопрос')), r3);
  ok(r3.code === 503 && r3.jsonBody.code === 'budget', 'spending cap stops new calls');
}
{ // history is trimmed
  let sent;
  const a = make(async (url, init) => { sent = JSON.parse(init.body); return sse([delta('ok'), ...finish('stop', {prompt_tokens:1, completion_tokens:1})]); });
  const msgs = []; for (let i = 0; i < 20; i++) msgs.push({role:i % 2 ? 'assistant' : 'user', content:'сообщение ' + i + ' ' + 'x'.repeat(900)});
  msgs.push({role:'user', content:'последний вопрос'});
  await a.h(req({...body(''), messages:msgs}), fakeRes());
  const hist = sent.messages.slice(1);
  ok(hist.length <= 8 && hist[0].role === 'user' && hist[hist.length - 1].content === 'последний вопрос', 'history is limited to the last turns and starts with the student');
}

{ // crisis words: help at once, no model call, no limit counted — in every assistant and language
  let calls = 0;
  const a = make(async () => { calls++; return sse([delta('x'), ...finish('stop', {prompt_tokens:1, completion_tokens:1})]); });
  for (const [lang, mode, q, num] of [['ru', 'care', 'Я больше не хочу жить', '150'], ['kz', 'koyan', 'Өмір сүргім келмейді', '150'], ['en', 'letter', 'I want to kill myself', '150']]) {
    const r = fakeRes(); await a.h(req({...body(q), lang, mode}), r);
    const text = r.events().filter(e => e.t === 'delta').map(e => e.text).join('');
    ok(text.includes(num) && text.includes('112') && r.events().some(e => e.t === 'crisis'), `crisis reply with hotlines [${lang}/${mode}]`);
  }
  ok(calls === 0 && a.store.reserveCalls === 0, 'crisis replies do not call the model or use limits');
}
{ // letter coach: own instructions, saved programme requirements, character count, longer drafts allowed
  let sent;
  const a = make(async (url, init) => { sent = JSON.parse(init.body); return sse([delta('Что уже работает: ...'), ...finish('stop', {prompt_tokens:1, completion_tokens:1})]); });
  const draft = 'Я хочу изучать психологию, потому что ' + 'мой волонтёрский проект '.repeat(80);
  const r = fakeRes(); await a.h(req({...body(draft), mode:'letter'}), r);
  const sys = sent.messages[0].content;
  ok(r.code === 200 && sys.includes('наставника по мотивационному письму') && sys.includes('Никогда не пиши письмо'), 'letter mode uses the coach instructions');
  ok(sys.includes(`${draft.trim().length} знаков`), 'letter mode passes the exact draft length');
  ok(sys.includes('[программа id=elte-psy]') && sys.includes('1500–2500'), 'letter mode includes the saved programme requirements');
  ok(!sys.includes('[программа id=kaist-ug]'), 'letter mode does not pull unrelated programmes');
  const long = fakeRes(); await a.h(req({...body('x'.repeat(5200)), mode:'letter'}), long);
  ok(long.code === 400, 'drafts over 5000 characters are refused');
  const short = fakeRes(); await a.h(req({...body('x'.repeat(1300)), mode:'koyan'}), short);
  ok(short.code === 400, 'the 1200-character limit still applies to normal questions');
}
{ // support chat: own instructions, check-in, no database, no tools
  let sent;
  const a = make(async (url, init) => { sent = JSON.parse(init.body); return sse([delta('Слышу тебя.'), ...finish('stop', {prompt_tokens:1, completion_tokens:1})]); });
  const r = fakeRes(); await a.h(req({...body('Очень боюсь не сдать IELTS, не могу спать'), mode:'care', checkin:{mood:2, sleep:1, stress:5, support:3}}), r);
  const sys = sent.messages[0].content;
  ok(sys.includes('Ты не психолог и не врач') && sys.includes('сон 1') && sys.includes('стресс 5'), 'support mode uses its instructions and the latest check-in');
  ok(!sent.tools && !sys.includes('ДАННЫЕ:') && !sys.includes('[программа'), 'support mode sends no database and no tools');
  ok(r.events().some(e => e.t === 'done'), 'support answer streams');
  const bad = fakeRes(); await a.h(req({...body('привет'), mode:'care', checkin:{mood:'<script>', sleep:9}}), bad);
  ok(!sent.messages[0].content.includes('<script>'), 'malformed check-in values are dropped');
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
