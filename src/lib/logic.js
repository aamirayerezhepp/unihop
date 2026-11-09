import { today, isoOf, fmtDate, daysLeft } from './dates.js';
import { REGIONS } from '../data/reference.js';
import { GRANTS } from '../data/grants.js';
import { DOC_GROUPS } from '../data/docs.js';
import { profileFacts } from '../data/questions.js';
import { buildPlan, isDone } from './plan.js';
import { programById } from '../data/programs.js';
import { STRINGS } from '../i18n/strings.js';
import { FACTS } from '../data/facts.js';

export { buildPlan, isDone };

/* Countries the student picked; all of them when unsure. */
export function effRegions(p){
  const picked = (p.regions || []).filter(r => r !== 'unsure');
  return picked.length ? picked : Object.keys(REGIONS);
}

/* Grants that fit the profile (all of them before the test). Home-country and Russian-quota grants follow citizenship. */
export function fittingGrants(p){
  if (!p) return GRANTS;
  const regs = effRegions(p);
  return GRANTS.filter(gr => {
    if (gr.only && !gr.only.includes(p.country)) return false;
    return gr.region === 'home' || gr.region === 'ru' || regs.includes(gr.region);
  });
}

/* Document checklist for the profile, with progress. */
export function docsFor(state){
  const p = state.profile, regs = p ? effRegions(p) : null;
  const fits = x => !x.regions || !regs || x.regions.some(r => regs.includes(r));
  const groups = DOC_GROUPS.filter(fits).map(gr => ({...gr, items:gr.items.filter(fits)})).filter(gr => gr.items.length);
  const items = groups.flatMap(gr => gr.items);
  const st = id => (state.docs || {})[id] || 'todo';
  return {groups, items, status:st, done:items.filter(i => st(i.id) === 'done').length, total:items.length};
}

/* Upcoming official deadlines from the plan (saved programmes, their scholarships and the student's own entries). */
export function upcoming(state){
  return buildPlan(state).filter(x => x.kind === 'official' && !x.info && !x.missed && !isDone(state, x) && daysLeft(x.date) >= 0)
    .map(x => ({key:x.id, title:x.title, date:x.date, approx:x.approx, src:x.src}));
}

/* In-app reminders: the reminder ladder applied to real dates, plus missing documents and the weekly check-in. */
export const LADDER = [['d30', 30], ['d14', 14], ['d7', 7], ['d3', 3], ['d1', 1], ['day', 0]];
export function alerts(state){
  const out = [];
  upcoming(state).forEach(u => {
    const d = daysLeft(u.date);
    if (d > 30) return;
    const stage = d === 0 ? 'day' : d <= 1 ? 'd1' : d <= 3 ? 'd3' : d <= 7 ? 'd7' : d <= 14 ? 'd14' : 'd30';
    out.push({kind:'deadline', stage, d, ...u});
  });
  const docs = docsFor(state);
  if (out.some(a => a.d <= 14) && docs.done < docs.total) out.push({kind:'docs', key:'docs', n:docs.total - docs.done});
  const lc = lastCheckin(state);
  if (state.profile && (!lc || daysLeft(lc.date) <= -7)) out.push({kind:'checkin', key:'checkin'});
  return out;
}

export const hasData = s => !!(s.profile || s.apps.length || s.checkins.length || Object.keys(s.docs || {}).length);
export const lastCheckin = s => s.checkins.length ? s.checkins[s.checkins.length - 1] : null;
export const wellIndex = c => (c.mood + c.sleep + (6 - c.stress) + c.support) / 4;
export const fmtIdx = (n, lang) => lang === 'en' ? n.toFixed(1) : n.toFixed(1).replace('.', ',');

const LANG_RULE = {
  ru:'Язык интерфейса ученика: русский. Отвечай на русском, если ученик сам не пишет на другом языке.',
  kz:'Язык интерфейса ученика: казахский. Отвечай на казахском (кириллица), если ученик сам не пишет на другом языке.',
  en:'The student\'s interface language is English. Answer in English unless the student writes in another language. In English your name is Qoyan.'
};

/* Facts for Қоян, checked in November 2026. Shared by every assistant prompt. */
export function factsText(){
  const grants = GRANTS.map(gr => `- ${gr.name.ru || gr.name}: ${gr.covers.ru}; сроки: ${gr.when.ru}; кому: ${gr.who.ru}; сайт: ${gr.url}`).join('\n');
  const facts = FACTS.map(f => '- ' + f.ru + (f.src ? ' (' + f.src + ')' : '')).join('\n');
  return `Данные платформы (проверено в ноябре 2026):\n${facts}\nСтипендии:\n${grants}`;
}

/* The student's profile, saved programmes and next steps, for the assistants (Russian labels; the model answers in the UI language). */
export function profileText(state){
  const p = state.profile;
  if (!p) return 'Профиль ученика: ещё не прошёл тест.';
  const ru = STRINGS.ru;
  const prof = profileFacts(p, 'ru').map(([k, v]) => `${ru[k] || k}: ${v}`).join('; ');
  const next = buildPlan(state).filter(t => !isDone(state, t) && !t.missed).slice(0, 5)
    .map(t => `- ${typeof t.title === 'object' ? t.title.ru : t.title} — ${t.kind === 'official' ? 'официальный срок' : 'рекомендуемый срок'} ${t.approx ? 'примерно ' : ''}${fmtDate(t.date)}`).join('\n');
  const list = state.apps.slice(0, 10).map(a => `- ${a.name}${a.programId ? ' [id ' + a.programId + ']' : ''}${a.deadline ? ' (срок ' + fmtDate(a.deadline) + ')' : ''}`).join('\n');
  return `Профиль ученика: ${prof}.${next ? '\nБлижайшие шаги плана:\n' + next : ''}${list ? '\nПрограммы в его списке:\n' + list : ''}`;
}

export const langRule = state => LANG_RULE[state.lang] || LANG_RULE.ru;

/* Standing instructions for Қоян, the general assistant: sent as the first user turn of every chat call. */
export function rulesText(state){
  const docs = docsFor(state);
  const missing = docs.items.filter(i => docs.status(i.id) !== 'done').map(i => i.name.ru).slice(0, 8).join(', ');
  return `Ты — Қоян, дружелюбный ИИ-помощник платформы UniHop для школьников 14–18 лет из Казахстана и других стран СНГ, которые поступают в зарубежные вузы на бакалавриат.

Правила:
1. ${langRule(state)}
2. Отвечай коротко: 2–6 предложений или короткий список. Обращайся на «ты», тепло и просто.
3. Опирайся на данные ниже и общеизвестные факты. Если не уверен в факте, сроке, цене или требовании — так и скажи и посоветуй проверить на официальном сайте. Не выдумывай цифры, даты, требования и ссылки.
4. Не пиши за ученика эссе, мотивационные письма и ответы на вопросы вузов. Можно объяснить структуру, задать наводящие вопросы и дать отзыв на его черновик.
5. Не обещай поступление и не называй шансы в процентах.
6. Не проси личные данные: ИИН, номер паспорта, адрес, телефон, пароли.
7. Если ученик пишет, что не хочет жить, хочет причинить себе вред, о насилии или сильном отчаянии — ответь с сочувствием, скажи, что он не один, и дай контакты: Казахстан — 150 (телефон доверия для детей и молодёжи, анонимно; WhatsApp +7 708 106 08 10), 111 (круглосуточно); Россия — 8 800 2000 122; экстренно — 112 или 103. Предложи рассказать взрослому, которому он доверяет. В таком ответе не говори о поступлении.
8. Ты не психолог и не юрист: при сложных вопросах советуй обратиться к специалисту.
9. Пиши простым текстом, без Markdown: без звёздочек, решёток и таблиц.

Сегодня: ${fmtDate(isoOf(today))}.
${profileText(state)}
${missing ? 'Ещё не готовы документы: ' + missing + '.\n' : ''}
${factsText()}`;
}
