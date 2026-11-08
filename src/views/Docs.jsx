import { useState } from 'react';
import { useApp } from '../state/AppState.jsx';
import { go } from '../hooks/useHashRoute.js';
import { Cabinet, PageHead } from '../components/Shell.jsx';
import { AccountLine } from '../components/Account.jsx';
import { COUNTRIES, REGIONS } from '../data/reference.js';
import { optLabel } from '../data/questions.js';
import { docsFor, effRegions } from '../lib/logic.js';

/* "Кабинет · Документы и профиль": a status checklist (no file uploads) plus the test answers. */
export default function Docs(){
  const { state, update, cycleDoc, startTest, resetAll, mode, t, L, lang } = useApp();
  const [confirmReset, setConfirmReset] = useState(false);
  const docs = docsFor(state), p = state.profile;
  const label = st => t('docs.' + st);

  const facts = p ? [
    ['pf.grade', t('result.grade', p.grade)], ['pf.country', L(COUNTRIES[p.country])], ['pf.english', optLabel('english', p.english, lang)],
    ['pf.sat', optLabel('sat', p.sat || 'none', lang)],
    ['pf.grades', optLabel('grades', p.grades, lang)], ['pf.extra', optLabel('extra', p.extra, lang)], ['pf.budget', optLabel('budget', p.budget, lang)],
    ['pf.field', optLabel('field', p.field, lang)], ['pf.regions', effRegions(p).map(r => L(REGIONS[r].label)).join(', ')]
  ] : [];

  return (
    <Cabinet>
      <PageHead pose="backpack" title={t('docs.h1')} sub={t('docs.sub')} />

      <div className="legend">
        <span><i className="sw done" />{label('done')}</span><span><i className="sw wip" />{label('wip')}</span><span><i className="sw todo" />{label('todo')}</span>
        <span className="muted">{t('docs.tap')}</span>
      </div>

      <div className="dgrid">
        {docs.groups.map(g => (
          <section key={g.id} className="card">
            <h2>{L(g.title)}</h2>
            {g.items.map(i => {
              const st = docs.status(i.id);
              return (
                <button key={i.id} type="button" className={'doc ' + st} onClick={() => cycleDoc(i.id)} aria-label={t('docs.itemAria', L(i.name), label(st))}>
                  <span className="grow"><b>{L(i.name)}</b><span className="small muted">{L(i.hint)}</span></span>
                  <span className="doc-st">{label(st)}</span>
                </button>
              );
            })}
            {g.note && <p className="small muted">{L(g.note)}</p>}
          </section>
        ))}
      </div>

      <section className="card">
        <h2>{t('docs.profileH')}</h2>
        <div className="field" style={{maxWidth:360}}>
          <label htmlFor="p-name">{t('docs.name')}</label>
          <input className="input" id="p-name" maxLength={40} placeholder={t('docs.namePh')} value={state.name || ''} onChange={e => update(s => { s.name = e.target.value; })} />
        </div>
        {p ? (
          <>
            <div className="facts">{facts.map(([k, v]) => <div key={k} className="fact"><span className="small muted">{t(k)}</span><b>{v}</b></div>)}</div>
            <div><button type="button" className="btn ghost sm" onClick={() => { startTest(); go('test'); }}>{t('result.edit')}</button></div>
          </>
        ) : <div><a className="btn sm" href="#test">{t('takeTest')}</a></div>}
      </section>

      <section className="privacy">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFD23F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
        <div className="grow"><b>{t('docs.privacyH')}</b><p>{mode === 'google' ? t('docs.privacyGoogle') : mode === 'cloud' ? t('docs.privacyCloud') : t('docs.privacyLocal')}</p></div>
      </section>

      <section className="card">
        <h2>{t('data.h')}</h2>
        <AccountLine />
        <p className="small muted">{t('data.p')}</p>
        <div className="row">
          {confirmReset ? (
            <>
              <span className="small bold">{t('data.sure')}</span>
              <button type="button" className="btn danger sm" onClick={() => { resetAll(); setConfirmReset(false); go('home'); }}>{t('data.yes')}</button>
              <button type="button" className="linkbtn" onClick={() => setConfirmReset(false)}>{t('cancel')}</button>
            </>
          ) : <button type="button" className="btn ghost sm" onClick={() => setConfirmReset(true)}>{t('data.reset')}</button>}
        </div>
      </section>
    </Cabinet>
  );
}
