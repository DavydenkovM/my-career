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

const SUMMARY_IMG_EN: ArticleBlock = {
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

The ViewModel provides state and actions, the Container binds them to the UI, the Component is responsible only for presentation. This is a direction of dependencies, not classic Unidirectional Data Flow.

**Model is the ViewModel**, not a copy of the backend's data model. We follow the thin-client principle: business rules and complex operations stay in the backend / BFF wherever possible. That is why models belong to a specific module and are not forced to become universal application entities.

All other dependencies also point inward:

* **Service → Model** — the public Service uses the private Model; the Model does not know about its own Service. The Service is essentially a facade over the Model.
* **Model → Configuration** — the Model reads Remote Config, but configuration does not know about the Model.
* **App Config → Module** — the application passes configuration to the module; the module does not know about the top level.
* **Portal → ViewModel** — a Portal also follows the ViewModel principle, but can be rendered inside another module.

If the Model or Container start becoming too complex, the first question we ask is: **has the module itself grown too big?** It is better to shrink the module than to complicate its internal architecture.

A strict hierarchy between layers is what keeps the chaos of communication to a minimum.
`;

const COMMUNICATIONS_EN = `## Inter-module communications

The Mobile Core module architecture has as many as three ways to exchange data between modules.

And this is no accident — communications are very important, and inter-module communication is no exception.

The thing is, different ways are convenient for different communication scenarios.

### 1. Service

Service is the simplest way for one module to get something from another without breaking its encapsulation.

Say we have a user profile module — profile — and an orders module — orders.

The orders module may need the user's phone number, which is already known to the profile module.

All you need to do is call the right method from the profile module's public service, and the data is yours:

\`\`\`typescript
const profileService = Application.resolveSync<Profile.Service>('profile');
const phone = profileService.getPhone();
\`\`\`


Service is not limited to synchronous operations only — but the essence is the same: a result that is obtained here and now.

\`\`\`typescript
const locationData = await locationService.calculateLocation();
\`\`\`


### 2. Events

When the capabilities of Service are not enough — you can apply the event interface (the Pub / Sub pattern).

Say we're building QR code scanning for in-store purchases.

we have a qr-code-scanner module
a catalog module
a profile module

The user scans their ID at the checkout — the catalog module needs to pull the user's favorite products, while the profile module needs personal discounts.

Obviously, an event interface will work well here.

On a successful scan the scanner module publishes an event:

\`\`\`typescript
EventBus.publish(QrCodeScannedEvent, { userId: 'UUID' });
\`\`\`


Accordingly, in the module-index files of the respective modules there will be subscriptions to the event:

\`\`\`typescript
EventBus.subscribe(QrCodeScannedEvent, onQrScanned);
\`\`\`


Modules stay independent, while the event architecture looks simple enough to understand.

### 3. Portals

Portals are also a way of inter-module interaction.

In essence, this is a convenient way of exchanging data that lets you avoid overloading the Service layer.

We can inject ready-made data right into a module's markup.

But if we want, we can share UX elements between modules this way as well.

For example, we might have an address module that contains the presentation logic for user addresses.

The products module doesn't need to duplicate the address presentation logic — it can just get the ready variant from the address module.

You can get ready-made UX blocks this way too. This can be a bit more complex, since the same component may look different in different modules and applications, but that's outside the scope of this article.

These three mechanisms describe the main ways modules can communicate and let you design modules that are independent and autonomous.
`;

const CONCLUSION_EN = `## Conclusion

In this article we started shaping the concept of Mobile Core — an approach to building modular digital products in the era of AI-assisted development.

We looked at the module as a standalone architectural unit, moved the principles of encapsulation and contract segregation to the module level, broke down the direction of dependencies between its layers, and examined the main ways of inter-module interaction.

This is only the foundation of the concept. Outside the scope of this article remain UI-decoupled navigation, client ↔ BFF contracts, and finally the AI-harness — the meta-contract that lets an AI agent work with a module within its architecture and rules.

More on them — in the next parts.
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

const INTRO_EN = `## OOP grown to the module level

In the previous article I broke down four problems of Feature-Sliced Design: modules are hard to disable, building communication between them is hard, they're hard to port to sibling projects, and public contracts often stay non-obvious.

In this article I propose to extend the concept of a module so that it:

- works well in the realities of AI-assisted development
- defines a clear structure of layers and dependencies between them, allowing a module to be built incrementally
- makes it easy to configure the module from the top level

In Mobile Core we arrived at a module model that can be seen as OOP grown to the module level.

In OOP it is customary to:

- hide implementation behind a public interface
- separate responsibilities
- build complex behavior through interaction of entities

The same principles apply not to an object, but to a product's functional area.

## Public contracts — what matters

A module is a functionally complete and autonomous building block of a product that can be used across different applications.

Encapsulation implies hiding the details of internal implementation — and for modules it works the same way. In some sense a module is a black box: when designing a product, we think in large blocks without being distracted by their internal makeup.

That is why in modular design it is the public contracts of a module that matter most.

The internal implementation can be changed without affecting consumers, as long as the public contracts remain unchanged.

But you should not mix all contracts into one big abstraction. Different usage scenarios of a module need different contracts.

This is, in some sense, the segregation of module interfaces by architectural layers — that same ISP from SOLID.

For different scenarios — their own contracts and their own responsibility.

To visualize this idea it is convenient to think of a module as a **capsule with windows**. The capsule separates the module's internal world from the rest of the system. And the windows are different ways to look at the module and interact with it.
`;

const CONCLUSION_RU = `## Заключение

В этой статье мы начали формировать концепцию Mobile Core — подхода к построению модульных цифровых продуктов в эпоху AI-assisted разработки.

Мы рассмотрели модуль как самостоятельную архитектурную единицу, перенесли принципы инкапсуляции и сегрегации контрактов на уровень модуля, разобрали направление зависимостей между его слоями и рассмотрели основные способы межмодульного взаимодействия.

Это только основа концепции. За пределами этой статьи остаются навигация отвязанная от ui слоя, контракты клиент ↔ BFF и, наконец, AI-harness — мета-контракт, который позволяет AI-агенту работать с модулем в рамках его архитектуры и правил.

О них — в следующих частях.
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
  title: "Mobile Core: OOP at the module level — encapsulation, contracts, and composition",
  lead:
    "OOP at the module level: encapsulation, contract segregation, thin clients, direction of dependencies inside a module, and inter-module communication.",
  date: "2026-08-06",
  tags: ["Mobile", "Architecture", "Modules", "Mobile Core"],
  imageBase: "/notes/mobile-core-module",
  blocks: [
    ...parseArticle(INTRO_EN, "Article illustration"),
    MODULE_CONTRACTS_IMG_EN,
    ...parseArticle(HIERARCHY_EN, "Article illustration"),
    HIERARCHY_IMG_EN,
    ...parseArticle(COMMUNICATIONS_EN, "Article illustration"),
    COMMUNICATIONS_IMG,
    ...parseArticle(CONCLUSION_EN, "Article illustration"),
    SUMMARY_IMG_EN,
  ],
};

export function getArticle(slug: string, lang: Language): Article | null {
  if (slug !== "mobile-core-module") return null;
  return lang === "en" ? articleEn : articleRu;
}

export const articlesBySlug: Record<string, Article> = {
  [articleRu.slug]: articleRu,
};
