/* Personal plan, built from today's date, the intake year and the programmes the student saved.
   kind 'official' — a deadline from an official source (year, source link, ≈ when it is last year's date);
   kind 'prep' — our recommended preparation date. Recommended dates never show as overdue: unfinished ones move to "now".
   No application tasks for programmes the student did not choose. */
import { programById } from '../data/programs.js';
import { ieltsNum } from '../data/questions.js';
import { today, isoOf } from './dates.js';

const g = (ru, kz, en) => ({ru, kz, en});
const L = (v, l) => v && typeof v === 'object' ? (v[l] ?? v.ru) : v;
const fx = fn => ({ru:fn('ru'), kz:fn('kz'), en:fn('en')});
export const addDays = (iso, n) => { const d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate() + n); return isoOf(d); };

/* A task counts as done when ticked under its id, or under its id from the first version of the plan. */
export const isDone = (state, x) => !!(state.done[x.id] || (x.alias && state.done[x.alias]));

export function buildPlan(state){
  const p = state.profile;
  if (!p) return [];
  const now = isoOf(today), I = Number(p.intake), C = I - 1;
  const out = [];
  const progs = state.apps.filter(a => a.programId).map(a => ({a, pr:programById(a.programId)})).filter(x => x.pr);

  /* official deadlines of saved programmes and their scholarships */
  const seenFund = new Set();
  for (const {pr} of progs) {
    if (pr.intake !== I) {
      out.push({id:`p-${pr.id}-dates-${I}`, kind:'prep', date:`${C}-09-15`, src:pr.links.admission,
        title:fx(l => ({ru:`Узнать сроки ${pr.uni} на набор ${I}`, kz:`${pr.uni}: ${I} жылғы қабылдау мерзімдерін білу`, en:`Find ${pr.uni}'s dates for the ${I} intake`}[l])),
        detail:fx(l => ({ru:`Наши данные — для набора ${pr.intake}. Новые сроки обычно публикуют осенью.`, kz:`Біздегі деректер ${pr.intake} жылғы қабылдауға арналған. Жаңа мерзімдер әдетте күзде жарияланады.`, en:`Our data is for the ${pr.intake} intake. New dates are usually published in autumn.`}[l]))});
      continue;
    }
    /* alternative rounds (same group): only the next open one, or the last one when all have passed */
    const now0 = isoOf(today);
    const shown = (pr.deadlines || []).filter(d => {
      if (!d.group) return true;
      const same = pr.deadlines.filter(x => x.group === d.group);
      const open = same.find(x => x.date >= now0);
      return d === (open || same[same.length - 1]);
    });
    for (const d of shown) out.push({id:`p-${pr.id}-${d.key}`, kind:'official', date:d.date, approx:!d.confirmed, src:d.src, info:!!d.info, after:pr.afterMissed, program:pr.id,
      title:fx(l => `${pr.uni}: ${L(d.label, l)}`), detail:d.note || null});
    for (const o of pr.funding || []) {
      if (!o.separate || !o.deadline || (o.countries && !o.countries.includes(p.country)) || seenFund.has(o.id)) continue;
      seenFund.add(o.id);
      out.push({id:`f-${o.id}`, kind:'official', date:o.deadline.date, approx:!o.deadline.confirmed, src:o.src,
        title:fx(l => ({ru:`${L(o.name, l)}: подать заявку на стипендию`, kz:`${L(o.name, l)}: стипендияға өтініш беру`, en:`${L(o.name, l)}: apply for the scholarship`}[l])), detail:o.deadline.note || null});
    }
    for (const s of pr.steps || []) {
      const ref = (pr.deadlines || []).find(d => d.key === s.ref) || (pr.deadlines || [])[0];
      out.push({id:`s-${pr.id}-${s.key}`, kind:'prep', title:s.title, detail:s.detail, src:s.src || null, ...(s.key === 'letter' ? {link:'#letter', linkKey:'nav.letter'} : {}),
        date:s.date || (ref ? addDays(ref.date, -(s.before || 21)) : addDays(now, 14))});
    }
  }

  /* the student's own list entries (catalogue universities, scholarships) that have a deadline */
  for (const a of state.apps.filter(a => !a.programId && a.deadline && a.status === 'prep')) {
    out.push({id:`a-${a.id}`, kind:'official', own:true, title:a.name, date:a.deadline, approx:!!a.approx, src:a.url || null,
      detail:a.approx ? g('Срок по прошлым годам — сверь на официальном сайте.','Мерзім өткен жылдар бойынша — ресми сайттан тексер.','Based on past years — check the official website.') : null});
  }

  const firstDeadline = out.filter(x => x.kind === 'official' && !x.info && x.date >= now).map(x => x.date).sort()[0] || `${C}-12-01`;
  const before = days => addDays(firstDeadline, -days);
  const prep = (id, title, detail, date, extra = {}) => out.push({id, kind:'prep', title, detail, date, ...extra});

  if (!progs.length && !state.apps.length) prep('pick', g('Выбрать 2–4 программы в подборе и сохранить их','Іріктеуден 2–4 бағдарлама таңдап, сақтау','Choose 2–4 programmes from your matches and save them'),
    g('Тогда в плане появятся их официальные сроки.','Сонда жоспарда олардың ресми мерзімдері пайда болады.','Their official deadlines will then appear in your plan.'), addDays(now, 7), {link:'#result', linkKey:'plan.toResult', alias:'list'});

  /* English: the target is the highest minimum among saved programmes, or 6.5 when none is saved */
  const need = Math.max(0, ...progs.map(x => (x.pr.req.english && x.pr.req.english.ielts) || 0)) || 6.5;
  const n = ieltsNum(p);
  if (p.english === 'none' || p.english === 'lt55') {
    if (Number(p.grade) <= 9) prep('eng-course', g('Подтянуть английский до уровня B2','Ағылшын тілін B2 деңгейіне жеткізу','Bring your English up to B2'),
      g('Занимайся 3–4 раза в неделю — без B2 сложно получить IELTS 6.5.','Аптасына 3–4 рет айналыс — B2-сіз IELTS 6.5 алу қиын.','Study 3–4 times a week — without B2, IELTS 6.5 is hard.'), `${C - 1}-05-31`, {alias:'eng'});
    prep('ielts', fx(l => ({ru:`Сдать IELTS Academic — цель ${need}`, kz:`IELTS Academic тапсыру — мақсат ${need}`, en:`Take IELTS Academic — target ${need}`}[l])),
      g('Результат должен прийти в вуз до срока подачи; оставь время на пересдачу. В Казахстане экзамен стоит около 105 000 ₸.','Нәтиже ЖОО-ға өтініш мерзіміне дейін жетуі керек; қайта тапсыруға уақыт қалдыр. Қазақстанда емтихан шамамен 105 000 ₸.','Results must reach the university before the deadline; leave time for a retake. In Kazakhstan the exam costs about ₸105,000.'), before(75), {alias:'ielts1'});
  } else if (p.english === 'other') {
    prep('cert-check', g('Проверить, принимают ли выбранные вузы твой сертификат','Таңдаған ЖОО-лар сертификатыңды қабылдай ма, тексеру','Check that your chosen universities accept your certificate'), null, before(60));
  } else if (n !== null && n < need) {
    prep('ielts-retake', fx(l => ({ru:`Пересдать IELTS: нужно ${need}, у тебя ${p.english}`, kz:`IELTS қайта тапсыру: ${need} керек, сенде ${p.english}`, en:`Retake IELTS: ${need} needed, you have ${p.english}`}[l])), null, before(45), {alias:'ielts2'});
  }

  if (progs.length || state.apps.length) prep('transcript', g('Перевести оценки за последние 2–4 года на английский','Соңғы 2–4 жылдың бағаларын ағылшын тіліне аудару','Translate your last 2–4 years of grades into English'),
    g('Нужен перевод табеля; нужно ли заверение — уточни у каждого вуза.','Табель аудармасы керек; куәландыру керек пе — әр ЖОО-дан нақтыла.','You need a translated transcript; check with each university whether it must be certified.'), before(30), {alias:'trans'});
  if ((p.extra || []).includes('none') && Number(p.grade) <= 10) prep('project', g('Начать проект или волонтёрство','Жоба немесе волонтерлік бастау','Start a project or volunteering'),
    g('Даже один проект за год — хорошая история для мотивационного письма.','Бір жылдағы бір жобаның өзі — мотивациялық хатқа жақсы оқиға.','Even one project in a year makes a good story for a motivation letter.'), `${C}-03-01`, {alias:'act'});
  if ((p.regions || []).includes('us') && (!p.sat || p.sat === 'none')) prep('sat', g('SAT: первая попытка','SAT: бірінші әрекет','SAT: first attempt'),
    g('Около $111 вне США. Готовься по бесплатным Bluebook и Khan Academy.','АҚШ-тан тыс шамамен $111. Тегін Bluebook және Khan Academy арқылы дайындал.','About $111 outside the US. Prepare with the free Bluebook and Khan Academy.'), before(60), {alias:'sat1'});
  if (progs.some(x => x.pr.country !== p.country)) prep('visa', g('Узнать, как оформляется студенческая виза','Студенттік виза қалай рәсімделетінін білу','Find out how the student visa works'),
    g('Обычно визу оформляют после письма о зачислении — заранее проверь список документов.','Әдетте визаны қабылдау хатынан кейін рәсімдейді — құжаттар тізімін алдын ала тексер.','The visa usually comes after the admission letter — check the document list in advance.'), `${I}-05-01`);

  /* recommended dates never show as overdue; missed official dates are flagged with what to do next */
  const soon = addDays(now, 7);
  for (const x of out) {
    if (x.kind === 'prep' && x.date < now && !isDone(state, x)) { x.date = soon; x.asap = true; }
    if (x.kind === 'official' && x.date < now && !isDone(state, x) && !x.info) x.missed = true;
  }
  return out.sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
}

/* The single most important next action and the three after it. */
export function planFocus(state, plan){
  const open = plan.filter(x => !isDone(state, x) && !x.missed && !x.info);
  return {main:open[0] || null, top:open.slice(1, 4)};
}
