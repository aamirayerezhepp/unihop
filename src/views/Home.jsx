import { useState } from 'react';
import { useApp } from '../state/AppState.jsx';
import { Public, Cabinet, PageHead } from '../components/Shell.jsx';
import Koyan from '../components/Koyan.jsx';
import TestCard from '../components/TestCard.jsx';
import { BASKETS, PRESETS, STATUSES, CHECKS } from '../data/reference.js';
import { buildPlan, docsFor, fittingGrants, upcoming, isDone } from '../lib/logic.js';
import { planFocus } from '../lib/plan.js';
import { daysLeft, daysWord, fmtDate, fmtShort } from '../lib/dates.js';

export default function Home(){
  const { state } = useApp();
  return state.profile ? <Dashboard /> : <Landing />;
}

/* First visit: design C's landing with the test right in the hero. Kept short on purpose. */
function Landing(){
  const { t, L } = useApp();
  const hero = (
    <section className="wrap hero">
      <div className="hero-text">
        <div className="kchip"><Koyan pose="joy" size={56} /><span>{t('land.chip')}</span></div>
        <h1>{t('land.h1')}</h1>
        <p className="lead">{t('land.lead')}</p>
        <span className="bold">{t('land.meta')}</span>
      </div>
      <div className="hero-side"><TestCard /></div>
    </section>
  );
  return (
    <Public hero={hero}>
      <section className="wrap section">
        <div className="row between" style={{alignItems:'baseline'}}>
          <div className="row" style={{gap:16}}><Koyan pose="graduate" size={88} /><h2>{t('land.resultH')}</h2></div>
          <span className="tag dash">{t('example')}</span>
        </div>
        <div className="card pcard" style={{maxWidth:640}}>
          <p className="small muted">Eötvös Loránd University (ELTE) · Budapest</p>
          <h3>Psychology BA</h3>
          <ul className="bullets" style={{fontSize:15}}>{['land.ex1', 'land.ex2', 'land.ex3'].map(k => <li key={k}>{t(k)}</li>)}</ul>
        </div>
      </section>

      <section className="assist">
        <div className="wrap section split">
          <div className="stack" style={{flex:'1 1 340px', minWidth:0}}>
            <Koyan pose="support" size={160} />
            <h2>{t('land.assistH')}</h2>
            <ul className="bullets">{['land.a1', 'land.a2', 'land.a3', 'land.a4', 'land.a5'].map(k => <li key={k}>{t(k)}</li>)}</ul>
          </div>
          <div className="bcard chat" style={{flex:'1 1 400px', minWidth:0}}>
            <div className="chat-head"><Koyan pose="idle" size={40} /><b>{t('koyan.name')}</b><span>{t('aiHelper')}</span></div>
            <div className="chat-log" style={{minHeight:0}}>
              <div className="bubble me">{L(PRESETS[0].q)}</div>
              <div className="msg"><Koyan pose="laptop" size={44} /><div className="bubble">{L(PRESETS[0].a)}<p className="note">{L(PRESETS[0].src)}</p></div></div>
            </div>
            <div className="chat-form"><a className="btn" href="#koyan" style={{flex:1}}>{t('askKoyan')}</a></div>
          </div>
        </div>
      </section>

      <footer className="wrap foot">{t('land.foot')}</footer>
    </Public>
  );
}

/* Personal account home, after the test: the "Кабинет · Главная" design, trimmed. */
function Dashboard(){
  const { state, t, L, lang, toggleTask } = useApp();
  const [justDone, setJustDone] = useState([]);
  const p = state.profile, plan = buildPlan(state).filter(x => !x.info);
  const doneN = plan.filter(x => isDone(state, x)).length, pct = plan.length ? Math.round(doneN / plan.length * 100) : 0;
  const up = upcoming(state), docs = docsFor(state);
  const nearest = up[0], nd = nearest ? daysLeft(nearest.date) : null;
  let sub = nearest ? (nd === 0 ? t('dash.nearestToday') : t('dash.nearest', daysWord(nd, lang))) : t('dash.noDeadlines');
  if (nearest && nd <= 30 && docs.done < docs.total) sub += t('dash.missing', docs.total - docs.done);
  const baskets = k => state.apps.filter(a => a.basket === k).length;
  const focus = planFocus(state, plan);
  const week = plan.filter(x => !x.missed && (!isDone(state, x) || justDone.includes(x.id))).slice(0, 4);
  const tip = week.some(x => /recs/.test(x.id)) ? t('dash.tipRecs') : t('dash.tip');
  const tick = x => { if (!justDone.includes(x.id)) setJustDone([...justDone, x.id]); toggleTask(x.id, x.alias); };

  return (
    <Cabinet>
      <PageHead pose="joy" title={t('dash.hi', state.name)} sub={sub} />

      <div className="tiles">
        <a className="tile" href="#list"><span className="tile-l">{t('tile.list')}</span><b>{state.apps.length}</b><span className="tile-s">{t('tile.listSub', baskets('dream'), baskets('real'), baskets('safe'))}</span></a>
        <a className="tile" href="#docs"><span className="tile-l">{t('tile.docs')}</span><b>{docs.done} / {docs.total}</b><div className="progress"><span style={{width:(docs.total ? docs.done / docs.total * 100 : 0) + '%'}} /></div></a>
        <a className="tile" href="#plan"><span className="tile-l">{t('tile.plan')}</span><b>{pct}%</b><span className="tile-s">{t('tile.planSub', doneN, plan.length)}</span></a>
        <a className="tile yellow" href="#grants"><span className="tile-l">{t('tile.grants')}</span><b>{fittingGrants(p).length}</b><span className="tile-s bold">{t('look')} →</span></a>
      </div>

      <div className="two">
        <section className="card">
          <div className="card-h"><h2>{t('dash.deadlines')}</h2><a href="#plan" className="bold small">{t('dash.allPlan')}</a></div>
          {up.length ? up.slice(0, 4).map(u => {
            const d = daysLeft(u.date);
            return (
              <div key={u.key} className="drow">
                <span className={'dchip' + (d <= 14 ? ' urgent' : '')}>{d === 0 ? t('today') : daysWord(d, lang)}</span>
                <div className="grow"><b>{L(u.title)}</b><span className="small muted">{u.approx ? '≈ ' : ''}{fmtDate(u.date, lang)}</span></div>
              </div>
            );
          }) : <p className="muted">{t('dash.noDeadlines')}</p>}
        </section>

        <section className="card">
          <div className="card-h"><h2>{t('dash.week')}</h2></div>
          {week.length ? week.map(x => (
            <label key={x.id} className="checkrow">
              <input type="checkbox" checked={isDone(state, x)} onChange={() => tick(x)} />
              <span className={isDone(state, x) ? 'struck' : ''}>{L(x.title)}{x === focus.main && !isDone(state, x) ? <b className="blue"> · {t('plan.main')}</b> : null}</span>
            </label>
          )) : <p className="muted">{t('dash.weekDone')}</p>}
          <div className="hint-row push"><Koyan pose="question" size={52} /><div className="bubble small">{tip}</div></div>
        </section>
      </div>

      <section className="card">
        <div className="card-h"><h2>{t('dash.list')}</h2><a href="#list" className="bold small">{t('dash.addProg')}</a></div>
        {state.apps.length ? (
          <div className="ltable">
            <div className="lrow lhead"><span>{t('col.program')}</span><span>{t('col.basket')}</span><span>{t('col.status')}</span><span>{t('col.ready')}</span><span>{t('col.deadline')}</span></div>
            {state.apps.map(a => (
              <a key={a.id} className="lrow" href="#list">
                <span className="lname"><b>{a.name}</b><span className="small muted">{a.kind === 'grant' ? t('apps.grant') : t('apps.uni')}</span></span>
                <span>{a.basket ? <span className={'bchip ' + a.basket}>{L(BASKETS[a.basket])}</span> : <span className="muted">—</span>}</span>
                <span className={a.status === 'sent' ? 'bold blue' : ''}>{L((STATUSES.find(s => s[0] === a.status) || STATUSES[0])[1])}</span>
                <span>{CHECKS.filter(([k]) => a.checks && a.checks[k]).length} / {CHECKS.length}</span>
                <span>{a.deadline ? fmtShort(a.deadline, lang) : '—'}</span>
              </a>
            ))}
          </div>
        ) : (
          <div className="row"><p className="muted grow">{t('dash.listEmpty')}</p><a className="btn sm" href="#result">{t('dash.myChances')}</a></div>
        )}
      </section>
    </Cabinet>
  );
}
