// End-to-end check of the real server (server/index.js) against a fake Kimi over HTTP: node server/test/e2e.mjs
// Starts a fake Kimi on 127.0.0.1:8790 and the server in --local mode on 127.0.0.1:8788.
import http from 'node:http';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

let failed = 0, passed = 0;
const ok = (c, name) => { if (c) passed++; else { failed++; console.log('FAIL', name); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
let upstreamClosedEarly = false;

/* fake Kimi: streams 30 words slowly; "медленно" makes it very slow (to test aborts) */
const kimi = http.createServer((req, res) => {
  let body = '';
  req.on('data', c => { body += c; });
  req.on('end', async () => {
    const b = JSON.parse(body);
    if (req.headers.authorization !== 'Bearer fake-key') { res.statusCode = 401; return res.end(JSON.stringify({error:{type:'invalid_authentication_error'}})); }
    const q = b.messages[b.messages.length - 1].content;
    res.writeHead(200, {'Content-Type':'text/event-stream'});
    let closed = false; res.on('close', () => { closed = true; });
    const slow = q.includes('медленно');
    for (let i = 0; i < 30; i++) {
      if (closed) { upstreamClosedEarly = true; return; }
      res.write(`data: ${JSON.stringify({choices:[{index:0, delta:{content:`слово${i} `}}]})}\n\n`);
      await sleep(slow ? 200 : 5);
    }
    res.write(`data: ${JSON.stringify({choices:[{index:0, delta:{}, finish_reason:'stop'}]})}\n\n`);
    res.write(`data: ${JSON.stringify({choices:[], usage:{prompt_tokens:100, completion_tokens:30}})}\n\n`);
    res.end('data: [DONE]\n\n');
  });
}).listen(8790, '127.0.0.1');

const root = fileURLToPath(new URL('../', import.meta.url));
const srv = spawn(process.execPath, ['index.js', '--local'], {cwd:root, env:{...process.env, PORT:'8788', KIMI_API_KEY:'fake-key', KIMI_BASE_URL:'http://127.0.0.1:8790/v1', KOYAN_ALLOWED_ORIGINS:'http://localhost:5173', FIREBASE_SERVICE_ACCOUNT:''}, stdio:['ignore', 'pipe', 'pipe']});
let logs = '';
srv.stdout.on('data', d => { logs += d; }); srv.stderr.on('data', d => { logs += d; });
for (let i = 0; i < 50 && !logs.includes('Қоян server on port'); i++) await sleep(100);
const token = readFileSync(new URL('../.dev-token', import.meta.url), 'utf8');
const base = 'http://127.0.0.1:8788';
const post = (q, extra = {}) => fetch(base + '/', {method:'POST', signal:extra.signal, headers:{'Content-Type':'application/json', Origin:'http://localhost:5173', Authorization:'Bearer ' + (extra.token || token)},
  body:JSON.stringify({lang:'ru', messages:[{role:'user', content:q}]})});

try {
  const h = await (await fetch(base + '/health')).json();
  ok(h.ok && h.configured && h.model === 'kimi-k3.1-pro' && h.limits === 'memory', 'health reports configuration');
  const s = await (await fetch(base + '/')).json();
  ok(s.configured === true, 'GET / says configured');

  const r = await post('Сколько стоит ELTE?');
  ok(r.status === 200 && r.headers.get('content-type').startsWith('text/event-stream'), 'POST streams');
  const text = await r.text();
  ok(text.includes('слово0') && text.includes('слово29') && text.includes('"t":"done"'), 'full answer arrives through the real server');

  const bad = await post('привет', {token:'wrong'});
  ok(bad.status === 401, 'wrong token is refused');
  const pre = await fetch(base + '/', {method:'OPTIONS', headers:{Origin:'http://localhost:5173'}});
  ok(pre.status === 204 && pre.headers.get('access-control-allow-origin') === 'http://localhost:5173', 'CORS preflight for the allowed site');
  const evil = await fetch(base + '/', {method:'OPTIONS', headers:{Origin:'https://evil.example'}});
  ok(evil.status === 403, 'other sites are refused');
  const big = await fetch(base + '/', {method:'POST', headers:{'Content-Type':'application/json', Origin:'http://localhost:5173', Authorization:'Bearer ' + token}, body:'x'.repeat(70000)}).catch(() => ({status:413}));
  ok(big.status === 413, 'oversized body is refused');

  // stop mid-answer: the server must stop reading from Kimi
  upstreamClosedEarly = false;
  const ctl = new AbortController();
  const r2 = await post('ответь медленно', {signal:ctl.signal});
  const reader = r2.body.getReader(); await reader.read(); ctl.abort();
  await sleep(800);
  ok(upstreamClosedEarly, 'closing the browser connection stops the Kimi request');
  ok(!logs.includes('слово') && !logs.includes('ELTE'), 'server logs contain no message text');
  ok(/"tokensIn":100/.test(logs), 'token usage is logged as numbers');
} finally {
  srv.kill(); kimi.close();
}
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
