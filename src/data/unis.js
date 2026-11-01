/* Universities for the chances estimate. c = country code (see UNI_COUNTRY), r = region,
   sel = rough selectivity on the same 0–6 scale as the student score.
   fund: aid = need-based aid, gov = government scholarship route, free = no/low tuition, low = moderate fees, paid = expensive. */
const g = (ru, kz) => ({ru, kz});
const VIA = name => g(`Через ${name}`, `${name} арқылы`);

export const UNIS = [
  {n:'MIT', c:'us', r:'us', sel:6, f:['it','eng','biz'], fund:'aid', note:g('Need-blind финпомощь до полной стоимости','Толық құнына дейін need-blind қаржылай көмек')},
  {n:'Amherst College', c:'us', r:'us', sel:6, f:['all'], fund:'aid', note:g('Need-blind финпомощь, liberal arts','Need-blind қаржылай көмек, liberal arts')},
  {n:'Arizona State University', c:'us', r:'us', sel:2, f:['all'], fund:'paid', note:g('Частичные скидки, полной помощи почти нет','Ішінара жеңілдіктер, толық көмек жоқтың қасы')},
  {n:'University of Toronto', c:'ca', r:'ca', sel:4.5, f:['all'], fund:'paid', note:g('Есть стипендия Lester B. Pearson по номинации школы','Мектеп ұсынуы бойынша Lester B. Pearson стипендиясы бар')},
  {n:'University of British Columbia', c:'ca', r:'ca', sel:4, f:['all'], fund:'paid', note:g('Стипендии для иностранцев ограничены','Шетелдіктерге стипендиялар шектеулі')},
  {n:'Imperial College London', c:'uk', r:'uk', sel:5.5, f:['it','eng','med'], fund:'paid', note:g('Финпомощи для бакалавров почти нет','Бакалаврларға қаржылай көмек жоқтың қасы')},
  {n:'University of Manchester', c:'uk', r:'uk', sel:3.5, f:['all'], fund:'paid', note:g('После школы СНГ — обычно через Foundation year','ТМД мектебінен кейін — әдетте Foundation year арқылы')},
  {n:'TU München', c:'de', r:'eu', sel:4.5, f:['it','eng'], fund:'low', note:g('Плата для иностранцев; нужен Studienkolleg','Шетелдіктер үшін ақылы; Studienkolleg керек')},
  {n:'RWTH Aachen', c:'de', r:'eu', sel:4, f:['it','eng'], fund:'free', note:g('Без платы за обучение; нужен Studienkolleg','Оқу ақысыз; Studienkolleg керек')},
  {n:'TU Delft', c:'nl', r:'eu', sel:4.5, f:['eng','it','design'], fund:'paid', note:g('Платно для студентов не из ЕС','ЕО-дан тыс студенттерге ақылы')},
  {n:'Politecnico di Milano', c:'it', r:'eu', sel:3.5, f:['eng','design','it'], fund:'free', note:g('Стипендия DSU по доходу семьи','Отбасы табысына қарай DSU стипендиясы')},
  {n:'University of Bologna', c:'it', r:'eu', sel:2.5, f:['all'], fund:'free', note:g('Стипендия DSU по доходу семьи','Отбасы табысына қарай DSU стипендиясы')},
  {n:'Charles University', c:'cz', r:'eu', sel:2.5, f:['all'], fund:'free', note:g('Бесплатно на чешском, на английском — платно','Чех тілінде тегін, ағылшынша — ақылы')},
  {n:'BME', c:'hu', r:'eu', sel:2, f:['eng','it'], fund:'gov', note:VIA('Stipendium Hungaricum')},
  {n:'ELTE', c:'hu', r:'eu', sel:2.5, f:['all'], fund:'gov', note:VIA('Stipendium Hungaricum')},
  {n:'KAIST', c:'kr', r:'asia', sel:4.5, f:['it','eng'], fund:'gov', note:g('Стипендии вуза и GKS','ЖОО стипендиялары және GKS')},
  {n:'Yonsei University', c:'kr', r:'asia', sel:3.5, f:['all'], fund:'gov', note:VIA('GKS')},
  {n:'Waseda University', c:'jp', r:'asia', sel:4, f:['all'], fund:'gov', note:VIA('MEXT')},
  {n:'Tsinghua University', c:'cn', r:'asia', sel:5.5, f:['it','eng','biz'], fund:'gov', note:VIA('CSC')},
  {n:'Zhejiang University', c:'cn', r:'asia', sel:3.5, f:['all'], fund:'gov', note:VIA('CSC')},
  {n:'Boğaziçi University', c:'tr', r:'tr', sel:4, f:['all'], fund:'gov', note:VIA('Türkiye Bursları')},
  {n:'ODTÜ (METU)', c:'tr', r:'tr', sel:3.5, f:['eng','it'], fund:'gov', note:VIA('Türkiye Bursları')},
  {n:'Istanbul University', c:'tr', r:'tr', sel:2, f:['all'], fund:'gov', note:VIA('Türkiye Bursları')}
];

export const FUND_OK = {
  full:['aid','gov','free'], partial:['aid','gov','free','low'], mid:['aid','gov','free','low'], any:['aid','gov','free','low','paid']
};
