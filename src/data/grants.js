/* Checked in November 2026. due(Y) only where last year's window is a usable guide. */
const g = (ru, kz) => ({ru, kz});
const ALL_YEAR = g('Вместе с заявкой: ноябрь – январь', 'Өтінішпен бірге: қараша – қаңтар');
const SCHOOL_GRADS = g('Иностранные выпускники школ', 'Шетелдік мектеп түлектері');

export const GRANTS = [
  {id:'nb', code:'US', region:'us', name:g('Need-blind вузы США','АҚШ-тағы need-blind ЖОО-лар'), cover:'full',
    covers:g('100% доказанной нужды — до полной стоимости учёбы','Дәлелденген қажеттіліктің 100% — оқудың толық құнына дейін'), when:ALL_YEAR,
    who:g('Harvard, Yale, Princeton, MIT, Amherst, Dartmouth, Bowdoin; Brown и Notre Dame — с выпуска 2029','Harvard, Yale, Princeton, MIT, Amherst, Dartmouth, Bowdoin; Brown және Notre Dame — 2029 жылғы түлектерден бастап'),
    url:'https://president.brown.edu/president/need-blind-admission-international-undergraduates', urlLabel:g('Политика Brown','Brown саясаты')},
  {id:'na', code:'US', region:'us', name:g('Need-aware колледжи США','АҚШ-тағы need-aware колледждер'), cover:'partial',
    covers:g('Частичная или полная финпомощь','Ішінара немесе толық қаржылай көмек'), when:ALL_YEAR,
    who:g('Десятки колледжей liberal arts; просьба о помощи может влиять на решение','Ондаған liberal arts колледждері; көмек сұрау шешімге әсер етуі мүмкін'),
    url:'https://www.commonapp.org/', urlLabel:'Common App'},
  {id:'pearson', code:'CA', region:'ca', name:'Lester B. Pearson (University of Toronto)', cover:'full',
    covers:g('Обучение, учебники и проживание на 4 года','Төрт жылға оқу, оқулықтар және тұру'),
    when:g('Осень, по номинации школы — уточни сроки на сайте','Күзде, мектеп ұсынуы бойынша — мерзімін сайттан нақтыла'),
    who:g('Иностранные выпускники школ с выдающимися результатами','Ерекше нәтижесі бар шетелдік мектеп түлектері'),
    url:'https://future.utoronto.ca/pearson/', urlLabel:'future.utoronto.ca'},
  {id:'tb', code:'TR', region:'tr', name:'Türkiye Bursları', cover:'full',
    covers:g('Обучение, общежитие, стипендия, перелёт, год турецкого','Оқу, жатақхана, стипендия, ұшақ билеті, бір жыл түрік тілі'),
    when:g('10 января – 20 февраля (так было в 2026 году)','10 қаңтар – 20 ақпан (2026 жылы осылай болды)'), who:g('Граждане любых стран','Кез келген елдің азаматтары'),
    url:'https://www.turkiyeburslari.gov.tr/', urlLabel:'turkiyeburslari.gov.tr', due:Y => `${Y+1}-02-20`},
  {id:'sh', code:'HU', region:'eu', name:'Stipendium Hungaricum', cover:'full',
    covers:g('Обучение, стипендия, общежитие','Оқу, стипендия, жатақхана'), when:g('Обычно ноябрь – январь','Әдетте қараша – қаңтар'),
    who:g('Граждане стран-партнёров Венгрии — проверь свою страну в списке','Венгрияның серіктес елдерінің азаматтары — еліңді тізімнен тексер'),
    url:'https://stipendiumhungaricum.hu/', urlLabel:'stipendiumhungaricum.hu'},
  {id:'dsu', code:'IT', region:'eu', name:g('Региональные стипендии DSU (Италия)','Италияның өңірлік DSU стипендиялары'), cover:'full',
    covers:g('Освобождение от платы и деньги на жизнь — по доходу семьи','Оқу ақысынан босату және өмір сүруге ақша — отбасы табысына қарай'),
    when:g('Летом, после зачисления','Жазда, оқуға қабылданғаннан кейін'), who:g('Студенты государственных вузов Италии','Италияның мемлекеттік ЖОО студенттері'),
    url:'https://www.universitaly.it/', urlLabel:'universitaly.it'},
  {id:'gks', code:'KR', region:'asia', name:'Global Korea Scholarship', cover:'full',
    covers:g('Обучение, стипендия, перелёт, год корейского','Оқу, стипендия, ұшақ билеті, бір жыл корей тілі'),
    when:g('Осень, через посольство Кореи или вуз','Күзде, Корея елшілігі немесе ЖОО арқылы'), who:SCHOOL_GRADS,
    url:'https://www.studyinkorea.go.kr/', urlLabel:'studyinkorea.go.kr'},
  {id:'mext', code:'JP', region:'asia', name:g('MEXT (бакалавриат)','MEXT (бакалавриат)'), cover:'full',
    covers:g('Обучение, стипендия, перелёт, подготовительный год','Оқу, стипендия, ұшақ билеті, дайындық жылы'),
    when:g('Весна – лето, отбор через посольство Японии','Көктем – жаз, Жапония елшілігі арқылы іріктеу'),
    who:g('Выпускники школ, требования по возрасту — на сайте','Мектеп түлектері, жас талаптары — сайтта'),
    url:'https://www.studyinjapan.go.jp/en/', urlLabel:'studyinjapan.go.jp'},
  {id:'csc', code:'CN', region:'asia', name:g('Стипендия правительства Китая (CSC)','Қытай үкіметінің стипендиясы (CSC)'), cover:'full',
    covers:g('Обучение, общежитие, стипендия, страховка','Оқу, жатақхана, стипендия, сақтандыру'), when:g('Зима – весна','Қыс – көктем'), who:SCHOOL_GRADS,
    url:'https://www.campuschina.org/', urlLabel:'campuschina.org'},
  {id:'bol', code:'KZ', region:'home', name:g('Болашак','«Болашақ»'), cover:'full',
    covers:g('Полное финансирование с обязательной отработкой','Міндетті түрде жұмыс істеп өтеумен толық қаржыландыру'),
    when:g('Приём в 2026 году начался 13 апреля','2026 жылы қабылдау 13 сәуірде басталды'),
    who:g('Граждане Казахстана; на бакалавриат в 2026 году — 20 мест','Қазақстан азаматтары; 2026 жылы бакалавриатқа — 20 орын'),
    url:'https://bolashak.gov.kz/', urlLabel:'bolashak.gov.kz', only:['kz']},
  {id:'eyuf', code:'UZ', region:'home', name:'El-yurt umidi', cover:'full',
    covers:g('Обучение за рубежом','Шетелде оқу'), when:g('Приём в 2026 году: 3–24 апреля','2026 жылы қабылдау: 3–24 сәуір'),
    who:g('Граждане Узбекистана; в основном магистратура','Өзбекстан азаматтары; негізінен магистратура'),
    url:'https://eyuf.uz/', urlLabel:'eyuf.uz', only:['uz']}
];

/* A grant in the list whose deadline is already a plan step: show that deadline once. */
export const GRANT_TASK = {tb:'tr', gks:'gks', mext:'mext', csc:'csc', sh:'hu'};
