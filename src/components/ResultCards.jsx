import { useApp } from '../state/AppState.jsx';
import { UNI_COUNTRY } from '../data/reference.js';

const CARDS = ['dream', 'real', 'safe'];

/* The three columns of the chances result. With onAdd, each university gets a "+ to my list" button. */
export default function ResultCards({ r, example = false, onAdd, isAdded }){
  const { t, L } = useApp();
  return (
    <div className="grid3">
      {CARDS.map(key => (
        <div key={key} className={'res ' + key}>
          <span className="label">{t('res.' + key)}</span>
          <p className="muted">{t('res.' + key + 'Desc')}</p>
          {r[key].length ? (
            <ul>
              {r[key].map(u => (
                <li key={u.n}>
                  <div className="grow"><b>{u.n} · {L(UNI_COUNTRY[u.c])}</b>{!example && <span className="muted">{L(u.note)}</span>}</div>
                  {onAdd && (isAdded(u)
                    ? <span className="added">{t('res.added')}</span>
                    : <button type="button" className="addbtn" onClick={() => onAdd(u, key)}>{t('res.add')}</button>)}
                </li>
              ))}
            </ul>
          ) : <p className="small muted">{t('res.empty')}</p>}
        </div>
      ))}
    </div>
  );
}
