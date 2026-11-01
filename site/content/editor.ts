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
  ["fold", "Свёртка: мысль и структура", 25],
  ["unfold", "Развёртка: как мысль раскрыта", 20],
  ["arc", "Дуга и сквозной пример", 10],
  ["figures", "Иллюстрации", 10],
  ["language", "Язык", 10],
  ["line", "Люди и агенты", 5],
];

export const PRACTICE_AXES: [string, string, number][] = [
  ["whole", "Цельность практики", 10],
  ["observe", "Наблюдаемость", 10],
];
