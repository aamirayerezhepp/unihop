/* Crisis check that does not depend on the AI model: used by the server before any limit or model call,
   and by the site itself so help appears even when the server is asleep or unavailable.
   Deliberately broad — a false alarm only shows the help numbers. */

const PATTERNS = [
  // Russian
  /не\s*(хочу|хочется|могу)\s*(больше\s*)?жить/i, /покончить\s*с\s*собой/i, /убить\s*себя/i, /суицид/i, /самоубий/i,
  /хочу\s*умереть/i, /лучше\s*бы\s*меня\s*не\s*было/i, /(порезать|резать|ранить)\s*себя/i, /причин\w*\s*себе\s*(вред|боль)/i,
  /нет\s*смысла\s*жить/i, /уйти\s*из\s*жизни/i, /меня\s*(бьют|насилу)/i, /насили/i,
  // Kazakh
  /өмір\s*сүргім\s*келмейді/i, /өзімді\s*өлтір/i, /өлгім\s*келеді/i, /өзіме\s*(зиян|зақым)/i, /өзін-өзі\s*өлтір/i, /зорлық/i,
  // English
  /kill\s*myself/i, /suicid/i, /want\s*to\s*die/i, /end\s*(my|it\s*all|my\s*life)/i, /hurt\s*myself/i, /self[-\s]?harm/i,
  /(don.?t|do\s*not)\s*want\s*to\s*live/i, /no\s*reason\s*to\s*live/i, /being\s*abused/i
];

export const isCrisis = text => PATTERNS.some(re => re.test(String(text || '')));

/* Same numbers as the Care page (checked November 2026). */
export const CRISIS_TEXT = {
  ru:'Мне очень жаль, что тебе сейчас так тяжело. Ты не один, и помощь есть прямо сейчас.\n'
    + '- Казахстан: 150 — телефон доверия для детей и молодёжи, бесплатно и анонимно (WhatsApp +7 708 106 08 10); 111 — круглосуточно.\n'
    + '- Россия: 8 800 2000 122 — бесплатно и анонимно.\n'
    + '- Если есть опасность прямо сейчас: 112 или 103.\n'
    + 'Пожалуйста, расскажи о своём состоянии взрослому, которому доверяешь: родителю, учителю, школьному психологу. Я рядом и могу просто поговорить, но живой человек сейчас важнее.',
  kz:'Саған қазір қиын болып тұрғанына қатты өкінемін. Сен жалғыз емессің, көмек дәл қазір бар.\n'
    + '- Қазақстан: 150 — балалар мен жастарға арналған сенім телефоны, тегін әрі жасырын (WhatsApp +7 708 106 08 10); 111 — тәулік бойы.\n'
    + '- Ресей: 8 800 2000 122 — тегін әрі жасырын.\n'
    + '- Дәл қазір қауіп болса: 112 немесе 103.\n'
    + 'Өтінемін, жағдайыңды өзің сенетін ересек адамға айт: ата-анаңа, мұғаліміңе, мектеп психологына. Мен жаныңдамын, бірақ қазір тірі адам маңыздырақ.',
  en:'I\'m really sorry you\'re going through this. You are not alone, and help is available right now.\n'
    + '- Kazakhstan: 150 — free, anonymous helpline for children and young people (WhatsApp +7 708 106 08 10); 111 — 24/7.\n'
    + '- Russia: 8 800 2000 122 — free and anonymous.\n'
    + '- If you are in danger right now: 112 or 103.\n'
    + 'Please tell an adult you trust — a parent, a teacher, the school psychologist. I\'m here to talk, but a real person matters most right now.'
};
