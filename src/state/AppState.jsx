import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { empty, loadLocal, saveLocal, migrate } from '../lib/storage.js';
import { hasData, rulesText } from '../lib/logic.js';
import { DOC_STATES } from '../data/docs.js';
import { translate, pick } from '../i18n/strings.js';
import { uid } from '../lib/dates.js';
import { toProfile, freshAnswers } from '../data/questions.js';
import { go } from '../hooks/useHashRoute.js';
import { googleEnabled, loadCloud } from '../lib/account.js';
import { KOYAN_URL, koyanStatus, askKoyan as askKoyanApi } from '../lib/koyanClient.js';
import { evaluate } from '../lib/match.js';
import { programById } from '../data/programs.js';

/* Without the failed question at the end, so "Try again" doesn't repeat it. */
const dropLastQuestion = (turns, text) => {
  const i = turns.map(t => t.role === 'user' && t.content === text).lastIndexOf(true);
  return i >= 0 ? turns.slice(0, i) : turns;
};
/* The site's own matching for the saved programmes, so Қоян explains the result rather than inventing one. */
const matchSummary = st => !st.profile ? [] : st.apps.filter(a => a.programId && programById(a.programId)).slice(0, 5).map(a => {
  const r = evaluate(programById(a.programId), st.profile);
  return {id:a.programId, adm:r.adm.status, fund:r.fund.status, miss:[...r.adm.miss, ...r.fund.miss].map(x => x.ru), improve:[...r.adm.improve, ...r.fund.improve].map(x => x.ru)};
});

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
  /* On the standalone site the chat goes through our server on Render (Kimi); "configured" is asked once, which also wakes the server. */
  const webChat = !!KOYAN_URL && googleEnabled();
  useEffect(() => {
    const c = window.claude;
    if (!c || typeof c.use !== 'function') {
      if (webChat) koyanStatus().then(setChatAvail); else setChatAvail(false);
      return;
    }
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
  const startTest = useCallback(prefill => setTest({key:null, a:clone(prefill || freshAnswers(state))}), [state]);
  const finishTest = useCallback(a => {
    update(s => { s.profile = toProfile(a); });
    setTest(null);
    go('result');
  }, [update]);

  /* ---- data actions ---- */
  const toggleTask = useCallback((id, alias) => update(s => { if (s.done[id] || (alias && s.done[alias])) { delete s.done[id]; if (alias) delete s.done[alias]; } else s.done[id] = true; }), [update]);
  const cycleDoc = useCallback(id => update(s => {
    s.docs = s.docs || {};
    const cur = DOC_STATES.indexOf(s.docs[id] || 'todo');
    s.docs[id] = DOC_STATES[(cur + 1) % DOC_STATES.length];
  }), [update]);
  const addApp = useCallback(app => update(s => { s.apps.push({id:uid(), status:'prep', checks:{}, deadline:'', basket:'', kind:'uni', ...app}); }), [update]);
  const resetAll = useCallback(() => { setState(prev => empty(prev.lang)); setTest(null); }, []);

  /* ---- chat with Қоян (kept in memory only) ---- */
  const [chat, setChat] = useState({turns:[], busy:false, errKey:'', retry:''});
  const chatRef = useRef(chat); chatRef.current = chat;
  const stateRef = useRef(state); stateRef.current = state;
  const ctlRef = useRef(null), focusRef = useRef([]);

  const sendChat = useCallback(async (raw, {retry = false} = {}) => {
    const text = (raw || '').trim();
    if (!text || chatRef.current.busy || !chatAvail) return;
    // A retry replaces the failed question instead of adding it twice.
    const base = retry ? dropLastQuestion(chatRef.current.turns, text) : chatRef.current.turns;
    const userTurn = {id:uid(), role:'user', content:text};
    const pid = uid();
    let hist = [...base, userTurn].filter(t => !t.pending && !t.local && t.content).slice(-16);
    while (hist.length && hist[0].role !== 'user') hist.shift();
    chatRef.current = {...chatRef.current, busy:true};
    setChat(c => ({...c, errKey:'', retry:'', busy:true, turns:[...base, userTurn, {id:pid, role:'assistant', content:'', pending:true}]}));
    const patch = p => setChat(c => ({...c, turns:c.turns.map(t => t.id === pid ? {...t, ...p} : t)}));
    const ctl = new AbortController(); ctlRef.current = ctl;

    if (!sample) {
      /* standalone site: our server function -> Kimi */
      let acc = '';
      try {
        const token = await gcloud.current.idToken();
        const st = stateRef.current;
        const payload = {lang:st.lang || 'ru', profile:st.profile, apps:st.apps.map(a => ({name:a.name, programId:a.programId || null, deadline:a.deadline || ''})),
          matches:matchSummary(st), focus:focusRef.current, messages:hist.map(t => ({role:t.role, content:t.content}))};
        focusRef.current = [];
        const r = await askKoyanApi({token, payload, signal:ctl.signal, onDelta:d => { acc += d; patch({content:acc}); }});
        patch({content:acc, pending:false, sources:r.sources, noteKey:r.truncated ? 'chat.truncated' : ''});
      } catch (e) {
        const code = (e && e.code) || 'net';
        if (code === 'cancelled') {
          if (acc) patch({pending:false, noteKey:'chat.stopped'}); else setChat(c => ({...c, turns:c.turns.filter(t => t.id !== pid)}));
        } else {
          if (code === 'not_configured') setChatAvail(false);
          const errKey = 'chat.err.' + (['budget', 'limit', 'busy', 'balance', 'unavailable', 'net', 'concurrent', 'input', 'auth', 'filter'].includes(code) ? code : 'unavailable');
          setChat(c => ({...c, errKey, retry:['input', 'filter', 'budget', 'limit', 'balance'].includes(code) ? '' : text,
            turns:acc ? c.turns.map(t => t.id === pid ? {...t, pending:false, noteKey:'chat.cut'} : t) : c.turns.filter(t => t.id !== pid)}));
        }
      } finally {
        ctlRef.current = null;
        setChat(c => ({...c, busy:false}));
      }
      return;
    }

    const input = [{role:'user', content:rulesText(stateRef.current)}, ...hist.map(t => ({role:t.role, content:t.content}))];
    try {
      const r = await sample(input, {cache:false, signal:ctl.signal, onText:({text}) => patch({content:text})});
      patch({content:r.text, pending:false, noteKey:r.truncated ? 'chat.truncated' : ''});
    } catch (e) {
      const code = e && e.code;
      let content = (e && e.text) || '', errKey = '', extra = {};
      if (code === 'cancelled') { /* keep what was written */ }
      else if (CHAT_OFF.includes(code)) { setChatAvail(false); content = ''; }
      else if (code === 'refused') { content = ''; errKey = 'chat.refused'; }
      else if (code === 'rate_limited') errKey = 'chat.rate';
      else if (code === 'session_expired') errKey = 'chat.session';
      else { errKey = 'chat.net'; if (content) extra.noteKey = 'chat.cut'; }
      setChat(c => ({...c, errKey, retry:errKey && errKey !== 'chat.refused' ? text : '', turns:content ? c.turns.map(t => t.id === pid ? {...t, ...extra, content, pending:false} : t) : c.turns.filter(t => t.id !== pid)}));
    } finally {
      ctlRef.current = null;
      setChat(c => ({...c, busy:false}));
    }
  }, [sample, chatAvail]);
  const stopChat = useCallback(() => { if (ctlRef.current) ctlRef.current.abort(); }, []);
  /* "Ask Қоян" buttons elsewhere put a ready question into the chat box (and tell the server which programme it is about). */
  const [chatDraft, setChatDraft] = useState('');
  const askKoyan = useCallback((text, programId) => { setChatDraft(text); focusRef.current = programId ? [programId] : []; go('koyan'); }, []);

  const mode = account.status === 'signedIn' ? 'google' : cloudOn ? 'cloud' : hasData(state) && localOK ? 'local' : 'none';

  const value = useMemo(() => ({
    state, update, mode, lang, t, L, setLang,
    toggleTask, cycleDoc, addApp, resetAll,
    test, setTest, startTest, finishTest,
    chat, chatAvail, sendChat, stopChat, chatDraft, setChatDraft, askKoyan,
    account, signInGoogle, signOutGoogle
  }), [state, update, mode, lang, t, L, setLang, toggleTask, cycleDoc, addApp, resetAll, test, startTest, finishTest, chat, chatAvail, sendChat, stopChat, chatDraft, askKoyan, account, signInGoogle, signOutGoogle]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
