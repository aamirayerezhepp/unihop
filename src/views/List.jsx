import { useState } from 'react';
import { useApp } from '../state/AppState.jsx';
import { Cabinet, PageHead } from '../components/Shell.jsx';
import { BASKETS, CHECKS, STATUSES } from '../data/reference.js';
import { daysLeft, daysWord, fmtDate } from '../lib/dates.js';

const EMPTY_FORM = {name:'', kind:'uni', basket:'', deadline:''};

export default function List(){
  const { state, update, addApp, t, L, lang } = useApp();
  const [confirmDel, setConfirmDel] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [err, setErr] = useState('');

  const apps = [...state.apps].sort((a, b) => (a.deadline || '9999') < (b.deadline || '9999') ? -1 : 1);
  const count = st => state.apps.filter(a => st.includes(a.status)).length;
  const edit = (id, fn) => update(s => { const a = s.apps.find(x => x.id === id); if (a) fn(a); });
  const submit = e => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) { setErr(t('apps.err')); return; }
    addApp({name, kind:form.kind, basket:form.basket, deadline:form.deadline});
    setForm(EMPTY_FORM); setErr('');
  };

  return (
    <Cabinet>
      <PageHead pose="travel" title={t('list.h1')} sub={t('list.sub')} extra={<a className="btn ghost sm" href="#result">{t('list.fromChances')}</a>} />

      <div className="stats">
        <div className="stat"><b>{count(['prep'])}</b><span>{t('apps.prep')}</span></div>
        <div className="stat"><b>{count(['sent'])}</b><span>{t('apps.sent')}</span></div>
        <div className="stat"><b>{count(['admit', 'wait', 'reject'])}</b><span>{t('apps.answered')}</span></div>
      </div>

      {apps.length ? apps.map(a => {
        const d = a.deadline ? daysLeft(a.deadline) : null;
        const ready = CHECKS.filter(([k]) => a.checks && a.checks[k]).length;
        return (
          <article key={a.id} className="card">
            <div className="row between top">
              <div className="grow">
                <div className="row" style={{gap:8}}>
                  <span className="small muted bold">{a.kind === 'grant' ? t('apps.grant') : t('apps.uni')}</span>
                  {a.basket && <span className={'bchip ' + a.basket}>{L(BASKETS[a.basket])}</span>}
                </div>
                <h3>{a.name}</h3>
                <p className="small muted">{a.deadline
                  ? t('apps.deadline', fmtDate(a.deadline, lang)) + (a.status === 'prep' ? (d < 0 ? t('apps.past') : t('apps.left', daysWord(d, lang))) : '')
                  : t('apps.noDeadline')}</p>
                {(a.noteKey || a.note) && <p className="small muted">{a.noteKey ? t(a.noteKey) : a.note}</p>}
              </div>
              <label className="small bold field-inline">{t('apps.status')}
                <select className="select" value={a.status} onChange={e => edit(a.id, x => { x.status = e.target.value; })}>
                  {STATUSES.map(([v, l]) => <option key={v} value={v}>{L(l)}</option>)}
                </select>
              </label>
            </div>
            <div className="stack" style={{gap:8}}>
              <p className="small muted">{t('apps.ready', ready, CHECKS.length)}</p>
              <div className="row" style={{gap:8}}>
                {CHECKS.map(([k, l]) => (
                  <button key={k} type="button" className="pill" aria-pressed={!!(a.checks && a.checks[k])}
                    onClick={() => edit(a.id, x => { x.checks = x.checks || {}; x.checks[k] = !x.checks[k]; })}>{L(l)}</button>
                ))}
              </div>
            </div>
            <div className="row end">
              {confirmDel === a.id ? (
                <>
                  <span className="small bold">{t('apps.delSure')}</span>
                  <button type="button" className="btn danger sm" onClick={() => { update(s => { s.apps = s.apps.filter(x => x.id !== a.id); }); setConfirmDel(null); }}>{t('delete')}</button>
                  <button type="button" className="linkbtn" onClick={() => setConfirmDel(null)}>{t('cancel')}</button>
                </>
              ) : <button type="button" className="linkbtn" onClick={() => setConfirmDel(a.id)}>{t('delete')}</button>}
            </div>
          </article>
        );
      }) : <p className="empty">{t('apps.empty')}</p>}

      <form className="card" onSubmit={submit} noValidate>
        <h2>{t('apps.addH')}</h2>
        <div className="field">
          <label htmlFor="app-name">{t('apps.name')}</label>
          <input className="input" id="app-name" maxLength={80} placeholder={t('apps.namePh')} value={form.name} onChange={e => setForm({...form, name:e.target.value})} />
        </div>
        <div className="row top">
          <div className="field grow"><label htmlFor="app-kind">{t('apps.kind')}</label>
            <select className="select" id="app-kind" value={form.kind} onChange={e => setForm({...form, kind:e.target.value})}><option value="uni">{t('apps.uni')}</option><option value="grant">{t('apps.grant')}</option></select></div>
          <div className="field grow"><label htmlFor="app-basket">{t('apps.basket')}</label>
            <select className="select" id="app-basket" value={form.basket} onChange={e => setForm({...form, basket:e.target.value})}>
              <option value="">{t('apps.noBasket')}</option>{Object.entries(BASKETS).map(([k, v]) => <option key={k} value={k}>{L(v)}</option>)}
            </select></div>
          <div className="field grow"><label htmlFor="app-deadline">{t('apps.date')}</label>
            <input className="input" type="date" id="app-deadline" value={form.deadline} onChange={e => setForm({...form, deadline:e.target.value})} /></div>
        </div>
        {err && <p className="err">{err}</p>}
        <div><button className="btn" type="submit">{t('apps.addBtn')}</button></div>
      </form>
    </Cabinet>
  );
}
