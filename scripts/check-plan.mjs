// Run: node scripts/check-plan.mjs — prints the plan for the reference profile with two saved programmes.
import { buildPlan, planFocus } from '../src/lib/plan.js';
const profile = {grade:11, intake:2027, country:'kz', field:'psy', regions:['eu'], langs:['en'], english:'6.5', sat:'nousa', grades:'mid', extra:['project'], prep:['unsure'], funding:'full', budget:{amount:0, currency:'KZT'}};
const show = (name, state) => {
  const plan = buildPlan(state), f = planFocus(state, plan);
  console.log(`\n== ${name}`);
  plan.forEach(x => console.log(`  ${x.date} ${x.kind.padEnd(8)} ${x.approx ? '≈' : ' '}${x.asap ? ' ASAP' : ''}${x.missed ? ' MISSED' : ''}${x.info ? ' info' : ''}  ${typeof x.title === 'object' ? x.title.ru : x.title}`));
  console.log('  MAIN:', f.main && (f.main.title.ru || f.main.title), '| TOP:', f.top.map(x => x.title.ru || x.title).join(' / '));
};
show('no programmes saved', {profile, apps:[], done:{}});
show('ELTE + Groningen saved', {profile, done:{}, apps:[{id:'a1', programId:'elte-psy', name:'ELTE', status:'prep'}, {id:'a2', programId:'rug-psy', name:'RUG', status:'prep'}]});
show('IELTS none, grade 10 (intake 2028)', {profile:{...profile, grade:10, intake:2028, english:'none', extra:['none']}, done:{ielts1:true}, apps:[{id:'a1', programId:'elte-psy', name:'ELTE', status:'prep'}]});
