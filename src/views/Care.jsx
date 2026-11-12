import { useEffect, useRef, useState } from 'react';
import { useApp } from '../state/AppState.jsx';
import { Cabinet, PageHead } from '../components/Shell.jsx';
import Koyan from '../components/Koyan.jsx';
import { HELP } from '../data/reference.js';
import ChatBox from '../components/ChatBox.jsx';
import { lastCheckin, wellIndex, fmtIdx } from '../lib/logic.js';
import { daysLeft, fmtShort, isoOf, today } from '../lib/dates.js';

function tipKeys(c){
  const dims = [['mood', c.mood], ['sleep', c.sleep], ['stress', 6 - c.stress], ['support', c.support]].sort((a, b) => a[1] - b[1]);
  if (dims[0][1] >= 4) return ['tip.good'];
  return dims.filter(d => d[1] <= 3).slice(0, 2).map(d => 'tip.' + d[0]);
}

function Scale({ id, q, lo, hi, value, onPick }){
  return (
    <div className="field">
      <span className="label" id={'q-' + id}>{q}</span>
      <div className="scale" role="group" aria-labelledby={'q-' + id}>
        {[1, 2, 3, 4, 5].map(v => <button key={v} type="button" className="opt" aria-pressed={value === v} onClick={() => onPick(v)}>{v}</button>)}
      </div>
      <div className="scale-ends"><span>{lo}</span><span>{hi}</span></div>
    </div>
  );
}

function Chart({ items }){
  const { t, lang } = useApp();
  const W = 340, H = 140, L = 22, B = 22, Tp = 10, n = items.length, bw = (W - L - 8) / n;
  const y = v => Tp + (H - Tp - B) * (1 - v / 5);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t('care.chartAria')}>
      {[1, 3, 5].map(v => <g key={v}><line className="grid" x1={L} x2={W - 4} y1={y(v)} y2={y(v)} /><text x={L - 6} y={y(v) + 3} textAnchor="end">{v}</text></g>)}
      {items.map((c, i) => {
        const v = wellIndex(c), x = L + i * bw + bw * 0.2, w = bw * 0.6;
        return <g key={c.date}><rect className={'bar' + (i === n - 1 ? ' last' : '')} x={x} y={y(v)} width={w} height={y(0) - y(v)} rx="4" /><text x={x + w / 2} y={H - 6} textAnchor="middle">{fmtShort(c.date, lang)}</text></g>;
      })}
    </svg>
  );
}

const PHASES = [['breath.in', true], ['breath.hold', true], ['breath.out', false], ['breath.hold', false]];
function Breath(){
  const { t } = useApp();
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState(-1); // -1 ready, -2 finished
  const step = useRef(0);
  useEffect(() => {
    if (!running) return;
    step.current = 0;
    const tick = () => {
      if (step.current >= 16) { setRunning(false); setPhase(-2); return; }
      setPhase(step.current % 4); step.current++;
    };
    tick();
    const id = setInterval(tick, 4000);
    return () => clearInterval(id);
  }, [running]);
  const label = phase === -1 ? t('breath.ready') : phase === -2 ? t('breath.done') : t(PHASES[phase][0]);
  return (
    <div className="breath-wrap">
      <div className={'breath' + (phase >= 0 && PHASES[phase][1] ? ' big' : '')} />
      <div>
        <p className="breath-label">{label}</p>
        <button type="button" className="btn ghost sm" onClick={() => { if (running) { setRunning(false); setPhase(-1); } else setRunning(true); }}>{running ? t('breath.stop') : t('breath.start')}</button>
      </div>
    </div>
  );
}

const TECH = [['tech.breathH', ['tech.breathP'], true], ['tech.rejectH', ['tech.rejectP1', 'tech.rejectP2']], ['tech.loadH', ['tech.loadP']],
  ['tech.parentsH', ['tech.parentsP1', 'tech.parentsP2']], ['tech.sleepH', ['tech.sleepP']]];

export default function Care(){
  const { state, update, t, L, lang } = useApp();
  const [ci, setCi] = useState(null);
  const [err, setErr] = useState('');
  const [crisis, setCrisis] = useState(false);

  const country = state.profile ? state.profile.country : 'kz';
  const lc = lastCheckin(state);
  const recentUnsafe = lc && lc.safe && daysLeft(lc.date) > -7;
  const doneThisWeek = lc && daysLeft(lc.date) > -7 && !ci;
  const help = [...(HELP[country] || []), ...HELP.kz, ...HELP.ru, ...HELP.other].filter((h, i, arr) => arr.findIndex(x => x.n === h.n) === i);
  const form = ci || {};
  const set = (k, v) => { setCi({...form, [k]:v}); setErr(''); };

  const submit = e => {
    e.preventDefault();
    if (!['mood', 'sleep', 'stress', 'support'].every(k => typeof form[k] === 'number') || !form.safe) { setErr(t('care.err')); return; }
    const d = isoOf(today);
    const entry = {date:d, mood:form.mood, sleep:form.sleep, stress:form.stress, support:form.support, safe:form.safe === 'yes', note:(form.note || '').slice(0, 500)};
    update(s => { s.checkins = s.checkins.filter(x => x.date !== d).concat(entry).slice(-52); });
    setCrisis(entry.safe); setCi(null); setErr(''); window.scrollTo(0, 0);
  };
  const q = k => <Scale id={k} q={t('care.' + k)} lo={t('care.' + k + 'Lo')} hi={t('care.' + k + 'Hi')} value={form[k]} onPick={v => set(k, v)} />;

  return (
    <Cabinet>
      <PageHead pose="love" title={t('care.h1')} sub={t('care.sub')} />

      {(crisis || recentUnsafe) && (
        <section className="crisis" role="alert">
          <h2>{t('care.crisisH')}</h2>
          <p>{t('care.crisisP')}</p>
          <p><b>{t('care.crisisKz')}</b>{t('care.crisisKzNote')}<b>{t('care.crisisRu')}</b> · <b>{t('care.crisisSos')}</b></p>
        </section>
      )}

      {doneThisWeek ? (
        <section className="card">
          <div className="card-h"><h2>{t('care.doneH', fmtShort(lc.date, lang))}</h2><span className="tag blue">{t('care.index', fmtIdx(wellIndex(lc), lang))}</span></div>
          {tipKeys(lc).map(k => <div key={k} className="hint-row"><Koyan pose="support" size={52} /><div className="bubble">{t(k)}</div></div>)}
          <div><button type="button" className="btn ghost sm" onClick={() => { setCi({}); setCrisis(false); }}>{t('care.again')}</button></div>
        </section>
      ) : (
        <form className="card" onSubmit={submit} noValidate>
          {q('mood')}{q('sleep')}{q('stress')}{q('support')}
          <div className="field">
            <span className="label" id="q-safe">{t('care.safe')}</span>
            <div className="row" role="group" aria-labelledby="q-safe">
              <button type="button" className="pill" aria-pressed={form.safe === 'no'} onClick={() => set('safe', 'no')}>{t('care.no')}</button>
              <button type="button" className="pill" aria-pressed={form.safe === 'yes'} onClick={() => set('safe', 'yes')}>{t('care.yes')}</button>
            </div>
          </div>
          <div className="field">
            <label htmlFor="ci-note">{t('care.note')}</label>
            <textarea className="input" id="ci-note" maxLength={500} placeholder={t('care.notePh')} value={form.note || ''} onChange={e => setCi({...form, note:e.target.value})} />
          </div>
          {err && <p className="err">{err}</p>}
          <div><button className="btn" type="submit">{t('care.save')}</button></div>
        </form>
      )}

      <section className="stack">
        <div><h2>{t('care.talkH')}</h2><p className="muted measure">{t('care.talkSub')}</p></div>
        <ChatBox mode="care" title={t('care.coachName')} hello={t('care.hello')} quick={[t('care.q1'), t('care.q2'), t('care.q3')]} privacyKey="care.privacy" />
      </section>

      {state.checkins.length > 0 && (
        <section className="card chart">
          <div className="card-h"><h2>{t('care.chartH')}</h2><span className="small bold muted">{t('care.of5')}</span></div>
          <Chart items={state.checkins.slice(-8)} />
          <p className="small muted">{t('care.chartP')}</p>
        </section>
      )}

      <section className="card">
        <h2>{t('care.helpH')}</h2>
        <div>
          {help.map(h => (
            <div key={h.n} className="help-row">
              <a className="num" href={'tel:' + h.n.replace(/\s/g, '')}>{h.n}</a>
              <div><p>{L(h.t)}</p>{h.x && <p className="small muted">{L(h.x)}</p>}</div>
            </div>
          ))}
        </div>
        <p className="small muted">{t('care.helpP')}</p>
      </section>

      <section className="card tight">
        <h2>{t('care.techH')}</h2>
        {TECH.map(([h, ps, breath]) => (
          <details key={h} className="tech"><summary>{t(h)}</summary>
            <div className="body">{ps.map(k => <p key={k}>{t(k)}</p>)}{breath && <Breath />}</div>
          </details>
        ))}
      </section>
    </Cabinet>
  );
}
