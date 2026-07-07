export const languages = ["ru", "en"] as const;
export type Language = (typeof languages)[number];
export const defaultLanguage: Language = "ru";

type LabelValue = string | string[];

export const labels: Record<Language, Record<string, LabelValue>> = {
  ru: {
    "ui.about": "О себе",
    "ui.competencies": "Ключевые компетенции",
    "ui.achievements": "Ключевые достижения",
    "ui.fullName": "ФИО",
    "ui.family": "Возраст / Семья",
    "ui.education": "Образование",
    "ui.telegram": "Telegram",
    "ui.github": "GitHub",
    "ui.nav": "Навигация",
    "ui.experience": "Опыт",
    "ui.aboutShort": "О компании",
    "ui.whatIDid": "Что делал",
    "ui.highlights": "Интересное",
    "ui.media": "Скриншоты / Демо",
    "ui.mediaEmpty": "Скриншотов пока нет",
    "ui.close": "Закрыть",
    "ui.next": "Вперёд",
    "ui.prev": "Назад",
    "ui.presentShort": "н.в.",
    "ui.tech": "Технологии",
    "ui.contacts": "Контакты",
    "ui.print": "Печать / PDF",
    "ui.printing": "Готовится…",
    "ui.downloadMd": "Скачать .md",
    "ui.openSource": "Исходник страницы",
    "ui.lang": "Язык",
    "ui.interviews": "интервью проведено",
    "ui.monthsShort": ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"],
    "ui.present": "наст. время",
    "ui.now": "по настоящее время",
    "ui.skillsCore": "Core",
    "ui.skillsStrong": "Strong",
    "ui.skillsFamiliar": "Familiar",
    "ui.printHint": "Совет: в диалоге печати выберите «Сохранить как PDF» и фон — без графики.",
  },
  en: {
    "ui.about": "About",
    "ui.competencies": "Core competencies",
    "ui.achievements": "Key achievements",
    "ui.fullName": "Full name",
    "ui.family": "Age / Family",
    "ui.education": "Education",
    "ui.telegram": "Telegram",
    "ui.github": "GitHub",
    "ui.nav": "Navigation",
    "ui.experience": "Experience",
    "ui.aboutShort": "About the company",
    "ui.whatIDid": "What I did",
    "ui.highlights": "Highlights",
    "ui.media": "Screenshots / Demo",
    "ui.mediaEmpty": "No screenshots yet",
    "ui.close": "Close",
    "ui.next": "Next",
    "ui.prev": "Previous",
    "ui.presentShort": "now",
    "ui.tech": "Technologies",
    "ui.contacts": "Contacts",
    "ui.print": "Print / PDF",
    "ui.printing": "Preparing…",
    "ui.downloadMd": "Download .md",
    "ui.openSource": "Page source",
    "ui.lang": "Language",
    "ui.interviews": "interviews conducted",
    "ui.monthsShort": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    "ui.present": "present",
    "ui.now": "to present",
    "ui.skillsCore": "Core",
    "ui.skillsStrong": "Strong",
    "ui.skillsFamiliar": "Familiar",
    "ui.printHint": "Tip: in the print dialog choose “Save as PDF” and untick headers/footers.",
  },
};

export function t(lang: Language, key: string): string {
  const v = labels[lang]?.[key];
  return Array.isArray(v) ? v.join(",") : v ?? key;
}

export function tArr(lang: Language, key: string): string[] {
  const v = labels[lang]?.[key];
  if (Array.isArray(v)) return v;
  if (typeof v === "string") return v.split(",").map((s) => s.trim());
  return [];
}
