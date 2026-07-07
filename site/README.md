# my-career-site

A small Next.js + Tailwind site that renders your CV/resume from Markdown files, with a Russian / English language switcher, mobile-first layout, print-to-PDF styling, and a clean minimalist design.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** for styling
- **react-markdown** + **remark-gfm** for Markdown
- **gray-matter** for frontmatter

No database, no CMS — all content is plain files in `content/`.

## Quick start

```bash
cd site
npm install
npm run dev   # http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

> Requires Node.js 18.17+ (Node 20 recommended).

## Project layout

```
site/
├── app/
│   ├── globals.css         # Tailwind + design tokens + print styles
│   ├── layout.tsx          # Root layout + <LangProvider>
│   └── page.tsx            # Home page (server component) → <CvClient/>
├── components/
│   ├── CvClient.tsx        # Main client view: composes all sections
│   ├── LangProvider.tsx    # Language context (ru/en) with localStorage
│   ├── LangSwitcher.tsx    # RU / EN toggle
│   ├── PrintButton.tsx     # window.print() with print styles
│   ├── HeaderTitle.tsx     # Name / title / location
│   ├── AboutSection.tsx    # About + competencies + achievements
│   ├── Section.tsx         # Reusable section heading
│   ├── ExperienceItem.tsx  # Renders one experience .md file
│   ├── TechSection.tsx     # Renders the tech matrix
│   ├── Contacts.tsx        # Renders contact list
│   └── Period.tsx          # Formats YYYY-MM → "Jun 2023" / "июн. 2023"
├── content/
│   ├── i18n.ts             # Supported languages + UI strings
│   ├── site.ts             # About / competencies / tech / contacts
│   ├── loader.ts           # Reads Markdown files from content/experience/<lang>/
│   └── experience/
│       ├── ru/             # Russian experience .md files
│       └── en/             # English experience .md files
├── tailwind.config.ts
├── postcss.config.mjs
├── next.config.mjs
├── tsconfig.json
└── package.json
```

## How to edit

### Add a new experience entry

Create **two** files (one per language). Filename slug must match across languages.

`content/experience/ru/my-company.md`:

```markdown
---
company: "Company Name"
role: "Your title"
period:
  from: "2024-01"
  to: "2025-01"          # omit, or set present: true for current job
  present: false
location: "City / Remote" # optional
order: 10                # lower = shown first
---

- Short summary of the role.
- Use Markdown freely — `##`, lists, **bold**, `code`, tables (GFM), etc.

## What I did

- Bullet 1
- Bullet 2
```

`content/experience/en/my-company.md` — same frontmatter, body in English.

Sort order is controlled by `order` (ascending). Omit `to` and set `present: true` for your current role.

### Edit About / Achievements / Tech / Contacts

Open `content/site.ts`. It exports a `getSiteContent(lang)` function with two literal objects (`ru` and `en`) — edit the fields in place.

### Edit UI strings (section titles, buttons, hints)

Open `content/i18n.ts` — the `labels` map holds every UI string. Add a new key to both `ru` and `en`, then call `t("your.key")` from a component.

### Edit design

- **Colors / spacing / fonts** — `tailwind.config.ts` (look for `colors.ink` and `colors.accent`).
- **Print rules** — `app/globals.css` under `@media print` (page breaks, hiding `.no-print`, etc.).
- **Layout** — `components/CvClient.tsx` (the order/structure of sections) and `components/Section.tsx` (the section header style).

### Add a new section to the CV

1. Create a new component, e.g. `components/ProjectsSection.tsx`.
2. If it needs content, add a new field to `SiteContent` in `content/site.ts`.
3. Mount it inside `components/CvClient.tsx`:
   ```tsx
   <Section id="projects" title={t("ui.projects")}>
     <ProjectsSection />
   </Section>
   ```
4. Add `ui.projects` to both languages in `content/i18n.ts`.

### Add a new language

1. In `content/i18n.ts`, add the new code to the `languages` tuple and add UI strings under `labels[<new>]`.
2. In `content/site.ts`, add a third content object and update `getSiteContent`.
3. Create `content/experience/<new>/*.md` translations (slug must match `ru` files).
4. (Optional) Style the new `LangSwitcher` button — it auto-renders one button per language.

## Print / PDF

Click the **Print / PDF** button in the header (or `Ctrl/Cmd+P`). The `@media print` rules in `globals.css`:

- hide UI chrome (`.no-print`)
- disable link underlines / colors
- force a page break before every experience item after the first (`.print-page-break`)
- keep code blocks / chips readable on paper

In the print dialog, choose **Save as PDF**, set Margins to **Default** or **Minimum**, and untick "Headers and footers" for the cleanest result.

## License

MIT — do whatever you want with this template.
