// Run: node scripts/check-match.mjs — prints the matching for the reference profile from the spec.
import { matchAll, suggestions, unverified } from '../src/lib/match.js';
const P = {grade:11, intake:2027, country:'kz', field:'psy', regions:['eu'], langs:['en'], english:'6.5', sat:'nousa', grades:'mid', extra:['project'], prep:['unsure'], funding:'full', budget:{amount:0, currency:'KZT'}};
const show = (name, p) => {
  const r = matchAll(p);
  console.log(`\n== ${name}: pool ${r.pool}`);
  for (const k of ['fit', 'money', 'alt']) r[k].forEach(x => console.log(`  [${k}] ${x.pr.id}: adm=${x.adm.status} fund=${x.fund.status} next=${x.dl.next ? x.dl.next.date : '-'}${x.adm.miss.length ? ' | miss: ' + x.adm.miss.map(m => m.ru).join(' / ') : ''}${x.fund.miss.length ? ' | fmiss: ' + x.fund.miss.map(m => m.ru).join(' / ') : ''}`));
  console.log('  reasons', JSON.stringify(r.reasons), 'suggest', JSON.stringify(suggestions(p).map(s => [s.kind, s.arg, s.n])), 'unverified', unverified(p).length);
};
show('spec profile', P);
show('+ czech', {...P, langs:['en', 'cs']});
show('IELTS none, self 20000 EUR', {...P, english:'none', funding:'self', budget:{amount:20000, currency:'EUR'}});
show('KZ IT home+asia', {...P, field:'it', regions:['kz', 'asia'], english:'6.0'});
show('US psychology (no data)', {...P, regions:['us']});
