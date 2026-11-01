import { useApp } from '../state/AppState.jsx';
import { Cabinet, PageHead } from '../components/Shell.jsx';
import { alerts } from '../lib/logic.js';
import { daysWord, fmtDate } from '../lib/dates.js';

const STAGES = ['d30', 'd14', 'd7', 'd3', 'd1', 'day', 'after'];

/* "Кабинет · Уведомления": the reminder ladder applied to the student's real dates. In-app only for now. */
export default function Alerts(){
  const { state, t, L, lang } = useApp();
  const list = alerts(state);
  return (
    <Cabinet>
      <PageHead pose="travel" title={t('alerts.h1')} sub={t('alerts.sub')} />

      <section className="card">
        <div className="card-h"><h2>{t('alerts.now')}</h2></div>
        {list.length ? list.map(a => {
          if (a.kind === 'deadline') return (
            <a key={a.key} href={a.app ? '#list' : '#plan'} className="drow link">
              <span className={'dchip' + (a.d <= 7 ? ' urgent' : '')}>{a.d === 0 ? t('today') : daysWord(a.d, lang)}</span>
              <div className="grow"><b>{L(a.title)}</b><span className="small muted">{fmtDate(a.date, lang)} · {t('stage.' + a.stage + 'T')}</span></div>
            </a>
          );
          if (a.kind === 'docs') return (
            <a key={a.key} href="#docs" className="drow link"><span className="dchip yellow">!</span>
              <div className="grow"><b>{t('alerts.docs', a.n)}</b><span className="small muted">{t('alerts.docsSub')}</span></div></a>
          );
          return (
            <a key={a.key} href="#care" className="drow link"><span className="dchip soft">♥</span>
              <div className="grow"><b>{t('alerts.checkin')}</b><span className="small muted">{t('alerts.checkinSub')}</span></div></a>
          );
        }) : <p className="muted">{t('alerts.empty')}</p>}
      </section>

      <section className="card">
        <div className="card-h"><h2>{t('alerts.ladderH')}</h2><span className="small muted">{t('alerts.ladderSub')}</span></div>
        <ol className="ladder">
          {STAGES.map((s, i) => (
            <li key={s} className={'step s' + i + (s === 'day' ? ' dayx' : '')}>
              <b>{t('stage.' + s)}</b><span>{t('stage.' + s + 'T')}</span>
            </li>
          ))}
        </ol>
        <p className="small muted">{t('alerts.channels')}</p>
      </section>
    </Cabinet>
  );
}
