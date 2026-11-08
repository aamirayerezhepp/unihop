/* Every visible text is {ru, kz, en}; pick(lang, value) chooses one. */
const g = (ru, kz, en) => ({ru, kz, en});

export const COUNTRIES = {
  kz:g('Казахстан','Қазақстан','Kazakhstan'), uz:g('Узбекистан','Өзбекстан','Uzbekistan'), kg:g('Кыргызстан','Қырғызстан','Kyrgyzstan'),
  ru:g('Россия','Ресей','Russia'), other:g('Другая страна','Басқа ел','Another country')
};

export const REGIONS = {
  us:{label:g('США','АҚШ','USA'), code:'US'}, uk:{label:g('Великобритания','Ұлыбритания','United Kingdom'), code:'UK'},
  eu:{label:g('Европа','Еуропа','Europe'), code:'EU'}, ca:{label:g('Канада','Канада','Canada'), code:'CA'},
  asia:{label:g('Корея, Япония, Китай','Корея, Жапония, Қытай','Korea, Japan, China'), code:'AS'}, tr:{label:g('Турция','Түркия','Turkey'), code:'TR'}
};

/* Country names for the university lists (code → name). */
export const UNI_COUNTRY = {
  us:g('США','АҚШ','USA'), uk:g('Великобритания','Ұлыбритания','United Kingdom'), ca:g('Канада','Канада','Canada'),
  de:g('Германия','Германия','Germany'), nl:g('Нидерланды','Нидерланды','Netherlands'), it:g('Италия','Италия','Italy'),
  fr:g('Франция','Франция','France'), es:g('Испания','Испания','Spain'), pt:g('Португалия','Португалия','Portugal'),
  ch:g('Швейцария','Швейцария','Switzerland'), at:g('Австрия','Австрия','Austria'), be:g('Бельгия','Бельгия','Belgium'),
  ie:g('Ирландия','Ирландия','Ireland'), se:g('Швеция','Швеция','Sweden'), dk:g('Дания','Дания','Denmark'),
  fi:g('Финляндия','Финляндия','Finland'), no:g('Норвегия','Норвегия','Norway'), cz:g('Чехия','Чехия','Czechia'),
  hu:g('Венгрия','Венгрия','Hungary'), pl:g('Польша','Польша','Poland'), ee:g('Эстония','Эстония','Estonia'),
  lv:g('Латвия','Латвия','Latvia'), lt:g('Литва','Литва','Lithuania'), tr:g('Турция','Түркия','Turkey'),
  kr:g('Корея','Корея','Korea'), jp:g('Япония','Жапония','Japan'), cn:g('Китай','Қытай','China'),
  hk:g('Гонконг','Гонконг','Hong Kong'), sg:g('Сингапур','Сингапур','Singapore'), my:g('Малайзия','Малайзия','Malaysia'),
  ae:g('ОАЭ','БАӘ','UAE'), au:g('Австралия','Аустралия','Australia'), nz:g('Новая Зеландия','Жаңа Зеландия','New Zealand'),
  kz:g('Казахстан','Қазақстан','Kazakhstan'), ru:g('Россия','Ресей','Russia'), uz:g('Узбекистан','Өзбекстан','Uzbekistan'),
  kg:g('Кыргызстан','Қырғызстан','Kyrgyzstan')
};

export const FIELDS = [
  ['it', g('IT и данные','IT және деректер','IT and data')], ['med', g('Медицина','Медицина','Medicine')], ['biz', g('Бизнес','Бизнес','Business')],
  ['eng', g('Инженерия','Инженерия','Engineering')], ['design', g('Дизайн','Дизайн','Design')], ['law', g('Право','Құқық','Law')],
  ['psy', g('Психология','Психология','Psychology')], ['unsure', g('Пока не знаю','Әзірге білмеймін','Not sure yet')]
];

export const STATUSES = [
  ['prep', g('Готовлю','Дайындап жатырмын','Preparing')], ['sent', g('Подано','Жіберілді','Submitted')], ['admit', g('Принят(а)','Қабылданды','Admitted')],
  ['wait', g('Лист ожидания','Күту тізімінде','Waitlisted')], ['reject', g('Отказ','Қабылданбады','Rejected')]
];
export const CHECKS = [
  ['essay', g('Эссе','Эссе','Essay')], ['recs', g('Рекомендации','Ұсыным хаттар','Recommendations')], ['test', g('Языковой тест','Тіл емтиханы','Language test')],
  ['docs', g('Документы','Құжаттар','Documents')], ['fin', g('Финансы','Қаржы','Finances')]
];
export const BASKETS = {dream:g('Мечта','Арман','Reach'), real:g('Реально','Нақты','Target'), safe:g('Надёжно','Сенімді','Safety')};

/* Kinds of application deadline in the university catalog. */
export const DEADLINE_TYPES = {
  rd:g('Regular Decision','Regular Decision','Regular Decision'),
  ucas:g('UCAS','UCAS','UCAS'),
  ucasE:g('UCAS, ранний срок','UCAS, ерте мерзім','UCAS early deadline'),
  uc:g('UC Application','UC Application','UC Application'),
  ouac:g('OUAC','OUAC','OUAC'),
  de:g('Зимний семестр + Studienkolleg','Қысқы семестр + Studienkolleg','Winter semester + Studienkolleg'),
  sl:g('Studielink','Studielink','Studielink'),
  nf:g('Numerus fixus','Numerus fixus','Numerus fixus'),
  dap:g('Campus France DAP','Campus France DAP','Campus France DAP'),
  joint:g('Совместный приём','Бірлескен қабылдау','Joint application'),
  sh:g('Stipendium Hungaricum','Stipendium Hungaricum','Stipendium Hungaricum'),
  fall:g('Осенний приём','Күзгі қабылдау','Fall intake'),
  sem1:g('Семестр 1 (февраль)','1-семестр (ақпан)','Semester 1 (February)'),
  nuet:g('NUET','NUET','NUET'),
  kzdocs:g('Приём документов (грант — в июле после ЕНТ)','Құжат қабылдау (грант — ҰБТ-дан кейін шілдеде)','Document intake (state grant in July after UNT)'),
  rudocs:g('Приём документов в вузы РФ','РФ ЖОО-ларына құжат қабылдау','Document intake (Russia)'),
  rolling:g('Rolling (по мере заполнения мест)','Rolling (орын толғанша)','Rolling admission')
};

export const HELP = {
  kz:[{n:'150', t:g('Телефон доверия для детей и молодёжи — анонимно и бесплатно','Балалар мен жастарға арналған сенім телефоны — жасырын және тегін','Helpline for children and young people in Kazakhstan — anonymous and free'),
        x:g('Можно написать: WhatsApp +7 708 106 08 10 или чат на telefon150.kz','Жазуға болады: WhatsApp +7 708 106 08 10 немесе telefon150.kz сайтындағы чат','You can also text: WhatsApp +7 708 106 08 10 or the chat at telefon150.kz')},
      {n:'111', t:g('Контакт-центр по вопросам семьи и защиты прав детей — круглосуточно','Отбасы және балалар құқықтарын қорғау мәселелері бойынша байланыс орталығы — тәулік бойы','Family and child protection contact centre in Kazakhstan — 24/7')},
      {n:'112', t:g('Экстренные службы','Шұғыл қызметтер','Emergency services')}],
  ru:[{n:'8 800 2000 122', t:g('Детский телефон доверия в России — бесплатно и анонимно','Ресейдегі балаларға арналған сенім телефоны — тегін және жасырын','Children\'s helpline in Russia — free and anonymous')},
      {n:'112', t:g('Экстренные службы','Шұғыл қызметтер','Emergency services')}],
  other:[{n:'103', t:g('Скорая помощь в Узбекистане, Кыргызстане и других странах СНГ','Өзбекстан, Қырғызстан және басқа ТМД елдеріндегі жедел жәрдем','Ambulance in Uzbekistan, Kyrgyzstan and other CIS countries'),
          x:g('Если номера телефона доверия твоей страны здесь нет, расскажи взрослому, которому доверяешь.','Мұнда еліңнің сенім телефоны болмаса, өзің сенетін ересек адамға айт.','If your country\'s helpline is not listed here, tell an adult you trust.')}]
};

/* Ready answers; also the fallback when the live chat is unavailable. */
export const PRESETS = [
  {q:g('Нужен ли Foundation после 11 класса?','11-сыныптан кейін Foundation керек пе?','Do I need a Foundation year after Grade 11?'),
   a:g('Зависит от страны. В Великобританию чаще всего идут через Foundation. В Германии нужен Studienkolleg или 1–2 курса вуза в Казахстане. В Чехии, Венгрии и Корее многие программы принимают аттестат РК напрямую.',
       'Елге байланысты. Ұлыбританияға көбіне Foundation арқылы түседі. Германияда Studienkolleg немесе Қазақстандағы ЖОО-ның 1–2 курсы керек. Чехия, Венгрия және Кореяда көптеген бағдарламалар ҚР аттестатын тікелей қабылдайды.',
       'It depends on the country. Most students reach the UK through a Foundation year. Germany needs a Studienkolleg or 1–2 years at a university in Kazakhstan. In Czechia, Hungary and Korea many programmes accept the Kazakhstan school certificate directly.'),
   src:g('Источники: сайты вузов, база anabin · проверено: ноябрь 2026','Дереккөздер: ЖОО сайттары, anabin базасы · тексерілді: 2026 жылғы қараша','Sources: university websites, anabin database · checked November 2026')},
  {q:g('Какие стипендии есть для бакалавриата?','Бакалавриатқа қандай стипендиялар бар?','Which scholarships exist for a bachelor\'s degree?'),
   a:g('Государственные программы: GKS (Корея), Stipendium Hungaricum (Венгрия), Türkiye Bursları (Турция), MEXT (Япония). Плюс гранты самих вузов для иностранцев. Загляни в раздел «Стипендии» — там они отфильтрованы под тебя.',
       'Мемлекеттік бағдарламалар: GKS (Корея), Stipendium Hungaricum (Венгрия), Türkiye Bursları (Түркия), MEXT (Жапония). Сонымен қатар ЖОО-лардың шетелдіктерге арналған гранттары бар. «Стипендиялар» бөлімін қара — онда олар саған сай іріктелген.',
       'Government programmes: GKS (Korea), Stipendium Hungaricum (Hungary), Türkiye Bursları (Turkey), MEXT (Japan). Plus universities\' own grants for international students. Open "Scholarships" — they are filtered for you there.'),
   src:g('Источники: официальные сайты программ · проверено: ноябрь 2026','Дереккөздер: бағдарламалардың ресми сайттары · тексерілді: 2026 жылғы қараша','Sources: official programme websites · checked November 2026')},
  {q:g('Сколько стоит учёба в Германии?','Германияда оқу қанша тұрады?','How much does studying in Germany cost?'),
   a:g('В большинстве государственных вузов учёба бесплатная, платится только семестровый взнос. Исключения: Бавария (например, TUM) и Баден-Вюртемберг берут плату с иностранцев. Отдельно нужны деньги на жизнь и блокированный счёт для визы.',
       'Мемлекеттік ЖОО-лардың көбінде оқу тегін, тек семестрлік жарна төленеді. Ерекшеліктер: Бавария (мысалы, TUM) және Баден-Вюртемберг шетелдіктерден ақы алады. Бөлек өмір сүруге ақша және виза үшін бұғатталған шот керек.',
       'Most public universities charge no tuition, only a semester fee. Exceptions: Bavaria (for example TUM) and Baden-Württemberg charge international students. You also need money to live on and a blocked account for the visa.'),
   src:g('Источники: DAAD, сайты вузов · проверено: ноябрь 2026','Дереккөздер: DAAD, ЖОО сайттары · тексерілді: 2026 жылғы қараша','Sources: DAAD, university websites · checked November 2026')}
];
