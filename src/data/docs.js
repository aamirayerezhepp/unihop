/* Document checklist. The site stores only the status of each item, never the files themselves.
   regions: shown only when the student applies to one of these regions (all items show before the test). */
const g = (ru, kz, en) => ({ru, kz, en});

export const DOC_GROUPS = [
  {id:'personal', title:g('Личные документы','Жеке құжаттар','Personal documents'), items:[
    {id:'passport', name:g('Заграничный паспорт','Шетелдік төлқұжат','Passport'), hint:g('Срок — на весь период учёбы','Мерзімі — бүкіл оқу кезеңіне','Valid for your whole period of study')},
    {id:'photo', name:g('Фото на документы','Құжатқа арналған фото','ID photo'), hint:g('Цифровое, светлый фон','Цифрлық, ашық фон','Digital, light background')},
    {id:'birth', name:g('Свидетельство о рождении','Туу туралы куәлік','Birth certificate'), hint:g('Нужно для визы','Виза үшін керек','Needed for the visa')}
  ]},
  {id:'study', title:g('Учёба','Оқу','School records'), items:[
    {id:'transcripts', name:g('Табели за 9–11 класс','9–11-сынып табельдері','Transcripts for Grades 9–11'), hint:g('Оценки за последние 3–4 года','Соңғы 3–4 жылдағы бағалар','Grades for the last 3–4 years')},
    {id:'translation', name:g('Перевод аттестата','Аттестат аудармасы','Certificate translation'), hint:g('Заверить у нотариуса','Нотариуста куәландыру','Certified by a notary')},
    {id:'schoolref', name:g('Справка с места учёбы','Оқу орнынан анықтама','School reference letter'), hint:g('На английском','Ағылшын тілінде','In English')},
    {id:'apostille', name:g('Апостиль','Апостиль','Apostille'), hint:g('Если требует страна или вуз','Ел немесе ЖОО талап етсе','If the country or university requires it'), regions:['eu','asia','tr']}
  ]},
  {id:'exams', title:g('Экзамены','Емтихандар','Exams'), items:[
    {id:'ielts', name:g('IELTS или другой языковой тест','IELTS немесе басқа тіл емтиханы','IELTS or another language test'), hint:g('Результат действует 2 года','Нәтиже 2 жыл жарамды','Results are valid for 2 years')},
    {id:'sat', name:g('SAT','SAT','SAT'), hint:g('Для вузов США','АҚШ ЖОО-лары үшін','For US universities'), regions:['us']},
    {id:'scores', name:g('Отправка баллов в вузы','Балдарды ЖОО-ларға жіберу','Sending scores to universities'), hint:g('Через сайт экзамена','Емтихан сайты арқылы','Through the exam website'), regions:['us','uk','ca']}
  ]},
  {id:'recs', title:g('Рекомендации','Ұсыным хаттар','Recommendations'), regions:['us','uk','ca'],
    note:g('Учитель отправляет письмо в вуз сам — ты его не видишь, так требуют вузы.','Мұғалім хатты ЖОО-ға өзі жібереді — сен оны көрмейсің, ЖОО-лар осылай талап етеді.','Your teacher sends the letter to the university directly — you don\'t see it, as universities require.'), items:[
    {id:'rec1', name:g('Рекомендация учителя 1','1-мұғалімнің ұсыным хаты','Teacher recommendation 1'), hint:g('Попроси за месяц до дедлайна','Дедлайнға бір ай қалғанда сұра','Ask a month before the deadline')},
    {id:'rec2', name:g('Рекомендация учителя 2','2-мұғалімнің ұсыным хаты','Teacher recommendation 2'), hint:g('Нужна для вузов США','АҚШ ЖОО-лары үшін керек','Needed for US universities'), regions:['us']}
  ]},
  {id:'essays', title:g('Эссе и письма','Эссе және хаттар','Essays and letters'), items:[
    {id:'mainessay', name:g('Основное эссе (Common App / UCAS)','Негізгі эссе (Common App / UCAS)','Main essay (Common App / UCAS)'), hint:g('Пиши сам, Қоян поможет со структурой','Өзің жаз, Қоян құрылымына көмектеседі','Write it yourself; Qoyan helps with structure'), regions:['us','uk','ca']},
    {id:'motivation', name:g('Мотивационное письмо','Мотивациялық хат','Motivation letter'), hint:g('Для Европы, Азии и стипендий','Еуропа, Азия және стипендиялар үшін','For Europe, Asia and scholarships'), regions:['eu','asia','tr']}
  ]},
  {id:'money', title:g('Достижения и финансы','Жетістіктер және қаржы','Achievements and finances'), items:[
    {id:'awards', name:g('Дипломы и сертификаты','Дипломдар мен сертификаттар','Diplomas and certificates'), hint:g('Олимпиады, курсы, конкурсы','Олимпиадалар, курстар, байқаулар','Olympiads, courses, competitions')},
    {id:'income', name:g('Справка о доходах семьи','Отбасы табысы туралы анықтама','Family income statement'), hint:g('Для визы и грантов','Виза және гранттар үшін','For the visa and grants')},
    {id:'cssprofile', name:g('CSS Profile','CSS Profile','CSS Profile'), hint:g('Для финпомощи в США','АҚШ-тағы қаржылай көмек үшін','For US financial aid'), regions:['us']}
  ]}
];

export const DOC_STATES = ['todo', 'wip', 'done'];
