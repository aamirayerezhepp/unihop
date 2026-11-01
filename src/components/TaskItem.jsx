import { useApp } from '../state/AppState.jsx';
import { daysLeft, fmtShort, daysWord } from '../lib/dates.js';
import { REGIONS } from '../data/reference.js';

function DueTag({ date, done }){
  const { t, lang } = useApp();
  if (done) return <span className="tag ok">{t('task.done')}</span>;
  const d = daysLeft(date);
  if (d < 0) return <span className="tag late">{t('task.late')}</span>;
  if (d === 0) return <span className="tag soon">{t('today')}</span>;
  if (d <= 21) return <span className="tag soon">{t('task.in', daysWord(d, lang))}</span>;
  return null;
}

export default function TaskItem({ t: task }){
  const { state, toggleTask, t, L, lang } = useApp();
  const done = !!state.done[task.id];
  return (
    <div className={'task' + (done ? ' is-done' : '')}>
      <button type="button" className="check" aria-pressed={done} aria-label={t('task.mark', L(task.title))} onClick={() => toggleTask(task.id)} />
      <div><p className="task-title">{L(task.title)}</p><p className="task-detail">{L(task.detail)}</p></div>
      <div className="task-meta">
        <span title={task.approx ? t('task.approxTitle') : t('task.exactTitle')}>{task.approx ? '≈ ' : ''}{fmtShort(task.date, lang)}</span>
        <div className="tags"><DueTag date={task.date} done={done} />{(task.regions || []).map(r => <span key={r} className="tag">{REGIONS[r].code}</span>)}</div>
      </div>
    </div>
  );
}
