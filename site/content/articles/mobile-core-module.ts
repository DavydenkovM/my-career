import type { Language } from "@/content/i18n";
import {
  parseArticle,
  type Article,
  type ArticleBlock,
} from "@/content/articles/types";

const SUMMARY_IMG: ArticleBlock = {
  type: "img",
  src: "mobile-core-module-public-api-v2.png",
  alt: "Модуль как капсула: пять runtime-окон и мета-контракт для AI-агента",
  caption:
    "Модуль Mobile Core: инкапсулированная функциональная область с пятью runtime-контрактами наружу и мета-контрактом для AI-агента",
};

const INTRO_IMG_EN: ArticleBlock = {
  type: "img",
  src: "mobile-core-module-public-api-v2.png",
  alt: "A module as a capsule: five runtime windows and one meta-contract for an AI agent",
  caption:
    "A Mobile Core module: an encapsulated functional area with five runtime contracts out and a meta-contract for the AI agent",
};

const MODULE_CONTRACTS_IMG: ArticleBlock = {
  type: "img",
  src: "module-contracts.png",
  alt: "Шесть окон: способы работы с модулем",
  caption:
    "Шесть публичных контрактов модуля — единственные точки взаимодействия с внешним миром",
};

const HIERARCHY_IMG: ArticleBlock = {
  type: "img",
  src: "module-internal-hierarchy.png",
  alt: "Иерархия слоёв внутри модуля",
  caption:
    "Направление зависимостей между слоями модуля",
};

const COMMUNICATIONS_IMG: ArticleBlock = {
  type: "img",
  src: "mobile-core-communications.png",
  alt: "Три способа межмодульной коммуникации",
  caption: "Service, Events и Portals — три канала общения между модулями",
};

const HIERARCHY_IMG_EN: ArticleBlock = {
  type: "img",
  src: "module-internal-hierarchy.png",
  alt: "Hierarchy of layers inside a module",
  caption:
    "Direction of dependencies between module layers: everything points inward — toward the model",
};

const MODULE_CONTRACTS_IMG_EN: ArticleBlock = {
  type: "img",
  src: "module-contracts.png",
  alt: "Six windows: ways to work with a module",
  caption:
    "Six public module contracts — the only interaction points with the outside world",
};

const INTRO_RU = `## ООП, выросшее до уровня модуля

В прошлой статье я разобрал четыре проблемы Feature-Sliced Design: модули сложно выключать, между ними сложно строить коммуникацию, их трудно переносить в смежные проекты, а публичные контракты часто остаются неочевидными.

В этой статье я предлагаю расширить концепцию модуля, чтобы она:

- хорошо работала в современных реалиях AI-assisted разработки
- задавала понятную структуру слоёв и зависимостей между ними, позволяя создавать модуль поэтапно
- позволяла просто конфигурировать модуль с верхнего уровня

В Mobile Core мы пришли к модели модуля, которую можно рассматривать как ООП, выросшее до уровня модуля.

В ООП принято:

- скрывать реализацию за публичным интерфейсом
- разделять ответственность
- строить сложное поведение через взаимодействие сущностей

Те же принципы применяются не к объекту, а к функциональной области продукта.

## Публичные контракты — то, что имеет значение

Модуль — это функционально законченный и автономный строительный блок продукта, который может использоваться в разных приложениях.

Инкапсуляция предполагает сокрытие деталей внутренней реализации — и для модулей это работает так же. Модуль в некотором смысле является чёрным ящиком: проектируя продукт, мы мыслим крупными блоками, не отвлекаясь на их внутреннее устройство.

Поэтому в модульном проектировании важны прежде всего публичные контракты модуля.

Внутреннюю реализацию можно менять, не затрагивая потребителей, пока публичные контракты остаются неизменными.

Но не стоит смешивать все контракты в одну большую абстракцию. Для разных сценариев использования модуля нужны разные контракты.

Это, в некотором смысле, сегрегация интерфейсов модуля по архитектурным слоям — тот самый ISP из SOLID.

Для разных сценариев — свои контракты и своя ответственность.

Для визуализации этой идеи удобно представить модуль как **капсулу с окнами**. Капсула отделяет внутренний мир модуля от остальной системы. А окна — это разные способы посмотреть на модуль и взаимодействовать с ним.
`;

const HIERARCHY_RU = `## Связи слоёв внутри модуля

Помимо контрактов важно определить направление зависимостей между слоями.

Основная цепочка:

**ViewModel → Container → Component**

ViewModel предоставляет состояние и действия, Container связывает их с UI, Component отвечает только за представление. Это направление зависимостей, а не классический Unidirectional Data Flow.

**Model — это ViewModel**, а не копия data-модели backend. Мы придерживаемся принципа тонкого клиента: бизнес-правила и сложные операции по возможности остаются в backend/BFF. Поэтому модели принадлежат конкретному модулю и не обязаны превращаться в универсальные сущности приложения.

Остальные зависимости также направлены внутрь:

* **Service → Model** — публичный Service использует приватную Model; Model не знает о собственном Service. Сервис по сути фасад к модели.
* **Model → Configuration** — модель читает Remote Config, но конфигурация не знает о модели.
* **App Config → Module** — приложение передаёт модулю конфигурацию; модуль не знает о верхнем уровне.
* **Portal → ViewModel** — Portal также следует ViewModel-принципу, но может отображаться в другом модуле.

Если Model или Container становятся слишком сложными, мы прежде всего задаём вопрос: **не слишком ли большим стал сам модуль?** Предпочтительно уменьшить модуль, чем усложнять его внутреннюю архитектуру.

Строгая иерархия между слоями позволяет минимизировать хаос коммуникации
`;

const HIERARCHY_EN = `## Connections between layers inside a module

Beyond the contracts, it's important to fix the direction of dependencies between layers.

The main chain:

**ViewModel → Container → Component**

The ViewModel provides state and actions, the Container binds them to the UI, the Component is purely presentational. This is the direction of dependencies, not classic Unidirectional Data Flow.

**Model is the ViewModel**, not a copy of the backend's data model. We follow the thin-client principle: business rules and complex operations stay in the backend / BFF wherever possible. That is why models belong to a specific module and are not forced to become universal application entities.

All other dependencies also point inward:

* **Service → Model** — the public Service uses the private Model; the Model does not know about its own Service. The Service is effectively a facade over the Model.
* **Model → Configuration** — the Model reads Remote Config, but the configuration does not know about the Model.
* **App Config → Module** — the application passes configuration to the module; the module does not know about the top level.
* **Portal → ViewModel** — a Portal follows the same ViewModel principle, but may be rendered inside another module.

If the Model or Container start becoming too complex, the first question we ask is: **has the module itself grown too big?** It is better to shrink the module than to complicate its internal architecture.

A strict hierarchy between layers is what keeps the chaos of communication to a minimum.
`;

const COMMUNICATIONS_RU = `## Межмодульные коммуникации

В архитектуре модулей Mobile Core заложено аж 3 способа обмена данными между модулями.

И это не спроста — коммуникации очень важны, и межмодульное общение — не исключение.

Всё дело в том, что для каждого сценария коммуникации бывают удобны разные способы.

### 1. Service

Service — самый простой способ одному модулю что-то получить от другого модуля, не нарушая его инкапсуляцию.

Допустим, у нас есть модуль профиля пользователя — profile, и модуль работы с заказами — orders.

Модулю заказов может потребоваться телефон пользователя, который уже известен модулю profile.

Всё, что нужно сделать, — вызвать нужный метод из публичного сервиса профиля, и данные есть:

\`\`\`typescript
const profileService = Application.resolveSync<Profile.Service>('profile');
const phone = profileService.getPhone();
\`\`\`


Сервис не ограничен только синхронными операциями — но суть та же: результат, который получается здесь и сейчас.

\`\`\`typescript
const locationData = await locationService.calculateLocation();
\`\`\`


### 2. Events

Когда возможностей Service недостаточно — можно применить событийный интерфейс (паттерн Pub / Sub).

Скажем, мы делаем функционал сканирования QR-кодов при покупке товаров в магазине.

у нас есть модуль qr-code-scanner
модуль catalog
модуль profile

Пользователь сканирует свой ID на кассе — в модуле catalog нужно подтянуть любимые продукты пользователя, а в profile — персональные скидки.

Очевидно, событийный интерфейс здесь сработает хорошо.

При успешном сканировании модуль сканера отправит эвент:

\`\`\`typescript
EventBus.publish(QrCodeScannedEvent, { userId: 'UUID' });
\`\`\`


Соответственно, в module-index файлах соответствующих модулей будут подписки на события:

\`\`\`typescript
EventBus.subscribe(QrCodeScannedEvent, onQrScanned);
\`\`\`


Модули остаются независимыми, при этом событийная архитектура выглядит достаточно простой для понимания.

### 3. Portals

Порталы также являются способом межмодульного взаимодействия.

По сути, это удобный способ обмена данными, который позволяет не перегружать Service-уровень.

Мы можем вставлять готовые данные прямо в разметку модуля.

Но при желании можем пошарить и UX-элементы между модулями таким способом.

Например, у нас может быть модуль address, который содержит в себе логику представления пользовательских адресов.

Модулю товаров не нужно дублировать логику представления адреса — можно сразу получить готовый вариант от модуля адреса.

Можно получать и готовые UX-блоки таким способом. Это может быть чуть более сложно, так как один и тот же компонент может выглядеть в разных модулях и разных приложениях по-разному, но к теме данной статьи это не относится.

Эти три механизма хорошо описывают основные способы коммуникации между модулями и позволяют проектировать модули независимыми и автономными.
`;

const INTRO_EN = `## Introduction

In the previous article I broke down four problems of Feature-Sliced Design on a real open-source project: modules are hard to disable, inter-module communication is hard, lifting a module into a sibling project is hard, and contracts are non-obvious.

Four hypotheses — four diagnoses. But no answer.

This article is about the shape of the answer.

### A module as a capsule

In Mobile Core every functional module is a **capsule**. Not a folder in a project, not a layer in an architecture, not a component in a dependency tree — but a self-contained functional unit with its own boundary.

Inside the capsule — everything the domain needs to live autonomously: state, screens, logic, localization, the contract with the server.

Outside, the capsule shows others only what it itself chooses to show. And it shows that through **windows** — six different outward channels: five runtime contracts and one meta-contract.

In this article I'll show:

- what the capsule consists of;
- what its six windows are and why each needs its own language;
- where inside it the interfaces live and why they aren't collected in a single file;
- and why this shape answers all four FSD problems at once.
`;

const CONCLUSION_RU = `## Заключение

В этой статье мы начали формировать концепцию Mobile Core — подхода к построению модульных цифровых продуктов в эпоху AI-assisted разработки.

Мы рассмотрели модуль как самостоятельную архитектурную единицу, перенесли принципы инкапсуляции и сегрегации контрактов на уровень модуля, разобрали направление зависимостей между его слоями и рассмотрели основные способы межмодульного взаимодействия.

Это только основа концепции. За пределами этой статьи остаются навигация отвязанная от ui слоя, контракты клиент ↔ BFF и, наконец, AI-harness — мета-контракт, который позволяет AI-агенту работать с модулем в рамках его архитектуры и правил.

О них — в следующих частях.
`;

const CAPSULE_EN = `## The capsule: a black box with six windows

Imagine a module as a black box with six numbered windows. The windows aren't "different names for the same thing". Each window speaks its own language and serves its own purpose:

| Window | Language | What it gives out |
|---|---|---|
| 1. Service | "Ask me — I'll answer" | Data and methods to other modules |
| 2. Events | "I'll let you know when …" | Notifications about internal changes |
| 3. Portals | "Here are my widgets — plug them into yours" | Embeddable UI pieces |
| 4. Routes | "This is where the user can come in" | Entry points into user scenarios |
| 5. Platform contract | "Give me these APIs — and I'll work" | Which BFF endpoints the module needs |
| 6. AI harness | "Here's how to work with me" | Rules, specification, decision history for AI agents |

The first five windows are **runtime contracts**: through them the capsule talks to other modules and the platform while the application is running.

The sixth window is different in kind. It's a **meta-contract**: it tells an AI agent (or a new developer) how the module is structured, what rules govern changes, and which architectural decisions have already been made and why. Today this is AGENTS.md, the module's specification, and the history of its major architectural decisions (ADRs). The exact structure of this layer is still being shaped, but its place in the capsule is already fixed — the AI harness must be a first-class citizen of module architecture.

Everything else is inside. Containers, stores, adapters, builders, localization — all that is the capsule's interior, which other modules neither see nor should see.

In the next section we'll walk through each window with simple examples.
`;

export const articleRu: Article = {
  slug: "mobile-core-module",
  title: "Mobile Core: ООП на уровне модуля - инкапсуляция, контракты и композиция",
  lead:
    "ООП на уровне модуля, сегрегация контрактов, тонкие клиенты, направление зависимостей внутри модуля, межмодульная коммуникация",
  date: "2026-08-06",
  tags: ["Mobile", "Architecture", "Modules", "Mobile Core"],
  imageBase: "/notes/mobile-core-module",
  blocks: [
    ...parseArticle(INTRO_RU, "Иллюстрация к статье"),
    MODULE_CONTRACTS_IMG,
    ...parseArticle(HIERARCHY_RU, "Иллюстрация к статье"),
    HIERARCHY_IMG,
    ...parseArticle(COMMUNICATIONS_RU, "Иллюстрация к статье"),
    COMMUNICATIONS_IMG,
    ...parseArticle(CONCLUSION_RU, "Иллюстрация к статье"),
    SUMMARY_IMG,
  ],
};

export const articleEn: Article = {
  slug: "mobile-core-module",
  title: "A Mobile Core module as a capsule: five windows out, everything else inside",
  lead:
    "Breaking down the shape of a Mobile Core module — a capsule with five windows. Why each window speaks its own language, where the interfaces live inside, and how this answers the four FSD problems from the previous article.",
  date: "2026-08-06",
  tags: ["Mobile", "Architecture", "Modules", "Mobile Core"],
  imageBase: "/notes/mobile-core-module",
  blocks: [
    ...parseArticle(INTRO_EN, "Article illustration"),
    ...parseArticle(CAPSULE_EN, "Article illustration"),
    INTRO_IMG_EN,
    ...parseArticle(HIERARCHY_EN, "Article illustration"),
    HIERARCHY_IMG_EN,
  ],
};

export function getArticle(slug: string, lang: Language): Article | null {
  if (slug !== "mobile-core-module") return null;
  return lang === "en" ? articleEn : articleRu;
}

export const articlesBySlug: Record<string, Article> = {
  [articleRu.slug]: articleRu,
};
