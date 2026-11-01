import { useApp } from '../state/AppState.jsx';
import { QUESTIONS } from '../data/questions.js';
import Koyan from './Koyan.jsx';

/* One question at a time; Қоян comments on the picked answer. */
export default function TestCard(){
  const { state, test, setTest, finishTest, t, L } = useApp();
  const cur = test || {step:0, a:state.profile ? JSON.parse(JSON.stringify(state.profile)) : {}};
  const q = QUESTIONS[cur.step], last = cur.step === QUESTIONS.length - 1, val = cur.a[q.key];
  const answered = q.multi ? true : val !== undefined && val !== null;
  const hint = L((!q.multi && answered && q.hints && q.hints[val]) || q.def);

  const isOn = v => q.multi ? (cur.a[q.key] || []).includes(v) : String(val) === String(v);
  const pick = v => {
    const a = {...cur.a};
    if (q.multi) {
      const prev = a[q.key] || [], rest = prev.filter(x => x !== 'unsure');
      a[q.key] = v === 'unsure' ? (prev.includes('unsure') ? [] : ['unsure']) : (rest.includes(v) ? rest.filter(x => x !== v) : [...rest, v]);
    } else a[q.key] = v;
    setTest({step:cur.step, a});
  };
  const next = () => last ? finishTest(cur.a) : setTest({step:cur.step + 1, a:cur.a});
  const back = () => { if (cur.step > 0) setTest({step:cur.step - 1, a:cur.a}); };

  return (
    <div className="bcard test">
      <div className="row between bold"><span>{t('test.count', cur.step + 1, QUESTIONS.length)}</span><span className="blue">{L(q.tag)}</span></div>
      <div className="progress" role="progressbar" aria-label={t('test.progress')} aria-valuenow={cur.step + 1} aria-valuemin={0} aria-valuemax={QUESTIONS.length}>
        <span style={{width:`${(cur.step + 1) / QUESTIONS.length * 100}%`}} />
      </div>
      <h2 className="q">{L(q.title)}</h2>
      <div className="opts" role="group" aria-label={L(q.title)}>
        {q.opts.map(([v, l]) => <button key={v} type="button" className="opt" aria-pressed={isOn(v)} onClick={() => pick(v)}>{L(l)}</button>)}
      </div>
      <div className="hint-row"><Koyan pose="question" size={72} /><div className="bubble">{hint}</div></div>
      <div className="row between">
        <button type="button" className="linkbtn" onClick={back} disabled={cur.step === 0}>{t('test.back')}</button>
        <button type="button" className="btn" onClick={next} disabled={!answered}>{last ? t('test.finish') : t('test.next')}</button>
      </div>
    </div>
  );
}
