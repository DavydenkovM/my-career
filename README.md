# my-career

Source for my personal CV site — https://DavydenkovM.github.io/my-career/

Built with **Next.js 14** (static export) + **Tailwind CSS**, content in **Markdown / YAML frontmatter**.

## Структура

```
.
├── .github/workflows/deploy.yml   # GitHub Pages deploy
├── site/                          # Next.js app
│   ├── app/                       # routes & layout
│   ├── components/                # UI
│   ├── content/                   # experience .md, i18n, site.ts
│   └── public/                    # static assets (photo, screenshots)
└── experience/                    # legacy hand-written CV (RU only, not used by site)
```

## Локальная разработка

```bash
cd site
npm install
npm run dev   # http://localhost:3000
```

Production build (статика в `site/out/`):

```bash
cd site
npm run build
```

## Деплой

Workflow `.github/workflows/deploy.yml` запускается на каждый push в `main`:

1. `npm ci` в `site/`
2. `npm run build` — Next.js генерирует статику в `site/out/`
3. `actions/upload-pages-artifact` — пакует `site/out/`
4. `actions/deploy-pages` — публикует в GitHub Pages

Сайт доступен по адресу: **https://DavydenkovM.github.io/my-career/**

BasePath `/my-career/` вшит в `site/next.config.mjs` для продакшн-сборки (в `NODE_ENV=production`). Локально префикс пустой — все `/photo.jfif`, `/screenshots/...` работают как обычные абсолютные пути.

## Как редактировать контент

| Что | Где |
|---|---|
| Имя, роли, фото, образование, контакты | `site/content/site.ts` → `meta` |
| Шапка (структура, sticky, фото) | `site/components/Header.tsx`, `StickyHeader.tsx` |
| Опыт работы (опыт, достижения, highlights, скриншоты) | `site/content/experience/{ru,en}/*.md` |
| Стек, компетенции, достижения | `site/content/site.ts` → `techs`, `competencies`, `achievements` |
| UI-строки (названия разделов) | `site/content/i18n.ts` |
| Стили (цвета, типографика, печать) | `site/app/globals.css` + `site/tailwind.config.ts` |

Скриншоты/видео для опыта: `site/public/screenshots/<slug-компании>/`.

## Старое резюме

Предыдущая версия резюме (RU only, hand-written markdown) лежит в `experience/`. Сайт её **не использует** — канон контента в `site/content/`. Старый сайт `https://github.com/DavydenkovM/DavydenkovM.github.io` остаётся в архивных целях.
