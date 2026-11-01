/* The portal holds no book text: everything comes from this private repository after login. */
export const EDITORIAL_REPO = "DavydenkovM/mobile-core-editorial";

/*
 * The GitHub token encrypted with the editor's password, made on the setup screen.
 * Empty until it is pasted here; a lock kept in one browser works without it.
 */
export const EDITOR_LOCK = "";

export const PILOT_CHAPTERS = ["why-module", "live-module", "bff-screens"];

export const READY_SCORE = 90;

export const BOOK_AXES: [string, string, number][] = [
  ["story", "Рассказ", 15],
  ["useful", "Когда пригодится", 15],
  ["theory", "Мера теории", 10],
  ["figures", "Иллюстрации", 10],
  ["language", "Язык", 10],
  ["truth", "Достоверность", 5],
];

export const PRACTICE_AXES: [string, string, number][] = [
  ["reproducible", "Воспроизводимость", 10],
  ["clear", "Понятность", 10],
  ["observable", "Наблюдаемость", 10],
  ["screencast", "Скринкаст", 5],
];
