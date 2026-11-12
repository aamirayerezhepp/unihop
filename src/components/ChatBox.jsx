import { useEffect, useRef, useState } from 'react';
import { useApp } from '../state/AppState.jsx';
import { GoogleButton } from './Account.jsx';
import Koyan from './Koyan.jsx';

/* One conversation with an assistant (mode: koyan | letter | care). Handles availability, Google sign-in, the free
   server waking up, streaming, stop, retry, sources and crisis replies. `draft` lets a page put text into the box. */
export default function ChatBox({ mode = 'koyan', hello, placeholder, maxLength = 1200, multiline = false, focus = null, quick = [], draft, onDraftUsed, privacyKey = 'chat.privacy', title }){
  const { chats, chatAvail, sendChat, stopChat, account, t } = useApp();
  const chat = chats[mode];
  const [q, setQ] = useState('');
  const logRef = useRef(null), inputRef = useRef(null), wasBusy = useRef(false);
  const inClaude = typeof window !== 'undefined' && !!window.claude;

  useEffect(() => { if (draft) { setQ(draft); if (onDraftUsed) onDraftUsed(); if (inputRef.current) inputRef.current.focus(); } }, [draft]);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [chat.turns]);
  useEffect(() => {
    if (wasBusy.current && !chat.busy && inputRef.current && !inputRef.current.disabled) inputRef.current.focus();
    wasBusy.current = chat.busy;
  }, [chat.busy]);

  const needSignIn = !inClaude && chatAvail && account.status !== 'signedIn';
  const live = chatAvail && !needSignIn;
  const send = text => sendChat(text, {mode, focus});
  const submit = e => { e.preventDefault(); const text = q; setQ(''); send(text); };
  const onKey = e => { if (multiline && e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit(e); };

  /* A crisis reply is shown even when the live chat is off (it never needs the server). */
  const crisisTurns = chat.turns.filter(x => x.crisis);

  return (
    <div className="stack">
      {chatAvail === false && (
        <section className="card offline" role="status">
          <div className="row" style={{flexWrap:'nowrap', gap:12}}><Koyan pose="support" size={56} /><div><h2>{t('chat.offTitle')}</h2><p className="muted">{t('chat.offText')}</p></div></div>
        </section>
      )}
      {chatAvail === null && (
        <section className="card" role="status">
          <div className="row" style={{flexWrap:'nowrap', gap:12}}><Koyan pose="idle" size={48} /><p className="muted">{inClaude ? t('chat.thinking') : t('chat.waking')}</p></div>
        </section>
      )}
      {needSignIn && (
        <section className="card">
          <div className="row" style={{flexWrap:'nowrap', gap:12}}><Koyan pose="question" size={56} /><p>{t('chat.signin')}</p></div>
          <div><GoogleButton /></div>
        </section>
      )}
      {!live && crisisTurns.map(x => <section key={x.id} className="crisis" role="alert"><p style={{whiteSpace:'pre-wrap'}}>{x.content}</p></section>)}
      {live && (
        <div className="bcard chat">
          <div className="chat-head"><Koyan pose={mode === 'care' ? 'love' : mode === 'letter' ? 'laptop' : 'idle'} size={40} /><b>{title || t('koyan.name')}</b><span>{t('aiHelper')}</span></div>
          <div className="chat-log" ref={logRef} aria-live="polite">
            <div className="msg"><Koyan pose="joy" size={44} /><div className="bubble">{hello}</div></div>
            {chat.turns.map(turn => turn.role === 'user'
              ? <UserBubble key={turn.id} text={turn.content} />
              : (
                <div key={turn.id} className="msg">
                  <Koyan pose={turn.crisis ? 'support' : 'laptop'} size={44} />
                  <div className={'bubble' + (turn.crisis ? ' crisis-bubble' : '')}>
                    <span>{turn.pending && !turn.content ? <span className="typing">{t('chat.thinking')}</span> : turn.content}</span>
                    {turn.sources && turn.sources.length > 0 && (
                      <p className="note">{t('chat.sources')}: {turn.sources.map((s, i) => <span key={s.url}>{i ? ' · ' : ''}<a href={s.url} target="_blank" rel="noopener">{s.title}</a></span>)}</p>
                    )}
                    {turn.noteKey && <p className="note">{t(turn.noteKey)}</p>}
                  </div>
                </div>
              ))}
          </div>
          {quick.length > 0 && !chat.busy && (
            <div className="chat-topics">{quick.map(x => <button key={x} type="button" className="pill" onClick={() => send(x)}>{x}</button>)}</div>
          )}
          {chat.errKey && (
            <div className="chat-warn row between" role="alert">
              <span>{t(chat.errKey)}</span>
              {chat.retry && <button type="button" className="btn ghost sm" disabled={chat.busy} onClick={() => sendChat(chat.retry, {retry:true, mode, focus})}>{t('chat.retry')}</button>}
            </div>
          )}
          <form className={'chat-form' + (multiline ? ' multi' : '')} onSubmit={submit}>
            <label htmlFor={'c-ask-' + mode} className="sr">{t('chat.label')}</label>
            {multiline
              ? <textarea id={'c-ask-' + mode} ref={inputRef} maxLength={maxLength} rows={4} placeholder={placeholder || t('chat.ph')} value={q} onChange={e => setQ(e.target.value)} onKeyDown={onKey} />
              : <input id={'c-ask-' + mode} ref={inputRef} type="text" maxLength={maxLength} autoComplete="off" placeholder={placeholder || t('chat.ph')} value={q} onChange={e => setQ(e.target.value)} />}
            {chat.busy
              ? <button type="button" className="btn ink" onClick={() => stopChat(mode)}>{t('chat.stop')}</button>
              : <button type="submit" className="btn" disabled={!q.trim()}>{t('chat.send')}</button>}
          </form>
          {multiline && <p className="small muted chat-count">{q.length} / {maxLength}</p>}
        </div>
      )}
      {live && <p className="small muted">{inClaude ? t('chat.privacyArtifact') : t(privacyKey)} {t('chat.foot')}</p>}
    </div>
  );
}

/* Long messages (drafts) are folded so the conversation stays readable. */
function UserBubble({ text }){
  const { t } = useApp();
  const [open, setOpen] = useState(false);
  const long = text.length > 400;
  return (
    <div className="bubble me">
      {long && !open ? text.slice(0, 280) + '…' : text}
      {long && <button type="button" className="linkbtn light" onClick={() => setOpen(o => !o)}>{open ? t('chat.less') : t('chat.more', text.length)}</button>}
    </div>
  );
}
