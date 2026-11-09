/* Programme matching. Plain rules over the verified data in programs.js — no AI and no invented numbers.
   Admission (requirements) and funding (money) are judged separately; every verdict carries its reasons.
   Texts are {ru, kz, en} objects so the same result serves all three languages and the chat server. */
import { PROGRAMS } from '../data/programs.js';
import { LANGS } from '../data/programs.js';
import { UNIS } from '../data/unis.js';
import { FIELDS, REGIONS, COUNTRIES } from '../data/reference.js';
import { ieltsNum, fmtMoney, OTHER_TESTS } from '../data/questions.js';
import { today, isoOf, fmtDate } from './dates.js';

const g = (ru, kz, en) => ({ru, kz, en});
const fx = fn => ({ru:fn('ru'), kz:fn('kz'), en:fn('en')});      // build a text in all languages from one template
const L = (v, l) => v && typeof v === 'object' ? (v[l] ?? v.ru) : v;
const fieldName = (f, l) => L((FIELDS.find(x => x[0] === f) || [, f])[1], l);
const langName = (c, l) => L(LANGS[c] || c, l);
const todayIso = () => isoOf(today);

export const ADM_OK = ['ok', 'check', 'gap'];
export const FUND_OK = ['ok', 'possible', 'check'];

/* Deadlines for the student's intake: the next open one, or "all passed". Informational dates are skipped. */
export function nextDeadline(pr){
  const real = (pr.deadlines || []).filter(d => !d.info);
  const now = todayIso();
  const open = real.filter(d => d.date >= now).sort((a, b) => a.date < b.date ? -1 : 1);
  return {next:open[0] || null, passed:real.length > 0 && !open.length, all:real};
}

const yearCost = c => {
  if (!c) return null;
  if (c.amount === 0) return {min:0, max:0, currency:c.currency};
  if (c.amount === undefined && c.min === undefined) return null;
  const k = c.per === 'semester' ? 2 : c.per === 'month' ? 12 : 1;
  const min = (c.min ?? c.amount) * k, max = (c.max ?? c.amount) * k;
  return {min, max, currency:c.currency};
};
const money = (v, cur, l) => fmtMoney(v, cur, l);
const range = (r, l) => r.min === r.max ? money(r.min, r.currency, l) : `${money(r.min, r.currency, l)}–${money(r.max, r.currency, l)}`;

/* Evaluate one programme for one profile. */
export function evaluate(pr, p){
  const adm = {why:[], miss:[], check:[], improve:[], hard:[]};
  const fund = {why:[], miss:[], check:[], improve:[]};
  const known = {n:0};

  /* field */
  if (p.field === 'unsure') adm.check.push(g('Направление ещё не выбрано — посмотри, интересна ли тебе эта программа.','Бағыт әлі таңдалмаған — бұл бағдарлама саған қызық па, қара.','You haven\'t chosen a field yet — see whether this programme interests you.'));
  else adm.why.push(fx(l => ({ru:`Направление «${fieldName(p.field, l)}»`, kz:`«${fieldName(p.field, l)}» бағыты`, en:`Field: ${fieldName(p.field, l)}`}[l])));

  /* language of instruction */
  const langs = p.langs || [];
  const common = pr.lang.filter(x => langs.includes(x));
  const local = (p.prep || []).includes('local');
  const ln = l => pr.lang.map(c => langName(c, l)).join(', ');
  if (common.length) { known.n++; adm.why.push(fx(l => ({ru:`Обучение на языке: ${ln(l)} — ты готов(а)`, kz:`Оқу тілі: ${ln(l)} — сен дайынсың`, en:`Taught in ${ln(l)} — which you chose`}[l]))); }
  else if (local) {
    known.n++;
    adm.improve.push(fx(l => ({ru:`Обучение на языке: ${ln(l)}. Его нужно выучить до уровня, который требует вуз.`, kz:`Оқу тілі: ${ln(l)}. Оны ЖОО талап ететін деңгейге дейін үйрену керек.`, en:`Taught in ${ln(l)}. You'd need to learn it to the level the university requires.`}[l])));
  } else {
    known.n++;
    adm.hard.push('lang');
    adm.miss.push(fx(l => ({ru:`Обучение на языке: ${ln(l)}, а ты выбрал(а): ${langs.map(c => langName(c, l)).join(', ') || '—'}`, kz:`Оқу тілі: ${ln(l)}, ал сен таңдағаның: ${langs.map(c => langName(c, l)).join(', ') || '—'}`, en:`Taught in ${ln(l)}, but you chose ${langs.map(c => langName(c, l)).join(', ') || '—'}`}[l])));
  }
  if (pr.langNote) adm.check.push(pr.langNote);
  if (pr.req.language && pr.req.language.text) adm.check.push(pr.req.language.text);

  /* intake year and deadlines */
  const dl = nextDeadline(pr);
  if (p.intake > pr.intake) {
    adm.check.push(fx(l => ({ru:`Данные — для набора ${pr.intake}. На ${p.intake} год сроки и требования могут измениться.`, kz:`Деректер ${pr.intake} жылғы қабылдауға арналған. ${p.intake} жылы мерзімдер мен талаптар өзгеруі мүмкін.`, en:`The data is for the ${pr.intake} intake. For ${p.intake}, dates and requirements may change.`}[l])));
  } else if (p.intake < pr.intake) {
    adm.hard.push('intake');
    adm.miss.push(fx(l => ({ru:`Набор ${p.intake} года уже начался или прошёл.`, kz:`${p.intake} жылғы қабылдау басталып кеткен немесе өткен.`, en:`The ${p.intake} intake has already started or passed.`}[l])));
  } else if (dl.passed) {
    adm.hard.push('deadline');
    adm.miss.push(fx(l => ({ru:`Все сроки подачи на ${pr.intake} год уже прошли.`, kz:`${pr.intake} жылға барлық өтініш мерзімі өтті.`, en:`All application deadlines for ${pr.intake} have passed.`}[l])));
    if (pr.afterMissed) adm.improve.push(pr.afterMissed);
  }

  /* English */
  const eng = pr.req.english;
  if (common.includes('en') || (pr.lang.includes('en') && local)) {
    if (!eng) adm.check.push(g('Требования к английскому мы не подтвердили — проверь на сайте.','Ағылшын тіліне талаптарды растамадық — сайттан тексер.','We haven\'t confirmed the English requirement — check the website.'));
    else {
      known.n++;
      const n = ieltsNum(p);
      const sub = eng.sub ? `L ${eng.sub.l} · R ${eng.sub.r} · S ${eng.sub.s} · W ${eng.sub.w}` : '';
      if (p.english === 'other') {
        const o = p.englishOther || {};
        adm.check.push(fx(l => ({ru:`У тебя ${L(OTHER_TESTS[o.test], l) || 'сертификат'} ${o.score || ''}. Проверь, принимает ли вуз его и какой нужен балл (для IELTS — ${eng.ielts}).`, kz:`Сенде ${L(OTHER_TESTS[o.test], l) || 'сертификат'} ${o.score || ''}. ЖОО оны қабылдай ма және қандай балл керек, тексер (IELTS үшін — ${eng.ielts}).`, en:`You have ${L(OTHER_TESTS[o.test], l) || 'a certificate'} ${o.score || ''}. Check whether it is accepted and what score is needed (IELTS: ${eng.ielts}).`}[l])));
      } else if (n === null) {
        adm.improve.push(fx(l => ({ru:`Нужен IELTS Academic от ${eng.ielts}${sub ? ` (${sub})` : ''}. ${p.english === 'lt55' ? 'Сейчас у тебя ниже 5.5.' : 'Экзамен ещё не сдан.'}`, kz:`IELTS Academic ${eng.ielts}-тен керек${sub ? ` (${sub})` : ''}. ${p.english === 'lt55' ? 'Қазір 5.5-тен төмен.' : 'Емтихан әлі тапсырылмаған.'}`, en:`You need IELTS Academic ${eng.ielts}+${sub ? ` (${sub})` : ''}. ${p.english === 'lt55' ? 'Yours is below 5.5 now.' : 'You haven\'t taken it yet.'}`}[l])));
      } else if (n >= eng.ielts) {
        adm.why.push(fx(l => ({ru:`IELTS ${p.english} — не ниже нужных ${eng.ielts}`, kz:`IELTS ${p.english} — қажетті ${eng.ielts}-тен төмен емес`, en:`IELTS ${p.english} meets the required ${eng.ielts}`}[l])));
        if (sub) adm.check.push(fx(l => ({ru:`Минимум по секциям: ${sub}. Проверь свои баллы по каждой части.`, kz:`Бөлімдер бойынша ең төменгі: ${sub}. Әр бөлім балын тексер.`, en:`Section minimums: ${sub}. Check your score in each part.`}[l])));
      } else {
        adm.improve.push(fx(l => ({ru:`Нужен IELTS от ${eng.ielts}, у тебя ${p.english}. Пересдай до подачи.`, kz:`IELTS ${eng.ielts}-тен керек, сенде ${p.english}. Өтінішке дейін қайта тапсыр.`, en:`You need IELTS ${eng.ielts}+, you have ${p.english}. Retake it before you apply.`}[l])));
      }
      if (eng.alt) adm.check.push(fx(l => `${({ru:'Английский', kz:'Ағылшын тілі', en:'English'})[l]}: ${L(eng.alt, l)}`));
    }
  }

  /* school certificate */
  const school = pr.req.school && (pr.req.school[p.country] || pr.req.school.any);
  if (school) {
    known.n++;
    if (school.status === 'ok') adm.check.push(school.text);
    else if (school.status === 'no') { adm.hard.push('school'); adm.miss.push(school.text); }
    else adm.check.push(school.text);
  }

  /* grades, exams, preparation, other documents */
  if (pr.req.grades && pr.req.grades.text) adm.check.push(pr.req.grades.text);
  (pr.req.exams || []).forEach(e => adm.check.push(fx(l => `${L(e.name, l)}${e.date ? ' — ' + fmtDate(e.date, l) : ''}${e.text ? '. ' + L(e.text, l) : ''}`)));
  const prep = pr.req.prep;
  if (prep && prep.needed === true) {
    if ((p.prep || []).includes('no')) { adm.hard.push('prep'); adm.miss.push(prep.text); }
    else adm.check.push(prep.text);
  } else if (prep && prep.text) adm.check.push(prep.text);
  (pr.req.other || []).forEach(o => adm.check.push(o));
  if (p.grades === 'low') adm.improve.push(g('Подтяни оценки 10–11 класса — их смотрят при поступлении.','10–11-сынып бағаларын көтер — түскенде соларға қарайды.','Raise your Grade 10–11 marks — they are looked at in admission.'));
  if (p.grades === 'other') adm.check.push(g('Проверь, как вуз пересчитывает твою систему оценок.','ЖОО сенің бағалау жүйеңді қалай есептейтінін тексер.','Check how the university converts your grading system.'));

  const admStatus = adm.hard.length ? 'no' : known.n === 0 ? 'unknown' : adm.improve.length ? 'gap' : adm.check.length ? 'check' : 'ok';

  /* ---- funding ---- */
  const tuition = yearCost(pr.costs.tuition), living = yearCost(pr.costs.living);
  const isFree = pr.costs.tuition && pr.costs.tuition.amount === 0;
  const options = (pr.funding || []).filter(o => !o.countries || o.countries.includes(p.country));
  (pr.funding || []).filter(o => o.countries && !o.countries.includes(p.country)).forEach(o =>
    fund.miss.push(fx(l => ({ru:`${L(o.name, l)} — не для граждан страны «${L(COUNTRIES[p.country], l)}»`, kz:`${L(o.name, l)} — «${L(COUNTRIES[p.country], l)}» азаматтарына емес`, en:`${L(o.name, l)} is not open to citizens of ${L(COUNTRIES[p.country], l)}`}[l]))));
  options.forEach(o => {
    fund.check.push(fx(l => `${L(o.name, l)}: ${L(o.text, l)}`));
    if (o.scope) fund.check.push(o.scope);
    if (o.separate) fund.improve.push(fx(l => ({ru:`Подай отдельную заявку на ${L(o.name, l)}${o.deadline ? ` — ${o.deadline.confirmed ? '' : 'примерно '}до ${fmtDate(o.deadline.date, l)}` : ''}.`, kz:`${L(o.name, l)} үшін бөлек өтініш бер${o.deadline ? ` — ${o.deadline.confirmed ? '' : 'шамамен '}${fmtDate(o.deadline.date, l)} дейін` : ''}.`, en:`Apply separately for ${L(o.name, l)}${o.deadline ? ` — ${o.deadline.confirmed ? '' : 'around '}by ${fmtDate(o.deadline.date, l)}` : ''}.`}[l])));
    if (o.competitive) fund.check.push(g('Это конкурс — стипендия не гарантирована.','Бұл конкурс — стипендияға кепілдік жоқ.','This is competitive — the scholarship is not guaranteed.'));
  });
  if (pr.fundingNote) fund.check.push(pr.fundingNote);

  const coverTuition = isFree || options.some(o => o.tuition === true);
  const tuitionUnclear = !isFree && options.some(o => o.tuition === null);
  const livingFull = options.some(o => o.living === 'full');
  const livingPart = options.find(o => o.living === 'partial' || o.living === 'support');
  const budget = p.budget || {amount:0, currency:'USD'};
  let fundStatus;
  // What remains for the family per year, when amounts are known.
  let remain = null;
  if (tuition || isFree) {
    const tPart = coverTuition ? 0 : tuition ? tuition.max : null;
    let lPart = livingFull ? 0 : living ? living.max : null;
    if (lPart !== null && livingPart && livingPart.monthly && living && livingPart.monthly.currency === living.currency) lPart = Math.max(0, lPart - livingPart.monthly.amount * 12);
    const cur = (tuition || living || {}).currency;
    if (tPart !== null && lPart !== null && (!living || !tuition || living.currency === tuition.currency)) remain = {amount:tPart + lPart, currency:cur};
  }
  if (tuition && !isFree) fund.why.push(fx(l => `${({ru:'Обучение', kz:'Оқу', en:'Tuition'})[l]}: ${range(tuition, l)} ${({ru:'в год', kz:'жылына', en:'a year'})[l]}`));
  if (isFree) fund.why.push(g('Обучение бесплатное.','Оқу тегін.','Tuition is free.'));
  if (living) fund.why.push(fx(l => `${({ru:'Жизнь (оценка вуза)', kz:'Тұрмыс (ЖОО бағасы)', en:'Living (university estimate)'})[l]}: ${range(living, l)} ${({ru:'в год', kz:'жылына', en:'a year'})[l]}`));
  else fund.check.push(g('Расходы на жизнь не подтверждены — уточни на сайте вуза.','Тұрмыс шығындары расталмаған — ЖОО сайтынан нақтыла.','Living costs are not confirmed — check the university website.'));

  if (p.funding === 'full') {
    if (livingFull && coverTuition) fundStatus = 'possible';
    else if (coverTuition && livingPart && livingPart.living === 'support' && !livingPart.monthly) {
      fundStatus = 'check';
      fund.improve.push(fx(l => ({ru:`Уточни, сколько ${L(livingPart.name, l)} даёт на жизнь и хватит ли этого.`, kz:`${L(livingPart.name, l)} тұрмысқа қанша беретінін және жететінін нақтыла.`, en:`Check how much ${L(livingPart.name, l)} gives for living costs and whether it is enough.`}[l])));
    } else if (coverTuition && (livingPart || isFree || options.length)) {
      fundStatus = 'partial';
      if (isFree && !options.length) fund.miss.push(g('Бесплатное обучение — не полный грант: жильё и жизнь придётся оплачивать самим.','Тегін оқу — толық грант емес: тұрғын үй мен тұрмысты өздерің төлейсіңдер.','Free tuition is not full funding: you would pay for housing and living yourselves.'));
      if (remain && remain.amount > 0) fund.miss.push(fx(l => ({ru:`Останется оплатить примерно ${money(remain.amount, remain.currency, l)} в год на жизнь.`, kz:`Тұрмысқа жылына шамамен ${money(remain.amount, remain.currency, l)} төлеу қалады.`, en:`About ${money(remain.amount, remain.currency, l)} a year for living would remain to pay.`}[l])));
      else if (!remain) fund.miss.push(g('Расходы на жизнь не покрыты полностью, а их размер не подтверждён.','Тұрмыс шығындары толық өтелмейді, мөлшері расталмаған.','Living costs are not fully covered, and their amount is not confirmed.'));
    } else if (tuitionUnclear) {
      fundStatus = 'check';
      fund.improve.push(g('Уточни, что именно покрывает грант: обучение, стипендию, общежитие.','Грант нақты нені өтейтінін нақтыла: оқу, стипендия, жатақхана.','Check exactly what the grant covers: tuition, stipend, dormitory.'));
    } else {
      fundStatus = 'no';
      fund.miss.push(g('Известного полного финансирования для тебя нет: нужно платить за обучение и жизнь.','Саған белгілі толық қаржыландыру жоқ: оқу мен тұрмысқа төлеу керек.','There is no known full funding for you: tuition and living would need to be paid.'));
    }
  } else {
    const B = Number(budget.amount) || 0;
    if (!remain) {
      fundStatus = tuitionUnclear ? 'check' : 'unknown';
      fund.check.push(g('Не хватает данных, чтобы сравнить стоимость с твоим бюджетом.','Құнын бюджетіңмен салыстыруға дерек жетпейді.','Not enough data to compare the cost with your budget.'));
    } else if (remain.currency !== budget.currency) {
      fundStatus = 'check';
      fund.check.push(fx(l => ({ru:`Стоимость в ${remain.currency}, а бюджет в ${budget.currency}: сравни по текущему курсу. Нужно примерно ${money(remain.amount, remain.currency, l)} в год, у тебя до ${money(B, budget.currency, l)}.`, kz:`Құны ${remain.currency}-пен, ал бюджет ${budget.currency}-пен: ағымдағы бағам бойынша салыстыр. Жылына шамамен ${money(remain.amount, remain.currency, l)} керек, сенде ${money(B, budget.currency, l)} дейін.`, en:`The cost is in ${remain.currency} and your budget in ${budget.currency}: compare at today's rate. About ${money(remain.amount, remain.currency, l)} a year is needed; you have up to ${money(B, budget.currency, l)}.`}[l])));
    } else if (remain.amount <= B) {
      fundStatus = 'ok';
    } else {
      fundStatus = options.some(o => o.competitive) ? 'possible' : 'no';
      fund.miss.push(fx(l => ({ru:`Нужно примерно ${money(remain.amount, remain.currency, l)} в год, а бюджет — до ${money(B, budget.currency, l)}.`, kz:`Жылына шамамен ${money(remain.amount, remain.currency, l)} керек, ал бюджет — ${money(B, budget.currency, l)} дейін.`, en:`About ${money(remain.amount, remain.currency, l)} a year is needed; your budget is up to ${money(B, budget.currency, l)}.`}[l])));
    }
  }
  if (!tuition && !isFree) fund.check.push(g('Стоимость обучения не подтверждена.','Оқу құны расталмаған.','Tuition is not confirmed.'));

  return {pr, dl, adm:{...adm, status:admStatus}, fund:{...fund, status:fundStatus}};
}

const inRegions = (pr, regs) => !regs.length || regs.includes('unsure') || regs.includes(pr.region);
const inField = (pr, f) => !f || f === 'unsure' || pr.field.includes(f);

/* Group results for the profile. Nothing outside the chosen countries and field is added. */
export function matchAll(p){
  const regs = p.regions || [];
  const pool = PROGRAMS.filter(pr => inRegions(pr, regs) && inField(pr, p.field));
  const all = pool.map(pr => evaluate(pr, p));
  const fit = all.filter(r => ADM_OK.includes(r.adm.status) && FUND_OK.includes(r.fund.status));
  const money = all.filter(r => ADM_OK.includes(r.adm.status) && !FUND_OK.includes(r.fund.status));
  const alt = all.filter(r => !ADM_OK.includes(r.adm.status));
  return {fit, money, alt, pool:pool.length,
    reasons:{lang:alt.filter(r => r.adm.hard.includes('lang')).length, passed:alt.filter(r => r.adm.hard.includes('deadline')).length, money:money.length}};
}

/* Concrete changes to the answers that would add matches, with the number they add. Never applied automatically. */
export function suggestions(p){
  const base = matchAll(p), n0 = base.fit.length + base.money.length;
  const out = [];
  const tryOne = (kind, arg, patch) => {
    const r = matchAll({...p, ...patch});
    const d = r.fit.length + r.money.length - n0;
    if (d > 0) out.push({kind, arg, n:d, patch});
  };
  const langs = [...new Set(PROGRAMS.filter(pr => inField(pr, p.field) && inRegions(pr, p.regions || [])).flatMap(pr => pr.lang))].filter(c => !(p.langs || []).includes(c));
  langs.forEach(c => tryOne('lang', c, {langs:[...(p.langs || []), c]}));
  if (!(p.prep || []).includes('local') && langs.length) tryOne('local', null, {prep:[...(p.prep || []).filter(x => x !== 'no' && x !== 'unsure'), 'local']});
  if (!(p.regions || []).includes('unsure')) Object.keys(REGIONS).filter(r => !(p.regions || []).includes(r)).forEach(r => tryOne('region', r, {regions:[...(p.regions || []), r]}));
  if (p.field !== 'unsure') tryOne('field', null, {field:'unsure'});
  if (p.funding === 'full') {
    const r = matchAll({...p, funding:'partial', budget:{amount:Number.MAX_SAFE_INTEGER, currency:'EUR'}});
    const d = r.fit.length - base.fit.length;
    if (d > 0) out.push({kind:'funding', n:d, patch:null});
  }
  return out;
}

/* Universities from the catalogue in the chosen countries and field that have no verified programme yet. */
export function unverified(p){
  const regs = p.regions || [];
  const verifiedUnis = new Set(PROGRAMS.map(pr => pr.uni.toLowerCase()));
  return UNIS.filter(u => (!regs.length || regs.includes('unsure') || regs.includes(u.r)) && (p.field === 'unsure' || u.f.includes('all') || u.f.includes(p.field)))
    .filter(u => ![...verifiedUnis].some(v => v.includes(u.n.toLowerCase()) || u.n.toLowerCase().includes(v.split(' (')[0])));
}

export const programTitle = (pr, l) => `${pr.uni} — ${L(pr.name, l)}`;
