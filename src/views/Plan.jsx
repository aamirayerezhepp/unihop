import { useState } from 'react';
import { useApp } from '../state/AppState.jsx';
import { Cabinet, PageHead, NeedProfile } from '../components/Shell.jsx';
import TaskItem from '../components/TaskItem.jsx';
import { buildPlan } from '../lib/logic.js';
import { daysLeft, monthTitle, stepsWord } from '../lib/dates.js';

const FILTERS = ['left', 'all', 'doneF'];

export default function Plan(){
  const { state, t, lang } = useApp();
  const [filter, setFilter] = useState('left');
  const p = state.profile;
  if (!p) return <Cabinet><PageHead pose="laptop" title={t('plan.h1')} sub={t('plan.leadEmpty')} /><NeedProfile textKey="needPlan" /></Cabinet>;

  const plan = buildPlan(p), isDone = x => !!state.done[x.id];
  const doneN = plan.filter(isDone).length, pct = plan.length ? Math.round(doneN / plan.length * 100) : 0;
  const list = filter === 'left' ? plan.filter(x => !isDone(x)) : filter === 'doneF' ? plan.filter(isDone) : plan;
  const late = list.filter(x => !isDone(x) && daysLeft(x.date) < 0);
  const groups = [];
  list.filter(x => !late.includes(x)).forEach(x => {
    const k = x.date.slice(0, 7);
    let g = groups.find(y => y.k === k);
    if (!g) groups.push(g = {k, items:[]});
    g.items.push(x);
  });

  return (
    <Cabinet>
      <PageHead pose="laptop" title={t('plan.h1')} sub={t('plan.lead', doneN, plan.length)} />
      <div className="progress"><span style={{width:pct + '%'}} /></div>
      <div className="row" role="group" aria-label={t('plan.filter')}>
        {FILTERS.map(v => <button key={v} type="button" className="pill" aria-pressed={filter === v} onClick={() => setFilter(v)}>{t('plan.' + v)}</button>)}
      </div>
      {late.length > 0 && (
        <section className="card tight">
          <div className="card-h late"><h2>{t('plan.now')}</h2><span className="small bold muted">{t('plan.past')}</span></div>
          {late.map(x => <TaskItem key={x.id} t={x} />)}
        </section>
      )}
      {groups.map(g => {
        const [y, m] = g.k.split('-').map(Number);
        return (
          <section key={g.k} className="card tight">
            <div className="card-h"><h2>{monthTitle(y, m, lang)}</h2><span className="small bold muted">{stepsWord(g.items.length, lang)}</span></div>
            {g.items.map(x => <TaskItem key={x.id} t={x} />)}
          </section>
        );
      })}
      {!late.length && !groups.length && <p className="empty">{t('plan.empty')}</p>}
    </Cabinet>
  );
}
