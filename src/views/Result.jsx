import { useState } from 'react';
import { useApp } from '../state/AppState.jsx';
import { go } from '../hooks/useHashRoute.js';
import { Public, NeedProfile } from '../components/Shell.jsx';
import Koyan from '../components/Koyan.jsx';
import ProgramCard, { saveProgram } from '../components/ProgramCard.jsx';
import { AccountOffer } from '../components/Account.jsx';
import { REGIONS, FIELDS, UNI_COUNTRY } from '../data/reference.js';
import { LANGS } from '../data/programs.js';
import { profileFacts, optLabel } from '../data/questions.js';
import { matchAll, suggestions, unverified, programTitle } from '../lib/match.js';

/* Matching result: programmes grouped by admission and funding fit, an honest note when the database is thin,
   suggested changes the student can apply, and catalogue universities that are not verified yet. */
export default function Result(){
  const { state, startTest, addApp, update, askKoyan, t, L, lang } = useApp();
  const [applied, setApplied] = useState(false);
  const p = state.profile;
  if (!p) return <Public hero={<section className="wrap hero"><NeedProfile textKey="needUnis" /></section>} />;

  const m = matchAll(p), sugs = suggestions(p), extra = unverified(p);
  const saved = r => state.apps.some(a => a.programId === r.pr.id);
  const onSave = r => saveProgram(addApp, r, lang);
  const onAsk = pr => askKoyan(t('card.askQ', programTitle(pr, lang)), pr.id);
  const regs = (p.regions || []).includes('unsure') || !(p.regions || []).length ? optLabel('regions', 'unsure', lang) : p.regions.map(r => L(REGIONS[r].label)).join(', ');
  const field = L((FIELDS.find(f => f[0] === p.field) || [, ''])[1]);
  const apply = s => { update(st => { Object.assign(st.profile, s.patch); }); setApplied(true); };
  const sugText = s => s.kind === 'lang' ? t('sug.lang', L(LANGS[s.arg]), s.n) : s.kind === 'region' ? t('sug.region', L(REGIONS[s.arg].label), s.n)
    : s.kind === 'field' ? t('sug.field', s.n) : s.kind === 'local' ? t('sug.local', s.n) : t('sug.funding', s.n);
  const few = m.fit.length < 2;

  const group = (key, list) => list.length > 0 && (
    <section className="stack" key={key}>
      <div><h2>{t('grp.' + key)}</h2><p className="muted measure">{t('grp.' + key + 'Desc')}</p></div>
      <div className="pgrid">{list.map(r => <ProgramCard key={r.pr.id} r={r} onSave={onSave} saved={saved(r)} onAsk={onAsk} />)}</div>
    </section>
  );

  const hero = (
    <section className="wrap hero hero-sm">
      <Koyan pose="graduate" size={140} />
      <div className="hero-text">
        <p className="eyebrow">{t('result.eyebrow')}</p>
        <h1 className="sm">{t('result.h1')}</h1>
        <div className="row">
          {profileFacts(p, lang).filter(([k]) => !['pf.country'].includes(k)).map(([k, v]) => v && <span key={k} className="tag" title={t(k)}>{v}</span>)}
          <button type="button" className="linkbtn ink" onClick={() => { startTest(); go('test'); }}>{t('result.edit')}</button>
        </div>
      </div>
    </section>
  );

  return (
    <Public hero={hero}>
      <div className="wrap section">
        <AccountOffer />
        <p className="muted measure">{t('result.note')}</p>
        {group('fit', m.fit)}
        {group('money', m.money)}
        {few && (
          <section className="soft limits">
            <h2>{t('lim.h')}</h2>
            <p>{m.pool ? t('lim.db', m.pool, field || '—', regs) : t('lim.none', field || '—', regs)}</p>
            {(m.reasons.lang > 0 || m.reasons.passed > 0 || m.reasons.money > 0) && (
              <ul>{m.reasons.lang > 0 && <li>{t('lim.lang', m.reasons.lang)}</li>}{m.reasons.passed > 0 && <li>{t('lim.passed', m.reasons.passed)}</li>}{m.reasons.money > 0 && <li>{t('lim.money', m.reasons.money)}</li>}</ul>
            )}
            {sugs.length > 0 && (
              <>
                <b>{t('lim.try')}</b>
                <ul className="sugs">{sugs.map((s, i) => (
                  <li key={i}><span className="grow">{sugText(s)}</span>{s.patch && <button type="button" className="btn ghost sm" onClick={() => apply(s)}>{t('lim.apply')}</button>}</li>
                ))}</ul>
              </>
            )}
            {applied && <p className="small bold" role="status">{t('lim.applied')}</p>}
          </section>
        )}
        {group('alt', m.alt)}
        {extra.length > 0 && (
          <details className="card catalog">
            <summary className="bold">{t('lim.catalog', extra.length)}</summary>
            <p className="small muted">{t('lim.catalogNote')}</p>
            <ul className="cols">{extra.map(u => <li key={u.n}>{u.n} · {L(UNI_COUNTRY[u.c])}</li>)}</ul>
          </details>
        )}
        <div className="row"><a className="btn" href="#home">{t('result.cabinet')}</a><a className="btn ghost" href="#koyan">{t('askKoyan')}</a></div>
      </div>
    </Public>
  );
}
