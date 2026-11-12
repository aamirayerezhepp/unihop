import { useState } from 'react';
import { useApp } from '../state/AppState.jsx';
import { Cabinet, PageHead } from '../components/Shell.jsx';
import ChatBox from '../components/ChatBox.jsx';
import { programById } from '../data/programs.js';
import { programTitle } from '../lib/match.js';

const STEPS = ['s1', 's2', 's3', 's4', 's5'];
const MIN_REVIEW = 200;

/* Motivation-letter coach: the student writes; Қоян explains structure, asks questions and reviews the draft.
   Drafts are kept in the student's own data (browser, or the Google account) and sent only when feedback is asked. */
export default function Letter(){
  const { state, update, sendChat, chats, t, lang } = useApp();
  const progs = state.apps.filter(a => a.programId && programById(a.programId)).map(a => programById(a.programId));
  const [pid, setPid] = useState(progs[0] ? progs[0].id : '');
  const pr = pid ? programById(pid) : null;
  const key = pid || 'general';
  const draft = (state.letters || {})[key] || '';
  const setDraft = v => update(s => { s.letters = s.letters || {}; s.letters[key] = v.slice(0, 5000); });

  const chars = draft.trim().length, words = draft.trim() ? draft.trim().split(/\s+/).length : 0;
  const req = pr && pr.letter;
  const fit = !req || !chars ? null : chars < req.min ? 'short' : chars > req.max ? 'long' : 'ok';
  const name = pr ? programTitle(pr, lang) : '';
  const busy = chats.letter.busy;
  const review = () => sendChat(t('letter.ask', name) + '\n\n' + draft.trim(), {mode:'letter', focus:pid ? [pid] : []});
  const start = () => sendChat(t('letter.startQ', name), {mode:'letter', focus:pid ? [pid] : []});

  return (
    <Cabinet>
      <PageHead pose="laptop" title={t('letter.h1')} sub={t('letter.sub')} />

      <section className="card">
        <div className="field" style={{maxWidth:520}}>
          <label htmlFor="l-prog">{t('letter.for')}</label>
          <select id="l-prog" className="select" value={pid} onChange={e => setPid(e.target.value)}>
            {progs.map(p => <option key={p.id} value={p.id}>{programTitle(p, lang)}</option>)}
            <option value="">{t('letter.none')}</option>
          </select>
          {!progs.length && <p className="small muted">{t('letter.noProgs')} <a className="bold" href="#result">{t('plan.toResult')} →</a></p>}
        </div>
        {pr && (
          <p className="small">
            <b>{t('letter.req')}:</b> {req ? <>{t('letter.reqLen', req.min, req.max)} <a href={req.src} target="_blank" rel="noopener">{t('card.src')} ↗</a></> : t('letter.reqUnknown')}
          </p>
        )}
        <div className="field">
          <label htmlFor="l-draft">{t('letter.draft')}</label>
          <textarea id="l-draft" className="input letter-draft" rows={12} maxLength={5000} placeholder={t('letter.draftPh')} value={draft} onChange={e => setDraft(e.target.value)} />
          <div className="row between small">
            <span className="muted">{t('letter.count', chars, words)}</span>
            {fit && <span className={'tag ' + (fit === 'ok' ? 'ok' : 'soon')}>{fit === 'ok' ? t('letter.inRange') : fit === 'short' ? t('letter.short', req.min - chars) : t('letter.long', chars - req.max)}</span>}
          </div>
        </div>
        <div className="row">
          <button type="button" className="btn" disabled={busy || chars < MIN_REVIEW} onClick={review}>{t('letter.review')}</button>
          <button type="button" className="btn ghost" disabled={busy} onClick={start}>{t('letter.start')}</button>
          {chars < MIN_REVIEW && <span className="small muted">{t('letter.reviewHint', MIN_REVIEW)}</span>}
        </div>
        <p className="small muted">{t('letter.privacy')}</p>
      </section>

      <ChatBox mode="letter" title={t('letter.coachName')} hello={t('letter.hello')} multiline maxLength={5000} focus={pid ? [pid] : []}
        quick={[t('letter.q1'), t('letter.q2'), t('letter.q3')]} privacyKey="letter.privacyChat" />

      <section className="card tight">
        <h2>{t('letter.structH')}</h2>
        {STEPS.map((s, i) => (
          <details key={s} className="tech"><summary>{i + 1}. {t('letter.' + s)}</summary><div className="body"><p>{t('letter.' + s + 'P')}</p></div></details>
        ))}
      </section>
    </Cabinet>
  );
}
