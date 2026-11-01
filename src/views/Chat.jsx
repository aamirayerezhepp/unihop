import { useEffect, useRef, useState } from 'react';
import { useApp } from '../state/AppState.jsx';
import { Cabinet, PageHead } from '../components/Shell.jsx';
import Koyan from '../components/Koyan.jsx';
import { PRESETS } from '../data/reference.js';

export default function Chat(){
  const { state, chat, chatAvail, sendChat, stopChat, t, L } = useApp();
  const [q, setQ] = useState('');
  const logRef = useRef(null), inputRef = useRef(null), wasBusy = useRef(false);

  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [chat.turns]);
  useEffect(() => {
    if (wasBusy.current && !chat.busy && inputRef.current && !inputRef.current.disabled) inputRef.current.focus();
    wasBusy.current = chat.busy;
  }, [chat.busy]);

  const off = chatAvail === false;
  const warn = off ? t('chat.off') : chat.errKey ? t(chat.errKey) : '';
  const submit = e => { e.preventDefault(); const text = q; setQ(''); sendChat(text); };
  const body = turn => turn.preset ? L(turn.preset.a) : turn.msgKey ? t(turn.msgKey) : (turn.pending && !turn.content ? t('chat.thinking') : turn.content);

  return (
    <Cabinet>
      <PageHead pose="laptop" title={t('chat.h1')} sub={t('chat.sub')} />
      <div className="bcard chat">
        <div className="chat-head"><Koyan pose="idle" size={40} /><b>Қоян</b><span>{t('aiHelper')}</span></div>
        <div className="chat-log" ref={logRef} aria-live="polite">
          <div className="msg"><Koyan pose="joy" size={44} /><div className="bubble">{t('chat.hello', !!state.profile)}</div></div>
          {chat.turns.map(turn => turn.role === 'user'
            ? <div key={turn.id} className="bubble me">{turn.content}</div>
            : (
              <div key={turn.id} className="msg">
                <Koyan pose="laptop" size={44} />
                <div className="bubble">
                  <span>{body(turn)}</span>
                  {turn.preset && <p className="note">{L(turn.preset.src)}</p>}
                  {turn.noteKey && <p className="note">{t(turn.noteKey)}</p>}
                </div>
              </div>
            ))}
        </div>
        <div className="chat-topics">
          {PRESETS.map(p => <button key={p.q.ru} type="button" className="pill" disabled={chat.busy} onClick={() => sendChat(L(p.q))}>{L(p.q)}</button>)}
        </div>
        {warn && <p className="chat-warn">{warn}</p>}
        <form className="chat-form" onSubmit={submit}>
          <label htmlFor="c-ask" className="sr">{t('chat.label')}</label>
          <input id="c-ask" ref={inputRef} type="text" maxLength={600} autoComplete="off" placeholder={t('chat.ph')} value={q} onChange={e => setQ(e.target.value)} disabled={off} />
          {chat.busy
            ? <button type="button" className="btn ink" onClick={stopChat}>{t('chat.stop')}</button>
            : <button type="submit" className="btn" disabled={off}>{t('chat.send')}</button>}
        </form>
      </div>
      <p className="small muted">{t('chat.foot')}</p>
    </Cabinet>
  );
}
