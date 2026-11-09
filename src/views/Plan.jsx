import { useState } from 'react';
import { useApp } from '../state/AppState.jsx';
import { Cabinet, PageHead, NeedProfile } from '../components/Shell.jsx';
import TaskItem from '../components/TaskItem.jsx';
import { buildPlan, isDone, planFocus } from '../lib/plan.js';
import { monthTitle, stepsWord } from '../lib/dates.js';

const FILTERS = ['left', 'all', 'doneF'];

/* The plan: the main next action and three priorities on top, then official deadlines and recommended
   preparation separately, and missed deadlines with what can still be done. */
export default function Plan(){
  const { state, t, lang } = useApp();
  const [filter, setFilter] = useState('left');
  const p = state.profile;
  if (!p) return <Cabinet><PageHead pose="laptop" title={t('plan.h1')} sub={t('plan.leadEmpty')} /><NeedProfile textKey="needPlan" /></Cabinet>;

  const plan = buildPlan(state), steps = plan.filter(x => !x.info);
  const done = x => isDone(state, x);
  const doneN = steps.filter(done).length, pct = steps.length ? Math.round(doneN / steps.length * 100) : 0;
  const keep = x => filter === 'left' ? !done(x) : filter === 'doneF' ? done(x) : true;
  const { main, top } = planFocus(state, plan);
  const missed = plan.filter(x => x.missed && keep(x));
  const official = plan.filter(x => x.kind === 'official' && !x.missed && keep(x));
  const prep = plan.filter(x => x.kind === 'prep' && keep(x));
  const byMonth = list => {
    const groups = [];
    list.forEach(x => { const k = x.date.slice(0, 7); let gr = groups.find(y => y.k === k); if (!gr) groups.push(gr = {k, items:[]}); gr.items.push(x); });
    return groups;
  };

  return (
    <Cabinet>
      <PageHead pose="laptop" title={t('plan.h1')} sub={t('plan.lead', doneN, steps.length)} />
      <div className="progress"><span style={{width:pct + '%'}} /></div>

      {filter === 'left' && main && (
        <section className="card focus">
          <div className="card-h"><h2>{t('plan.main')}</h2></div>
          <TaskItem t={main} />
          {top.length > 0 && <><h3 className="small muted" style={{marginTop:6}}>{t('plan.top')}</h3>{top.map(x => <TaskItem key={x.id} t={x} />)}</>}
        </section>
      )}
      {!state.apps.some(a => a.programId) && <p className="soft small">{t('plan.noApps')} <a className="bold" href="#result">{t('plan.toResult')} →</a></p>}

      <div className="row" role="group" aria-label={t('plan.filter')}>
        {FILTERS.map(v => <button key={v} type="button" className="pill" aria-pressed={filter === v} onClick={() => setFilter(v)}>{t('plan.' + v)}</button>)}
      </div>

      {missed.length > 0 && (
        <section className="card tight">
          <div className="card-h late"><h2>{t('plan.missed')}</h2></div>
          {missed.map(x => <TaskItem key={x.id} t={x} />)}
        </section>
      )}
      {official.length > 0 && (
        <section className="card tight">
          <div className="card-h"><h2>{t('plan.official')}</h2></div>
          <p className="small muted">{t('plan.officialDesc')}</p>
          {official.map(x => <TaskItem key={x.id} t={x} />)}
        </section>
      )}
      {prep.length > 0 && <h2 style={{marginTop:6}}>{t('plan.prep')}</h2>}
      {prep.length > 0 && <p className="small muted" style={{marginTop:-10}}>{t('plan.prepDesc')}</p>}
      {byMonth(prep).map(gr => {
        const [y, m] = gr.k.split('-').map(Number);
        return (
          <section key={gr.k} className="card tight">
            <div className="card-h"><h2>{monthTitle(y, m, lang)}</h2><span className="small bold muted">{stepsWord(gr.items.length, lang)}</span></div>
            {gr.items.map(x => <TaskItem key={x.id} t={x} />)}
          </section>
        );
      })}
      {!missed.length && !official.length && !prep.length && <p className="empty">{filter === 'left' ? t('plan.allDone') : t('plan.empty')}</p>}
    </Cabinet>
  );
}
