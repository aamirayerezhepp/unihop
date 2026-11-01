import { useApp } from '../state/AppState.jsx';
import { useRoute } from '../hooks/useHashRoute.js';
import { alerts, buildPlan, docsFor, fittingGrants } from '../lib/logic.js';
import Koyan from './Koyan.jsx';
import Logo from './Logo.jsx';
import { GoogleButton, AccountLine } from './Account.jsx';

const PATHS = {
  home: <><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></>,
  plan: <><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z" /><path d="M9 4v14M15 6v14" /></>,
  list: <><path d="M9 6h11M9 12h11M9 18h11" /><circle cx="4.5" cy="6" r="1.2" /><circle cx="4.5" cy="12" r="1.2" /><circle cx="4.5" cy="18" r="1.2" /></>,
  docs: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6M8 13h8M8 17h5" /></>,
  grants: <><circle cx="12" cy="9" r="5" /><path d="M9 13.5L7.5 21l4.5-2.5 4.5 2.5L15 13.5" /></>,
  care: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
  koyan: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />,
  alerts: <><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></>
};
export const Icon = ({ name }) => (
  <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{PATHS[name]}</svg>
);

export function LangSwitch(){
  const { lang, setLang, t } = useApp();
  return (
    <div className="lang" role="group" aria-label={t('lang.aria')}>
      <button type="button" aria-pressed={lang === 'ru'} onClick={() => setLang('ru')}>RU</button>
      <button type="button" aria-pressed={lang === 'kz'} onClick={() => setLang('kz')}>KZ</button>
    </div>
  );
}

export function Bell({ wideOnly = false }){
  const { state, t } = useApp();
  const n = alerts(state).length;
  return (
    <a href="#alerts" className={'bell' + (wideOnly ? ' wide-only' : '')} aria-label={t('bell', n)}>
      <Icon name="alerts" />{n > 0 && <span className="badge">{n}</span>}
    </a>
  );
}

/* Landing, test and result: the yellow band from design C. */
export function Public({ hero, children }){
  const { state, account, t } = useApp();
  return (
    <>
      <div className="band">
        <div className="wrap topbar">
          <a href="#home" className="brand"><Logo height={30} onYellow /></a>
          <div className="top-right">
            <nav className="pubnav" aria-label="UniHop"><a href="#grants">{t('nav.grants')}</a><a href="#koyan">{t('nav.koyan')}</a><a href="#care">{t('nav.care')}</a></nav>
            <LangSwitch />
            {!state.profile && account.status === 'signedOut' && <GoogleButton compact />}
            {state.profile && <a className="btn ink sm" href="#home">{t('nav.cabinet')}</a>}
          </div>
        </div>
        {hero}
      </div>
      <main className="pub-main">{children}</main>
    </>
  );
}

/* Personal account: sidebar on wide screens, five bottom tabs on phones. */
const TABS = ['home', 'plan', 'list', 'docs', 'care'];
export function Cabinet({ children }){
  const view = useRoute();
  const { state, mode, t } = useApp();
  const docs = docsFor(state);
  const left = state.profile ? buildPlan(state.profile).filter(x => !state.done[x.id]).length : null;
  const nAlerts = alerts(state).length;
  const items = [
    ['home', t('nav.home')], ['plan', t('nav.plan'), left], ['list', t('nav.list'), state.apps.length || null],
    ['docs', t('nav.docs'), `${docs.done}/${docs.total}`], ['grants', t('nav.grants'), fittingGrants(state.profile).length],
    ['care', t('nav.care')], ['koyan', t('nav.koyan')], ['alerts', t('nav.alerts'), nAlerts || null]
  ];
  return (
    <div className="cab">
      <aside className="side">
        <a className="side-logo" href="#home"><Logo height={30} /></a>
        <nav className="side-nav" aria-label={t('nav.aria')}>
          {items.map(([id, label, count]) => (
            <a key={id} href={'#' + id} aria-current={view === id ? 'page' : undefined}>
              <Icon name={id} /><span className="grow">{label}</span>{count !== null && count !== undefined && <span className="count">{count}</span>}
            </a>
          ))}
        </nav>
        <div className="side-foot"><AccountLine /><LangSwitch /><span className={'status ' + mode}><i />{t('status.' + mode)}</span></div>
      </aside>
      <div className="cab-main">
        <header className="mtop">
          <a href="#home"><Logo height={24} /></a>
          <div className="mtop-r">
            <LangSwitch />
            <a className="iconbtn" href="#koyan" aria-label={t('nav.koyan')}><Koyan pose="idle" size={30} /></a>
            <Bell />
          </div>
        </header>
        <main className="cab-content">{children}</main>
      </div>
      <nav className="tabs" aria-label={t('nav.aria')}>
        {TABS.map(id => (
          <a key={id} href={'#' + id} aria-current={view === id ? 'page' : undefined}><Icon name={id} />{id === 'list' ? t('nav.listShort') : t('nav.' + id)}</a>
        ))}
      </nav>
    </div>
  );
}

export function PageHead({ pose, title, sub, extra }){
  return (
    <div className="phead">
      <div className="phead-l">
        <Koyan pose={pose} size={80} />
        <div className="phead-t"><h1>{title}</h1>{sub && <p className="muted">{sub}</p>}</div>
      </div>
      <div className="phead-r">{extra}<Bell wideOnly /></div>
    </div>
  );
}

export function NeedProfile({ textKey }){
  const { t } = useApp();
  return (
    <div className="card need">
      <div className="hint-row"><Koyan pose="question" size={64} /><div className="bubble">{t(textKey)}</div></div>
      <div><a className="btn" href="#test">{t('takeTest')}</a></div>
    </div>
  );
}
