import { useState } from 'react';
import { useApp } from '../state/AppState.jsx';
import { Cabinet, PageHead } from '../components/Shell.jsx';
import { GRANTS, grantDue } from '../data/grants.js';
import { fittingGrants } from '../lib/logic.js';

const REGION_OPTS = ['all', 'us', 'eu', 'ca', 'asia', 'tr', 'ru', 'home'];

export default function Grants(){
  const { state, addApp, t, L } = useApp();
  const [region, setRegion] = useState('all');
  const [onlyFull, setOnlyFull] = useState(false);
  const [mineOn, setMineOn] = useState(true);
  const p = state.profile, mine = mineOn && !!p;

  let list = mine ? fittingGrants(p) : GRANTS;
  if (region !== 'all') list = list.filter(g => g.region === region);
  if (onlyFull) list = list.filter(g => g.cover === 'full');
  const inList = id => state.apps.some(a => a.from === id);
  const add = g => {
    const {date, approx} = grantDue(g);
    addApp({from:g.id, name:L(g.name), kind:'grant', deadline:date, url:g.url, approx, noteKey:approx ? 'note.lastYear' : ''});
  };

  return (
    <Cabinet>
      <PageHead pose="celebrate" title={t('grants.h1')} sub={t('grants.sub')} extra={<span className="tag dash">{t('grants.checked')}</span>} />
      <div className="stack" style={{gap:10}}>
        <div className="row" role="group" aria-label={t('grants.region')}>
          {REGION_OPTS.map(v => <button key={v} type="button" className="pill" aria-pressed={region === v} onClick={() => setRegion(v)}>{t('grants.' + v)}</button>)}
        </div>
        <div className="row">
          {p && <button type="button" className="pill" aria-pressed={mineOn} onClick={() => setMineOn(x => !x)}>{t('grants.mine')}</button>}
          <button type="button" className="pill" aria-pressed={onlyFull} onClick={() => setOnlyFull(x => !x)}>{t('grants.full')}</button>
        </div>
      </div>
      {list.length ? list.map(g => (
        <article key={g.id} className="card">
          <div className="row top" style={{gap:12, flexWrap:'nowrap'}}>
            <span className="flag">{g.code}</span>
            <div className="grow">
              <h3>{L(g.name)}</h3>
              <span className={'tag ' + (g.cover === 'full' ? 'ok' : 'soon')}>{g.cover === 'full' ? t('grants.coverFull') : t('grants.coverPart')}</span>
            </div>
          </div>
          <dl className="kv"><dt>{t('grants.covers')}</dt><dd>{L(g.covers)}</dd><dt>{t('grants.when')}</dt><dd>{L(g.when)}</dd><dt>{t('grants.who')}</dt><dd>{L(g.who)}</dd></dl>
          <div className="row between">
            <a href={g.url} target="_blank" rel="noopener" className="bold">{L(g.urlLabel)} ↗</a>
            {inList(g.id) ? <span className="tag blue">{t('grants.inApps')}</span> : <button type="button" className="btn ghost sm" onClick={() => add(g)}>{t('grants.add')}</button>}
          </div>
        </article>
      )) : <p className="empty">{t('grants.empty')}</p>}
    </Cabinet>
  );
}
