import { useApp } from '../state/AppState.jsx';
import Koyan from './Koyan.jsx';

/* Standard "Sign in with Google" button: white, Google "G" mark, neutral outline. */
export function GoogleButton({ compact = false }){
  const { signInGoogle, t } = useApp();
  return (
    <button type="button" className={'gbtn' + (compact ? ' compact' : '')} onClick={signInGoogle}>
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z" />
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
      </svg>
      {compact ? t('acc.signIn') : t('acc.google')}
    </button>
  );
}

/* Shown right after the test: save the result to a Google account. Only on the standalone site. */
export function AccountOffer(){
  const { account, state, update, t } = useApp();
  if (account.status === 'off' || account.status === 'loading') return null;
  if (account.status === 'signedIn') return (
    <div className="acc-ok"><span className="acc-dot" />{t('acc.signedAs', account.user.email)}</div>
  );
  if (state.offerOff) return null;
  return (
    <section className="bcard offer">
      <div className="offer-row">
        <Koyan pose="celebrate" size={96} />
        <div className="grow stack" style={{gap:8}}>
          <h2>{t('acc.offerH')}</h2>
          <p>{t('acc.offerP')}</p>
        </div>
      </div>
      <div className="row">
        <GoogleButton />
        <button type="button" className="linkbtn" onClick={() => update(s => { s.offerOff = true; })}>{t('acc.later')}</button>
      </div>
      {account.errKey && <p className="err">{t(account.errKey)}</p>}
      <p className="small muted">{t('acc.note')}</p>
    </section>
  );
}

/* Compact account line for the sidebar and the "Мои данные" card. */
export function AccountLine(){
  const { account, signOutGoogle, t } = useApp();
  if (account.status === 'signedIn') return (
    <div className="acc-line">
      <span className="small"><b>{account.user.name || account.user.email}</b></span>
      <button type="button" className="linkbtn small" onClick={signOutGoogle}>{t('acc.signOut')}</button>
    </div>
  );
  if (account.status === 'signedOut') return (
    <div className="acc-line"><GoogleButton compact />{account.errKey && <span className="err small">{t(account.errKey)}</span>}</div>
  );
  return null;
}
