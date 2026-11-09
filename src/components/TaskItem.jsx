import { useApp } from '../state/AppState.jsx';
import { daysLeft, fmtDate, daysWord } from '../lib/dates.js';
import { isDone } from '../lib/plan.js';

function DueTag({ task, done }){
  const { t, lang } = useApp();
  if (done) return <span className="tag ok">{t('task.done')}</span>;
  if (task.missed) return <span className="tag late">{t('task.late')}</span>;
  if (task.asap) return <span className="tag soon">{t('plan.asap')}</span>;
  const d = daysLeft(task.date);
  if (d === 0) return <span className="tag soon">{t('today')}</span>;
  if (d <= 21) return <span className="tag soon">{t('task.in', daysWord(d, lang))}</span>;
  return null;
}

/* One plan step: official deadlines show the year and a source link; recommended steps say they are advice. */
export default function TaskItem({ t: task }){
  const { state, toggleTask, t, L, lang } = useApp();
  const done = isDone(state, task);
  const official = task.kind === 'official';
  return (
    <div className={'task' + (done ? ' is-done' : '')}>
      <button type="button" className="check" aria-pressed={done} aria-label={t('task.mark', L(task.title))} onClick={() => toggleTask(task.id, task.alias)} />
      <div>
        <p className="task-title">{L(task.title)}</p>
        {task.detail && <p className="task-detail">{L(task.detail)}</p>}
        {task.missed && task.after && <p className="task-detail"><b>{t('plan.whatNow')}:</b> {L(task.after)}</p>}
        {task.link && <a className="small bold" href={task.link}>{t('plan.toResult')} →</a>}
      </div>
      <div className="task-meta">
        <span title={official ? (task.approx ? t('task.approxTitle') : t('task.exactTitle')) : t('plan.recommended')}>
          {task.approx ? '≈ ' : ''}{task.asap ? t('plan.asap') : fmtDate(task.date, lang)}
        </span>
        <div className="tags">
          <DueTag task={task} done={done} />
          <span className={'tag ' + (official ? 'blue' : 'dash')}>{official ? t('plan.officialTag') : t('plan.recommended')}</span>
        </div>
        {task.src && <a href={task.src} target="_blank" rel="noopener" className="small">{t('card.src')} ↗</a>}
      </div>
    </div>
  );
}
