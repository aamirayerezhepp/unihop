/* Universities for the chances estimate (140). Names match the catalog, so "+ to my list" fills the deadline and link.
   c = country code, r = region, sel = rough selectivity on the same 0–6 scale as the student score,
   f = fields ('all' = broad), fund: aid = need-based aid, gov = government scholarship route, free = no/low tuition,
   low = moderate fees or strong merit aid, paid = expensive. note = a key in NOTES. */
const g = (ru, kz, en) => ({ru, kz, en});
const via = name => g(`Через ${name}`, `${name} арқылы`, `Through ${name}`);

export const NOTES = {
  nb:g('Need-blind финпомощь до полной стоимости','Толық құнына дейін need-blind қаржылай көмек','Need-blind aid up to the full cost'),
  na:g('Need-aware: помощь до полной стоимости, но просьба о ней влияет на решение','Need-aware: толық құнға дейін көмек, бірақ оны сұрау шешімге әсер етеді','Need-aware: aid up to the full cost, but asking for it affects the decision'),
  lac:g('Need-blind финпомощь, liberal arts','Need-blind қаржылай көмек, liberal arts','Need-blind aid, liberal arts'),
  merit:g('Стипендии за успехи, полной помощи почти нет','Үлгерім үшін стипендиялар, толық көмек жоқтың қасы','Merit scholarships; full aid is rare'),
  paid:g('Платно, финпомощи для иностранцев мало','Ақылы, шетелдіктерге қаржылай көмек аз','Expensive; little aid for internationals'),
  asu:g('Частичные скидки, полной помощи почти нет','Ішінара жеңілдіктер, толық көмек жоқтың қасы','Partial discounts; full aid is rare'),
  uk:g('Финпомощи для бакалавров почти нет','Бакалаврларға қаржылай көмек жоқтың қасы','Almost no aid for undergraduates'),
  ukf:g('После школы СНГ — обычно через Foundation year','ТМД мектебінен кейін — әдетте Foundation year арқылы','After a CIS school — usually via a Foundation year'),
  pearson:g('Есть стипендия Lester B. Pearson по номинации школы','Мектеп ұсынуы бойынша Lester B. Pearson стипендиясы бар','Lester B. Pearson scholarship by school nomination'),
  ubc:g('UBC International Scholars по номинации школы','Мектеп ұсынуы бойынша UBC International Scholars','UBC International Scholars by school nomination'),
  ca:g('Стипендии для иностранцев ограничены','Шетелдіктерге стипендиялар шектеулі','Limited scholarships for internationals'),
  defree:g('Без платы за обучение; нужен Studienkolleg','Оқу ақысыз; Studienkolleg керек','No tuition; Studienkolleg required'),
  depaid:g('Плата для иностранцев; нужен Studienkolleg','Шетелдіктер үшін ақылы; Studienkolleg керек','Fees for internationals; Studienkolleg required'),
  nl:g('Платно для студентов не из ЕС; есть NL Scholarship','ЕО-дан тыс студенттерге ақылы; NL Scholarship бар','Fees for non-EU students; NL Scholarship available'),
  dsu:g('Стипендия DSU по доходу семьи','Отбасы табысына қарай DSU стипендиясы','DSU grant based on family income'),
  isu:g('ISU Bocconi: помощь по доходу семьи','ISU Bocconi: отбасы табысына қарай көмек','ISU Bocconi: income-based aid'),
  fr:g('Невысокая плата в госвузах; подача через Campus France','Мемлекеттік ЖОО-ларда ақы төмен; Campus France арқылы','Low fees at public universities; apply via Campus France'),
  boutmy:g('Стипендия Emile-Boutmy для студентов не из ЕС','ЕО-дан тыс студенттерге Emile-Boutmy стипендиясы','Emile-Boutmy scholarship for non-EU students'),
  ch:g('Невысокая плата, но дорогая жизнь','Ақы төмен, бірақ өмір қымбат','Low fees but high living costs'),
  nordic:g('Платно для студентов не из ЕС; есть стипендии вуза','ЕО-дан тыс студенттерге ақылы; ЖОО стипендиялары бар','Fees for non-EU students; university scholarships available'),
  aalto:g('Aalto Excellence Scholarship — до 100% платы','Aalto Excellence Scholarship — ақының 100%-на дейін','Aalto Excellence Scholarship — up to 100% of fees'),
  cz:g('Бесплатно на чешском, на английском — платно','Чех тілінде тегін, ағылшынша — ақылы','Free in Czech; fees in English'),
  sh:via('Stipendium Hungaricum'),
  pl:g('Недорогая учёба и жизнь','Оқу мен тұрмыс арзан','Affordable tuition and living costs'),
  gks:via('GKS'), kaist:g('Стипендии вуза и GKS','ЖОО стипендиялары және GKS','University scholarships and GKS'),
  mext:via('MEXT'), csc:via('CSC'), tb:via('Türkiye Bursları'),
  hk:g('Belt and Road Scholarship — Казахстан в списке','Belt and Road Scholarship — Қазақстан тізімде','Belt and Road Scholarship — Kazakhstan is eligible'),
  sg:g('Tuition Grant с обязательной работой в Сингапуре','Сингапурда міндетті жұмыспен Tuition Grant','Tuition Grant with a work bond in Singapore'),
  nyuad:g('Финпомощь по нужде, до полной стоимости','Қажеттілікке қарай көмек, толық құнға дейін','Need-based aid up to the full cost')
};

const U = (n, c, r, sel, f, fund, note) => ({n, c, r, sel, f, fund, note});
const ALL = ['all'], TECH = ['it','eng'];

export const UNIS = [
  // USA — need-blind for internationals
  U('MIT','us','us',6,['it','eng','biz'],'aid','nb'), U('Harvard University','us','us',6,ALL,'aid','nb'), U('Yale University','us','us',6,ALL,'aid','nb'),
  U('Princeton University','us','us',6,ALL,'aid','nb'), U('Dartmouth College','us','us',5.5,ALL,'aid','nb'), U('Brown University','us','us',5.5,ALL,'aid','nb'),
  U('Amherst College','us','us',6,ALL,'aid','lac'), U('Bowdoin College','us','us',5.5,ALL,'aid','lac'), U('University of Notre Dame','us','us',5,ALL,'aid','nb'),
  // USA — need-aware
  U('Stanford University','us','us',6,ALL,'aid','na'), U('Columbia University','us','us',6,ALL,'aid','na'), U('Caltech','us','us',6,TECH,'aid','na'),
  U('Duke University','us','us',5.5,ALL,'aid','na'), U('University of Pennsylvania','us','us',5.5,ALL,'aid','na'), U('Cornell University','us','us',5.5,ALL,'aid','na'),
  U('University of Chicago','us','us',5.5,ALL,'aid','na'), U('Northwestern University','us','us',5.5,ALL,'aid','na'), U('Johns Hopkins University','us','us',5.5,ALL,'aid','na'),
  U('Rice University','us','us',5,ALL,'aid','na'), U('Vanderbilt University','us','us',5,ALL,'aid','na'), U('Washington University in St. Louis','us','us',5,ALL,'aid','na'),
  U('Emory University','us','us',4.5,ALL,'aid','na'), U('Tufts University','us','us',5,ALL,'aid','na'), U('Williams College','us','us',6,ALL,'aid','na'),
  U('Swarthmore College','us','us',5.5,ALL,'aid','na'), U('Pomona College','us','us',5.5,ALL,'aid','na'), U('Wellesley College','us','us',5,ALL,'aid','na'),
  U('Middlebury College','us','us',5,ALL,'aid','na'), U('Carleton College','us','us',4.5,ALL,'aid','na'), U('Grinnell College','us','us',4,ALL,'aid','na'),
  U('Davidson College','us','us',4.5,ALL,'aid','na'), U('Colby College','us','us',4.5,ALL,'aid','na'),
  // USA — paid
  U('Arizona State University','us','us',2,ALL,'paid','asu'), U('New York University','us','us',5,ALL,'paid','paid'), U('Boston University','us','us',4,ALL,'paid','paid'),
  U('University of Michigan','us','us',5,ALL,'paid','paid'), U('UC Berkeley','us','us',5.5,ALL,'paid','paid'), U('UCLA','us','us',5.5,ALL,'paid','paid'),
  U('UC San Diego','us','us',4.5,ALL,'paid','paid'), U('University of Illinois Urbana-Champaign','us','us',4.5,['it','eng','biz'],'paid','paid'),
  U('Georgia Tech','us','us',5,['it','eng','biz'],'paid','paid'), U('Purdue University','us','us',3.5,['it','eng','biz'],'paid','merit'),
  U('University of Texas at Austin','us','us',4.5,ALL,'paid','paid'), U('University of Washington','us','us',4,ALL,'paid','paid'),
  U('Northeastern University','us','us',4.5,ALL,'paid','merit'), U('University of Southern California','us','us',5,ALL,'paid','merit'),
  U('Carnegie Mellon University','us','us',5.5,['it','eng','design','biz'],'paid','paid'),
  // United Kingdom
  U('University of Oxford','uk','uk',6,ALL,'paid','uk'), U('University of Cambridge','uk','uk',6,ALL,'paid','uk'), U('Imperial College London','uk','uk',5.5,['it','eng','med','biz'],'paid','uk'),
  U('London School of Economics','uk','uk',5.5,['biz','law','psy'],'paid','uk'), U('University College London','uk','uk',5,ALL,'paid','uk'), U("King's College London",'uk','uk',4.5,ALL,'paid','uk'),
  U('University of Edinburgh','uk','uk',4.5,ALL,'paid','ukf'), U('University of Warwick','uk','uk',4.5,ALL,'paid','ukf'), U('University of St Andrews','uk','uk',4.5,ALL,'paid','ukf'),
  U('University of Manchester','uk','uk',3.5,ALL,'paid','ukf'), U('University of Bristol','uk','uk',4,ALL,'paid','ukf'), U('Durham University','uk','uk',4,ALL,'paid','ukf'),
  U('University of Glasgow','uk','uk',3.5,ALL,'paid','ukf'), U('University of Nottingham','uk','uk',3.5,ALL,'paid','ukf'), U('University of Birmingham','uk','uk',3.5,ALL,'paid','ukf'),
  U('University of Leeds','uk','uk',3.5,ALL,'paid','ukf'), U('University of Southampton','uk','uk',3.5,ALL,'paid','ukf'), U('University of Exeter','uk','uk',3.5,ALL,'paid','ukf'),
  // Canada
  U('University of Toronto','ca','ca',4.5,ALL,'paid','pearson'), U('University of British Columbia','ca','ca',4,ALL,'paid','ubc'), U('McGill University','ca','ca',4.5,ALL,'paid','ca'),
  U('University of Waterloo','ca','ca',4.5,TECH,'paid','ca'), U('McMaster University','ca','ca',4,ALL,'paid','ca'), U('Western University','ca','ca',3.5,ALL,'paid','ca'),
  U("Queen's University",'ca','ca',4,ALL,'paid','ca'), U('University of Alberta','ca','ca',3,ALL,'paid','ca'),
  // Europe
  U('TU München','de','eu',4.5,TECH,'low','depaid'), U('RWTH Aachen','de','eu',4,TECH,'free','defree'), U('LMU München','de','eu',4,ALL,'free','defree'),
  U('Heidelberg University','de','eu',4,ALL,'low','depaid'), U('Karlsruhe Institute of Technology','de','eu',4,TECH,'low','depaid'), U('TU Berlin','de','eu',3.5,TECH,'free','defree'),
  U('Humboldt University of Berlin','de','eu',4,ALL,'free','defree'), U('Freie Universität Berlin','de','eu',3.5,ALL,'free','defree'),
  U('Politecnico di Milano','it','eu',3.5,['eng','design','it'],'free','dsu'), U('University of Bologna','it','eu',2.5,ALL,'free','dsu'), U('Bocconi University','it','eu',4.5,['biz','law'],'low','isu'),
  U('Sapienza University of Rome','it','eu',2.5,ALL,'free','dsu'), U('University of Padua','it','eu',3,ALL,'free','dsu'), U('Politecnico di Torino','it','eu',3,['eng','it','design'],'free','dsu'),
  U('TU Delft','nl','eu',4.5,['eng','it','design'],'paid','nl'), U('University of Amsterdam','nl','eu',4,ALL,'paid','nl'), U('Leiden University','nl','eu',4,ALL,'paid','nl'),
  U('Utrecht University','nl','eu',3.5,ALL,'paid','nl'), U('University of Groningen','nl','eu',3,ALL,'paid','nl'), U('Erasmus University Rotterdam','nl','eu',4,['biz','med','law','psy'],'paid','nl'),
  U('Eindhoven University of Technology','nl','eu',4,['it','eng','design'],'paid','nl'),
  U('Sciences Po','fr','eu',5,['law','biz','psy'],'low','boutmy'), U('Sorbonne University','fr','eu',3.5,ALL,'low','fr'), U('Université Paris-Saclay','fr','eu',4,ALL,'low','fr'),
  U('ETH Zurich','ch','eu',5.5,['it','eng','design'],'low','ch'), U('EPFL','ch','eu',5,['it','eng','design'],'low','ch'),
  U('Lund University','se','eu',4,ALL,'paid','nordic'), U('KTH Royal Institute of Technology','se','eu',4,TECH,'paid','nordic'),
  U('University of Copenhagen','dk','eu',4,ALL,'paid','nordic'), U('Aalto University','fi','eu',4.5,['it','eng','biz','design'],'paid','aalto'),
  U('Charles University','cz','eu',2.5,ALL,'free','cz'), U('Czech Technical University in Prague','cz','eu',2.5,TECH,'free','cz'),
  U('BME','hu','eu',2,TECH,'gov','sh'), U('ELTE','hu','eu',2.5,ALL,'gov','sh'), U('University of Warsaw','pl','eu',2.5,ALL,'low','pl'),
  // Asia
  U('KAIST','kr','asia',4.5,TECH,'gov','kaist'), U('Seoul National University','kr','asia',5,ALL,'gov','gks'), U('Yonsei University','kr','asia',3.5,ALL,'gov','gks'),
  U('Korea University','kr','asia',4,ALL,'gov','gks'), U('POSTECH','kr','asia',4.5,TECH,'gov','gks'), U('Sungkyunkwan University','kr','asia',3.5,ALL,'gov','gks'),
  U('University of Tokyo','jp','asia',5.5,ALL,'gov','mext'), U('Kyoto University','jp','asia',5,ALL,'gov','mext'), U('Waseda University','jp','asia',4,ALL,'gov','mext'),
  U('Keio University','jp','asia',4,ALL,'gov','mext'), U('Tohoku University','jp','asia',3.5,ALL,'gov','mext'), U('Ritsumeikan Asia Pacific University','jp','asia',2.5,['biz','law','psy'],'low','merit'),
  U('Tsinghua University','cn','asia',5.5,['it','eng','biz'],'gov','csc'), U('Peking University','cn','asia',5.5,ALL,'gov','csc'), U('Zhejiang University','cn','asia',3.5,ALL,'gov','csc'),
  U('Fudan University','cn','asia',4.5,ALL,'gov','csc'), U('Shanghai Jiao Tong University','cn','asia',4.5,ALL,'gov','csc'), U('Nanjing University','cn','asia',4,ALL,'gov','csc'),
  U('University of Hong Kong','hk','asia',5,ALL,'gov','hk'), U('Chinese University of Hong Kong','hk','asia',4.5,ALL,'gov','hk'),
  U('HKUST','hk','asia',4.5,['it','eng','biz'],'gov','hk'), U('Hong Kong Polytechnic University','hk','asia',3.5,ALL,'gov','hk'),
  U('National University of Singapore','sg','asia',5.5,ALL,'low','sg'), U('Nanyang Technological University','sg','asia',5,ALL,'low','sg'),
  U('Singapore Management University','sg','asia',4,['biz','law','it'],'low','sg'), U('NYU Abu Dhabi','ae','asia',5.5,ALL,'aid','nyuad'),
  // Turkey
  U('Boğaziçi University','tr','tr',4,ALL,'gov','tb'), U('ODTÜ (METU)','tr','tr',3.5,TECH,'gov','tb'), U('Istanbul University','tr','tr',2,ALL,'gov','tb'),
  U('Bilkent University','tr','tr',3.5,ALL,'gov','tb'), U('Koç University','tr','tr',4,ALL,'low','merit'), U('Sabancı University','tr','tr',3.5,ALL,'low','merit')
];

export const FUND_OK = {
  full:['aid','gov','free'], partial:['aid','gov','free','low'], mid:['aid','gov','free','low'], any:['aid','gov','free','low','paid']
};
