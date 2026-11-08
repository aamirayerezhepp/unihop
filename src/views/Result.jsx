import { useApp } from '../state/AppState.jsx';
import { go } from '../hooks/useHashRoute.js';
import { Public, NeedProfile } from '../components/Shell.jsx';
import Koyan from '../components/Koyan.jsx';
import ResultCards from '../components/ResultCards.jsx';
import { AccountOffer } from '../components/Account.jsx';
import { REGIONS } from '../data/reference.js';
import { optLabel } from '../data/questions.js';
import { chances, effRegions, gaps } from '../lib/logic.js';
import { findInCatalog } from '../data/catalog.js';

export default function Result(){
  const { state, startTest, addApp, t, L, lang } = useApp();
  const p = state.profile;
  if (!p) return <Public hero={<section className="wrap hero"><NeedProfile textKey="needUnis" /></section>} />;

  const eng = p.english === 'none' ? t('result.noIelts') : t('result.ielts', optLabel('english', p.english, lang));
  const sat = p.sat === 'nousa' ? null : (!p.sat || p.sat === 'none') ? t('result.noSat') : t('result.sat', optLabel('sat', p.sat, lang));
  const summary = [t('result.grade', p.grade), eng, sat, optLabel('grades', p.grades, lang), optLabel('budget', p.budget, lang), optLabel('field', p.field, lang)].filter(Boolean);
  const isAdded = u => state.apps.some(a => a.name === u.n);
  /* Deadline and website come from the catalog. */
  const onAdd = (u, basket) => {
    const c = findInCatalog(u.n);
    addApp({name:u.n, kind:'uni', basket, deadline:c ? c.date : '', url:c ? c.url : '', approx:c ? c.approx : false});
  };

  const hero = (
    <section className="wrap hero hero-sm">
      <Koyan pose="graduate" size={140} />
      <div className="hero-text">
        <p className="eyebrow">{t('result.eyebrow')}</p>
        <h1 className="sm">{t('result.h1')}</h1>
        <div className="row">
          {summary.map(s => <span key={s} className="tag">{s}</span>)}
          <button type="button" className="linkbtn ink" onClick={() => { startTest(); go('test'); }}>{t('result.edit')}</button>
        </div>
      </div>
    </section>
  );
  return (
    <Public hero={hero}>
      <div className="wrap section">
        <AccountOffer />
        <p className="muted measure">{t('result.note', effRegions(p).map(x => L(REGIONS[x].label)).join(', '))}</p>
        <ResultCards r={chances(p)} onAdd={onAdd} isAdded={isAdded} />
        <div className="soft gaps"><b>{t('gaps.title')}</b>{gaps(p).map(k => <span key={k}>{t(k)}</span>)}</div>
        <div className="row"><a className="btn" href="#home">{t('result.cabinet')}</a><a className="btn ghost" href="#koyan">{t('askKoyan')}</a></div>
      </div>
    </Public>
  );
}
