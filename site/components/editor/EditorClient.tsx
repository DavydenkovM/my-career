"use client";

import { useCallback, useEffect, useState } from "react";
import { EDITOR_LOCK } from "@/content/editor";
import { AuthError, Repo } from "./github";
import { lockToken, unlockToken } from "./lock";
import type { Chapter, Decision, Review, Rubric, Target } from "./model";
import { Board } from "./Board";
import { ChapterView } from "./ChapterView";

const LOCK_KEY = "editor-lock";
const TOKEN_KEY = "editor-token";

type Data = { source: string; chapters: Chapter[]; rubric: Rubric; reviews: Record<string, Review>; decisions: Record<string, Decision> };

const read = (store: () => Storage, key: string) => {
  try {
    return store().getItem(key);
  } catch {
    return null;
  }
};

const field = "w-full rounded border border-stone-300 bg-white px-3 py-2 text-sm focus:border-stone-500 focus:outline-none";
const primary = "rounded bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50";

function Gate({ onToken }: { onToken: (token: string) => void }) {
  const [lock, setLock] = useState<string | null>(null);
  const [made, setMade] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => setLock(EDITOR_LOCK || read(() => localStorage, LOCK_KEY) || ""), []);

  const unlock = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      onToken(await unlockToken(lock ?? "", password));
    } catch {
      setError("Неверный пароль.");
    }
    setBusy(false);
  };

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 14) return setError("Нужен пароль не короче 14 символов.");
    if (password !== repeat) return setError("Пароли не совпадают.");
    setBusy(true);
    setError("");
    const value = await lockToken(token.trim(), password);

    localStorage.setItem(LOCK_KEY, value);
    setMade(value);
    setBusy(false);
  };

  if (lock === null) return null;
  if (made) {
    return (
      <div className="grid gap-3">
        <h1 className="text-xl font-semibold">Вход настроен</h1>
        <p className="text-sm text-stone-600">
          В этом браузере теперь работает ваш пароль. Чтобы войти с другого устройства, этот зашифрованный ключ нужно
          добавить в EDITOR_LOCK на сайте. Без пароля он бесполезен.
        </p>
        <textarea readOnly value={made} rows={4} className={`${field} font-mono text-xs`} aria-label="Зашифрованный ключ" />
        <button className={primary} onClick={() => onToken(token.trim())}>Открыть редакцию</button>
      </div>
    );
  }
  if (lock) {
    return (
      <form onSubmit={unlock} className="grid gap-3">
        <h1 className="text-xl font-semibold">Редакция</h1>
        <label className="grid gap-1 text-sm">
          Пароль
          <input id="editor-password" type="password" autoFocus autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
        </label>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button className={primary} disabled={busy || !password}>{busy ? "Проверяю…" : "Войти"}</button>
      </form>
    );
  }
  return (
    <form onSubmit={create} className="grid gap-3">
      <h1 className="text-xl font-semibold">Настройка входа</h1>
      <p className="text-sm text-stone-600">
        Создайте{" "}
        <a className="underline" href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">
          токен GitHub
        </a>
        : доступ только к репозиторию mobile-core-editorial, разрешение Contents — Read and write. Токен шифруется вашим
        паролем прямо в браузере и никуда не отправляется.
      </p>
      <label className="grid gap-1 text-sm">
        Токен GitHub
        <input id="editor-token" type="password" autoComplete="off" value={token} onChange={(e) => setToken(e.target.value)} className={field} />
      </label>
      <label className="grid gap-1 text-sm">
        Пароль, не короче 14 символов
        <input id="editor-new-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
      </label>
      <label className="grid gap-1 text-sm">
        Пароль ещё раз
        <input id="editor-repeat-password" type="password" autoComplete="new-password" value={repeat} onChange={(e) => setRepeat(e.target.value)} className={field} />
      </label>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button className={primary} disabled={busy || !token.trim() || !password}>Сохранить</button>
    </form>
  );
}

const parseHash = (): { slug?: string; target: Target } => {
  const [slug, tab] = window.location.hash.slice(1).split("/");

  return { slug: slug ? decodeURIComponent(slug) : undefined, target: tab === "practice" ? "practice" : "book" };
};

export function EditorClient() {
  const [repo, setRepo] = useState<Repo | null>(null);
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [route, setRoute] = useState<{ slug?: string; target: Target }>({ target: "book" });
  const [checked, setChecked] = useState(false);

  const enter = useCallback((token: string) => {
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* the token just lives until the page closes */
    }
    setRepo(new Repo(token));
  }, []);

  const leave = useCallback(() => {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      /* nothing was kept */
    }
    setRepo(null);
    setData(null);
  }, []);

  const load = useCallback(async (from: Repo) => {
    setError("");
    try {
      const [index, rubric, reviews, decisions] = await Promise.all([
        from.json<{ source: string; chapters: Chapter[] }>("index.json"),
        from.json<Rubric>("rubric.json"),
        from.folder<Review>("reviews"),
        from.folder<Decision>("decisions"),
      ]);

      setData({ ...index, rubric, reviews, decisions });
    } catch (failure) {
      if (failure instanceof AuthError) {
        setError("GitHub не принял токен: он истёк или у него нет доступа к репозиторию. Создайте новый и настройте вход заново.");
      } else {
        setError(`Не удалось загрузить данные: ${(failure as Error).message}`);
      }
    }
  }, []);

  useEffect(() => {
    const token = read(() => sessionStorage, TOKEN_KEY);

    if (token) setRepo(new Repo(token));
    setChecked(true);
    setRoute(parseHash());
    const onHash = () => {
      setRoute(parseHash());
      window.scrollTo(0, 0);
    };

    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    if (repo) load(repo);
  }, [repo, load]);

  if (!checked) return null;
  if (!repo) {
    return (
      <main className="mx-auto max-w-md px-4 py-16">
        <Gate onToken={enter} />
      </main>
    );
  }

  const chapter = data?.chapters.find(({ slug }) => slug === route.slug);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <a href="#" className="font-semibold">Редакция книги Mobile Core</a>
          <button className="text-sm text-stone-600 underline" onClick={leave}>Выйти</button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        {error && <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        {!data && !error && <p className="text-sm text-stone-600">Загружаю главы…</p>}
        {data && !chapter && <Board chapters={data.chapters} rubric={data.rubric} reviews={data.reviews} decisions={data.decisions} source={data.source} />}
        {data && chapter && (
          <ChapterView
            key={chapter.slug}
            repo={repo}
            chapter={chapter}
            target={route.target}
            rubric={data.rubric}
            review={data.reviews[chapter.slug]}
            decision={data.decisions[chapter.slug]}
            onSaved={(decision) => setData({ ...data, decisions: { ...data.decisions, [chapter.slug]: decision } })}
          />
        )}
      </main>
    </div>
  );
}
