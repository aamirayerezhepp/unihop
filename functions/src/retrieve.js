/* Finds the pieces of the verified database that matter for one question, so the model gets a few relevant
   fragments instead of the whole database. Simple word matching on names, countries, fields and keywords
   (Russian, Kazakh and English). Every fragment keeps its source link and check date. */

const STOP = new Set(('как что где когда какой какая какие какую можно нужно надо есть мне мой моя мои для про или это эти ещё уже тоже очень если чтобы '
  + 'қалай қандай қай қашан маған менің үшін бар керек және немесе туралы ' + 'the and for with what which how when where can need does about is are my me i to of in on a an do').split(' '));

const norm = s => String(s || '').toLowerCase().replace(/ё/g, 'е');
export const tokens = s => norm(s).split(/[^a-zа-яәғқңөұүһі0-9]+/i).filter(w => w.length >= 3 && !STOP.has(w));
/* crude stemming: compare the first 5 letters, so "психологию" meets "психология" and "германию" meets "германия" */
const stem = w => w.length > 5 ? w.slice(0, 5) : w;

function makeIndex(text){ return new Set(tokens(text).map(stem)); }
function score(qStems, idx, weight){ let s = 0; for (const q of qStems) if (idx.has(q)) s += weight; return s; }

export function createRetriever(kb){
  const fieldText = f => (kb.names.fields[f] || {}).all || f;
  const langText = c => (kb.names.langs[c] || {}).all || c;
  const progs = kb.programs.map(p => ({p,
    name:makeIndex(`${p.uni} ${p.alt || ''} ${typeof p.name === 'object' ? [p.name.ru, p.name.en].join(' ') : p.name} ${p.city || ''} ${p.id}`),
    meta:makeIndex(`${(kb.names.countries[p.country] || {}).all || ''} ${p.field.map(fieldText).join(' ')} ${p.lang.map(langText).join(' ')} ${p.region === 'eu' ? 'европа europe еуропа' : ''} ${p.region === 'asia' ? 'азия asia корея' : ''} бакалавриат bachelor`)}));
  const grants = kb.grants.map(g => ({g, name:makeIndex(`${g.names} ${g.code || ''} ${g.id}`), meta:makeIndex(`${g.covers} ${g.who} стипендия грант scholarship`)}));
  const cat = kb.catalog.map(u => ({u, name:makeIndex(`${u.n} ${u.alt}`), meta:makeIndex(u.country)}));
  const facts = kb.facts.map(f => ({f, idx:makeIndex(`${f.k} ${f.ru}`)}));

  /* question + optional programme ids the student saved or is asking about */
  return function retrieve(question, {programIds = [], limit = {programs:4, grants:3, catalog:6, facts:4}} = {}){
    const q = [...new Set(tokens(question).map(stem))];
    const pick = (list, fn, n) => list.map(x => ({x, s:fn(x)})).filter(r => r.s > 0).sort((a, b) => b.s - a.s).slice(0, n).map(r => r.x);
    const asked = new Set(programIds);
    const P = [...kb.programs.filter(p => asked.has(p.id)),
      ...pick(progs, r => score(q, r.name, 3) + score(q, r.meta, 1), limit.programs).map(r => r.p).filter(p => !asked.has(p.id))].slice(0, limit.programs + asked.size);
    const G = pick(grants, r => score(q, r.name, 3) + score(q, r.meta, 1), limit.grants).map(r => r.g);
    const C = pick(cat, r => score(q, r.name, 3) + score(q, r.meta, 1), limit.catalog).map(r => r.u).filter(u => !P.some(p => p.uni.toLowerCase().includes(u.n.toLowerCase())));
    const F = pick(facts, r => score(q, r.idx, 1), limit.facts).map(r => r.f);
    return {programs:P, grants:G, catalog:C, facts:F};
  };
}

const R = v => v && typeof v === 'object' ? (v.ru ?? '') : (v ?? '');
const money = c => !c ? 'не подтверждено' : c.amount === 0 ? `бесплатно${c.note ? ' (' + R(c.note) + ')' : ''}`
  : `${c.min !== undefined ? (c.min === c.max ? c.min : c.min + '–' + c.max) : c.amount} ${c.currency} ${({year:'в год', semester:'за семестр', month:'в месяц'})[c.per] || ''}${c.year ? ' (' + c.year + ')' : c.amount !== undefined ? ' (учебный год не указан)' : ''}${c.note && c.amount !== 0 ? ' — ' + R(c.note) : ''}`;

/* Compact Russian text of one programme for the model, with sources. */
export function programText(p){
  const e = p.req.english;
  const school = Object.entries(p.req.school || {}).map(([k, s]) => `${k === 'any' ? '' : '[' + k + '] '}${R(s.text)}`).join(' ');
  const lines = [
    `[программа id=${p.id}] ${p.uni} — ${R(p.name)} (${p.country.toUpperCase()}${p.city ? ', ' + p.city : ''}); язык: ${p.lang.join(', ')}; ${R(p.duration) || 'длительность не подтверждена'}; данные для набора ${p.intake}; проверено ${p.checked}`,
    `Аттестат: ${school || 'не подтверждено'}`,
    `Английский: ${e ? `IELTS ${e.ielts}${e.sub ? ` (L${e.sub.l} R${e.sub.r} S${e.sub.s} W${e.sub.w})` : ''}. ${R(e.alt)}` : p.req.language ? R(p.req.language.text) : 'не подтверждено'}`,
    `Экзамены: ${(p.req.exams || []).map(x => `${R(x.name)}${x.date ? ' ' + x.date : ''}${x.text ? ' — ' + R(x.text) : ''}`).join('; ') || 'не подтверждено'}`,
    `Подготовительный этап: ${p.req.prep && p.req.prep.text ? R(p.req.prep.text) : p.req.prep && p.req.prep.needed === false ? 'не требуется' : 'не подтверждено'}`,
    (p.req.other || []).length ? `Ещё: ${p.req.other.map(R).join('; ')}` : '',
    `Обучение: ${money(p.costs.tuition)}. Проживание: ${money(p.costs.living)}`,
    `Финансирование: ${(p.funding || []).map(o => `${R(o.name)} — ${R(o.text)}${o.scope ? ' ' + R(o.scope) : ''}${o.deadline ? ` Срок: ${o.deadline.date}${o.deadline.confirmed ? '' : ' (примерно)'}${o.deadline.note ? ', ' + R(o.deadline.note) : ''}.` : ''} (${o.src})`).join(' | ') || R(p.fundingNote) || 'не подтверждено'}`,
    `Сроки: ${(p.deadlines || []).map(d => `${d.date} ${R(d.label)}${d.confirmed ? '' : ' (примерно)'}${d.note ? ' — ' + R(d.note) : ''}`).join('; ') || 'не подтверждено'}`,
    p.afterMissed ? `Если срок пропущен: ${R(p.afterMissed)}` : '',
    (p.unknown || []).length ? `Не подтверждено: ${p.unknown.map(R).join(', ')}` : '',
    `Ссылки: программа ${p.links.program}; поступление ${p.links.admission}${p.links.funding ? '; финансирование ' + p.links.funding : ''}`
  ];
  return lines.filter(Boolean).join('\n');
}

export function contextText(found){
  const parts = [];
  if (found.programs.length) parts.push('ПРОВЕРЕННЫЕ ПРОГРАММЫ:\n' + found.programs.map(programText).join('\n\n'));
  if (found.grants.length) parts.push('СТИПЕНДИИ:\n' + found.grants.map(g => `- ${g.name}: ${g.covers}; сроки: ${g.when}${g.approx ? ' (по прошлым годам)' : ''}; кому: ${g.who}; ${g.url}`).join('\n'));
  if (found.catalog.length) parts.push('КАТАЛОГ (только название, обычный срок и сайт; программы не проверены):\n' + found.catalog.map(u => `- ${u.n}${u.alt ? ' (' + u.alt + ')' : ''}, ${u.country.split(' ')[0]}: ${u.type}, обычно ${u.date}${u.approx ? ' (по прошлым годам)' : ''}; ${u.url}`).join('\n'));
  if (found.facts.length) parts.push('ФАКТЫ (проверено в ноябре 2026):\n' + found.facts.map(f => `- ${f.ru}${f.src ? ' (' + f.src + ')' : ''}`).join('\n'));
  return parts.join('\n\n') || 'По этому вопросу в базе ничего не нашлось.';
}

/* Links the answer may cite: every URL that appeared in the fragments. */
export function sourcesOf(found){
  const out = [];
  const add = (title, url) => { if (url && !out.some(s => s.url === url)) out.push({title, url}); };
  found.programs.forEach(p => { add(`${p.uni} — ${R(p.name)}`, p.links.program); add(`${p.uni}: поступление`, p.links.admission); if (p.links.funding) add(`${p.uni}: финансирование`, p.links.funding); });
  found.grants.forEach(g => add(g.name, g.url));
  found.catalog.forEach(u => add(u.n, u.url));
  found.facts.forEach(f => f.src && add(f.id, f.src));
  return out;
}
