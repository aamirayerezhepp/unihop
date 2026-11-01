export const pad = n => String(n).padStart(2, '0');
export const isoOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseISO = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };

export const today = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();

const MON = {
  ru:{gen:['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'],
      nom:['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
      short:['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек']},
  kz:{gen:['қаңтар','ақпан','наурыз','сәуір','мамыр','маусым','шілде','тамыз','қыркүйек','қазан','қараша','желтоқсан'],
      nom:['Қаңтар','Ақпан','Наурыз','Сәуір','Мамыр','Маусым','Шілде','Тамыз','Қыркүйек','Қазан','Қараша','Желтоқсан'],
      short:['қаң','ақп','нау','сәу','мам','мау','шіл','там','қыр','қаз','қар','жел']}
};
const M = lang => MON[lang] || MON.ru;

/* "13 января 2027" / "2027 жылғы 13 қаңтар" */
export const fmtDate = (s, lang = 'ru') => {
  const d = parseISO(s), day = d.getDate(), mon = M(lang).gen[d.getMonth()], y = d.getFullYear();
  return lang === 'kz' ? `${y} жылғы ${day} ${mon}` : `${day} ${mon} ${y}`;
};
export const fmtShort = (s, lang = 'ru') => { const d = parseISO(s); return `${d.getDate()} ${M(lang).short[d.getMonth()]}`; };
export const monthTitle = (y, m, lang = 'ru') => `${M(lang).nom[m - 1]} ${y}`;
export const daysLeft = s => Math.round((parseISO(s) - today) / 864e5);

export const plural = (n, one, few, many) => {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b > 1 && b < 5) return few;
  if (b === 1) return one;
  return many;
};
/* Kazakh nouns stay singular after a number: "5 күн". */
export const daysWord = (n, lang = 'ru') => lang === 'kz' ? `${n} күн` : `${n} ${plural(n, 'день', 'дня', 'дней')}`;
export const stepsWord = (n, lang = 'ru') => lang === 'kz' ? `${n} қадам` : `${n} ${plural(n, 'шаг', 'шага', 'шагов')}`;
export const uid = () => 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
