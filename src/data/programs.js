/* Verified programmes. Every value here was read on the official page named in `src` on the date in `checked`.
   Anything the official pages did not state is left null / listed in `unknown` and shown as "Не подтверждено".
   Do not add a programme or a number without reading the official page first.

   Shapes:
   lang: languages of instruction ('en', 'cs', 'hu', 'ru', 'kk', 'ko', ...).
   req.english: {ielts, sub:{l,r,s,w}, alt, src} — minimum IELTS Academic; null when not stated.
   req.school[country] or req.school.any: {status:'ok'|'check'|'no', text, src}
   req.exams: [{name, date, text, src}] — entrance tests and interviews.
   req.prep: {needed:true|false|null, text, src} — Foundation / Studienkolleg / language year.
   costs.tuition: {amount, currency, per:'year'|'semester', year, src} — amount 0 = no tuition fee.
   costs.living: {min, max, currency, per:'month'|'year'|'semester', note, src}
   funding: [{id, name, tuition:true|false, living:'full'|'partial'|'support'|false|null, text, countries, separate, competitive, deadline, src}]
   deadlines: [{key, label, date, end, confirmed, note, src}] — `date` is the last day; `end` marks rounds. */

const g = (ru, kz, en) => ({ru, kz, en});
export const CHECKED = '2026-11-08';

export const PROGRAMS = [
  {
    id:'rug-psy', uni:'University of Groningen', alt:'Гронинген Groningen RUG Нидерланды Голландия', country:'nl', region:'eu', city:'Groningen',
    name:'Psychology (EN), BSc', level:'bachelor', field:['psy'], lang:['en'],
    duration:g('3 года (180 EC)','3 жыл (180 EC)','3 years (180 EC)'), start:'2027-09-01', intake:2027,
    req:{
      school:{
        kz:{status:'check', text:g('В списке эквивалентов для Казахстана указан только сертификат NIS Grade 12. Обычного аттестата РК в списке нет; университет пишет, что рассматривает каждую заявку отдельно, а Foundation-годы при оценке не учитывает.',
          'Қазақстан үшін баламалар тізімінде тек NIS Grade 12 сертификаты көрсетілген. Қарапайым ҚР аттестаты тізімде жоқ; университет әр өтінішті жеке қарайтынын, ал Foundation жылдарын есепке алмайтынын жазады.',
          'For Kazakhstan, only the NIS Grade 12 Certificate is listed as equivalent. A regular Kazakhstan school certificate is not on the list; the university says it assesses each application individually and does not count Foundation years.'),
          src:'https://www.rug.nl/education/application-enrolment-tuition-fees/admission/non-dutch-qualification/bachelor/bachelor-entry-requirements/bachelorlinkscountry/kazakhstan'},
        any:{status:'check', text:g('Нужен диплом, равноценный нидерландскому VWO. Если твоей страны нет в списке, университет советует всё равно подать заявку — её оценят индивидуально.',
          'Нидерландтық VWO-ға тең диплом керек. Егер елің тізімде болмаса, университет бәрібір өтініш беруге кеңес береді — оны жеке бағалайды.',
          'You need a diploma equivalent to the Dutch VWO. If your country is not listed, the university encourages you to apply anyway — it is assessed individually.'),
          src:'https://www.rug.nl/education/application-enrolment-tuition-fees/admission/non-dutch-qualification/bachelor/bachelor-entry-requirements/vwo-equivalent-qualifications'}
      },
      english:{ielts:6.5, sub:{l:6.0, r:6.0, s:6.5, w:6.5}, alt:g('Также принимают TOEFL iBT, Pearson (66), LanguageCert (70), Cambridge C1/C2. Результаты для студентов не из ЕС — до 1 июля.','TOEFL iBT, Pearson (66), LanguageCert (70), Cambridge C1/C2 да қабылданады. ЕО-дан тыс студенттер нәтижені 1 шілдеге дейін береді.','TOEFL iBT, Pearson (66), LanguageCert (70) and Cambridge C1/C2 are also accepted. Non-EU applicants send results by 1 July.'),
        src:'https://www.rug.nl/gmw/bachelors/psychology/bachelor-psychology-english?lang=en'},
      grades:{min:null, text:g('Порог оценок не указан: при отборе оценки и резюме не учитываются.','Баға шегі көрсетілмеген: іріктеуде бағалар мен түйіндеме ескерілмейді.','No grade threshold: grades and CV are not considered in selection.'), src:'https://www.rug.nl/gmw/psychology/education/bachelor/about-selection/'},
      exams:[{name:g('Отборочный онлайн-тест','Іріктеу онлайн-тесті','Online selection test'), date:'2027-03-06',
        text:g('225 мест. Итог = 50% тест + 50% лотерея. Темы: введение в психологию, статистика, социальная психология; материалы — с 1 декабря 2026.','225 орын. Нәтиже = 50% тест + 50% лотерея. Тақырыптар: психологияға кіріспе, статистика, әлеуметтік психология; материалдар 2026 жылғы 1 желтоқсаннан.','225 places. Final score = 50% test + 50% lottery. Topics: introduction to psychology, statistics, social psychology; study material from 1 December 2026.'),
        src:'https://www.rug.nl/gmw/psychology/education/bachelor/about-selection/'}],
      prep:{needed:false, text:g('Foundation-год при оценке диплома не учитывается.','Foundation жылы диплом бағалауда ескерілмейді.','A Foundation year is not counted when the diploma is assessed.'), src:'https://www.rug.nl/education/application-enrolment-tuition-fees/admission/non-dutch-qualification/bachelor/bachelor-entry-requirements/vwo-equivalent-qualifications'},
      other:[g('Регистрационный сбор €100 для иностранных дипломов','Шетелдік дипломдар үшін €100 тіркеу алымы','€100 application fee for non-Dutch diplomas'), g('Виза и вид на жительство для студентов не из ЕС оформляются через университет','ЕО-дан тыс студенттерге виза мен тұруға рұқсатты университет арқылы рәсімдейді','Visa and residence permit for non-EU students are arranged through the university')]
    },
    costs:{
      tuition:{amount:14400, currency:'EUR', per:'year', year:'2027/28', src:'https://www.rug.nl/education/application-enrolment-tuition-fees/tuition-fee/bachelor'},
      living:{min:800, max:1000, currency:'EUR', per:'month', note:g('оценка университета, без учёта платы за обучение','университеттің бағасы, оқу ақысынсыз','university estimate, excluding tuition'), src:'https://www.rug.nl/education/bachelor/international-students/financial-matters/living-expenses'}
    },
    funding:[],
    fundingNote:g('Стипендий для бакалавров не из ЕС на страницах университета не нашли. Проверь поиск стипендий Grantfinder.','Университет беттерінен ЕО-дан тыс бакалаврларға стипендия таппадық. Grantfinder іздеуін тексер.','We found no scholarships for non-EU bachelor students on the university pages. Check the Grantfinder search.'),
    fundingLink:'https://www.rug.nl/education/scholarships/findscholarships',
    deadlines:[
      {key:'apply', label:g('Подача через Studielink','Studielink арқылы өтініш','Apply via Studielink'), date:'2027-01-15', confirmed:true, src:'https://www.rug.nl/bachelors/psychology-en/'},
      {key:'test', label:g('Отборочный тест','Іріктеу тесті','Selection test'), date:'2027-03-06', confirmed:true, src:'https://www.rug.nl/gmw/psychology/education/bachelor/about-selection/'},
      {key:'rank', label:g('Номера в рейтинге','Рейтингтегі нөмірлер','Ranking numbers'), date:'2027-04-15', confirmed:true, info:true, src:'https://www.rug.nl/gmw/psychology/education/bachelor/about-selection/'}
    ],
    afterMissed:g('Приём идёт раз в год. Если срок пропущен — можно подать на набор следующего года.','Қабылдау жылына бір рет. Мерзім өтіп кетсе — келесі жылғы қабылдауға өтінуге болады.','There is one intake a year. If you miss it, you can apply for the following year.'),
    steps:[{key:'test-prep', date:'2026-12-01', src:'https://www.rug.nl/gmw/psychology/education/bachelor/about-selection/',
      title:g('Готовиться к отборочному тесту Groningen','Groningen іріктеу тестіне дайындалу','Prepare for the Groningen selection test'),
      detail:g('Материалы публикуют 1 декабря 2026, тест — 6 марта 2027: введение в психологию, статистика, социальная психология.','Материалдар 2026 жылғы 1 желтоқсанда жарияланады, тест — 2027 жылғы 6 наурызда: психологияға кіріспе, статистика, әлеуметтік психология.','Material is published on 1 December 2026; the test is on 6 March 2027: introduction to psychology, statistics, social psychology.')}],
    links:{program:'https://www.rug.nl/bachelors/psychology-en/', admission:'https://www.rug.nl/gmw/psychology/education/bachelor/about-selection/', funding:'https://www.rug.nl/education/scholarships/findscholarships'},
    unknown:[g('стипендии для бакалавров','бакалавриатқа стипендиялар','bachelor scholarships')],
    checked:CHECKED
  },

  {
    id:'elte-psy', uni:'Eötvös Loránd University (ELTE)', alt:'ЭЛТЕ ELTE Будапешт Венгрия', country:'hu', region:'eu', city:'Budapest',
    name:'Psychology BA', level:'bachelor', field:['psy'], lang:['en'],
    duration:g('3 года (6 семестров, 180 ECTS)','3 жыл (6 семестр, 180 ECTS)','3 years (6 semesters, 180 ECTS)'), start:'2027-09-01', intake:2027,
    req:{
      school:{any:{status:'check', text:g('Нужен аттестат, равноценный венгерскому аттестату зрелости. Принимается ли аттестат твоей страны — уточни у приёмной комиссии.',
        'Венгрияның кемелдік аттестатына тең аттестат керек. Еліңнің аттестаты қабылдана ма — қабылдау комиссиясынан нақтыла.',
        'You need a certificate equivalent to the Hungarian certificate of matriculation. Check with admissions whether your country\'s certificate qualifies.'), src:'https://ppk.elte.hu/en/node/238347'}},
      english:{ielts:6.5, sub:null, alt:g('Или Cambridge B2, или TOEFL iBT 79–93. Если ты учился(ась) в школе на английском, это тоже может подойти.','Немесе Cambridge B2, немесе TOEFL iBT 79–93. Мектепте ағылшынша оқысаң, бұл да жарауы мүмкін.','Or Cambridge B2, or TOEFL iBT 79–93. Schooling in English can also count.'), src:'https://apply.elte.hu/enter/200'},
      grades:{min:null, text:g('Порог оценок не указан; нужны оценки за последние два года с переводом на английский.','Баға шегі көрсетілмеген; соңғы екі жылдың бағалары ағылшынша аудармасымен керек.','No grade threshold stated; you need the last two years of grades with an English translation.'), src:'https://ppk.elte.hu/en/node/238347'},
      exams:[{name:g('Устный вступительный экзамен','Ауызша қабылдау емтиханы','Oral entrance exam'), date:null,
        text:g('Час на чтение научно-популярной статьи по психологии, затем беседа. 60 баллов — беседа и английский, 40 — мотивационное письмо, резюме и впечатление комиссии. Можно онлайн через Teams.','Психология туралы ғылыми-көпшілік мақаланы оқуға бір сағат, содан кейін әңгіме. 60 балл — әңгіме мен ағылшын тілі, 40 — мотивациялық хат, түйіндеме және комиссия әсері. Teams арқылы онлайн болады.','One hour to read a popular-science psychology article, then a discussion. 60 points for the discussion and English, 40 for the motivation letter, CV and the committee\'s impression. Can be taken online via Teams.'),
        src:'https://ppk.elte.hu/en/node/238347'}],
      prep:{needed:false, text:null, src:null},
      other:[g('Мотивационное письмо 1500–2500 знаков и резюме','1500–2500 таңбалық мотивациялық хат және түйіндеме','Motivation letter of 1,500–2,500 characters and a CV'), g('Сбор за заявку: €180 до 31 января, €240 до 31 мая, €300 до 8 июня 2027','Өтініш алымы: 31 қаңтарға дейін €180, 31 мамырға дейін €240, 8 маусымға дейін €300 (2027)','Application fee: €180 until 31 January, €240 until 31 May, €300 until 8 June 2027')]
    },
    costs:{
      tuition:{amount:4700, currency:'EUR', per:'semester', year:null, src:'https://apply.elte.hu/enter/200'},
      living:null
    },
    funding:[{
      id:'sh', name:'Stipendium Hungaricum', tuition:true, living:'support',
      text:g('Покрывает обучение и поддерживает проживание. Размер ежемесячной стипендии мы не подтвердили. Нужна номинация от партнёра в твоей стране, заявка подаётся отдельно через портал стипендии; два семестра обязателен венгерский язык.',
        'Оқуды өтейді және тұруға қолдау көрсетеді. Ай сайынғы стипендия мөлшерін растамадық. Еліңдегі серіктестің номинациясы керек, өтініш стипендия порталы арқылы бөлек беріледі; екі семестр венгр тілі міндетті.',
        'Covers tuition and supports accommodation. We have not confirmed the monthly stipend amount. You need a nomination from the partner in your country; you apply separately on the scholarship portal; two semesters of Hungarian are compulsory.'),
      countries:['kz','kg','uz','ru'], separate:true, competitive:true,
      scope:g('В официальном списке 2026/27 направление «Psychology, BA» открыто для Казахстана, Кыргызстана, Узбекистана и России. Участвует ли именно эта программа ELTE — нужно уточнить.',
        '2026/27 ресми тізімінде «Psychology, BA» бағыты Қазақстан, Қырғызстан, Өзбекстан және Ресей үшін ашық. Дәл осы ELTE бағдарламасы қатыса ма — нақтылау керек.',
        'In the official 2026/27 list, "Psychology, BA" is open to Kazakhstan, Kyrgyzstan, Uzbekistan and Russia. Whether this exact ELTE programme takes part needs checking.'),
      deadline:{date:'2027-01-15', confirmed:false, note:g('Срок на 2027/28 ещё не опубликован; на 2026/27 заявки принимали до 15 января 2026.','2027/28 мерзімі әлі жарияланбаған; 2026/27 үшін өтініш 2026 жылғы 15 қаңтарға дейін қабылданды.','The 2027/28 deadline is not published yet; for 2026/27 applications closed on 15 January 2026.')},
      src:'https://stipendiumhungaricum.hu/apply'
    }],
    deadlines:[
      {key:'early', group:'round', label:g('Ранняя подача','Ерте өтініш','Early-bird round'), date:'2027-01-31', confirmed:true, src:'https://apply.elte.hu/enter/200'},
      {key:'regular', group:'round', label:g('Основная подача','Негізгі өтініш','Regular round'), date:'2027-05-31', confirmed:true, src:'https://apply.elte.hu/enter/200'},
      {key:'late', group:'round', label:g('Поздняя подача','Кеш өтініш','Late round'), date:'2027-06-08', confirmed:true, src:'https://apply.elte.hu/enter/200'}
    ],
    afterMissed:g('После 8 июня 2027 подать на 2027 год уже нельзя — следующий набор через год.','2027 жылғы 8 маусымнан кейін 2027 жылға өтініш беру мүмкін емес — келесі қабылдау бір жылдан кейін.','After 8 June 2027 you can no longer apply for 2027 — the next intake is a year later.'),
    steps:[{key:'letter', ref:'early', before:21, src:'https://ppk.elte.hu/en/node/238347',
      title:g('Мотивационное письмо и резюме для ELTE','ELTE үшін мотивациялық хат және түйіндеме','Motivation letter and CV for ELTE'),
      detail:g('1500–2500 знаков, своими словами. Қоян поможет со структурой, но не напишет текст за тебя.','1500–2500 таңба, өз сөзіңмен. Қоян құрылымына көмектеседі, бірақ мәтінді сен үшін жазбайды.','1,500–2,500 characters, in your own words. Qoyan helps with structure but will not write it for you.')}],
    letter:{min:1500, max:2500, src:'https://ppk.elte.hu/en/node/238347'},
    links:{program:'https://ppk.elte.hu/en/node/238347', admission:'https://apply.elte.hu/enter/200', funding:'https://stipendiumhungaricum.hu/apply'},
    unknown:[g('расходы на жизнь','тұрмыс шығындары','living costs'), g('учебный год, к которому относится плата','ақы қай оқу жылына жататыны','the academic year the fee applies to')],
    checked:CHECKED
  },

  {
    id:'cuni-psy', uni:'Charles University (Univerzita Karlova)', alt:'Карлов университет Прага Чехия', country:'cz', region:'eu', city:'Praha',
    name:'Psychologie (Bc.)', level:'bachelor', field:['psy'], lang:['cs'],
    duration:null, start:null, intake:2027,
    req:{
      school:{any:{status:'check', text:g('Нужно законченное среднее образование. Требуется ли признание (нострификация) аттестата — уточни.','Аяқталған орта білім керек. Аттестатты тану (нострификация) керек пе — нақтыла.','Completed secondary education is required. Check whether your certificate needs recognition (nostrification).'), src:'https://cuni.cz/UKEN-1634.html'}},
      english:null,
      language:{text:g('Обучение на чешском. Требуемый уровень чешского мы не подтвердили.','Оқу чех тілінде. Чех тілінің талап етілетін деңгейін растамадық.','Taught in Czech. We have not confirmed the required Czech level.'), src:'https://cuni.cz/UKEN-372.html'},
      grades:{min:null, text:null, src:null},
      exams:[],
      prep:{needed:null, text:null, src:null},
      other:[]
    },
    costs:{
      tuition:{amount:0, currency:'CZK', per:'year', year:null, note:g('Обучение на чешском бесплатное (плата — только при превышении срока обучения больше чем на год).','Чех тіліндегі оқу тегін (оқу мерзімін бір жылдан асырғанда ғана ақы алынады).','Study in Czech is free (a fee applies only if you exceed the standard length by more than a year).'), src:'https://cuni.cz/UKEN-372.html'},
      living:null
    },
    funding:[],
    fundingNote:g('Бесплатное обучение — не полный грант: жильё и жизнь оплачиваешь сам.','Тегін оқу — толық грант емес: тұрғын үй мен тұрмысты өзің төлейсің.','Free tuition is not a full scholarship: you pay for housing and living yourself.'),
    deadlines:[{key:'apply', label:g('Подача заявления (программы на чешском)','Өтініш беру (чех тіліндегі бағдарламалар)','Application (Czech-taught programmes)'), date:'2027-02-28', from:'2026-11-01', confirmed:true, src:'https://www.ff.cuni.cz/prijimaci-rizeni/pred-prijimackami/'}],
    afterMissed:null,
    links:{program:'https://www.ff.cuni.cz/prijimaci-rizeni/pred-prijimackami/', admission:'https://www.ff.cuni.cz/prijimaci-rizeni/pred-prijimackami/', funding:'https://cuni.cz/UKEN-372.html'},
    unknown:[g('уровень чешского','чех тілінің деңгейі','required Czech level'), g('формат вступительного экзамена','қабылдау емтиханының форматы','entrance exam format'), g('длительность','ұзақтығы','duration'), g('расходы на жизнь','тұрмыс шығындары','living costs')],
    checked:CHECKED
  },

  ...['cs', 'econ'].map(k => ({
    id:'nu-' + k, uni:'Nazarbayev University', alt:'Назарбаев Университет НУ NU Астана', country:'kz', region:'kz', city:'Astana',
    name:k === 'cs' ? 'BS in Computer Science' : 'BA in Economics', level:'bachelor', field:k === 'cs' ? ['it'] : ['biz'], lang:['en'],
    duration:g('4 года','4 жыл','4 years'), start:null, intake:2027,
    req:{
      school:{any:{status:'ok', text:g('Нужен один академический результат на выбор: средний балл 4.0 из 5.0, ЕНТ на английском от 85 (математика 8/10, чтение 8/10), SAT от 1240 или ACT от 26, IB или A-level/NIS (на разных страницах NU пороги отличаются: IB 27 или 30, A-level BBB или ABB), NUET от 120 (не меньше 50 по каждому предмету).',
        'Таңдауыңа бір академиялық нәтиже керек: орташа балл 5.0-дан 4.0, ағылшынша ҰБТ 85-тен (математика 8/10, оқу 8/10), SAT 1240-тан немесе ACT 26-дан, IB немесе A-level/NIS (NU беттерінде шектер әртүрлі: IB 27 не 30, A-level BBB не ABB), NUET 120-дан (әр пәннен кемінде 50).',
        'You need one academic result of your choice: GPA 4.0 out of 5.0, UNT in English 85+ (maths 8/10, reading 8/10), SAT 1240+ or ACT 26+, IB or A-level/NIS (NU pages differ: IB 27 or 30, A-level BBB or ABB), or NUET 120+ (at least 50 in each subject).'),
        src:'https://nu.edu.kz/?p=12745'}},
      english:{ielts:6.0, sub:{l:5.5, r:5.5, s:5.5, w:6.0}, alt:g('Условное зачисление возможно с IELTS 5.5. Для Foundation Year (NUFYP) — IELTS 5.5. IELTS Online и TOEFL Home Edition не принимают.','IELTS 5.5-пен шартты қабылдау болады. Foundation Year (NUFYP) үшін — IELTS 5.5. IELTS Online мен TOEFL Home Edition қабылданбайды.','Conditional admission is possible with IELTS 5.5. Foundation Year (NUFYP) needs IELTS 5.5. IELTS Online and TOEFL Home Edition are not accepted.'), src:'https://nu.edu.kz/?p=12745'},
      grades:{min:null, text:null, src:null},
      exams:[{name:g('NUET (если поступаешь по категории NUET)','NUET (NUET санаты бойынша түссең)','NUET (if you apply in the NUET category)'), date:null, text:g('Даты NUET 2027 ещё не объявлены. Для госгранта нужно не меньше 120 баллов.','NUET 2027 күндері әлі жарияланбаған. Мемлекеттік грант үшін кемінде 120 балл керек.','NUET 2027 dates are not announced yet. A state grant needs at least 120 points.'), src:'https://nu.edu.kz/?p=14609'}],
      prep:{needed:false, text:g('Если баллов не хватает, есть Foundation Year (NUFYP).','Балл жетпесе, Foundation Year (NUFYP) бар.','If your scores are short, there is a Foundation Year (NUFYP).'), src:'https://nu.edu.kz/?p=12745'},
      other:[]
    },
    costs:{
      tuition:{amount:15000, currency:'USD', per:'year', year:'2026/27', note:g('Плата на 2027/28 ещё не опубликована. Для резидентов РК платежи в тенге по внутреннему курсу NU.','2027/28 ақысы әлі жарияланбаған. ҚР резиденттері NU ішкі бағамы бойынша теңгемен төлейді.','The 2027/28 fee is not published yet. Kazakhstan residents pay in tenge at NU\'s internal rate.'), src:'https://nu.edu.kz/?p=12745'},
      living:null
    },
    funding:[{
      id:'nu-grant', name:g('Финансовая поддержка / госгрант NU','NU қаржылай қолдауы / мемлекеттік грант','NU financial support / state grant'), tuition:null, living:null,
      text:g('Гражданин РК подаёт заявку на финансовую поддержку в выбранной категории (NUET, SAT/ACT, олимпиады, IB, A-level/NIS, NUFYP). Что именно покрывает грант (обучение, стипендия, общежитие), на прочитанных страницах не указано. Обычное поступление без этой заявки — платное.',
        'ҚР азаматы таңдаған санат бойынша (NUET, SAT/ACT, олимпиадалар, IB, A-level/NIS, NUFYP) қаржылай қолдауға өтініш береді. Грант нақты нені өтейтіні (оқу, стипендия, жатақхана) оқылған беттерде көрсетілмеген. Бұл өтінішсіз кәдімгі түсу — ақылы.',
        'Kazakhstan citizens apply for financial support in a chosen category (NUET, SAT/ACT, olympiads, IB, A-level/NIS, NUFYP). What the grant covers (tuition, stipend, dormitory) is not stated on the pages we read. Regular admission without this application is fee-paying.'),
      countries:['kz'], separate:true, competitive:true,
      deadline:{date:'2027-02-02', confirmed:true, note:g('Для категории NUET — до 11 декабря 2026, 14:00 по Астане; для остальных — до 2 февраля 2027.','NUET санаты үшін — 2026 жылғы 11 желтоқсанға дейін, Астана уақытымен 14:00; қалғандары үшін — 2027 жылғы 2 ақпанға дейін.','NUET category: by 11 December 2026, 2 p.m. Astana time; other categories: by 2 February 2027.')},
      src:'https://nu.edu.kz/?p=14609'
    }],
    deadlines:[
      {key:'nuet-aid', label:g('Заявка на финподдержку (категория NUET)','Қаржылай қолдауға өтініш (NUET санаты)','Financial-support application (NUET category)'), date:'2026-12-11', confirmed:true, src:'https://nu.edu.kz/?p=14609'},
      {key:'ielts-other', label:g('Результаты IELTS/TOEFL (не NUET)','IELTS/TOEFL нәтижелері (NUET емес)','IELTS/TOEFL results (non-NUET)'), date:'2027-01-28', confirmed:true, src:'https://nu.edu.kz/?p=14609'},
      {key:'aid-other', label:g('Заявка на финподдержку (остальные категории)','Қаржылай қолдауға өтініш (басқа санаттар)','Financial-support application (other categories)'), date:'2027-02-02', confirmed:true, src:'https://nu.edu.kz/?p=14609'},
      {key:'regular', label:g('Платное поступление: результаты IELTS/TOEFL','Ақылы түсу: IELTS/TOEFL нәтижелері','Fee-paying track: IELTS/TOEFL results'), date:'2027-06-01', confirmed:true, src:'https://nu.edu.kz/?p=12745'}
    ],
    afterMissed:g('Если сроки финподдержки прошли, остаётся платное поступление (до 1 июня 2027) или набор следующего года.','Қаржылай қолдау мерзімі өтсе, ақылы түсу (2027 жылғы 1 маусымға дейін) немесе келесі жылғы қабылдау қалады.','If the financial-support deadlines pass, the fee-paying track (until 1 June 2027) or next year\'s intake remain.'),
    steps:[{key:'category', ref:'nuet-aid', before:21, src:'https://nu.edu.kz/?p=14609',
      title:g('Выбрать категорию поступления в NU и следить за датами NUET','NU-ға түсу санатын таңдап, NUET күндерін бақылау','Choose your NU admission category and watch for NUET dates'),
      detail:g('Даты NUET 2027 объявят позже; для госгранта по NUET нужно от 120 баллов.','NUET 2027 күндерін кейін жариялайды; NUET бойынша мемлекеттік грантқа 120 балдан керек.','NUET 2027 dates will be announced later; a state grant via NUET needs 120+ points.')}],
    links:{program:'https://nu.edu.kz/admissions/programs/', admission:'https://nu.edu.kz/?p=12745', funding:'https://nu.edu.kz/?p=14609'},
    unknown:[g('что покрывает грант','грант нені өтейді','what the grant covers'), g('плата на 2027/28','2027/28 ақысы','the 2027/28 fee'), g('расходы на жизнь','тұрмыс шығындары','living costs')],
    checked:CHECKED
  })),

  {
    id:'kaist-ug', uni:'KAIST', alt:'КАИСТ Корея', country:'kr', region:'asia', city:'Daejeon',
    name:g('Бакалавриат (первый курс без выбора специальности)','Бакалавриат (бірінші курс мамандықсыз)','Undergraduate (undeclared major in the first year)'),
    level:'bachelor', field:['it', 'eng'], lang:['en'],
    duration:g('4 года (8 семестров)','4 жыл (8 семестр)','4 years (8 semesters)'), start:'2027-08-31', intake:2027,
    langNote:g('Сайт KAIST пишет, что с 2008 года английский — основной язык преподавания.','KAIST сайты 2008 жылдан бері ағылшын тілі — негізгі оқыту тілі екенін жазады.','KAIST says English has been the main language of teaching since 2008.'),
    req:{
      school:{any:{status:'check', text:g('Школу нужно окончить до 31 августа 2027. Ни один из родителей не должен быть гражданином Кореи.','Мектепті 2027 жылғы 31 тамызға дейін бітіру керек. Ата-анаңның ешқайсысы Корея азаматы болмауы тиіс.','You must graduate from high school by 31 August 2027. Neither parent may be a Korean citizen.'), src:'https://admission.kaist.ac.kr/intl-undergraduate/before/sub02'}},
      english:null,
      grades:{min:null, text:null, src:null},
      exams:[{name:g('Интервью (если пригласят)','Сұхбат (шақырса)','Interview (if required)'), date:'2027-03-03', text:null, src:'https://admission.kaist.ac.kr/intl-undergraduate/application/ApplicationGuide/ApplicationTimeline'}],
      prep:{needed:false, text:null, src:null},
      other:[g('Рекомендательные письма — до 21 января 2027','Ұсыным хаттар — 2027 жылғы 21 қаңтарға дейін','Recommendation letters by 21 January 2027')]
    },
    costs:{
      tuition:{amount:6866000, currency:'KRW', per:'year', year:null, src:'https://admission.kaist.ac.kr/intl-undergraduate/support/coa'},
      living:{min:6803000, max:6803000, currency:'KRW', per:'year', note:g('жильё и питание по оценке KAIST (664 000 + 2 737 500 ₩ за семестр)','KAIST бағасы бойынша тұрғын үй мен тамақ (семестріне 664 000 + 2 737 500 ₩)','housing and food per KAIST estimate (₩664,000 + ₩2,737,500 per semester)'), src:'https://admission.kaist.ac.kr/intl-undergraduate/support/coa'}
    },
    funding:[{
      id:'kaist-sch', name:'KAIST Scholarship', tuition:true, living:'partial',
      text:g('Полное освобождение от платы за 8 семестров, 350 000 ₩ в месяц на жизнь и медстраховка. После первого курса нужен средний балл не ниже 2.7 из 4.3. Отдельной заявки нет — нужно отметить «KAIST scholarship» в анкете.',
        '8 семестрге толық ақыдан босату, айына 350 000 ₩ тұрмысқа және медициналық сақтандыру. Бірінші курстан кейін орташа балл 4.3-тен кемінде 2.7 болуы керек. Бөлек өтініш жоқ — сауалнамада «KAIST scholarship» белгілеу керек.',
        'Full tuition waiver for 8 semesters, ₩350,000 a month for living and health insurance. After the first year you need a GPA of at least 2.7 out of 4.3. No separate application — tick "KAIST scholarship" on the form.'),
      monthly:{amount:350000, currency:'KRW'}, countries:null, separate:false, competitive:false,
      deadline:null, src:'https://admission.kaist.ac.kr/intl-undergraduate/support/scholarships/kaist'
    }],
    deadlines:[
      {key:'regular', label:g('Основной набор (осень 2027)','Негізгі қабылдау (2027 күз)','Regular round (Fall 2027)'), date:'2027-01-14', from:'2026-11-10', confirmed:true, note:g('18:00 по Корее. Ранний набор закрылся 22 октября 2026.','Корея уақытымен 18:00. Ерте қабылдау 2026 жылғы 22 қазанда жабылды.','6 p.m. Korea time. The early round closed on 22 October 2026.'), src:'https://admission.kaist.ac.kr/intl-undergraduate/application/ApplicationGuide/ApplicationTimeline'},
      {key:'recs', label:g('Рекомендательные письма','Ұсыным хаттар','Recommendation letters'), date:'2027-01-21', confirmed:true, src:'https://admission.kaist.ac.kr/intl-undergraduate/application/ApplicationGuide/ApplicationTimeline'}
    ],
    afterMissed:g('После 14 января 2027 подать на осень 2027 нельзя; следующий ранний набор — осенью 2027.','2027 жылғы 14 қаңтардан кейін 2027 күзіне өтініш беру мүмкін емес; келесі ерте қабылдау — 2027 жылдың күзінде.','After 14 January 2027 you cannot apply for Fall 2027; the next early round is in autumn 2027.'),
    steps:[{key:'recs-ask', ref:'recs', before:35, src:'https://admission.kaist.ac.kr/intl-undergraduate/application/ApplicationGuide/ApplicationTimeline',
      title:g('Попросить двух учителей о рекомендациях для KAIST','KAIST үшін екі мұғалімнен ұсыным сұрау','Ask two teachers for KAIST recommendations'),
      detail:g('Письма нужны до 21 января 2027. Дай учителям месяц и список своих достижений.','Хаттар 2027 жылғы 21 қаңтарға дейін керек. Мұғалімдерге бір ай және жетістіктер тізімін бер.','Letters are due by 21 January 2027. Give teachers a month and a list of your achievements.')}],
    links:{program:'https://admission.kaist.ac.kr/intl-undergraduate/', admission:'https://admission.kaist.ac.kr/intl-undergraduate/application/ApplicationGuide/ApplicationTimeline', funding:'https://admission.kaist.ac.kr/intl-undergraduate/support/scholarships/kaist'},
    unknown:[g('требования к английскому','ағылшын тіліне талаптар','English requirements'), g('учебный год, к которому относится плата','ақы қай оқу жылына жататыны','the academic year the fee applies to')],
    checked:CHECKED
  }
];

export const programById = id => PROGRAMS.find(p => p.id === id);

/* Languages a student can pick, with names in the three interface languages. */
export const LANGS = {
  en:g('Английский','Ағылшын','English'), ru:g('Русский','Орыс','Russian'), kk:g('Казахский','Қазақ','Kazakh'),
  de:g('Немецкий','Неміс','German'), cs:g('Чешский','Чех','Czech'), hu:g('Венгерский','Венгр','Hungarian'),
  tr:g('Турецкий','Түрік','Turkish'), ko:g('Корейский','Корей','Korean'), zh:g('Китайский','Қытай','Chinese'), ja:g('Японский','Жапон','Japanese')
};
