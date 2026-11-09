// Snapshot of the verified data for the Қоян server function: node scripts/build-kb.mjs -> functions/kb.json
// Runs automatically before `firebase deploy --only functions` (see firebase.json predeploy).
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { PROGRAMS, LANGS } from '../src/data/programs.js';
import { GRANTS } from '../src/data/grants.js';
import { catalogItems } from '../src/data/catalog.js';
import { FACTS } from '../src/data/facts.js';
import { FIELDS, UNI_COUNTRY, COUNTRIES, DEADLINE_TYPES } from '../src/data/reference.js';

const ru = v => v && typeof v === 'object' ? v.ru : v;
const all = v => v && typeof v === 'object' ? [v.ru, v.kz, v.en].filter(Boolean).join(' ') : (v || '');

const kb = {
  built:new Date().toISOString().slice(0, 10),
  programs:PROGRAMS,
  grants:GRANTS.map(g => ({id:g.id, name:ru(g.name), names:all(g.name), covers:ru(g.covers), when:ru(g.when), who:ru(g.who), url:g.url,
    dates:g.dates || [], approx:!!g.approx, only:g.only || null, region:g.region, code:g.code})),
  catalog:catalogItems().map(u => ({n:u.n, alt:u.alt || '', c:u.c, country:all(UNI_COUNTRY[u.c]), date:u.date, approx:u.approx, type:ru(DEADLINE_TYPES[u.type]), url:u.url})),
  facts:FACTS,
  names:{
    countries:Object.fromEntries(Object.entries(UNI_COUNTRY).map(([k, v]) => [k, {ru:ru(v), all:all(v)}])),
    home:Object.fromEntries(Object.entries(COUNTRIES).map(([k, v]) => [k, ru(v)])),
    fields:Object.fromEntries(FIELDS.map(([k, v]) => [k, {ru:ru(v), all:all(v)}])),
    langs:Object.fromEntries(Object.entries(LANGS).map(([k, v]) => [k, {ru:ru(v), all:all(v)}]))
  }
};
const out = fileURLToPath(new URL('../functions/kb.json', import.meta.url));
writeFileSync(out, JSON.stringify(kb));
console.log(`kb.json: ${kb.programs.length} programmes, ${kb.grants.length} scholarships, ${kb.catalog.length} catalogue rows, ${kb.facts.length} facts`);
