/* Minimal streaming client for the Kimi Open Platform chat completions API (OpenAI-compatible).
   Yields parsed stream chunks; throws KimiError with the HTTP status and the API's error type. */

export class KimiError extends Error {
  constructor(status, type, message){ super(message || type || 'kimi_error'); this.status = status; this.type = type || ''; }
}

export async function* streamChat({baseUrl, apiKey, body, signal, fetchImpl = fetch}){
  let res;
  try {
    res = await fetchImpl(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method:'POST', signal,
      headers:{'Authorization':`Bearer ${apiKey}`, 'Content-Type':'application/json', 'Accept':'text/event-stream'},
      body:JSON.stringify(body)
    });
  } catch (e) {
    if (e && e.name === 'AbortError') throw e;
    throw new KimiError(0, 'network', 'network');
  }
  if (!res.ok) {
    let type = '', message = '';
    try { const j = await res.json(); type = (j.error && j.error.type) || ''; message = (j.error && j.error.message) || ''; } catch (e) { /* not JSON */ }
    throw new KimiError(res.status, type, message);
  }
  const reader = res.body.getReader(), dec = new TextDecoder();
  let buf = '';
  for (;;) {
    const {value, done} = await reader.read();
    if (done) break;
    buf += dec.decode(value, {stream:true});
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
      if (!line.startsWith('data:')) continue;
      const data = line.slice(5).trim();
      if (data === '[DONE]') return;
      let obj;
      try { obj = JSON.parse(data); } catch (e) { continue; }
      if (obj.error) throw new KimiError(500, obj.error.type || 'stream_error', obj.error.message);
      yield obj;
    }
  }
}

/* Error -> short code the browser understands. Never includes the message text. */
export function errorCode(e){
  if (!e) return 'unavailable';
  if (e.name === 'AbortError') return 'cancelled';
  if (e.status === 429 && e.type === 'exceeded_current_quota_error') return 'balance';
  if (e.status === 429) return 'busy';
  if (e.status === 400 && e.type === 'content_filter') return 'filter';
  if (e.status === 400 && /too long/i.test(e.message || '')) return 'input';
  if (e.status === 503 || e.status === 504) return 'busy';
  return 'unavailable';
}

export const retryable = e => e && e.name !== 'AbortError' && (e.status === 0 || e.status >= 500 || (e.status === 429 && e.type === 'engine_overloaded_error'));
