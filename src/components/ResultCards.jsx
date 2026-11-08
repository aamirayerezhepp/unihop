import { useState } from 'react';
import { useApp } from '../state/AppState.jsx';
import { UNI_COUNTRY } from '../data/reference.js';
import { NOTES } from '../data/unis.js';

const CARDS = ['dream', 'real', 'safe'];
const FIRST = 10;

/* The three columns of the chances result: 10 universities each, the rest behind "Show all".
   With onAdd, each university gets a "+ to my list" button. */
export default function ResultCards({ r, example = false, onAdd, isAdded }){
  const { t, L } = useApp();
  const [open, setOpen] = useState({});
  return (
    <div className="grid3">
      {CARDS.map(key => {
        const list = r[key], shown = open[key] ? list : list.slice(0, FIRST);
        return (
          <div key={key} className={'res ' + key}>
            <span className="label">{t('res.' + key)}</span>
            <p className="muted">{t('res.' + key + 'Desc')}</p>
            {list.length ? (
              <ul>
                {shown.map(u => (
                  <li key={u.n}>
                    <div className="grow"><b>{u.n} · {L(UNI_COUNTRY[u.c])}</b>{!example && u.note && <span className="muted">{L(NOTES[u.note])}</span>}</div>
                    {onAdd && (isAdded(u)
                      ? <span className="added">{t('res.added')}</span>
                      : <button type="button" className="addbtn" onClick={() => onAdd(u, key)}>{t('res.add')}</button>)}
                  </li>
                ))}
              </ul>
            ) : <p className="small muted">{t('res.empty')}</p>}
            {list.length > FIRST && (
              <button type="button" className="morebtn" aria-expanded={!!open[key]} onClick={() => setOpen({...open, [key]:!open[key]})}>
                {open[key] ? t('res.collapse') : t('res.showAll', list.length)}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
