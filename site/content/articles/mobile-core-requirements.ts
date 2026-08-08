import type { Language } from "@/content/i18n";
import { parseArticle, type Article } from "@/content/articles/types";

const RAW_RU = `Давайте забудем все чему нас учили, и подумаем - как организовать проект на верхнем уровне чтобы
исправить те недостатки, которые я перечислил выше?

Начнем со сбора требований:
- Модуль должен быть полноценной архитектурной единицей приложения
- Нужна верхнеуровневая абстракция чтобы управлять модулями
- Должен быть тулинг который связывает ядро, модули, AI, спеки и людей

## Требования к модулю

| Требование | Содержание |
|---|---|
| **1. Гранулярность и ответственность** | **Модуль = бизнес-функция**, а не архитектурный слой. Граница модуля совпадает с границей функциональности (Авторизация, Профиль, Заказы, Аналитика, Оплата). · **Полноценная архитектурная единица**: содержит ВСЁ необходимое для работы своей функциональности — спецификацию, UI, состояние, локали, сервис, события, конфигурацию, AI-harness релевантный для модуля. Для слоя модуля - свои правила, свои скиллы, свои интерфейсы |
| **2. Атомарность жизненного цикла** | Модуль либо полностью работает, либо полностью отсутствует в приложении. **Включение/выключение = одна строка** в init([...]) на верхнем уровне. · В коде приложения нет условных импортов вида if (analyticsEnabled) require(...). Верхний уровень решает, грузить модуль или нет. |
| **3. Переносимость** | Модуль можно **вытащить в смежный проект** без хирургии: git-submodule + алиас в tsconfig.json. · Манифест package.json декларирует peerDependencies (ядро, UIKit, mobx, react-native) — потребитель знает, что нужно подставить. · Структура директорий стандартизирована, имя слоя = его смысл. |
| **4. Явный и минимальный публичный контракт** | Модуль наружу отдаёт ровно три вещи: **Service** — публичный API для чтения/изменения данных (другие модули общаются с модулем только через Service слой). · **Events** — контракты для слабосвязанной коммуникации и навигации. · **Navigation routes** — URI экранов, которые модуль умеет рендерить. Всё остальное (модель, контейнеры, компоненты) — внутренности модуля, недоступны другим модулям напрямую. |
| **5. Явные зависимости** | Модуль **декларирует**, какие сервисы других модулей ему нужны (dependencies: [...]). · Ядро валидирует граф при инициализации — нет «неявных» связей через глобалы или прямые импорты. |
| **6. Конфигурируемость с верхнего уровня** | defaults: { moduleName: {...} } в init() — начальная конфигурация. · Возможность **override настроек конкретного модуля** без правки самого модуля (например, разный privacy policy для разных типов пользователей). · Тип конфигурации объявлен в самом модуле, но значения приходят снаружи. |
| **7. Самодостаточность** | Свои локали (assets/locale/*.json - опционально локали могут быть получены из remote config). · Свои UI-компоненты, которых нет в общем UIKit. · Своя модель/стор — состояние инкапсулировано. |
| **8. Точка входа как контракт** | Единственный обязательный файл — index.ts, через который ядро инициализирует модуль. · makeModule('id', factory) — фабрика, в которую ядро инжектит inject(route, screen), defaults, контекст. |
| **9. Типовая безопасность и предсказуемость** | TypeScript везде, any запрещён в публичных контрактах. · Структура одинакова для всех модулей → предсказуемость для разработчика и инструментов. |
| **10. AI-friendly (harness-ready)** | Стандартная структура → LLM-ассистент точно знает, где искать экраны/модель/сервис. · Для каждого слоя модуля - свои скиллы (скилл чтобы делать верстку модуля, скилл чтобы работать с данными, скилл для выстраивания внешнего интерфейса модуля и тд.) · Явные контракты → ИИ может безопасно рефакторить внутри модуля, не ломая внешние связи. · Изоляция → изменение в одном модуле не требует каскадной правки других. |
| **11. Ориентация на Spec-Driven-Development** | Модуль следует формальной спецификации - каждый слой модуля может быть сгенерирован из спецификации · Если в модуле появляется спецификация - она становится источником правды. Пока спеки нет - модуль может управляться вручную (это необходимо для постепенной миграции большой кодовой базы на Spec-Driven Development) |

## Требования к ядру (Application Core)

| Требование | Содержание |
|---|---|
| **1. Единая точка входа в приложение** | Функция init(modules, options) — один раз на приложение. · Application компонент — корень дерева, оборачивает всё в провайдеры (темы, локали, навигация, store). |
| **2. Реестр модулей и валидация графа зависимостей** | Принимает массив модулей, вызывает их фабрики. · Перед инициализацией строит граф dependencies, проверяет, что все заявленные зависимости будут предоставлены другими загруженными модулями. Иначе — ApplicationError на старте, не в рантайме фичи. |
| **3. Service discovery** | Ядро должно предоставлять средства чтобы модули могли обращаться к другим модулям. · Резолв синхронный/асинхронный (для модулей, инициализирующихся отложенно). · Бросает понятную ошибку, если сервис не зарегистрирован. |
| **4. Шина событий для межмодульного общения** | publish(event, payload) / EventBus.subscribe(event, handler). · Типизированные payload. · Гарантирует, что подписки/отписки корректно живут в lifecycle модуля. |
| **5. Router (URI-based навигация)** | navigate('/module/screen', params) — модуле-независимый способ перехода. · inject(route, Component) — модуль регистрирует свои экраны у ядра. · Стек, deep links, back navigation — на совести ядра. |
| **6. Connections** | Маппинг event → uri route объявляется на верхнем уровне (connections в init), не в модулях. · Это развязывает: модуль публикует событие «хочу перейти в профиль», приложение решает, какой URI этому соответствует (в текущем билде / в b2b-сборке / в веб-варианте). |
| **7. Управление конфигурацией** | Принимает defaults для каждого модуля. · Подмешивает Remote Config / runtime overrides. · Делает конфиг доступным модулю через инжект в фабрику. |
| **8. Темизация и локализация (платформенные сервисы)** | Реестр тем, переключение на лету. · Реестр локалей модулей, форматирование дат/чисел/валют. |
| **9. Гарантия изоляции** | Ядро не предоставляет API, чтобы модуль А напрямую импортнул код модуля Б (кроме публичных экспортов через его index.ts и сервиса). · Импорты между модулями физически не запретишь, но **архитектурно и документально** это контрактное нарушение, которое легко ловится линтером. |
| **10. Предсказуемость для AI-harness** | Узкий, стабильный API ядра (init, makeModule, Application, EventBus, navigate, inject, publish). · Единая сигнатура фабрики модуля — ИИ всегда знает, какие колбэки/поля доступны. · Документация, типы и примеры — машиночитаемые. |

Как видно требований и к модулю и к ядру достаточно. И разумеется это неполный список требований.

Подобный функционал уже реализован, и на практике выглядит примерно следующим образом (в реализации superapp-mobile-core V1)

[image: app-entrypoint.png | Точка входа приложения: init([...]) с массивом модулей]
[image: app-entrypoint__defaults.png | Та же точка входа с overrides конфигурации конкретных модулей]
[image: module-internals.png | Внутренняя структура модуля: spec, model, ui, service, events, navigation]

Если сравнить Mobile Core концепцию с тем что позволяет FSD - видно что ряд проблем решены

| FSD-проблема | Как проблема решается в Mobile Core |
|---|---|
| Модули сложно выключить | Один массив в init([...]), нет условных require в коде |
| Сложная межмодульная коммуникация | EventBus + URI routing + Service Locator — три явных механизма |
| Сложно перенести в смежный проект | git submodule + alias + peerDependencies + самодостаточная структура |
| Неочевидные контракты | Service + Events + Navigation routes — три явных канала наружу |
| Нельзя настроить модуль с верхнего уровня | defaults в init() + Remote Config, override без правки модуля |
| Не встраивается AI-harness | Стандартная структура + явные контракты + типобезопасность |
`;

const RAW_EN = `Let's forget everything we were taught and think — how to organize a project at the top level to fix the shortcomings I listed above?

Let's start with gathering requirements:
- A module should be a full-fledged architectural unit of the application
- A top-level abstraction is needed to manage modules
- There should be tooling that connects core, modules, AI, specs and people

## Module requirements

| Requirement | Details |
|---|---|
| **1. Granularity and responsibility** | **Module = business feature**, not architectural layer. The module boundary matches the feature boundary (Authentication, Profile, Orders, Analytics, Payment). · **A full-fledged architectural unit**: contains EVERYTHING needed to work its functionality — specification, UI, state, locales, service, events, configuration, AI-harness relevant to the module. For the module layer — its own rules, its own skills, its own interfaces |
| **2. Atomicity of lifecycle** | A module either fully works, or is completely absent from the application. **Enable/disable = one line** in init([...]) at the top level. · The application code has no conditional imports like if (analyticsEnabled) require(...). The top level decides whether to load the module or not. |
| **3. Portability** | A module can be **lifted into a sibling project** without surgery: git-submodule + alias in tsconfig.json. · The package.json manifest declares peerDependencies (core, UIKit, mobx, react-native) — the consumer knows what needs to be supplied. · Directory structure is standardized, the layer name = its meaning. |
| **4. Explicit and minimal public contract** | A module exposes exactly three things to the outside: **Service** — public API for reading/changing data (other modules communicate with the module only through the Service layer). · **Events** — contracts for loosely-coupled communication and navigation. · **Navigation routes** — URIs of screens the module can render. Everything else (model, containers, components) is internals of the module, inaccessible to other modules directly. |
| **5. Explicit dependencies** | The module **declares** which services of other modules it needs (dependencies: [...]). · The core validates the graph at initialization — no "implicit" connections through globals or direct imports. |
| **6. Configurability from the top level** | defaults: { moduleName: {...} } in init() — initial configuration. · Ability to **override settings of a specific module** without modifying the module itself (e.g. different privacy policy for different user types). · The configuration type is declared in the module itself, but values come from outside. |
| **7. Self-sufficiency** | Own locales (assets/locale/*.json — optionally locales can be obtained from remote config). · Own UI components that are not in the shared UIKit. · Own model/store — state is encapsulated. |
| **8. Entry point as contract** | The only required file is index.ts, through which the core initializes the module. · makeModule('id', factory) — a factory into which the core injects inject(route, screen), defaults, context. |
| **9. Type safety and predictability** | TypeScript everywhere, any is forbidden in public contracts. · The structure is the same for all modules → predictability for the developer and tools. |
| **10. AI-friendly (harness-ready)** | Standard structure → the LLM assistant knows exactly where to look for screens/model/service. · For each module layer — its own skills (a skill to make the module's layout, a skill to work with data, a skill for building the module's external interface, etc.) · Explicit contracts → AI can safely refactor inside the module without breaking external links. · Isolation → a change in one module doesn't require cascading edits in others. |
| **11. Orientation on Spec-Driven-Development** | The module follows a formal specification — each layer of the module can be generated from the specification · If a specification appears in the module — it becomes the source of truth. Until there is a spec — the module can be managed manually (this is necessary for gradual migration of a large codebase to Spec-Driven Development) |

## Core requirements (Application Core)

| Requirement | Details |
|---|---|
| **1. Single entry point into the application** | Function init(modules, options) — once per application. · Application component — the root of the tree, wraps everything in providers (theme, locale, navigation, store). |
| **2. Module registry and dependency graph validation** | Accepts an array of modules, calls their factories. · Before initialization, builds the dependencies graph, checks that all declared dependencies will be provided by other loaded modules. Otherwise — ApplicationError at startup, not in feature runtime. |
| **3. Service discovery** | The core must provide means so that modules can address other modules. · Resolution sync/async (for modules initialized lazily). · Throws a clear error if the service is not registered. |
| **4. Event bus for inter-module communication** | publish(event, payload) / EventBus.subscribe(event, handler). · Typed payloads. · Guarantees that subscriptions/unsubscriptions correctly live in the module's lifecycle. |
| **5. Router (URI-based navigation)** | navigate('/module/screen', params) — module-independent way of navigating. · inject(route, Component) — the module registers its screens with the core. · Stack, deep links, back navigation — the core's responsibility. |
| **6. Connections** | Mapping event → uri route is declared at the top level (connections in init), not in modules. · This decouples: the module publishes the event "I want to go to profile", the application decides which URI this corresponds to (in the current build / in the b2b build / in the web variant). |
| **7. Configuration management** | Accepts defaults for each module. · Mixes in Remote Config / runtime overrides. · Makes the config available to the module via inject into the factory. |
| **8. Theming and localization (platform services)** | Theme registry, switching on the fly. · Module locale registry, formatting of dates/numbers/currencies. |
| **9. Isolation guarantee** | The core does not provide an API for module A to directly import module B's code (other than public exports through its index.ts and service). · Imports between modules can't be physically forbidden, but **architecturally and document-wise** it is a contract violation that is easily caught by a linter. |
| **10. Predictability for AI-harness** | A narrow, stable core API (init, makeModule, Application, EventBus, navigate, inject, publish). · A single signature for the module factory — AI always knows which callbacks/fields are available. · Documentation, types and examples are machine-readable. |

As you can see, there are enough requirements both for the module and for the core. And of course this is not a complete list of requirements.

Such functionality is already implemented, and in practice it looks approximately as follows (in the implementation of superapp-mobile-core V1)

[image: app-entrypoint.png | App entry point: init([...]) with a module array]
[image: app-entrypoint__defaults.png | The same entry point with per-module config overrides]
[image: module-internals.png | Module internals: spec, model, ui, service, events, navigation]

If we compare the Mobile Core concept with what FSD allows — you can see that a number of problems are solved

| FSD problem | How the problem is solved in Mobile Core |
|---|---|
| Modules are hard to disable | One array in init([...]), no conditional require in code |
| Complex inter-module communication | EventBus + URI routing + Service Locator — three explicit mechanisms |
| Hard to move to a sibling project | git submodule + alias + peerDependencies + self-sufficient structure |
| Non-obvious contracts | Service + Events + Navigation routes — three explicit outward channels |
| Can't configure a module from the top level | defaults in init() + Remote Config, override without modifying the module |
| Doesn't fit an AI-harness | Standard structure + explicit contracts + type safety |
`;

export const articleRu: Article = {
  slug: "mobile-core-requirements",
  title: "Сбор требований для Mobile Core",
  lead:
    "Формальные требования к модулю и ядру, которые решают проблемы FSD и задают фундамент Mobile Core.",
  date: "2026-07-26",
  tags: ["Mobile", "Architecture", "Modules", "Mobile Core"],
  imageBase: "/notes/mobile-core-requirements",
  blocks: parseArticle(RAW_RU, "Иллюстрация к статье"),
};

export const articleEn: Article = {
  slug: "mobile-core-requirements",
  title: "Requirements gathering for Mobile Core",
  lead:
    "Formal requirements for a module and the core that solve FSD's problems and lay the foundation for Mobile Core.",
  date: "2026-07-26",
  tags: ["Mobile", "Architecture", "Modules", "Mobile Core"],
  imageBase: "/notes/mobile-core-requirements",
  blocks: parseArticle(RAW_EN, "Article illustration"),
};

export function getArticle(slug: string, lang: Language): Article | null {
  if (slug !== "mobile-core-requirements") return null;
  return lang === "en" ? articleEn : articleRu;
}

export const articlesBySlug: Record<string, Article> = {
  [articleRu.slug]: articleRu,
};
