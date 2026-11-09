import { BASE } from './questionText.js';
import { COUNTRIES, FIELDS, REGIONS } from './reference.js';
import { LANGS } from './programs.js';
import { pick } from '../i18n/strings.js';
import { today } from '../lib/dates.js';

const g = (ru, kz, en) => ({ru, kz, en});
const base = key => BASE.find(q => q.key === key);

/* Calendar year in which the final (11th) school year starts, and the usual first intake after it. */
export function finalYear(grade){
  const sy = today.getMonth() >= 7 ? today.getFullYear() : today.getFullYear() - 1;
  return sy + (11 - Number(grade));
}
export const firstIntake = grade => finalYear(grade) + 1;

export const IELTS = ['lt55', '5.5', '6.0', '6.5', '7.0', '7.5'];
export const ieltsNum = p => p && /^\d/.test(p.english || '') ? Number(p.english) : null;
export const CURRENCIES = ['KZT', 'USD', 'EUR'];

/* The test. Short main path; `show` hides questions that do not apply, `extra` adds a small follow-up under the options.
   multi: several answers; `only` options exclude all others. */
export const QUESTIONS = [
  {...base('grade'), opts:base('grade').opts},
  {key:'intake', tag:g('Год поступления','Түсу жылы','Start year'), title:g('В каком году хочешь начать учёбу?','Қай жылы оқуды бастағың келеді?','When do you want to start university?'),
    opts:a => { const y = firstIntake(a.grade || 11); return [y, y + 1, y + 2].map(v => [v, g(`Осенью ${v}`, `${v} жылдың күзінде`, `Autumn ${v}`)]); },
    def:g('Обычно сразу после школы. От года зависят сроки подачи и план.','Әдетте мектептен кейін бірден. Өтініш мерзімі мен жоспар осыған байланысты.','Usually right after school. Deadlines and your plan depend on it.'),
    hint:(v, a) => Number(v) === firstIntake(a.grade || 11)
      ? g('Подавать документы нужно в учебном году перед стартом — сроки начнутся уже осенью.','Құжатты оқу басталар алдындағы оқу жылында тапсырасың — мерзімдер күзде басталады.','You apply in the school year before you start — deadlines begin in the autumn.')
      : g('Хорошо, будет время на экзамены и gap year. План построю под этот год.','Жақсы, емтихандар мен gap year үшін уақыт болады. Жоспарды осы жылға құрамын.','Good, there will be time for exams or a gap year. I\'ll build the plan for that year.')},
  base('country'),
  {...base('field'), opts:FIELDS},
  {key:'regions', multi:true, only:['unsure'], tag:g('Страны','Елдер','Countries'), title:g('Где хочешь учиться?','Қай жерде оқығың келеді?','Where do you want to study?'),
    opts:[...Object.keys(REGIONS).map(r => [r, REGIONS[r].label]), ['unsure', g('Пока не знаю','Әзірге білмеймін','Not sure yet')]],
    def:g('Можно выбрать несколько. Подбор не будет сам добавлять другие страны.','Бірнешеуін таңдауға болады. Іріктеу басқа елдерді өздігінен қоспайды.','Pick one or more. Matching will not add other countries on its own.')},
  {key:'langs', multi:true, min:1, tag:g('Язык обучения','Оқу тілі','Study language'), title:g('На каких языках готов(а) учиться?','Қай тілдерде оқуға дайынсың?','Which languages can you study in?'),
    opts:Object.entries(LANGS),
    def:g('Выбери языки, на которых сможешь учиться уже на первом курсе.','Бірінші курстан бастап оқи алатын тілдерді таңда.','Choose languages you could study in from the first year.')},
  {key:'english', tag:g('Английский','Ағылшын тілі','English'), title:g('Какой у тебя IELTS Academic?','IELTS Academic нәтижең қандай?','What is your IELTS Academic score?'),
    opts:[['none', g('Не сдавал(а)','Тапсырған жоқпын','Not taken')], ['lt55', g('Ниже 5.5','5.5-тен төмен','Below 5.5')], ...IELTS.slice(1).map(v => [v, g(v === '7.5' ? '7.5 и выше' : v, v === '7.5' ? '7.5 және жоғары' : v, v === '7.5' ? '7.5 or higher' : v)]),
          ['other', g('Другой сертификат','Басқа сертификат','Another certificate')]],
    def:g('Если экзамена ещё не было, выбери «Не сдавал(а)».','Емтихан тапсырмаған болсаң, «Тапсырған жоқпын» деп таңда.','If you haven\'t taken it yet, choose "Not taken".'),
    hint:v => v === 'none' ? base('english').hints.none : v === 'other'
      ? g('Укажи экзамен и балл. Перевод в IELTS не делаю — каждый вуз сам решает, что принимать.','Емтихан мен балды көрсет. IELTS-ке айналдырмаймын — әр ЖОО нені қабылдайтынын өзі шешеді.','Enter the test and score. I don\'t convert to IELTS — each university decides what it accepts.')
      : g('Сравню с минимальным баллом каждой программы, если он известен.','Белгілі болса, әр бағдарламаның ең төменгі балымен салыстырамын.','I\'ll compare it with each programme\'s minimum, where it is known.'),
    extra:'englishOther'},
  {...base('sat'), show:a => (a.regions || []).some(r => r === 'us' || r === 'unsure')},
  {...base('grades'), opts:[...base('grades').opts, ['other', g('У меня другая система оценок','Менде басқа бағалау жүйесі','I have a different grading system')]],
    hint:v => v === 'other' ? g('Укажи систему и средний балл — так я не ошибусь при сравнении.','Жүйе мен орташа балды көрсет — салыстырғанда қателеспеймін.','Enter your system and average so I compare correctly.') : (base('grades').hints[v] || base('grades').def),
    extra:'gradesOther'},
  {key:'extra', multi:true, min:1, only:['none'], tag:base('extra').tag, title:g('Есть олимпиады или проекты?','Олимпиада немесе жобаң бар ма?','Any olympiads or projects?'),
    opts:base('extra').opts, def:g('Можно выбрать оба варианта.','Екеуін де таңдауға болады.','You can pick both.'), hints:base('extra').hints},
  {key:'prep', multi:true, min:1, only:['no', 'unsure'], show:a => (a.regions || []).some(r => ['eu', 'uk', 'asia', 'unsure'].includes(r)),
    tag:g('Подготовка','Дайындық','Preparation'), title:g('Готов(а) к подготовительному этапу?','Дайындық кезеңіне дайынсың ба?','Are you open to a preparation stage?'),
    opts:[['foundation', g('Да, к подготовительному году (Foundation, Studienkolleg)','Иә, дайындық жылына (Foundation, Studienkolleg)','Yes, a preparatory year (Foundation, Studienkolleg)')],
          ['local', g('Да, выучить язык страны','Иә, сол елдің тілін үйренуге','Yes, learning the local language')],
          ['no', g('Нет, хочу сразу на бакалавриат','Жоқ, бірден бакалавриатқа','No, straight into the bachelor\'s')], ['unsure', g('Пока не знаю','Әзірге білмеймін','Not sure yet')]],
    def:g('В некоторых странах после 11 класса нужен ещё год подготовки.','Кейбір елдерде 11-сыныптан кейін тағы бір жыл дайындық керек.','Some countries require an extra preparation year after 11 school years.')},
  {key:'funding', tag:g('Финансы','Қаржы','Money'), title:g('Как семья будет платить за учёбу?','Отбасың оқуға қалай төлейді?','How will your family pay for university?'),
    opts:[['full', g('Нужно полное финансирование: учёба и жизнь','Толық қаржыландыру керек: оқу және тұрмыс','I need full funding: tuition and living')],
          ['partial', g('Частично заплатим, нужна помощь','Ішінара төлейміз, көмек керек','We can pay part and need help')],
          ['self', g('Оплатим сами в пределах бюджета','Бюджет шегінде өзіміз төлейміз','We will pay ourselves within a budget')]],
    def:g('Полный грант — это и обучение, и проживание. Бесплатная учёба без стипендии — не полный грант.','Толық грант — оқу да, тұру да. Стипендиясыз тегін оқу — толық грант емес.','Full funding means tuition and living costs. Free tuition without a stipend is not full funding.'),
    hint:v => v === 'full' ? g('Буду отдельно показывать, покрывает ли стипендия жизнь, и что останется оплатить.','Стипендия тұрмысты өтей ме, не төлеу қалатынын бөлек көрсетемін.','I\'ll show separately whether a scholarship covers living costs and what is left to pay.')
      : g('Укажи максимум в год на учёбу и жизнь — сравню с известной стоимостью.','Оқу мен тұрмысқа жылына ең көбі қанша екенін көрсет — белгілі құнымен салыстырамын.','Enter the yearly maximum for tuition and living — I\'ll compare it with known costs.'),
    extra:'budget'}
];

/* Visible questions for the current answers. */
export const visibleQuestions = a => QUESTIONS.filter(q => !q.show || q.show(a));
export const optionsOf = (q, a) => typeof q.opts === 'function' ? q.opts(a) : q.opts;

/* Is the question answered well enough to go on? */
export function answered(q, a){
  const v = a[q.key];
  if (q.multi) return Array.isArray(v) && v.length >= (q.min || 0);
  if (v === undefined || v === null || v === '') return false;
  if (q.extra === 'englishOther' && v === 'other') return !!(a.englishOther && a.englishOther.test && String(a.englishOther.score || '').trim());
  if (q.extra === 'gradesOther' && v === 'other') return !!(a.gradesOther && a.gradesOther.system && String(a.gradesOther.value || '').trim());
  if (q.extra === 'budget' && v !== 'full') return !!(a.budget && Number(a.budget.amount) > 0 && a.budget.currency);
  return true;
}

export const optLabel = (key, v, lang = 'ru', a = {}) => {
  const q = QUESTIONS.find(x => x.key === key);
  const o = q && optionsOf(q, a).find(x => String(x[0]) === String(v));
  return o ? pick(lang, o[1]) : '';
};

const OTHER_TESTS = {toefl:'TOEFL iBT', duolingo:'Duolingo', cambridge:'Cambridge', pte:'PTE Academic', other:g('другой','басқа','other')};
const GRADE_SYSTEMS = {gpa4:g('GPA из 4','4-тік GPA','GPA out of 4'), p100:g('100-балльная','100 балдық','100-point'), ib:'IB', alevel:'A-level', other:g('другая','басқа','other')};
export { OTHER_TESTS, GRADE_SYSTEMS };

export const fmtMoney = (n, cur, lang = 'ru') => {
  if (n === null || n === undefined) return '';
  const loc = lang === 'en' ? 'en-US' : lang === 'kz' ? 'kk-KZ' : 'ru-RU';
  const sym = {EUR:'€', USD:'$', KZT:'₸', KRW:'₩', CZK:'Kč'}[cur] || cur;
  const num = Number(n).toLocaleString(loc, {maximumFractionDigits:0});
  return cur === 'USD' || cur === 'EUR' ? `${sym}${num}` : `${num} ${sym}`;
};

/* Readable answers: [label key, value] pairs for chips and the profile page. */
export function profileFacts(p, lang = 'ru'){
  if (!p) return [];
  const L = v => pick(lang, v);
  const eng = p.english === 'other' && p.englishOther ? `${L(OTHER_TESTS[p.englishOther.test])} ${p.englishOther.score}` : optLabel('english', p.english, lang);
  const grades = p.grades === 'other' && p.gradesOther ? `${L(GRADE_SYSTEMS[p.gradesOther.system])}: ${p.gradesOther.value}` : optLabel('grades', p.grades, lang);
  const money = p.funding === 'full' ? optLabel('funding', 'full', lang)
    : `${optLabel('funding', p.funding, lang)}${p.budget && p.budget.amount ? ' · ' + fmtMoney(p.budget.amount, p.budget.currency, lang) : ''}`;
  return [
    ['pf.grade', L(g(`${p.grade} класс`, `${p.grade}-сынып`, `Grade ${p.grade}`))],
    ['pf.intake', String(p.intake)],
    ['pf.country', L(COUNTRIES[p.country])],
    ['pf.field', optLabel('field', p.field, lang)],
    ['pf.regions', (p.regions || []).map(r => r === 'unsure' ? optLabel('regions', 'unsure', lang) : L(REGIONS[r].label)).join(', ')],
    ['pf.langs', (p.langs || []).map(l => L(LANGS[l])).join(', ')],
    ['pf.english', eng],
    ...(p.sat && p.sat !== 'none' && p.sat !== 'nousa' ? [['pf.sat', optLabel('sat', p.sat, lang)]] : []),
    ['pf.grades', grades],
    ['pf.extra', (p.extra || []).map(x => optLabel('extra', x, lang)).join(', ')],
    ...(p.prep && p.prep.length ? [['pf.prep', p.prep.map(x => optLabel('prep', x, lang)).join(', ')]] : []),
    ['pf.budget', money]
  ];
}

/* Test answers -> stored profile. Answers to hidden questions are dropped, so a changed path can't leave stale data. */
export function toProfile(a){
  const shown = new Set(visibleQuestions(a).map(q => q.key));
  const keep = k => shown.has(k) ? a[k] : undefined;
  const funding = a.funding || 'full';
  return {
    grade:Number(a.grade), intake:Number(a.intake) || firstIntake(a.grade), country:a.country, field:a.field,
    regions:a.regions || [], langs:a.langs && a.langs.length ? a.langs : ['en'],
    english:a.english, englishOther:a.english === 'other' ? {test:(a.englishOther || {}).test, score:String((a.englishOther || {}).score || '').trim()} : null,
    sat:shown.has('sat') ? (a.sat || 'none') : 'nousa',
    grades:a.grades, gradesOther:a.grades === 'other' ? {system:(a.gradesOther || {}).system, value:String((a.gradesOther || {}).value || '').trim()} : null,
    extra:a.extra && a.extra.length ? a.extra : ['none'], prep:keep('prep') || [],
    funding, budget:funding === 'full' ? {amount:0, currency:(a.budget || {}).currency || 'USD'} : {amount:Number((a.budget || {}).amount) || 0, currency:(a.budget || {}).currency || 'USD'}
  };
}

/* Profiles saved by the first version of the test (before November 2026). Unknown new answers get cautious defaults. */
export function upgradeProfile(p){
  if (!p || p.intake) return p;
  const english = {none:'none', ielts55:'5.5', ielts65:'6.5', ielts75:'7.5'}[p.english] || 'none';
  const funding = {full:'full', partial:'partial', mid:'self', any:'self'}[p.budget] || 'full';
  return {
    grade:Number(p.grade), intake:firstIntake(p.grade), country:p.country, field:p.field, regions:p.regions || [], langs:['en'],
    english, englishOther:null, sat:p.sat || 'none', grades:p.grades, gradesOther:null,
    extra:Array.isArray(p.extra) ? p.extra : [p.extra || 'none'], prep:[],
    funding, budget:p.budget === 'mid' ? {amount:15000, currency:'USD'} : {amount:0, currency:'USD'}, upgraded:true
  };
}

/* Starting answers: the saved profile, or sensible defaults (English as a study language, tenge for Kazakhstan). */
export function freshAnswers(state){
  if (state.profile) return JSON.parse(JSON.stringify(state.profile));
  return {langs:['en'], budget:{amount:'', currency:'USD'}};
}
