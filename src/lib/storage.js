import { upgradeProfile } from '../data/questions.js';

/* Browser copy of the student's data. The same shape is mirrored to the artifact's private db when available. */
const LS_KEY = 'orientir-state-v1';

const guessLang = () => {
  try { const l = navigator.language || ''; return /^kk/i.test(l) ? 'kz' : /^en/i.test(l) ? 'en' : 'ru'; } catch (e) { return 'ru'; }
};
export const empty = (lang = guessLang()) => ({v:4, lang, name:'', profile:null, done:{}, apps:[], checkins:[], docs:{}});

/* Accepts saved data from any earlier version; returns null when it can't be used. */
export function migrate(o){
  if (!o || !Array.isArray(o.apps) || !Array.isArray(o.checkins)) return null;
  if (o.v === 4) return o;
  if (o.v === 3) return {...o, v:4, profile:upgradeProfile(o.profile)};
  if (o.v === 1) {
    if (o.demo) return null;
    const p = o.profile || {};
    const english = {none:'none', b1:'ielts55', ielts6:'ielts65', ielts7:'ielts75'}[p.english] || 'none';
    const fmap = {it:'it', biz:'biz', med:'med', sci:'eng', hum:'law', art:'design'};
    o = {v:2, profile:{grade:p.grade, country:p.country, english, grades:p.grades, extra:'none', budget:p.budget, field:fmap[(p.interests || [])[0]] || 'unsure', regions:p.regions || []},
      done:o.done || {}, apps:o.apps, checkins:o.checkins};
  }
  if (o.v === 2) return {...empty(), ...o, v:4, profile:upgradeProfile(o.profile), docs:o.docs || {}, name:o.name || ''};
  return null;
}

export function loadLocal(){
  try { const s = localStorage.getItem(LS_KEY); return s ? migrate(JSON.parse(s)) : null; } catch (e) { return null; }
}
export function saveLocal(state){
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); return true; } catch (e) { return false; }
}
