import { COUNTRIES, FIELDS } from './reference.js';
import { pick } from '../i18n/strings.js';

const g = (ru, kz, en) => ({ru, kz, en});

/* The 9-question chances test. Each answer gets a short comment from Қоян. */
export const QUESTIONS = [
  {key:'grade', tag:g('Класс','Сынып','Grade'), title:g('В каком ты классе?','Нешінші сыныпта оқисың?','What grade are you in?'),
    opts:[[8, g('8 класс','8-сынып','Grade 8')], [9, g('9 класс','9-сынып','Grade 9')], [10, g('10 класс','10-сынып','Grade 10')], [11, g('11 класс','11-сынып','Grade 11')]],
    def:g('Это нужно, чтобы рассчитать сроки подготовки.','Бұл дайындық мерзімін есептеу үшін керек.','This sets the timing of your plan.'),
    hints:{8:g('Отлично, времени много. Начнём с направления и английского.','Тамаша, уақыт көп. Бағыт таңдаудан және ағылшын тілінен бастайық.','Great, there is plenty of time. Let\'s start with a direction and English.'),
           9:g('Самое время подтянуть английский и найти свой проект.','Ағылшын тілін жақсартып, өз жобаңды табатын кез келді.','A good time to improve your English and find your own project.'),
           10:g('Хороший момент: впереди экзамены и первые результаты для портфолио.','Жақсы кезең: алда емтихандар және портфолиоға алғашқы нәтижелер.','Good timing: exams and your first portfolio results are ahead.'),
           11:g('Подача уже в этом учебном году. Сосредоточимся на дедлайнах.','Құжат тапсыру осы оқу жылында. Дедлайндарға назар аударамыз.','You apply this school year. Let\'s focus on deadlines.')}},
  {key:'country', tag:g('Страна','Ел','Country'), title:g('Где ты живёшь?','Қай елде тұрасың?','Where do you live?'), opts:Object.entries(COUNTRIES),
    def:g('От страны зависят документы и местные стипендии.','Құжаттар мен жергілікті стипендиялар елге байланысты.','Documents and local scholarships depend on your country.'),
    hints:{kz:g('Подскажу, что нужно с аттестатом РК, и расскажу про «Болашак».','ҚР аттестатына не керек екенін айтып, «Болашақ» туралы түсіндіремін.','I\'ll explain what to do with a Kazakhstan school certificate and tell you about Bolashak.'),
           uz:g('Расскажу и про фонд El-yurt umidi.','El-yurt umidi қоры туралы да айтамын.','I\'ll also tell you about the El-yurt umidi foundation.'),
           kg:g('Большинство стипендий открыто и для Кыргызстана.','Стипендиялардың көбі Қырғызстанға да ашық.','Most scholarships are open to Kyrgyzstan too.'),
           ru:g('Учту особенности документов и виз.','Құжаттар мен визаның ерекшеліктерін ескеремін.','I\'ll take document and visa details into account.'),
           other:g('Подберу варианты, открытые для всех стран.','Барлық елдерге ашық нұсқаларды іріктеймін.','I\'ll pick options open to every country.')}},
  {key:'english', tag:g('Английский','Ағылшын тілі','English'), title:g('Какой у тебя IELTS?','IELTS бойынша нәтижең қандай?','What is your IELTS score?'),
    opts:[['none', g('Ещё не сдавал(а)','Әлі тапсырған жоқпын','Not taken yet')], ['ielts55', g('5.5–6.0','5.5–6.0','5.5–6.0')], ['ielts65', g('6.5–7.0','6.5–7.0','6.5–7.0')], ['ielts75', g('7.5 и выше','7.5 және жоғары','7.5 or higher')]],
    def:g('Если не сдавал(а), выбери «Ещё не сдавал(а)».','Тапсырмаған болсаң, «Әлі тапсырған жоқпын» деп таңда.','If you haven\'t taken it, choose "Not taken yet".'),
    hints:{none:g('Ничего страшного. Подскажу, когда лучше сдать IELTS, чтобы успеть к дедлайнам.','Ештеңе етпейді. Дедлайндарға үлгеру үшін IELTS-ті қашан тапсырған дұрыс екенін айтамын.','No problem. I\'ll tell you when to take IELTS to make the deadlines.'),
           ielts55:g('С 5.5–6.0 подойдут Foundation-программы и часть вузов Европы и Азии.','5.5–6.0 нәтижесімен Foundation бағдарламалары және Еуропа мен Азияның кейбір ЖОО-лары сәйкес келеді.','With 5.5–6.0, Foundation programmes and some universities in Europe and Asia fit.'),
           ielts65:g('С 6.5–7.0 открыта большая часть программ в Европе и Канаде.','6.5–7.0 нәтижесімен Еуропа мен Канададағы бағдарламалардың көбі ашық.','With 6.5–7.0, most programmes in Europe and Canada are open to you.'),
           ielts75:g('С 7.5 и выше английский не помешает тебе почти нигде, даже в топ-вузах.','7.5 және одан жоғары болса, ағылшын тілі саған ешқайда кедергі болмайды, тіпті топ ЖОО-ларда да.','With 7.5 or higher, English won\'t hold you back almost anywhere, even at top universities.')}},
  {key:'sat', tag:g('SAT','SAT','SAT'), title:g('Сдавал(а) SAT?','SAT тапсырдың ба?','Have you taken the SAT?'),
    opts:[['none', g('Ещё не сдавал(а)','Әлі тапсырған жоқпын','Not taken yet')], ['lt1200', g('До 1200','1200-ге дейін','Below 1200')], ['s1214', g('1200–1400','1200–1400','1200–1400')],
          ['s1400', g('1400 и выше','1400 және жоғары','1400 or higher')], ['nousa', g('Не нужен — не подаюсь в США','Керек емес — АҚШ-қа тапсырмаймын','Not needed — not applying to the US')]],
    def:g('SAT — экзамен для вузов США (математика и английский), шкала 400–1600. Сдаётся на компьютере в Bluebook, вне США стоит около $111.',
          'SAT — АҚШ ЖОО-лары үшін емтихан (математика және ағылшын тілі), шкаласы 400–1600. Компьютерде Bluebook арқылы тапсырылады, АҚШ-тан тыс шамамен $111 тұрады.',
          'The SAT is the exam for US universities (maths and English), scored 400–1600. It is taken on a computer in Bluebook and costs about $111 outside the US.'),
    hints:{none:g('Для поступления в 2027 году SAT или ACT обязательны в Harvard, Yale, Stanford, MIT, Caltech, Brown, Dartmouth, Cornell, Johns Hopkins. Готовиться можно бесплатно в Bluebook и Khan Academy.',
                  '2027 жылы түсу үшін Harvard, Yale, Stanford, MIT, Caltech, Brown, Dartmouth, Cornell, Johns Hopkins-та SAT немесе ACT міндетті. Bluebook пен Khan Academy-де тегін дайындалуға болады.',
                  'For 2027 entry, the SAT or ACT is required at Harvard, Yale, Stanford, MIT, Caltech, Brown, Dartmouth, Cornell and Johns Hopkins. You can prepare for free in Bluebook and on Khan Academy.'),
           lt1200:g('Есть куда расти: в топ-20 у принятых обычно 1500+. Пересдача почти всегда добавляет баллы.','Өсуге орын бар: топ-20-да қабылданғандарда әдетте 1500+. Қайта тапсыру әдетте балл қосады.','Room to grow: admitted students at the top 20 usually have 1500+. A retake almost always adds points.'),
           s1214:g('Хорошая база для многих вузов. Для топ-20 ориентир — 1500+.','Көп ЖОО үшін жақсы негіз. Топ-20 үшін бағдар — 1500+.','A good base for many universities. For the top 20, aim for 1500+.'),
           s1400:g('Сильный результат. В топ-20 у принятых обычно 1500+ — подумай о пересдаче, если целишься туда.','Мықты нәтиже. Топ-20-да қабылданғандарда әдетте 1500+ — сонда түскің келсе, қайта тапсыруды ойластыр.','A strong score. Admitted students at the top 20 usually have 1500+ — consider a retake if you aim there.'),
           nousa:g('Хорошо, SAT учитывать не будем. Передумаешь — ответ можно изменить.','Жақсы, SAT-ты ескермейміз. Ойың өзгерсе, жауапты өзгертуге болады.','Fine, we won\'t count the SAT. If you change your mind, you can change the answer.')}},
  {key:'grades', tag:g('Учёба','Оқу','Grades'), title:g('Какие у тебя оценки?','Бағаларың қандай?','What are your school grades like?'),
    opts:[['high', g('В основном пятёрки','Көбіне беспін','Mostly top marks (5)')], ['mid', g('Четвёрки и пятёрки','Төрт пен бес','Mostly 4s and 5s')], ['low', g('Есть тройки','Үштік бар','Some 3s')]],
    def:g('Вузы смотрят на оценки за последние 3–4 года.','ЖОО-лар соңғы 3–4 жылдағы бағаларға қарайды.','Universities look at your grades for the last 3–4 years.'),
    hints:{high:g('Сильный аттестат открывает и топ-вузы, и стипендии.','Мықты аттестат топ ЖОО-ларға да, стипендияларға да жол ашады.','A strong record opens both top universities and scholarships.'),
           mid:g('Хорошая база. Вузы смотрят ещё на экзамены и проекты.','Жақсы негіз. ЖОО-лар емтихандар мен жобаларға да қарайды.','A good base. Universities also look at exams and projects.'),
           low:g('Не страшно: оценки 10–11 класса важнее, и их ещё можно подтянуть.','Қорықпа: 10–11-сыныптағы бағалар маңыздырақ, оларды әлі көтеруге болады.','Don\'t worry: grades in Grades 10–11 matter more, and you can still raise them.')}},
  {key:'extra', tag:g('Достижения','Жетістіктер','Achievements'), title:g('Есть олимпиады или проекты?','Олимпиада немесе жобаң бар ма?','Any olympiads or projects?'),
    opts:[['olymp', g('Призёр олимпиады','Олимпиада жүлдегері','Olympiad prize-winner')], ['project', g('Проект или волонтёрство','Жоба немесе волонтерлік','A project or volunteering')], ['none', g('Пока ничего','Әзірге жоқ','Nothing yet')]],
    def:g('Это то, о чём ты расскажешь в эссе.','Эссеңде осы туралы айтасың.','This is what you will write about in your essay.'),
    hints:{olymp:g('Олимпиады очень ценят технические вузы и стипендиальные комиссии.','Олимпиадаларды техникалық ЖОО-лар мен стипендия комиссиялары жоғары бағалайды.','Technical universities and scholarship committees value olympiads highly.'),
           project:g('Свой проект — отличная история для эссе.','Өз жобаң — эссе үшін тамаша оқиға.','Your own project is a great story for an essay.'),
           none:g('Есть время начать. Даже один проект за год сильно помогает.','Бастауға уақыт бар. Бір жылдағы бір жобаның өзі көп көмектеседі.','There is time to start. Even one project in a year helps a lot.')}},
  {key:'budget', tag:g('Бюджет','Бюджет','Budget'), title:g('Сколько семья может тратить на учёбу?','Отбасың оқуға қанша жұмсай алады?','How much can your family spend on study?'),
    opts:[['full', g('Нужен полный грант','Толық грант керек','I need a full scholarship')], ['partial', g('Нужна частичная помощь','Ішінара көмек керек','I need partial aid')],
          ['mid', g('До $15 000 в год','Жылына $15 000-ға дейін','Up to $15,000 a year')], ['any', g('Бюджет не ограничен','Бюджет шектеусіз','No budget limit')]],
    def:g('Честный ответ поможет не тратить время на неподходящие вузы.','Шынайы жауап сай келмейтін ЖОО-ларға уақыт кетірмеуге көмектеседі.','An honest answer saves time on universities that don\'t fit.'),
    hints:{full:g('Покажу вузы, куда можно попасть с полной финпомощью или госстипендией.','Толық қаржылай көмекпен немесе мемлекеттік стипендиямен түсуге болатын ЖОО-ларды көрсетемін.','I\'ll show universities you can attend with full aid or a government scholarship.'),
           partial:g('Добавлю страны с бесплатным или недорогим обучением.','Тегін немесе арзан оқитын елдерді қосамын.','I\'ll add countries with free or low-cost tuition.'),
           mid:g('С таким бюджетом подойдут Европа, Азия и Турция.','Мұндай бюджетпен Еуропа, Азия және Түркия сәйкес келеді.','With this budget, Europe, Asia and Turkey fit.'),
           any:g('Тогда выбор самый широкий — сосредоточимся на шансах.','Онда таңдау ең кең — мүмкіндіктерге назар аударамыз.','Then the choice is widest — let\'s focus on your chances.')}},
  {key:'field', tag:g('Направление','Бағыт','Field'), title:g('Кем хочешь стать?','Кім болғың келеді?','What do you want to study?'), opts:FIELDS,
    def:g('Если не знаешь — это нормально. Подберу вузы с широким выбором.','Білмесең — бұл қалыпты. Таңдауы кең ЖОО-ларды іріктеймін.','Not sure is fine. I\'ll pick universities with a wide choice.'),
    hints:{unsure:g('Многие решают на первом курсе. В США специальность выбирают позже.','Көпшілік бірінші курста шешеді. АҚШ-та мамандықты кейін таңдайды.','Many decide in their first year. In the US you choose a major later.')}},
  {key:'regions', multi:true, tag:g('Страны','Елдер','Countries'), title:g('Куда хочешь поступать?','Қай елге түскің келеді?','Where do you want to apply?'),
    opts:[['us', g('США','АҚШ','USA')], ['uk', g('Великобритания','Ұлыбритания','United Kingdom')], ['eu', g('Европа','Еуропа','Europe')], ['ca', g('Канада','Канада','Canada')],
          ['asia', g('Корея, Япония, Китай','Корея, Жапония, Қытай','Korea, Japan, China')], ['tr', g('Турция','Түркия','Turkey')], ['unsure', g('Пока не знаю','Әзірге білмеймін','Not sure yet')]],
    def:g('Можно выбрать несколько. Если не знаешь — подберу сам.','Бірнешеуін таңдауға болады. Білмесең — өзім іріктеймін.','You can choose several. If you are not sure, I\'ll pick for you.')}
];

export const optLabel = (key, v, lang = 'ru') => {
  const q = QUESTIONS.find(x => x.key === key);
  const o = q && q.opts.find(x => String(x[0]) === String(v));
  return o ? pick(lang, o[1]) : '';
};
