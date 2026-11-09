/* General admissions facts for Қоян, checked in November 2026. One fact per item so the server can send only the relevant ones.
   `k` are search words (Russian, Kazakh and English stems); `src` is where the student can check the fact. */
export const FACTS_CHECKED = '2026-11';

export const FACTS = [
  {id:'ucas', k:'ucas великобритания англия британ ұлыбритания uk oxford cambridge оксфорд кембридж медицина personal statement',
    ru:'UCAS (Великобритания), поступление 2027: 15 октября 2026 — Оксфорд, Кембридж, медицина; 13 января 2027, 18:00 по Лондону — остальные программы. Одна заявка на 5 программ.', src:'https://www.ucas.com/'},
  {id:'us-dates', k:'сша америка usa us common app коммон дедлайн early decision ранняя подача harvard yale stanford mit',
    ru:'США: Common App, ранняя подача обычно 1 или 15 ноября, основная — 1–15 января (например: Harvard, Princeton, Columbia — 1 января; Yale, Cornell, JHU — 2 января; Caltech, Duke, UChicago, Northwestern — 4 января; Stanford, Penn, Brown, NYU, MIT — 5 января).', src:'https://www.commonapp.org/'},
  {id:'us-needblind', k:'сша need-blind финпомощь грант стипендия usa aid harvard yale princeton mit amherst dartmouth bowdoin',
    ru:'Need-blind для иностранцев: Harvard, Yale, Princeton, MIT, Amherst, Dartmouth, Bowdoin; Brown и Notre Dame — с выпуска 2029. Для поступления в 2027 году SAT или ACT обязательны в Harvard, Yale, Stanford, MIT, Caltech, Brown, Dartmouth, Cornell, Johns Hopkins.', src:'https://www.commonapp.org/'},
  {id:'us-visa', k:'виза сша visa f-1 f1 j-1 запрет travel ban dhs uscis',
    ru:'Визы США: с 1 января 2026 действует запрет на въезд для 39 стран; стран Центральной Азии в нём нет. С 15 сентября 2026 действует правило DHS о фиксированном сроке пребывания по визам F и J — до 4 лет, продление через USCIS.', src:'https://travel.state.gov/'},
  {id:'kz-grant', k:'госгрант государственный грант казахстан ент ұбт грант мемлекеттік unt',
    ru:'Госгрант Республики Казахстан: заявления подаются после ЕНТ, в 2026 году — 13–20 июля; порог 50–75 баллов в зависимости от направления.', src:'https://testcenter.kz/'},
  {id:'ielts-cost', k:'ielts айелтс стоимость цена сколько стоит британский совет british council тенге',
    ru:'IELTS в Казахстане стоит около 105 000 тенге (British Council, 2026).', src:'https://www.britishcouncil.kz/'},
  {id:'sat', k:'sat сат стоимость цена bluebook khan экзамен сша',
    ru:'SAT вне США стоит $68 + $43 = $111; сдаётся на компьютере в Bluebook; бесплатная подготовка — Bluebook и Khan Academy.', src:'https://satsuite.collegeboard.org/'},
  {id:'duolingo', k:'duolingo дуолинго english test стоимость',
    ru:'Duolingo English Test стоит $70; принимают не все вузы — проверяй у каждого.', src:'https://englishtest.duolingo.com/'},
  {id:'germany', k:'германия германию немецкий studienkolleg штудиенколлег germany tum бавария бесплатно',
    ru:'Германия: со школьным аттестатом СНГ обычно нужен Studienkolleg или 1–2 курса вуза дома; в большинстве госвузов учёба бесплатная, кроме Баварии и Баден-Вюртемберга для иностранцев.', src:'https://www.study-in-germany.de/'},
  {id:'italy', k:'италия italy dsu стипендия регион universitaly',
    ru:'Италия: региональные стипендии DSU назначают по доходу семьи; подача через регион и вуз.', src:'https://www.universitaly.it/'},
  {id:'czech', k:'чехия чешский czech прага бесплатно cuni',
    ru:'Чехия: в государственных вузах обучение на чешском бесплатное; на английском — платное.', src:'https://cuni.cz/UKEN-372.html'},
  {id:'foundation', k:'foundation фаундейшн подготовительный год 11 класс 12 лет studienkolleg nufyp',
    ru:'После 11 лет школы часть стран требует подготовительный год (Foundation, Studienkolleg) или курс вуза дома. Требование зависит от вуза — смотри страницу «entry requirements» для твоей страны.', src:null},
  {id:'docs', k:'документы аттестат перевод транскрипт табель нотариус апостиль рекомендации',
    ru:'Обычно нужны: оценки за последние 2–4 года с переводом на английский, языковой сертификат, мотивационное письмо или эссе, иногда рекомендации учителей. Нужно ли заверение или апостиль — решает вуз.', src:null}
];
