import { useApp } from '../state/AppState.jsx';
import { visibleQuestions, optionsOf, answered, freshAnswers, OTHER_TESTS, GRADE_SYSTEMS, CURRENCIES } from '../data/questions.js';
import Koyan from './Koyan.jsx';

/* One question at a time; Қоян comments on the picked answer. Answers are kept when going back and forth.
   The step is stored as a question key, so questions that appear or disappear don't shift the position. */
export default function TestCard(){
  const { state, test, setTest, finishTest, t, L } = useApp();
  const cur = test || {key:null, a:freshAnswers(state)};
  const list = visibleQuestions(cur.a);
  const idx = Math.max(0, list.findIndex(q => q.key === cur.key));
  const q = list[idx], last = idx === list.length - 1, val = cur.a[q.key];
  const opts = optionsOf(q, cur.a);

  const isOn = v => q.multi ? (val || []).map(String).includes(String(v)) : String(val) === String(v);
  const set = patch => setTest({key:q.key, a:{...cur.a, ...patch}});
  const pick = v => {
    if (!q.multi) return set({[q.key]:v});
    const prev = (val || []).filter(x => opts.some(o => String(o[0]) === String(x)));
    const only = q.only || [];
    if (only.includes(v)) return set({[q.key]:prev.includes(v) ? [] : [v]});
    const rest = prev.filter(x => !only.includes(x));
    set({[q.key]:rest.includes(v) ? rest.filter(x => x !== v) : [...rest, v]});
  };
  const go = i => setTest({key:list[i].key, a:cur.a});
  const next = () => last ? finishTest(cur.a) : go(idx + 1);

  const lastPicked = q.multi ? (val || [])[(val || []).length - 1] : val;
  const hintSrc = lastPicked !== undefined && lastPicked !== null && lastPicked !== ''
    ? (q.hint ? q.hint(lastPicked, cur.a) : q.hints && q.hints[lastPicked]) : null;
  const hint = L(hintSrc || q.def);

  return (
    <div className="bcard test">
      <div className="row between bold"><span>{t('test.count', idx + 1, list.length)}</span><span className="blue">{L(q.tag)}</span></div>
      <div className="progress" role="progressbar" aria-label={t('test.progress')} aria-valuenow={idx + 1} aria-valuemin={0} aria-valuemax={list.length}>
        <span style={{width:`${(idx + 1) / list.length * 100}%`}} />
      </div>
      <h2 className="q">{L(q.title)}</h2>
      {q.multi && <p className="small muted" style={{marginTop:-8}}>{t('test.several')}</p>}
      <div className="opts" role="group" aria-label={L(q.title)}>
        {opts.map(([v, l]) => <button key={v} type="button" className="opt" aria-pressed={isOn(v)} onClick={() => pick(v)}>{L(l)}</button>)}
      </div>
      <Extra q={q} a={cur.a} set={set} />
      <div className="hint-row"><Koyan pose="question" size={72} /><div className="bubble">{hint}</div></div>
      <div className="row between">
        <button type="button" className="linkbtn" onClick={() => go(idx - 1)} disabled={idx === 0}>{t('test.back')}</button>
        <button type="button" className="btn" onClick={next} disabled={!answered(q, cur.a)}>{last ? t('test.finish') : t('test.next')}</button>
      </div>
    </div>
  );
}


/* Small follow-up fields under some questions. */
function Extra({ q, a, set }){
  const { t, L } = useApp();
  if (q.extra === 'englishOther' && a.english === 'other') {
    const o = a.englishOther || {};
    return (
      <div className="row extra">
        <label className="field-inline"><span className="small bold">{t('test.otherTest')}</span>
          <select className="select" value={o.test || ''} onChange={e => set({englishOther:{...o, test:e.target.value}})}>
            <option value="" disabled>—</option>
            {Object.entries(OTHER_TESTS).map(([k, v]) => <option key={k} value={k}>{L(v)}</option>)}
          </select></label>
        <label className="field-inline"><span className="small bold">{t('test.score')}</span>
          <input className="input" inputMode="decimal" maxLength={12} value={o.score || ''} onChange={e => set({englishOther:{...o, score:e.target.value}})} /></label>
      </div>
    );
  }
  if (q.extra === 'gradesOther' && a.grades === 'other') {
    const o = a.gradesOther || {};
    return (
      <div className="row extra">
        <label className="field-inline"><span className="small bold">{t('test.system')}</span>
          <select className="select" value={o.system || ''} onChange={e => set({gradesOther:{...o, system:e.target.value}})}>
            <option value="" disabled>—</option>
            {Object.entries(GRADE_SYSTEMS).map(([k, v]) => <option key={k} value={k}>{L(v)}</option>)}
          </select></label>
        <label className="field-inline"><span className="small bold">{t('test.avg')}</span>
          <input className="input" maxLength={12} value={o.value || ''} onChange={e => set({gradesOther:{...o, value:e.target.value}})} /></label>
      </div>
    );
  }
  if (q.extra === 'budget' && a.funding && a.funding !== 'full') {
    const b = a.budget || {};
    const cur = b.currency || (a.country === 'kz' ? 'KZT' : 'USD');
    return (
      <div className="row extra">
        <label className="field-inline" style={{flex:'1 1 180px'}}><span className="small bold">{t('test.budget')}</span>
          <input className="input" inputMode="numeric" maxLength={12} value={b.amount || ''} onChange={e => set({budget:{currency:cur, amount:e.target.value.replace(/[^\d]/g, '')}})} /></label>
        <label className="field-inline"><span className="small bold">{t('test.currency')}</span>
          <select className="select" value={cur} onChange={e => set({budget:{...b, currency:e.target.value}})}>
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select></label>
      </div>
    );
  }
  return null;
}
