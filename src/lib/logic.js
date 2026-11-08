import { today, isoOf, fmtDate, daysLeft } from './dates.js';
import { REGIONS, COUNTRIES } from '../data/reference.js';
import { TASKS, lowEng } from '../data/tasks.js';
import { UNIS, FUND_OK } from '../data/unis.js';
import { GRANTS, GRANT_TASK } from '../data/grants.js';
import { DOC_GROUPS } from '../data/docs.js';
import { optLabel } from '../data/questions.js';

const g = (ru, kz, en) => ({ru, kz, en});

/* Calendar year in which the student's final (11th) school year starts. */
export function finalYear(p){
  const sy = today.getMonth() >= 7 ? today.getFullYear() : today.getFullYear() - 1;
  return sy + (11 - Number(p.grade));
}

/* Which countries fit the profile, with up to two short reasons each. */
export function recommend(p){
  const full = p.budget === 'full', partial = p.budget === 'partial', mid = p.budget === 'mid';
  const strong = p.grades === 'high', eng = ['ielts65','ielts75'].includes(p.english), ca = ['kz','uz','kg'].includes(p.country);
  const out = [];
  { let s = 50; const r = [];
    if (full || partial) {
      if (strong) { s += 20; r.push(g('Need-blind вузы покрывают до полной стоимости учёбы — для сильных учеников.','Need-blind ЖОО-лар мықты оқушыларға оқудың толық құнына дейін төлейді.','Need-blind universities cover up to the full cost for strong students.')); }
      else { s -= 15; r.push(g('Полная финпомощь есть, но конкурс за неё очень высокий.','Толық қаржылай көмек бар, бірақ оған бәсеке өте жоғары.','Full aid exists, but competition for it is very high.')); }
    } else { s += 15; r.push(g('Самый большой выбор программ, специальность можно выбрать позже.','Бағдарламалар таңдауы ең көп, мамандықты кейін таңдауға болады.','The widest choice of programmes; you can choose a major later.')); }
    if (eng) s += 10; else r.push(g('Понадобятся IELTS или Duolingo и, часто, SAT.','IELTS немесе Duolingo, көбіне SAT те керек болады.','You will need IELTS or Duolingo, and often the SAT.'));
    if (p.sat === 's1400') s += 5;
    out.push({r:'us', s, reasons:r}); }
  { let s = 50; const r = [];
    if (full) { s -= 30; r.push(g('Для бакалавриата финпомощи почти нет.','Бакалавриатқа қаржылай көмек жоқтың қасы.','There is almost no aid for undergraduates.')); }
    else if (partial) { s -= 15; r.push(g('Стипендии для иностранцев небольшие и редкие.','Шетелдіктерге стипендиялар аз әрі шағын.','Scholarships for internationals are small and rare.')); }
    else { s += 15; r.push(g('Бакалавриат за 3 года, одна заявка через UCAS на 5 программ.','Бакалавриат 3 жыл, UCAS арқылы бір өтініш 5 бағдарламаға.','A 3-year degree, one UCAS application for 5 programmes.')); }
    r.push(g('После школы СНГ часто нужен Foundation year.','ТМД мектебінен кейін көбіне Foundation year керек.','After a CIS school you often need a Foundation year.'));
    if (strong) s += 5;
    out.push({r:'uk', s, reasons:r}); }
  { let s = 55; const r = [];
    if (mid || partial) { s += 15; r.push(g('В госвузах Германии почти нет платы, в Италии есть стипендии DSU по доходу семьи.','Германияның мемлекеттік ЖОО-ларында ақы жоқтың қасы, Италияда отбасы табысына қарай DSU стипендиялары бар.','German public universities charge almost nothing; Italy has income-based DSU grants.')); }
    else if (full) { s += 10; r.push(g('Stipendium Hungaricum и DSU покрывают обучение и часть расходов на жизнь.','Stipendium Hungaricum мен DSU оқуды және өмір сүру шығынының бір бөлігін өтейді.','Stipendium Hungaricum and DSU cover tuition and part of living costs.')); }
    else { s += 5; r.push(g('Много программ на английском, учёба дешевле, чем в США и Великобритании.','Ағылшынша бағдарламалар көп, оқу АҚШ пен Ұлыбританияға қарағанда арзан.','Many English-taught programmes, cheaper than the US and UK.')); }
    if (!eng) { s -= 5; r.push(g('Нужен английский B2 или язык страны.','Ағылшын тілі B2 деңгейінде немесе сол елдің тілі керек.','You need B2 English or the local language.')); }
    out.push({r:'eu', s, reasons:r}); }
  { let s = 50; const r = [];
    if (full) { s -= 20; r.push(g('Финпомощи для иностранцев мало; есть отдельные стипендии вроде Lester B. Pearson.','Шетелдіктерге қаржылай көмек аз; Lester B. Pearson сияқты жеке стипендиялар бар.','Little aid for internationals; a few awards like Lester B. Pearson.')); }
    else if (partial) { s -= 10; r.push(g('Обучение платное, стипендий для иностранцев немного.','Оқу ақылы, шетелдіктерге стипендия аз.','Tuition is charged and scholarships for internationals are few.')); }
    else { s += 10; r.push(g('Сильные вузы и возможность работать после учёбы.','Мықты ЖОО-лар және оқудан кейін жұмыс істеу мүмкіндігі.','Strong universities and the chance to work after graduating.')); }
    if (eng) s += 5;
    out.push({r:'ca', s, reasons:r}); }
  { let s = 50; const r = [];
    if (full || partial) { s += 20; r.push(g('GKS, MEXT и CSC дают полное финансирование и год языка.','GKS, MEXT және CSC толық қаржыландырады және бір жыл тіл үйретеді.','GKS, MEXT and CSC give full funding and a language year.')); }
    else r.push(g('Сильные технические вузы, учёба дешевле западной.','Мықты техникалық ЖОО-лар, оқу батысқа қарағанда арзан.','Strong technical universities, cheaper than the West.'));
    if (['it','eng'].includes(p.field)) { s += 10; r.push(g('Сильные программы в IT и инженерии.','IT және инженерия бағдарламалары мықты.','Strong programmes in IT and engineering.')); }
    out.push({r:'asia', s, reasons:r}); }
  { let s = 50; const r = [];
    if (full || partial) { s += 20; r.push(g('Türkiye Bursları покрывает обучение, общежитие, стипендию и перелёт.','Türkiye Bursları оқуды, жатақхананы, стипендияны және ұшақ билетін өтейді.','Türkiye Bursları covers tuition, dormitory, stipend and flights.')); }
    else { s += 5; r.push(g('Невысокая стоимость учёбы и жизни.','Оқу мен тұрмыс құны төмен.','Low tuition and living costs.')); }
    if (ca) { s += 10; r.push(g('Культурно близко, много студентов из Центральной Азии.','Мәдениеті жақын, Орталық Азиядан студенттер көп.','Culturally close, with many students from Central Asia.')); }
    if (p.grades !== 'high') s += 5;
    out.push({r:'tr', s, reasons:r}); }
  out.forEach(o => { o.s = Math.max(5, Math.min(95, o.s)); o.reasons = o.reasons.slice(0, 2); });
  return out.sort((a, b) => b.s - a.s);
}

/* Countries the student picked, or the three best fits when they are unsure. */
export function effRegions(p){
  const picked = (p.regions || []).filter(r => r !== 'unsure');
  return picked.length ? picked : recommend(p).slice(0, 3).map(o => o.r);
}

export function buildPlan(p){
  const Y = finalYear(p), regs = effRegions(p);
  return TASKS.filter(t => (!t.regions || t.regions.some(r => regs.includes(r))) && (!t.cond || t.cond(p)))
    .map(t => ({...t, date:t.due(Y), approx:typeof t.approx === 'function' ? t.approx(Y) : !!t.approx}))
    .sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
}

/* Student profile strength on a 0–5 scale: grades, English and achievements. */
export function strength(p){
  let s = {high:4, mid:3, low:1.5}[p.grades] || 2;
  s += {ielts75:3, ielts65:2.5, ielts55:1.5, none:Number(p.grade) <= 9 ? 1.5 : 0.5}[p.english] || 1;
  s += {olymp:3, project:2, none:0.5}[p.extra] || 1;
  return s / 2;
}
/* A good SAT raises the chances at US universities only. */
export const satBonus = p => ({s1400:0.75, s1214:0.35}[p.sat] || 0);

/* Rough estimate, not an admissions forecast: compares strength with each university's selectivity. */
export function chances(p){
  const base = strength(p), regs = effRegions(p), ok = FUND_OK[p.budget] || FUND_OK.any;
  const res = {dream:[], real:[], safe:[]};
  UNIS.filter(u => regs.includes(u.r) && ok.includes(u.fund) && (p.field === 'unsure' || u.f.includes('all') || u.f.includes(p.field)))
    .forEach(u => {
      const d = u.sel - (base + (u.r === 'us' ? satBonus(p) : 0));
      if (d > 0.75 && d <= 2.75) res.dream.push({...u, d});
      else if (d > -0.75 && d <= 0.75) res.real.push({...u, d});
      else if (d <= -0.75) res.safe.push({...u, d});
    });
  res.dream.sort((a, b) => a.d - b.d); res.real.sort((a, b) => b.d - a.d); res.safe.sort((a, b) => b.d - a.d);
  return res;
}

/* What to improve, as interface-string keys. */
export function gaps(p){
  const out = [];
  if (lowEng(p)) out.push('gap.ielts');
  if (p.extra === 'none') out.push('gap.extra');
  if (effRegions(p).includes('us') && !['s1214', 's1400'].includes(p.sat)) out.push('gap.sat');
  if (p.grades === 'low') out.push('gap.grades');
  if (p.budget === 'full') out.push('gap.grants');
  if (!out.length) out.push('gap.essay');
  return out.slice(0, 4);
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

/* Upcoming dated items: plan deadlines and the student's own applications. */
export function upcoming(state){
  const p = state.profile, plan = p ? buildPlan(p) : [];
  const fromPlan = plan.filter(t => t.deadline && !state.done[t.id])
    .map(t => ({key:'t-' + t.id, title:t.title, date:t.date, approx:t.approx, code:t.regions ? REGIONS[t.regions[0]].code : ''}));
  const fromApps = state.apps.filter(a => a.deadline && a.status === 'prep' && !(GRANT_TASK[a.from] && plan.some(t => t.id === GRANT_TASK[a.from])))
    .map(a => ({key:'a-' + a.id, title:a.name, date:a.deadline, approx:!!a.approx, app:a}));
  return [...fromPlan, ...fromApps].filter(x => daysLeft(x.date) >= 0).sort((a, b) => a.date < b.date ? -1 : 1);
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
  return `Данные платформы (проверено в ноябре 2026):
- UCAS (Великобритания), поступление 2027: 15 октября 2026 — Оксфорд, Кембридж, медицина; 13 января 2027, 18:00 по Лондону — остальные программы.
- США: Common App, ранняя подача обычно 1 или 15 ноября, основная — 1–15 января (например: Harvard, Princeton, Columbia — 1 января; Yale, Cornell, JHU — 2 января; Caltech, Duke, UChicago, Northwestern — 4 января; Stanford, Penn, Brown, NYU, MIT — 5 января; UNC, Purdue — 15 января; Michigan — 1 февраля). Need-blind для иностранцев: Harvard, Yale, Princeton, MIT, Amherst, Dartmouth, Bowdoin; Brown и Notre Dame — с выпуска 2029. Для поступления в 2027 году SAT или ACT обязательны в Harvard, Yale, Stanford, MIT, Caltech, Brown, Dartmouth, Cornell, Johns Hopkins.
- Визы США: с 1 января 2026 действует запрет на въезд для 39 стран; стран Центральной Азии в нём нет. С 15 сентября 2026 действует правило DHS о фиксированном сроке пребывания по визам F и J — до 4 лет, продление через USCIS.
- Госгрант Республики Казахстан: заявления подаются после ЕНТ, в 2026 году — 13–20 июля; порог 50–75 баллов в зависимости от направления.
- IELTS в Казахстане — около 105 тыс. тенге (British Council, 2026); SAT вне США — $68 + $43 = $111; Duolingo English Test — $70.
- Германия: со школьным аттестатом СНГ обычно нужен Studienkolleg или 1–2 курса вуза дома; в большинстве госвузов учёба бесплатная, кроме Баварии и Баден-Вюртемберга для иностранцев.
- Италия: региональные стипендии DSU по доходу семьи. Чехия: бесплатно на чешском языке.
Стипендии:
${grants}`;
}

/* The student's profile and next steps, for the assistants. */
export function profileText(state){
  const p = state.profile;
  if (!p) return 'Профиль ученика: ещё не прошёл тест.';
  const sat = p.sat && p.sat !== 'none' ? optLabel('sat', p.sat) : 'не сдавал';
  const prof = `${p.grade} класс, страна: ${COUNTRIES[p.country].ru}, IELTS: ${optLabel('english', p.english)}, SAT: ${sat}, оценки: ${optLabel('grades', p.grades)}, достижения: ${optLabel('extra', p.extra)}, бюджет: ${optLabel('budget', p.budget)}, направление: ${optLabel('field', p.field)}, страны: ${effRegions(p).map(r => REGIONS[r].label.ru).join(', ')}.`;
  const next = buildPlan(p).filter(t => !state.done[t.id]).slice(0, 5).map(t => `- ${t.title.ru} — ${t.approx ? 'примерно ' : ''}${fmtDate(t.date)}`).join('\n');
  const list = state.apps.slice(0, 10).map(a => `- ${a.name}${a.deadline ? ' (дедлайн ' + fmtDate(a.deadline) + ')' : ''}`).join('\n');
  return `Профиль ученика: ${prof}${next ? '\nБлижайшие шаги плана:\n' + next : ''}${list ? '\nВузы в его списке:\n' + list : ''}`;
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
