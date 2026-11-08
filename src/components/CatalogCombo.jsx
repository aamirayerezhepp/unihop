import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../state/AppState.jsx';
import { catalogItems } from '../data/catalog.js';
import { GRANTS, grantDue } from '../data/grants.js';
import { DEADLINE_TYPES, UNI_COUNTRY } from '../data/reference.js';
import { fmtShort } from '../lib/dates.js';

const names = v => typeof v === 'object' ? [v.ru, v.kz, v.en].join(' ') : v || '';

/* Searchable dropdown for "Мой список": the university catalog, or the scholarships when kind is "grant".
   Soonest deadlines first; search by name, other name and country; ↑ ↓ Enter Esc work. Free text is allowed. */
export default function CatalogCombo({ id, kind, value, onType, onPick }){
  const { t, L, lang } = useApp();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listRef = useRef(null);

  const all = useMemo(() => {
    const rows = kind === 'grant'
      ? GRANTS.map(gr => ({key:gr.id, from:gr.id, title:L(gr.name), sub:L(gr.covers), ...grantDue(gr), url:gr.url,
          search:[names(gr.name), gr.code, names(gr.covers)].join(' ')}))
      : catalogItems().map(u => ({key:u.n, title:u.n, alt:u.alt, sub:`${L(UNI_COUNTRY[u.c])} · ${L(DEADLINE_TYPES[u.type])}`, date:u.date, approx:u.approx, url:u.url,
          search:[u.n, u.alt, names(UNI_COUNTRY[u.c])].join(' ')}));
    rows.forEach(r => { r.search = r.search.toLowerCase(); });
    return rows.sort((a, b) => (a.date || '9999') < (b.date || '9999') ? -1 : (a.date || '9999') > (b.date || '9999') ? 1 : a.title.localeCompare(b.title));
  }, [kind, lang]);

  const words = value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const items = words.length ? all.filter(r => words.every(w => r.search.includes(w))) : all;

  useEffect(() => { setActive(-1); }, [value, kind]);
  useEffect(() => {
    if (active < 0 || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-i="${active}"]`);
    if (el) el.scrollIntoView({block:'nearest'});
  }, [active]);

  const pick = item => { onPick(item); setOpen(false); };
  const onKeyDown = e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive(a => Math.min(a + 1, items.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter' && open && active >= 0 && items[active]) { e.preventDefault(); pick(items[active]); }
    else if (e.key === 'Escape') { setOpen(false); }
  };

  const listId = id + '-list';
  return (
    <div className="combo">
      <input className="input" id={id} type="text" autoComplete="off" maxLength={80} role="combobox"
        aria-expanded={open} aria-controls={listId} aria-autocomplete="list" aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        placeholder={kind === 'grant' ? t('apps.namePhGrant') : t('apps.namePhCat')} value={value}
        onChange={e => { onType(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} onKeyDown={onKeyDown} />
      {open && (
        <ul className="combo-list" id={listId} role="listbox" ref={listRef}>
          {items.length ? items.map((r, i) => (
            <li key={r.key} id={`${listId}-${i}`} data-i={i} role="option" aria-selected={i === active} className={i === active ? 'on' : ''}
              onMouseDown={e => e.preventDefault()} onClick={() => pick(r)} onMouseEnter={() => setActive(i)}>
              <span className="grow"><b>{r.title}</b>{r.alt && <span className="alt"> · {r.alt}</span>}<span className="sub">{r.sub}</span></span>
              <span className="when" title={r.approx ? t('cat.approxNote') : undefined}>{r.date ? (r.approx ? '≈ ' : '') + fmtShort(r.date, lang) : t('cat.noDate')}</span>
            </li>
          )) : <li className="combo-empty" role="option" aria-selected="false" aria-disabled="true">{t('cat.empty')}</li>}
        </ul>
      )}
    </div>
  );
}
