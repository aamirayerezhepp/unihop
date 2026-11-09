import { useEffect, useRef, useState } from 'react';
import { useApp } from '../state/AppState.jsx';
import { Cabinet, PageHead } from '../components/Shell.jsx';
import { GoogleButton } from '../components/Account.jsx';
import Koyan from '../components/Koyan.jsx';
import { PRESETS } from '../data/reference.js';

/* Chat with Қоян. Live answers come from the server (Kimi) on the site, or from Claude inside a Claude artifact.
   When neither is available the page says so plainly; the common questions below are a separate FAQ with checked answers. */
export default function Chat(){
  const { state, chat, chatAvail, sendChat, stopChat, chatDraft, setChatDraft, account, t, L } = useApp();
  const [q, setQ] = useState('');
  const logRef = useRef(null), inputRef = useRef(null), wasBusy = useRef(false);
  const inClaude = typeof window !== 'undefined' && !!window.claude;

  useEffect(() => { if (chatDraft) { setQ(chatDraft); setChatDraft(''); if (inputRef.current) inputRef.current.focus(); } }, [chatDraft]);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [chat.turns]);
  useEffect(() => {
    if (wasBusy.current && !chat.busy && inputRef.current && !inputRef.current.disabled) inputRef.current.focus();
    wasBusy.current = chat.busy;
  }, [chat.busy]);

  const needSignIn = !inClaude && chatAvail && account.status !== 'signedIn';
  const live = chatAvail && !needSignIn;
  const submit = e => { e.preventDefault(); const text = q; setQ(''); sendChat(text); };

  return (
    <Cabinet>
      <PageHead pose="laptop" title={t('chat.h1')} sub={t('chat.sub')} />
      {chatAvail === false && (
        <section className="card offline" role="status">
          <div className="row" style={{flexWrap:'nowrap', gap:12}}><Koyan pose="support" size={56} /><div><h2>{t('chat.offTitle')}</h2><p className="muted">{t('chat.offText')}</p></div></div>
        </section>
      )}
      {needSignIn && (
        <section className="card">
          <div className="row" style={{flexWrap:'nowrap', gap:12}}><Koyan pose="question" size={56} /><p>{t('chat.signin')}</p></div>
          <div><GoogleButton /></div>
        </section>
      )}
      {live && (
        <div className="bcard chat">
          <div className="chat-head"><Koyan pose="idle" size={40} /><b>{t('koyan.name')}</b><span>{t('aiHelper')}</span></div>
          <div className="chat-log" ref={logRef} aria-live="polite">
            <div className="msg"><Koyan pose="joy" size={44} /><div className="bubble">{t('chat.hello', !!state.profile)}</div></div>
            {chat.turns.map(turn => turn.role === 'user'
              ? <div key={turn.id} className="bubble me">{turn.content}</div>
              : (
                <div key={turn.id} className="msg">
                  <Koyan pose="laptop" size={44} />
                  <div className="bubble">
                    <span>{turn.pending && !turn.content ? <span className="typing">{t('chat.thinking')}</span> : turn.content}</span>
                    {turn.sources && turn.sources.length > 0 && (
                      <p className="note">{t('chat.sources')}: {turn.sources.map((s, i) => <span key={s.url}>{i ? ' · ' : ''}<a href={s.url} target="_blank" rel="noopener">{s.title}</a></span>)}</p>
                    )}
                    {turn.noteKey && <p className="note">{t(turn.noteKey)}</p>}
                  </div>
                </div>
              ))}
          </div>
          {chat.errKey && (
            <div className="chat-warn row between" role="alert">
              <span>{t(chat.errKey)}</span>
              {chat.retry && <button type="button" className="btn ghost sm" disabled={chat.busy} onClick={() => sendChat(chat.retry, {retry:true})}>{t('chat.retry')}</button>}
            </div>
          )}
          <form className="chat-form" onSubmit={submit}>
            <label htmlFor="c-ask" className="sr">{t('chat.label')}</label>
            <input id="c-ask" ref={inputRef} type="text" maxLength={1200} autoComplete="off" placeholder={t('chat.ph')} value={q} onChange={e => setQ(e.target.value)} />
            {chat.busy
              ? <button type="button" className="btn ink" onClick={stopChat}>{t('chat.stop')}</button>
              : <button type="submit" className="btn" disabled={!q.trim()}>{t('chat.send')}</button>}
          </form>
        </div>
      )}
      {chatAvail === null && <p className="muted">{t('chat.thinking')}</p>}
      {live && <p className="small muted">{inClaude ? t('chat.privacyArtifact') : t('chat.privacy')} {t('chat.foot')}</p>}

      <section className="card">
        <h2>{t('chat.faq')}</h2>
        {PRESETS.map(p => (
          <details key={p.q.ru} className="tech">
            <summary>{L(p.q)}</summary>
            <div className="body"><p>{L(p.a)}</p><p className="small">{L(p.src)}</p></div>
          </details>
        ))}
      </section>
    </Cabinet>
  );
}
