import type { Language } from "./i18n";

export type SkillGroup = {
  titleKey: "ui.skillsCore" | "ui.skillsStrong" | "ui.skillsFamiliar";
  items: string[];
};

export type TechBlock = {
  category: string;
  groups: SkillGroup[];
};

export type Contact = { label: string; value: string; href?: string };

export type ProfileButton = {
  label: string;
  href: string;
  iconSrc?: string;
};

export type SiteContent = {
  meta: {
    name: string;
    title?: string;
    location: string;
    roles?: string[];
    rolesEn?: string[];
    photo?: string;
    fullName?: string;
    age?: number;
    family?: string;
    education?: string[];
    contactLinks?: Contact[];
    profileButtons?: ProfileButton[];
    contacts?: Contact[];
  };
  about: string[];
  competencies: string[];
  offerings: string[];
  achievements: { text: string; interviews?: number }[];
  techs: TechBlock[];
  contacts: { label: string; value: string; href?: string }[];
};

function ageFromBirth(birth: string, now = new Date()): number {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(birth);
  if (!m) return 0;
  const [, dd, mm, yyyy] = m;
  let age = now.getFullYear() - Number(yyyy);
  const beforeBirthday =
    now.getMonth() + 1 < Number(mm) ||
    (now.getMonth() + 1 === Number(mm) && now.getDate() < Number(dd));
  if (beforeBirthday) age -= 1;
  return age;
}

const BIRTH = "23.12.1989";

const ru: SiteContent = {
  meta: {
    name: "Михаил Давыденков",
    location: "Москва / удалённо",
    roles: ["Технический директор", "Руководитель мобильной разработки", "Архитектор платформ"],
    rolesEn: ["CTO", "Head of Mobile", "Platform Architect"],
    photo: "/photo.jfif",
    fullName: "Давыденков Михаил Юрьевич",
    age: ageFromBirth(BIRTH),
    family: "Женат, двое детей",
    education: [
      "МАИ 2011/2012 — программист (специалитет) · ИнЯз (2-е высшее)",
    ],
    contactLinks: [
      { label: "Telegram", value: "@davydenkovm", href: "https://t.me/davydenkovm" },
      { label: "Email", value: "davydenkov.mihail@gmail.com", href: "mailto:davydenkov.mihail@gmail.com" },
    ],
    profileButtons: [
      { label: "LinkedIn", href: "https://www.linkedin.com/in/mikhail-davydenkov-46508488/" },
      { label: "GitHub", href: "https://github.com/Davydenkovm" },
      { label: "AI", href: "https://clawhub.ai/DavydenkovM" },
    ],
  },
  about: [
    "Более **17 лет** строю **инженерные платформы** и команды в EdTech, FinTech, LifeStyle Mobile Services и Aerospace. Совмещаю **техническое лидерство** с **практической разработкой**: проектирую архитектуру, пишу **критически важные компоненты**, выстраиваю **инженерные процессы** и развиваю команды.",
    "Работал в ролях **CTO**, **Head of Mobile** и **Head of Frontend**, руководил **кросс-функциональными командами** до **20 человек**.",
  ],
  competencies: [
    "Platform Architecture",
    "Mobile Architecture",
    "Engineering Management",
    "Product Engineering",
    "Technical Leadership",
    "Distributed Systems",
    "AI-driven development",
    "Fast TDD / BDD",
  ],
  offerings: [
    "**Запустить новый продукт** — со старта правильно выстроить разработку мобилок, бэка, фронта, инфры. Помочь корректно выбрать **технологический стек**",
    "**Навести порядок в процессах** — сделать разработку **прозрачной для бизнеса и клиентов**",
    "**Оптимизировать работу команд через внедрение ИИ** на всех уровнях: **обучение моделей** под специфику доменной области, **автоматизация ревью и документации**, **контроль за процессами**",
    "**Подтянуть или пересобрать команду** — выстроить **планы обучения**, прокачать **харды**",
    "**Оптимизировать инфраструктуру**, выстроить **пайплайны** и **чеклисты** для staging / препрод / продакшн",
  ],
  achievements: [
    { text: "Помог нескольким компаниям выстроить инженерные процессы, позволяющие масштабировать команды и ускорить поставку продукта" },
    { text: "Построил платформу модульной мобильной разработки — на её базе выпущено 12 приложений (десятки тысяч пользователей)" },
    { text: "Спроектировал и руководил разработкой платёжных систем, образовательных и мобильных платформ с высокими требованиями к надёжности и модульности" },
    { text: "Руководил миграцией образовательной платформы от монолитной архитектуры к микросервисной" },
    { text: "Провёл более 350 технических интервью и участвовал в построении инженерных команд разных уровней — от стартапов до крупных продуктовых компаний", interviews: 350 },
  ],
  techs: [
    {
      category: "Mobile",
      groups: [
        { titleKey: "ui.skillsCore", items: ["React Native", "TypeScript", "Kotlin", "Swift"] },
        { titleKey: "ui.skillsStrong", items: ["MobX", "Reanimated", "Objective‑C"] },
      ],
    },
    {
      category: "Frontend",
      groups: [
        { titleKey: "ui.skillsCore", items: ["React", "Next.js", "SSR", "PWA"] },
        { titleKey: "ui.skillsStrong", items: ["AMP", "Electron"] },
      ],
    },
    {
      category: "Backend",
      groups: [
        { titleKey: "ui.skillsCore", items: ["Node.js", "GoLang", "Python"] },
        { titleKey: "ui.skillsStrong", items: ["Ruby on Rails", "NestJS", "Erlang/Elixir"] },
      ],
    },
    {
      category: "Data layer",
      groups: [
        { titleKey: "ui.skillsCore", items: ["PostgreSQL", "Redis", "Apache Kafka"] },
        { titleKey: "ui.skillsStrong", items: ["MySQL", "MongoDB", "RabbitMQ"] },
      ],
    },
    {
      category: "Infrastructure",
      groups: [
        { titleKey: "ui.skillsCore", items: ["Docker", "CI/CD", "Kubernetes", "Terraform"] },
        { titleKey: "ui.skillsStrong", items: ["Ansible", "Vault", "ELK", "Grafana/Prometheus"] },
      ],
    },
    {
      category: "Architecture",
      groups: [
        { titleKey: "ui.skillsCore", items: ["Microservices", "Modular Monolith", "Backend‑For‑Frontend", "Event‑driven systems"] },
      ],
    },
    {
      category: "Управление",
      groups: [
        { titleKey: "ui.skillsCore", items: ["Команды до 20 человек", "Найм и перф-ревью", "P&L и бюджеты", "Менторинг", "Процессы с нуля"] },
        { titleKey: "ui.skillsStrong", items: ["Кросс-функциональные команды", "Архитектурный комитет", "Техно-пятницы / митапы", "Найм на US-рынке"] },
      ],
    },
    {
      category: "AI инструменты",
      groups: [
        { titleKey: "ui.skillsCore", items: ["AI-агенты на базе модулей", "Авто-генерация модулей", "Авто-ревью и тесты", "Авто-документация", "Унификация стилей через AI"] },
      ],
    },
  ],
  contacts: [
    { label: "Email", value: "you@example.com", href: "mailto:you@example.com" },
    { label: "Telegram", value: "@your_handle" },
    { label: "GitHub", value: "github.com/your-handle", href: "https://github.com/your-handle" },
    { label: "LinkedIn", value: "linkedin.com/in/your-handle", href: "https://linkedin.com/in/your-handle" },
  ],
};

const en: SiteContent = {
  meta: {
    name: "Mikhail Davydenkov",
    location: "Moscow / remote",
    roles: ["CTO", "Head of Mobile", "Platform Architect"],
    rolesEn: ["CTO", "Head of Mobile", "Platform Architect"],
    photo: "/photo.jfif",
    fullName: "Mikhail Yurievich Davydenkov",
    age: ageFromBirth(BIRTH),
    family: "Married, two children",
    education: [
      "MAI 2011/2012 — programmer (specialist) · language dept. (2nd degree)",
    ],
    contactLinks: [
      { label: "Telegram", value: "@davydenkovm", href: "https://t.me/davydenkovm" },
      { label: "Email", value: "davydenkov.mihail@gmail.com", href: "mailto:davydenkov.mihail@gmail.com" },
    ],
    profileButtons: [
      { label: "LinkedIn", href: "https://www.linkedin.com/in/mikhail-davydenkov-46508488/" },
      { label: "GitHub", href: "https://github.com/Davydenkovm" },
      { label: "AI", href: "https://clawhub.ai/DavydenkovM" },
    ],
  },
  about: [
    "**15+ years** in software engineering. I build **engineering platforms**, **scale delivery organizations** and reduce **architectural complexity** of products.",
    "Throughout my career I have set up **engineering processes**, **platform architecture** and **technical organizations** across EdTech, FinTech, Mobile Services and Aerospace.",
    "Hands‑on architect and **engineering leader**: I continue to **design and implement** the most critical parts of the systems I own.",
    "I have led **cross‑functional teams** of up to **20 direct reports** and a mobile engineering group of up to **5 direct reports**.",
  ],
  competencies: [
    "Platform Architecture",
    "Mobile Architecture",
    "Engineering Management",
    "Product Engineering",
    "Technical Leadership",
    "Distributed Systems",
  ],
  offerings: [
    "**Launch a new product** — set up mobile, backend, frontend and infrastructure from day one. Help pick the **right technology stack**.",
    "**Bring order to engineering processes** — make development **transparent to the business and to customers**.",
    "**Optimize team workflows with AI** at every level: **training models** on domain-specific data, **automating code review and documentation**, **monitoring processes**.",
    "**Level up or rebuild the team** — define **growth plans** and sharpen **hard skills**.",
    "**Optimize infrastructure**, build **CI/CD pipelines** and **checklists** for staging / pre-prod / production.",
  ],
  achievements: [
    { text: "Built a modular mobile development platform that powers 12 released apps (tens of thousands of users)" },
    { text: "Led the migration of an EdTech platform from a monolith to microservices" },
    { text: "Set up engineering processes in several companies — from early‑stage startups to large product organizations" },
    { text: "Led the development of mission‑critical systems: payments, education platforms, mobile ecosystems" },
    { text: "Conducted 350+ technical interviews", interviews: 350 },
  ],
  techs: [
    {
      category: "Mobile",
      groups: [
        { titleKey: "ui.skillsCore", items: ["React Native", "TypeScript", "Kotlin", "Swift"] },
        { titleKey: "ui.skillsStrong", items: ["MobX", "Reanimated", "Objective‑C"] },
      ],
    },
    {
      category: "Frontend",
      groups: [
        { titleKey: "ui.skillsCore", items: ["React", "Next.js", "SSR", "PWA"] },
        { titleKey: "ui.skillsStrong", items: ["AMP", "Electron"] },
      ],
    },
    {
      category: "Backend",
      groups: [
        { titleKey: "ui.skillsCore", items: ["Node.js", "GoLang", "Python"] },
        { titleKey: "ui.skillsStrong", items: ["Ruby on Rails", "NestJS", "Erlang/Elixir"] },
      ],
    },
    {
      category: "Data layer",
      groups: [
        { titleKey: "ui.skillsCore", items: ["PostgreSQL", "Redis", "Apache Kafka"] },
        { titleKey: "ui.skillsStrong", items: ["MySQL", "MongoDB", "RabbitMQ"] },
      ],
    },
    {
      category: "Infrastructure",
      groups: [
        { titleKey: "ui.skillsCore", items: ["Docker", "CI/CD", "Kubernetes", "Terraform"] },
        { titleKey: "ui.skillsStrong", items: ["Ansible", "Vault", "ELK", "Grafana/Prometheus"] },
      ],
    },
    {
      category: "Architecture",
      groups: [
        { titleKey: "ui.skillsCore", items: ["Microservices", "Modular Monolith", "Backend‑For‑Frontend", "Event‑driven systems"] },
      ],
    },
    {
      category: "Management",
      groups: [
        { titleKey: "ui.skillsCore", items: ["Teams up to 20", "Hiring & perf reviews", "P&L and budgets", "Mentoring", "Building process from scratch"] },
        { titleKey: "ui.skillsStrong", items: ["Cross-functional teams", "Architecture committee", "Tech Fridays / meetups", "Hiring on the US market"] },
      ],
    },
    {
      category: "AI tooling",
      groups: [
        { titleKey: "ui.skillsCore", items: ["AI agents on top of modules", "Auto-generation of modules", "Auto review & tests", "Auto documentation", "Style unification via AI"] },
      ],
    },
  ],
  contacts: [
    { label: "Email", value: "you@example.com", href: "mailto:you@example.com" },
    { label: "Telegram", value: "@your_handle" },
    { label: "GitHub", value: "github.com/your-handle", href: "https://github.com/your-handle" },
    { label: "LinkedIn", value: "linkedin.com/in/your-handle", href: "https://linkedin.com/in/your-handle" },
  ],
};

export function getSiteContent(lang: Language): SiteContent {
  return lang === "en" ? en : ru;
}
