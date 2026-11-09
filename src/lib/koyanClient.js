/* Browser side of the Қоян chat on the standalone site: talks to our server (server/, on Render), never to Kimi directly.
   The function address comes from VITE_KOYAN_URL; there is no API key in the browser. */
export const KOYAN_URL = import.meta.env.VITE_KOYAN_URL || '';

/* Is the chat configured on the server? Any failure counts as "not available".
   A free Render service sleeps after 15 idle minutes and needs up to about a minute to wake, so wait that long. */
export async function koyanStatus(timeoutMs = 75000){
  if (!KOYAN_URL) return false;
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const r = await fetch(KOYAN_URL, {method:'GET', signal:ctl.signal});
    if (!r.ok) return false;
    const j = await r.json();
    return !!j.configured;
  } catch (e) { return false; }
  finally { clearTimeout(timer); }
}

/* Sends the conversation; calls onDelta(text) for each streamed piece. Resolves {sources, truncated};
   rejects with {code} (auth, limit, concurrent, budget, balance, busy, filter, input, unavailable, net, not_configured, cancelled). */
export async function askKoyan({token, payload, signal, onDelta, url = KOYAN_URL}){
  let res;
  try {
    res = await fetch(url, {method:'POST', signal, headers:{'Content-Type':'application/json', 'Authorization':'Bearer ' + token}, body:JSON.stringify(payload)});
  } catch (e) {
    throw {code:e && e.name === 'AbortError' ? 'cancelled' : 'net'};
  }
  if (!res.ok) {
    let code = 'unavailable';
    try { code = (await res.json()).code || code; } catch (e) { /* not JSON */ }
    throw {code};
  }
  const reader = res.body.getReader(), dec = new TextDecoder();
  let buf = '', sources = [], truncated = false, done = false;
  try {
    while (!done) {
      const r = await reader.read();
      if (r.done) break;
      buf += dec.decode(r.value, {stream:true});
      let i;
      while ((i = buf.indexOf('\n\n')) >= 0) {
        const block = buf.slice(0, i); buf = buf.slice(i + 2);
        const line = block.split('\n').find(l => l.startsWith('data:'));
        if (!line) continue;
        let ev;
        try { ev = JSON.parse(line.slice(5).trim()); } catch (e) { continue; }
        if (ev.t === 'delta') onDelta(ev.text || '');
        else if (ev.t === 'sources') sources = Array.isArray(ev.items) ? ev.items : [];
        else if (ev.t === 'note' && ev.code === 'truncated') truncated = true;
        else if (ev.t === 'error') throw {code:ev.code || 'unavailable'};
        else if (ev.t === 'done') done = true;
      }
    }
  } catch (e) {
    // An aborted read is a DOMException whose legacy numeric `code` is 20 — check the name first.
    if (e && e.name === 'AbortError') throw {code:'cancelled'};
    if (e && typeof e.code === 'string') throw e;
    throw {code:'net'};
  }
  if (!done) throw {code:'net'};
  return {sources, truncated};
}
