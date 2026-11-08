import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { empty, loadLocal, saveLocal, migrate } from '../lib/storage.js';
import { hasData, rulesText } from '../lib/logic.js';
import { PRESETS } from '../data/reference.js';
import { DOC_STATES } from '../data/docs.js';
import { translate, pick } from '../i18n/strings.js';
import { uid } from '../lib/dates.js';
import { go } from '../hooks/useHashRoute.js';
import { googleEnabled, loadCloud } from '../lib/account.js';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

const clone = o => JSON.parse(JSON.stringify(o));
const DB_FATAL = ['invalid_argument', 'revoked', 'not_granted', 'capability_disabled', 'capability_removed'];
const CHAT_OFF = ['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed'];

export function AppStateProvider({ children }){
  /* ---- student data: browser copy + private cloud copy when the artifact runtime offers it ---- */
  const [state, setState] = useState(() => loadLocal() || empty());
  const [localOK, setLocalOK] = useState(true);
  const [cloudOn, setCloudOn] = useState(false);
  const cloud = useRef(null), chain = useRef(Promise.resolve()), timer = useRef(null);
  const firstRun = useRef(true), skipCloud = useRef(false);

  const update = useCallback(fn => setState(prev => { const next = clone(prev); fn(next); return next; }), []);

  /* Google account (standalone site only): one Firestore document per student. */
  const gcloud = useRef(null), guid = useRef(null), gtimer = useRef(null);
  const [account, setAccount] = useState({status:'off', user:null, errKey:''});

  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    setLocalOK(saveLocal(state));
    if (guid.current && gcloud.current) {
      if (skipCloud.current) { skipCloud.current = false; return; }
      clearTimeout(gtimer.current);
      const uid = guid.current, body = clone(state);
      gtimer.current = setTimeout(() => { gcloud.current.save(uid, body).catch(() => {}); }, 700);
      return;
    }
    if (!cloud.current) return;
    if (skipCloud.current) { skipCloud.current = false; return; }
    clearTimeout(timer.current);
    const body = clone(state);
    timer.current = setTimeout(() => {
      chain.current = chain.current.then(() => cloud.current && cloud.current.set(body)).catch(e => {
        if (e && DB_FATAL.includes(e.code)) { cloud.current = null; setCloudOn(false); }
      });
    }, 700);
  }, [state]);

  /* ---- language ---- */
  const lang = ['kz', 'en'].includes(state.lang) ? state.lang : 'ru';
  useEffect(() => { document.documentElement.lang = lang === 'kz' ? 'kk' : lang; }, [lang]);
  const t = useCallback((key, ...args) => translate(lang, key, ...args), [lang]);
  const L = useCallback(v => pick(lang, v), [lang]);
  const setLang = useCallback(l => update(s => { s.lang = l; }), [update]);

  /* ---- Claude runtime: chat model + private storage. Absent outside an artifact viewer. ---- */
  const [sample, setSample] = useState(null);
  const [chatAvail, setChatAvail] = useState(null); // null = still checking
  useEffect(() => {
    const c = window.claude;
    if (!c || typeof c.use !== 'function') { setChatAvail(false); return; }
    c.use('sample').then(s => { setSample(() => s); setChatAvail(!!s); }).catch(() => setChatAvail(false));
    (async () => {
      try {
        const [user, db] = await Promise.all([c.use('user'), c.use('db')]);
        if (!user || !db) return;
        const id = await user.id();
        if (!id) return;
        const ref = db.doc('data/users/' + id + '/state');
        let tm;
        const snap = await Promise.race([ref.get(), new Promise((_, rej) => { tm = setTimeout(() => rej({code:'timeout'}), 10000); })]);
        clearTimeout(tm);
        cloud.current = ref; setCloudOn(true);
        if (snap.exists) {
          const d = migrate(clone(snap.data()));
          if (d) { skipCloud.current = true; setState(d); return; }
        }
        setState(prev => hasData(prev) ? clone(prev) : prev); // first visit with an account: upload the browser copy
      } catch (e) { /* stays in this browser */ }
    })();
  }, []);

  useEffect(() => {
    if (!googleEnabled()) return;
    setAccount(a => ({...a, status:'loading'}));
    let unsub = () => {};
    loadCloud().then(c => {
      gcloud.current = c;
      unsub = c.onUser(async u => {
        if (!u) { guid.current = null; setAccount({status:'signedOut', user:null, errKey:''}); return; }
        setAccount({status:'signedIn', user:{name:u.displayName || '', email:u.email || ''}, errKey:''});
        let saved = null;
        try { saved = migrate(await c.load(u.uid)); } catch (e) { /* offline: keep the browser copy */ }
        guid.current = u.uid;
        if (saved && saved.profile) { skipCloud.current = true; setState(saved); return; }
        // New account: keep what the student just did here, add their first name, and upload it.
        setState(prev => { const next = clone(prev); if (!next.name && u.displayName) next.name = u.displayName.split(' ')[0]; return next; });
      });
    }).catch(() => setAccount({status:'off', user:null, errKey:''}));
    return () => unsub();
  }, []);

  const signInGoogle = useCallback(async () => {
    if (!gcloud.current) return;
    setAccount(a => ({...a, errKey:''}));
    try { await gcloud.current.signIn(); }
    catch (e) {
      const code = (e && e.code) || '';
      if (code.includes('popup-closed') || code.includes('cancelled-popup')) return;
      setAccount(a => ({...a, errKey:code.includes('popup-blocked') ? 'acc.popup' : 'acc.err'}));
    }
  }, []);
  /* Signing out also clears this browser, so the next person on a shared computer starts clean. */
  const signOutGoogle = useCallback(async () => {
    if (!gcloud.current) return;
    guid.current = null;
    await gcloud.current.signOut().catch(() => {});
    setState(prev => empty(prev.lang));
    setTest(null);
    go('home');
  }, []);

  /* ---- chances test progress (shared by the landing page and #test) ---- */
  const [test, setTest] = useState(null);
  const startTest = useCallback(prefill => setTest({step:0, a:clone(prefill || state.profile || {})}), [state.profile]);
  const finishTest = useCallback(a => {
    update(s => { s.profile = {grade:Number(a.grade), country:a.country, english:a.english, sat:a.sat || 'none', grades:a.grades, extra:a.extra, budget:a.budget, field:a.field, regions:a.regions || []}; });
    setTest(null);
    go('result');
  }, [update]);

  /* ---- data actions ---- */
  const toggleTask = useCallback(id => update(s => { if (s.done[id]) delete s.done[id]; else s.done[id] = true; }), [update]);
  const cycleDoc = useCallback(id => update(s => {
    s.docs = s.docs || {};
    const cur = DOC_STATES.indexOf(s.docs[id] || 'todo');
    s.docs[id] = DOC_STATES[(cur + 1) % DOC_STATES.length];
  }), [update]);
  const addApp = useCallback(app => update(s => { s.apps.push({id:uid(), status:'prep', checks:{}, deadline:'', basket:'', kind:'uni', ...app}); }), [update]);
  const resetAll = useCallback(() => { setState(prev => empty(prev.lang)); setTest(null); }, []);

  /* ---- chat with Қоян (kept in memory only) ---- */
  const [chat, setChat] = useState({turns:[], busy:false, errKey:''});
  const chatRef = useRef(chat); chatRef.current = chat;
  const stateRef = useRef(state); stateRef.current = state;
  const ctlRef = useRef(null);

  const sendChat = useCallback(async raw => {
    const text = (raw || '').trim();
    if (!text || chatRef.current.busy) return;
    const preset = PRESETS.find(x => x.q.ru === text || x.q.kz === text || x.q.en === text);
    const userTurn = {id:uid(), role:'user', content:text};
    if (!sample || chatAvail === false) {
      const reply = preset
        ? {id:uid(), role:'assistant', preset, local:true}
        : {id:uid(), role:'assistant', msgKey:'chat.unavailable', local:true};
      setChat(c => ({...c, errKey:'', turns:[...c.turns, userTurn, reply]}));
      return;
    }
    const pid = uid();
    let hist = [...chatRef.current.turns, userTurn].filter(t => !t.pending && !t.local && t.content).slice(-16);
    while (hist.length && hist[0].role !== 'user') hist.shift();
    const input = [{role:'user', content:rulesText(stateRef.current)}, ...hist.map(t => ({role:t.role, content:t.content}))];
    chatRef.current = {...chatRef.current, busy:true};
    setChat(c => ({...c, errKey:'', busy:true, turns:[...c.turns, userTurn, {id:pid, role:'assistant', content:'', pending:true}]}));
    const patch = p => setChat(c => ({...c, turns:c.turns.map(t => t.id === pid ? {...t, ...p} : t)}));
    const ctl = new AbortController(); ctlRef.current = ctl;
    try {
      const r = await sample(input, {cache:false, signal:ctl.signal, onText:({text}) => patch({content:text})});
      patch({content:r.text, pending:false, noteKey:r.truncated ? 'chat.truncated' : ''});
    } catch (e) {
      const code = e && e.code;
      let content = (e && e.text) || '', errKey = '', extra = {};
      if (code === 'cancelled') { /* keep what was written */ }
      else if (CHAT_OFF.includes(code)) { setChatAvail(false); content = ''; if (preset) { extra = {preset, local:true}; content = ' '; } }
      else if (code === 'refused') { content = ''; errKey = 'chat.refused'; }
      else if (code === 'rate_limited') errKey = 'chat.rate';
      else if (code === 'session_expired') errKey = 'chat.session';
      else { errKey = 'chat.net'; if (content) extra.noteKey = 'chat.cut'; }
      setChat(c => ({...c, errKey, turns:content ? c.turns.map(t => t.id === pid ? {...t, ...extra, content:extra.preset ? '' : content, pending:false} : t) : c.turns.filter(t => t.id !== pid)}));
    } finally {
      ctlRef.current = null;
      setChat(c => ({...c, busy:false}));
    }
  }, [sample, chatAvail]);
  const stopChat = useCallback(() => { if (ctlRef.current) ctlRef.current.abort(); }, []);

  const mode = account.status === 'signedIn' ? 'google' : cloudOn ? 'cloud' : hasData(state) && localOK ? 'local' : 'none';

  const value = useMemo(() => ({
    state, update, mode, lang, t, L, setLang,
    toggleTask, cycleDoc, addApp, resetAll,
    test, setTest, startTest, finishTest,
    chat, chatAvail, sendChat, stopChat,
    account, signInGoogle, signOutGoogle
  }), [state, update, mode, lang, t, L, setLang, toggleTask, cycleDoc, addApp, resetAll, test, startTest, finishTest, chat, chatAvail, sendChat, stopChat, account, signInGoogle, signOutGoogle]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
