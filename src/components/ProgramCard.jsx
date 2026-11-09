import { useState } from 'react';
import { useApp } from '../state/AppState.jsx';
import { UNI_COUNTRY } from '../data/reference.js';
import { LANGS } from '../data/programs.js';
import { fmtMoney } from '../data/questions.js';
import { fmtDate } from '../lib/dates.js';
import { programTitle } from '../lib/match.js';

const ADM_TAG = {ok:'ok', check:'blue', gap:'soon', no:'late', unknown:'dash'};
const FUND_TAG = {ok:'ok', possible:'blue', check:'blue', partial:'soon', no:'late', unknown:'dash'};

/* One evaluated programme: university, country, programme; admission and funding verdicts with reasons;
   the next deadline; full details on demand; save to "My list" and ask Қоян. */
export default function ProgramCard({ r, onSave, saved, onAsk }){
  const { t, L, lang } = useApp();
  const [open, setOpen] = useState(false);
  const { pr, adm, fund, dl } = r;
  const sec = (key, items, cls) => items.length > 0 && (
    <div className={'psec p-' + cls}><b>{t(key)}</b><ul>{items.map((x, i) => <li key={i}>{L(x)}</li>)}</ul></div>
  );
  const why = [...adm.why, ...fund.why], miss = [...adm.miss, ...fund.miss];
  const check = [...adm.check, ...fund.check], improve = [...adm.improve, ...fund.improve];

  return (
    <article className="card pcard">
      <div className="pc-head">
        <span className="flag">{pr.country.toUpperCase()}</span>
        <div className="grow">
          <p className="small muted">{pr.uni} · {L(UNI_COUNTRY[pr.country])}{pr.city ? ', ' + pr.city : ''}</p>
          <h3>{L(pr.name)}</h3>
          <p className="small">{t('card.bachelor')} · {pr.lang.map(c => L(LANGS[c])).join(', ')}{pr.duration ? ' · ' + L(pr.duration) : ''}</p>
        </div>
      </div>
      <div className="verdicts">
        <div><span className="small muted">{t('m.adm')}</span><span className={'tag ' + ADM_TAG[adm.status]}>{t('adm.' + adm.status)}</span></div>
        <div><span className="small muted">{t('m.fund')}</span><span className={'tag ' + FUND_TAG[fund.status]}>{t('fund.' + fund.status)}</span></div>
      </div>
      <p className="small bold">{dl.next
        ? <>{t('card.next')}: {L(dl.next.label)} — {fmtDate(dl.next.date, lang)} <span className="muted">({dl.next.confirmed ? t('card.confirmed') : t('card.approx')})</span></>
        : dl.passed ? <span className="crit">{t('card.passed', pr.intake)}</span> : t('card.unknown')}</p>
      <div className="psecs">
        {sec('sec.why', why, 'why')}
        {sec('sec.miss', miss, 'miss')}
        {sec('sec.check', check.slice(0, open ? 99 : 3), 'check')}
        {sec('sec.improve', improve, 'improve')}
      </div>
      {open && <ProgramDetails pr={pr} />}
      <div className="row between">
        <button type="button" className="linkbtn ink" aria-expanded={open} onClick={() => setOpen(o => !o)}>{open ? t('card.hide') : t('card.details')}</button>
        <div className="row">
          {onAsk && <button type="button" className="btn ghost sm" onClick={() => onAsk(pr)}>{t('card.ask')}</button>}
          {onSave && (saved ? <span className="tag blue">{t('card.saved')}</span> : <button type="button" className="btn sm" onClick={() => onSave(r)}>{t('card.save')}</button>)}
        </div>
      </div>
    </article>
  );
}

const Src = ({ href }) => { const { t } = useApp(); return href ? <> <a href={href} target="_blank" rel="noopener" className="small">{t('card.src')} ↗</a></> : null; };

/* Everything we know about the programme, with sources. Unknown values say so. */
export function ProgramDetails({ pr }){
  const { t, L, lang } = useApp();
  const none = <span className="muted">{t('card.unconfirmed')}</span>;
  const cost = c => {
    if (!c) return none;
    if (c.amount === 0) return <>{t('card.free')}{c.note ? <> — {L(c.note)}</> : null}<Src href={c.src} /></>;
    const amt = c.min !== undefined ? (c.min === c.max ? fmtMoney(c.min, c.currency, lang) : `${fmtMoney(c.min, c.currency, lang)}–${fmtMoney(c.max, c.currency, lang)}`) : fmtMoney(c.amount, c.currency, lang);
    return <>{amt} {t('card.per.' + c.per)}{c.amount !== undefined ? <> · {c.year ? t('card.year', c.year) : t('card.yearNot')}</> : null}{c.note ? <> — {L(c.note)}</> : null}<Src href={c.src} /></>;
  };
  const school = pr.req.school ? Object.entries(pr.req.school) : [];
  const eng = pr.req.english;
  return (
    <div className="pdetails">
      <h4>{t('card.req')}</h4>
      <dl className="kv">
        <dt>{t('card.school')}</dt><dd>{school.length ? school.map(([k, s]) => <p key={k}>{L(s.text)}<Src href={s.src} /></p>) : none}</dd>
        <dt>{t('card.english')}</dt><dd>{eng ? <>IELTS Academic {eng.ielts}{eng.sub ? ` (${t('card.sub', `L ${eng.sub.l} · R ${eng.sub.r} · S ${eng.sub.s} · W ${eng.sub.w}`)})` : ''}{eng.alt ? <>. {L(eng.alt)}</> : null}<Src href={eng.src} /></> : pr.req.language ? <>{L(pr.req.language.text)}<Src href={pr.req.language.src} /></> : none}</dd>
        <dt>{t('card.exams')}</dt><dd>{(pr.req.exams || []).length ? pr.req.exams.map((e, i) => <p key={i}><b>{L(e.name)}</b>{e.date ? ` — ${fmtDate(e.date, lang)}` : ''}{e.text ? `. ${L(e.text)}` : ''}<Src href={e.src} /></p>) : none}</dd>
        <dt>{t('card.prep')}</dt><dd>{pr.req.prep && pr.req.prep.needed === false && !pr.req.prep.text ? t('card.prepNo') : pr.req.prep && pr.req.prep.text ? <>{L(pr.req.prep.text)}<Src href={pr.req.prep.src} /></> : none}</dd>
        {(pr.req.other || []).length > 0 && <><dt>{t('card.other')}</dt><dd>{pr.req.other.map((o, i) => <p key={i}>{L(o)}</p>)}</dd></>}
      </dl>
      <h4>{t('card.costs')}</h4>
      <dl className="kv">
        <dt>{t('card.tuition')}</dt><dd>{cost(pr.costs.tuition)}</dd>
        <dt>{t('card.living')}</dt><dd>{cost(pr.costs.living)}</dd>
      </dl>
      <h4>{t('card.funding')}</h4>
      {(pr.funding || []).length ? pr.funding.map(o => (
        <div key={o.id} className="fund">
          <b>{L(o.name)}</b>
          <p>{L(o.text)}</p>
          {o.scope && <p className="small">{L(o.scope)}</p>}
          <p className="small muted">{o.separate ? t('card.separate') : t('card.noSeparate')}{o.countries ? ` · ${t('card.for')}: ${o.countries.map(c => c.toUpperCase()).join(', ')}` : ''}
            {o.deadline ? <> · {o.deadline.confirmed ? '' : '≈ '}{fmtDate(o.deadline.date, lang)}{o.deadline.note ? ` (${L(o.deadline.note)})` : ''}</> : null}<Src href={o.src} /></p>
        </div>
      )) : <p>{pr.fundingNote ? L(pr.fundingNote) : none}</p>}
      <h4>{t('card.deadlines')}</h4>
      <ul className="dlist">
        {(pr.deadlines || []).map(d => (
          <li key={d.key}><b>{fmtDate(d.date, lang)}</b> — {L(d.label)}{d.from ? ` (${t('card.from', fmtDate(d.from, lang))})` : ''} <span className="muted">· {d.confirmed ? t('card.confirmed') : t('card.approx')}</span>{d.note ? <span className="muted"> · {L(d.note)}</span> : null}<Src href={d.src} /></li>
        ))}
      </ul>
      <h4>{t('card.links')}</h4>
      <div className="row">
        {pr.links.program && <a href={pr.links.program} target="_blank" rel="noopener" className="bold">{t('card.linkProgram')} ↗</a>}
        {pr.links.admission && pr.links.admission !== pr.links.program && <a href={pr.links.admission} target="_blank" rel="noopener" className="bold">{t('card.linkAdmission')} ↗</a>}
        {pr.links.funding && <a href={pr.links.funding} target="_blank" rel="noopener" className="bold">{t('card.linkFunding')} ↗</a>}
      </div>
      {(pr.unknown || []).length > 0 && <p className="small muted">{t('card.verify')}: {pr.unknown.map(u => L(u)).join(', ')}.</p>}
      <p className="small muted">{t('card.checked', fmtDate(pr.checked, lang))}</p>
    </div>
  );
}

export const saveProgram = (addApp, r, lang) => addApp({
  name:programTitle(r.pr, lang), kind:'uni', programId:r.pr.id, basket:'',
  deadline:r.dl.next ? r.dl.next.date : '', approx:r.dl.next ? !r.dl.next.confirmed : false, url:r.pr.links.program
});
