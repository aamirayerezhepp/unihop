import { useApp } from '../state/AppState.jsx';
import { Cabinet, PageHead } from '../components/Shell.jsx';
import ChatBox from '../components/ChatBox.jsx';
import { PRESETS } from '../data/reference.js';

/* Chat with Қоян about admission, plus links to the two other assistants and a FAQ with checked answers. */
export default function Chat(){
  const { state, chatDraft, setChatDraft, t, L } = useApp();
  return (
    <Cabinet>
      <PageHead pose="laptop" title={t('chat.h1')} sub={t('chat.sub')} />
      <div className="row assist-links">
        <a className="pill" href="#letter">✍ {t('nav.letter')}</a>
        <a className="pill" href="#care">♡ {t('care.talkH')}</a>
      </div>
      <ChatBox mode="koyan" hello={t('chat.hello', !!state.profile)} draft={chatDraft} onDraftUsed={() => setChatDraft('')} />
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
