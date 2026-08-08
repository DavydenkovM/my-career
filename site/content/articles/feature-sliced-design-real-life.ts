import type { Language } from "@/content/i18n";
import {
  parseArticle,
  type Article,
  type ArticleBlock,
} from "@/content/articles/types";

const RESEARCH_RU = `## Объект исследования

| Параметр | Значение |
|---|---|
| Репозиторий | https://github.com/penteleichuk/Moke-Smoke |
| Стек | React Native 0.73 + Redux Toolkit + RN Navigation + Firebase |
| FSD compliance | Декларируется в README (с оговоркой: pages → screens) |
| Объём кода src/ | 6 слоёв, 96+ директорий со слайсами |

### Структура src/


src/
├── app/         ← композиция: navigation, providers, store
├── processes/   ← (отсутствует, уместно)
├── pages/       ← переименован в screens/ «для mobile»
├── widgets/     ← 15 составных UI-блоков
├── features/    ← 15 верхнеуровневых «фич», 40 вложенных
├── entities/    ← 12 доменных сущностей
└── shared/      ← переиспользуемые абстракции (ui, lib, api, config)


И всё это собрано в один combineReducers в src/app/providers/StoreProvider/config/reducer.ts и один Stack.Navigator в src/app/navigation/ui/Navigation.tsx.

## Гипотеза A — модули сложно выключить

Чтобы убрать из приложения фичу audio-плеера, нужно синхронно отредактировать минимум 5 файлов.

### A.1 Глобальный enum маршрутов


src/shared/config/navigation/model/types/navigation.ts


100 строк — enum AppNavigation с 42 значениями. Любая новая или удалённая фича = правка одного общего enum + одного общего типа.

### A.2 Глобальный роутер


src/app/navigation/ui/Navigation.tsx


371 строка — 42 экрана зарегистрированы руками в одном файле.

### A.3 Глобальный стор


src/app/providers/StoreProvider/config/reducer.ts


combineReducers всех фич.

### A.4 Глобальный persist-whitelist


src/app/providers/StoreProvider/config/persistedReducer.ts


Whitelist персистируемых слайсов. Имена — строковые ключи, нигде не типизированы.

### A.5 Глобальный провайдер bottom-sheets


src/app/providers/SheetProvider/SheetProvider.tsx


12 sheet-виджетов захардкожены. Агрегатор ниже перечисляет те же 12 импортов ещё раз:


src/widgets/sheet/index.ts


**Вывод:** в FSD нет механизма «фича сама себя регистрирует». Чтобы выключить — нужно знать устройство всего приложения.

## Гипотеза B — между модулями сложно построить коммуникацию

В проекте зафиксировано **23 нарушения направления зависимостей**.

### B.1 shared → feature (критическое)


src/shared/ui/PressableOpacity/ui/PressableOpacity.tsx


Импортирует селектор из фичи «вибрация». PressableOpacity — центральный UI-компонент, используется в 45 файлах.

### B.2 widget → feature (14 случаев)

Виджеты массово импортируют фичи — 14 случаев. Самые показательные: widgets/profile-setting-inputs импортирует 5 фич из features/setting/set-*, widgets/simulator — 3 фичи из features/smoked/*.

### B.3 feature → feature (5 случаев)

Фичи не изолированы. Самые «дорогие»: features/send-message-chat импортирует features/language-picker, features/feed/feed-create-post импортирует features/language-picker.

### B.4 feature → app (3 случая)

Самое грубое — фичи импортируют провайдер приложения. Без app/providers/SheetProvider фичи не работают вообще.

## Гипотеза C — модули сложно утащить в смежный проект

### C.1 Отсутствие агрегаторов верхнего уровня

Из 15 верхнеуровневых директорий в src/features/ 5 крупнейших (auth, feed, player, setting, smoked) не имеют index.ts верхнего уровня.

Чтобы «утащить» features/auth/auth-by-google в другой проект — нужно 5–6 ручных правок: скопировать директорию, зарегистрировать редьюсер, добавить маршрут в enum, зарегистрировать экран, добавить в persist-whitelist, проверить сущности.

### C.2 Неявная связь через центральные конфиги

Фичи импортируют shared/config/navigation. Без воссоздания AppNavigation-enum (42 значения) фичи не компилируются.

## Гипотеза D — контракты модулей неочевидны

### D.1 Публичные API текут


src/features/setting/toggle-vibration/index.ts


Экспортирует сразу селектор, редьюсер и UI-компонент. Внутренне фиче нужен только reducer. Все три текут в общий namespace.

### D.2 Селектор используется как «контракт»

getLanguage из features/language-picker импортируется в 5 местах: hook фида, два хука чата, экран создания поста, экран аудио. Переименование селектора ломает 5 файлов. Нет интерфейса, нет DI, нет точки подмены.

### D.3 Типизация маршрутов — F = any

ts
export type NavigationStackLists<F = any> = {
  [AppNavigation.COURSE]: F;
  ...
};


Контракт между фичей и навигацией — any. Опечатка в имени поля — runtime error.

## Сводная таблица нарушений

| Гипотеза | Факт в коде |
|---|---|
| Модули сложно выключить | 5 центральных файлов правятся вручную при отключении одной фичи |
| Сложная межмодульная коммуникация | 14 widget→feature импортов, 5 cross-feature импортов, 3 feature→app импорта |
| Сложно перенести в смежный проект | 15 «фич» верхнего уровня, у 5 из них нет агрегирующего index.ts |
| Контракты модулей неочевидны | Фичи экспортируют и reducer, и selector, и UI; навигация типизирована через F = any |
`;

const RESEARCH_EN = `## Object of study

| Parameter | Value |
|---|---|
| Repository | https://github.com/penteleichuk/Moke-Smoke |
| Stack | React Native 0.73 + Redux Toolkit + RN Navigation + Firebase |
| FSD compliance | Self-declared in README (with a deviation: pages → screens) |
| src/ size | 6 layers, 96+ slice directories |

### src/ structure


src/
├── app/         ← composition: navigation, providers, store
├── processes/   ← (absent, appropriate)
├── pages/       ← renamed to screens/ «for mobile»
├── widgets/     ← 15 composite UI blocks
├── features/    ← 15 top-level «features», 40 nested
├── entities/    ← 12 domain entities
└── shared/      ← reusable abstractions (ui, lib, api, config)


All assembled into one combineReducers in src/app/providers/StoreProvider/config/reducer.ts and one Stack.Navigator in src/app/navigation/ui/Navigation.tsx.

## Hypothesis A — modules are hard to disable

To remove the audio-player feature you have to synchronously edit at least 5 files.

### A.1 Global route enum


src/shared/config/navigation/model/types/navigation.ts


100 lines — an AppNavigation enum with 42 values. Any added or removed feature = editing one shared enum + one shared type.

### A.2 Global router


src/app/navigation/ui/Navigation.tsx


371 lines — 42 screens manually registered in a single file.

### A.3 Global store


src/app/providers/StoreProvider/config/reducer.ts


combineReducers of all features.

### A.4 Global persist whitelist


src/app/providers/StoreProvider/config/persistedReducer.ts


Whitelist of persisted slices. Names are string keys, never typed.

### A.5 Global bottom-sheets provider


src/app/providers/SheetProvider/SheetProvider.tsx


12 sheet widgets hardcoded. The aggregator below lists the same 12 imports again:


src/widgets/sheet/index.ts


**Conclusion:** FSD has no mechanism for "a feature registers itself". To disable one you need to know the entire app's structure.

## Hypothesis B — inter-module communication is hard

**23 violations of dependency direction** were found in the project.

### B.1 shared → feature (critical)


src/shared/ui/PressableOpacity/ui/PressableOpacity.tsx


Imports a selector from the "vibration" feature. PressableOpacity is a central UI component used in 45 files.

### B.2 widget → feature (14 cases)

Widgets import features en masse — 14 cases. The worst: widgets/profile-setting-inputs imports 5 features from features/setting/set-*, widgets/simulator imports 3 features from features/smoked/*.

### B.3 feature → feature (5 cases)

Features aren't isolated. The most "expensive": features/send-message-chat imports features/language-picker, features/feed/feed-create-post imports features/language-picker.

### B.4 feature → app (3 cases)

The worst — features import the application provider. Without app/providers/SheetProvider the features don't work at all.

## Hypothesis C — modules are hard to lift into a sibling project

### C.1 Missing top-level aggregators

Of the 15 top-level directories in src/features/, the 5 largest (auth, feed, player, setting, smoked) have no top-level index.ts.

To lift features/auth/auth-by-google into another project you need 5–6 manual edits: copy the directory, register the reducer, add a route to the enum, register the screen, add to persist-whitelist, verify entities.

### C.2 Implicit link through central configs

Features import shared/config/navigation. Without recreating the AppNavigation enum (42 values), they don't compile.

## Hypothesis D — module contracts are unclear

### D.1 Leaky public APIs


src/features/setting/toggle-vibration/index.ts


Exports three things at once: a selector, a reducer and a UI component. Internally the feature only needs the reducer. All three leak into the global namespace.

### D.2 Selector used as a "contract"

getLanguage from features/language-picker is imported in 5 places: a feed hook, two chat hooks, a post-creation screen, an audio screen. Renaming the selector breaks 5 files. No interface, no DI, no swap point.

### D.3 Route typing — F = any

ts
export type NavigationStackLists<F = any> = {
  [AppNavigation.COURSE]: F;
  ...
};


The contract between a feature and navigation is any. A typo in a field name → runtime error.

## Summary table of violations

| Hypothesis | Evidence in code |
|---|---|
| Modules are hard to disable | 5 central files manually edited to disable a single feature |
| Hard inter-module communication | 14 widget→feature imports, 5 cross-feature imports, 3 feature→app imports |
| Hard to move to a sibling project | 15 top-level "features", 5 of them without an aggregating index.ts |
| Unclear module contracts | Features export reducer, selector, and UI; navigation typed via F = any |
`;

const TABS_RU: ArticleBlock = {
  type: "tabs",
  items: [
    {
      kind: "iframe",
      label: "FSD в теории",
      src: "research/infographic-concepts.html",
      title: "Как FSD выглядит в теории",
      height: 900,
    },
    {
      kind: "iframe",
      label: "FSD на практике",
      src: "research/infographic-disadvantages.html",
      title: "Что мы увидели в живом проекте",
      height: 900,
    },
    {
      kind: "markdown",
      label: "Анализ (markdown)",
      blocks: parseArticle(RESEARCH_RU, "Иллюстрация к анализу"),
    },
  ],
};

const TABS_EN: ArticleBlock = {
  type: "tabs",
  items: [
    {
      kind: "iframe",
      label: "FSD in theory",
      src: "research/infographic-concepts.html",
      title: "How FSD looks in theory",
      height: 900,
    },
    {
      kind: "iframe",
      label: "FSD in practice",
      src: "research/infographic-disadvantages.html",
      title: "What we saw in a real project",
      height: 900,
    },
    {
      kind: "markdown",
      label: "Analysis (markdown)",
      blocks: parseArticle(RESEARCH_EN, "Analysis illustration"),
    },
  ],
};

const RAW_RU_INTRO = `Поговорим сегодня немного про концепции и идеи в программировании.

Мне всегда нравились архитектурные концепции, которые предлагают разработчикам методологии и идеи о том, как превратить хаос в порядок.

### Как философия Rails изменила веб-разработку

В бэкенд-мире Ruby on Rails в своё время произвёл революцию, привнеся подход "Convention over Configuration" (соглашение превыше конфигурации).

Создатель RoR, известный как DHH, описал концепцию одной ёмкой фразой: "Если мы можем сделать разумное предположение о том, что вы хотите сделать, мы сделаем это за вас. Если нет — вы всегда можете настроить". Такое решение экономило время и убирало лишний код.

RoR сильно ускорил разработку веб-приложений и показал, насколько мощным может быть стандартизированный подход к разработке.

[картинка: ror-convention-over-configuration.png | Convention over Configuration в Ruby on Rails]

### Как Flux и Redux изменили подход к управлению состоянием

Во фронтенде долгое время не было общепринятой модели управления сложным состоянием приложения.
В 2014 году Facebook предложил Flux — идею однонаправленного потока данных, которая позже получила широкое развитие в Redux.

[картинка: redux-revolution.png | Революция Flux и Redux в управлении состоянием фронтенда]

Одна из ключевых идей Flux и Redux заключалась в том, чтобы отказаться от хаотичных взаимных изменений состояния и ввести явный однонаправленный поток данных: State → Action → Reducer → New State.

Redux быстро получил широкое распространение и стал стандартным инструментом для управления сложным состоянием.

### Как FSD стандартизировал организацию frontend-кода в 2020

На этом фоне появился Feature-Sliced Design — подход, который предложил структурировать frontend-код вокруг бизнес-сущностей и пользовательских сценариев, а не только вокруг технических типов файлов.

При этом FSD хорошо сочетался с предыдущими архитектурными подходами: например, Redux можно было использовать внутри FSD-приложений.

Но он привнёс новые правила, решающие проблему организации кода: зависимость между слоями стала однонаправленной.

[картинка: feature-slide-design-concept.png | Концепция Feature-Sliced Design]

Но цифровые продукты продолжают усложняться. И вместе с ними меняются требования к архитектуре.

В больших цифровых продуктах всё большую роль стали играть явные контракты между компонентами и командами. Бизнес всё чаще строит супераппы и экосистемы из нескольких цифровых продуктов. Поэтому требования к переиспользованию кода, автономности команд и явным контрактам между частями системы стали значительно выше.

А затем появился новый фактор — AI-assisted разработка.

Если архитектура не учитывает AI-assisted разработку как полноценную часть SDLC, то новые инструменты начинают обходить существующие правила — и архитектура постепенно трещит по швам.

Давайте посмотрим, насколько FSD отвечает этим требованиям в 2026 году.
`;

const RAW_EN_INTRO = `Today, let's talk a little about concepts and ideas in programming.

I've always liked architectural concepts that give developers methodologies and ideas for turning chaos into order.

### How Rails philosophy changed the world of web development (created in 2004, peak popularity — 2012)

In the backend world, Ruby on Rails revolutionized development by introducing the "Convention over Configuration" approach.

DHH, the creator of RoR, described the concept in one concise phrase: "If we can make a reasonable guess about what you want to do, we'll do it for you. If not, you can always configure it." This saved time and eliminated unnecessary code.

The backend world received a huge boost from the practices RoR introduced. Many startups took off thanks to the level of standardization Rails offered at the time.

[image: ror-convention-over-configuration.png | Convention over Configuration in Ruby on Rails]

### Flux / Redux ideas from 2014 standardized state management

Before Flux, and later Redux, the frontend world was in complete chaos. In 2014, Facebook proposed a powerful idea — and the whole world adopted it with astonishing speed.

The revolutionary idea behind Redux was that components don't change each other's state directly — state changes through an explicit, controlled flow of events: State → Action → Reducer → New State.

[image: redux-revolution.png | The Flux and Redux revolution in frontend state management]

Redux took off, and developers were able to build much more complex frontends.

### How FSD standardized frontend code organization in 2020

Over time, people arrived at a new idea: organize code around business functionality rather than around "technical file types."

In 2020, this approach was called Feature-Sliced Design, and it quickly became popular.

All business logic was gathered into a single slice, which made development much simpler.

The approach also respected the existing legacy: Redux could be used perfectly well inside FSD applications. But it introduced new rules to solve the problem of code organization: dependencies between layers became unidirectional.

[image: feature-slide-design-concept.png | The Feature-Sliced Design concept]

However, time moves on and rules change. Eventually, old concepts become too restrictive and new ones have to be invented.

Contract-based programming has become far more popular.
Business often builds super-apps, and the requirements for code reuse have become significantly higher than they were 5 years ago.

A new Game-Changer has emerged — the AI-assisted approach to development.
If an architectural concept doesn't make the AI-assisted layer a First-Class Citizen in the SDLC, chaos begins and the concept starts cracking at the seams.

Taking these new realities into account, let's take a look at the FSD approach in 2026. What's wrong with it?
`;

const RAW_RU_FSD = `Когда я проводил собеседования в мобильную команду, мы давали кандидатам небольшое архитектурное задание.

Нужно было спроектировать приложение так, чтобы:

- его части легко было переиспользовать в других приложениях (например вытащить аутентификацию или профиль)
- иметь возможность выключать определенную функциональность приложения (например выключить в приложении систему аналитики)
- иметь возможность выполнить настройку определенного модуля с верхнего уровня (например показывать разным типам пользователей разные privacy policy)

И кандидаты часто приносили FSD реализацию.

### Проблемы, которые проявлялись в решениях

Очень часто мы наблюдали одни и теже проблемы у самых разных кандидатов:
- Модули сложно выключить
- Между модулями сложно строить коммуникацию
- Модули сложно утащить в смежный проект
- Контракты модулей неочевидны
- Сложно управлять конфигурацией отдельных модулей с верхнего уровня
- Неочевидно, как встроить AI-assisted harness в существующую структуру проекта

Самое интересное — многие кандидаты были сильными разработчиками. Но FSD не давал им очевидных инструментов для решения этих задач.

Чтобы посмотреть, как FSD отвечает современным требованиям к цифровым продуктам, я провёл небольшое исследование публичного open-source проекта — приложения, которое помогает бросить курить.

Я проверял несколько простых вопросов:

- Насколько легко отключить отдельную функциональность?
- Насколько просто построить коммуникацию между частями системы?
- Можно ли перенести функциональность в другой проект?
- Насколько очевидны контракты отдельных частей?

Симптомы повторялись.

[Приложение которое помогает бросить курить](https://github.com/penteleichuk/Moke-Smoke.git)

Без обид авторам проекта — огромное уважение людям, которые делают такие проекты открытыми. Я оцениваю здесь не качество конкретного кода, а возможности самой архитектурной концепции: насколько хорошо она отвечает современным требованиям.
`;

const RAW_RU_FSD_ANALYSIS = `### Код вокруг слоёв vs бизнес вокруг функций

Дело в том что FSD организует код вокруг архитектурных слоёв:
entities → features → widgets → pages

Но бизнес мыслит иначе.

Бизнес мыслит функциональностью:
Авторизация, Профиль, Заказы, Оплата, Лояльность.

В результате одна бизнес-функция в FSD может быть распределена сразу по нескольким слоям. И тогда становится не так очевидно:

- Где заканчивается эта функциональность?
- Что именно нужно перенести, чтобы она заработала в другом приложении?
- Как её полностью отключить?
- Какой у неё публичный API?
- Где проходит граница ответственности команды?
`;

const RAW_EN_FSD = `When I interviewed candidates for our mobile development team — to evaluate architectural thinking we gave them a small test task:
design a small application in such a way that:

- its parts could be easily reused in other applications (e.g. extract authentication or profile)
- you could turn off specific functionality of the app (e.g. disable the analytics system in the app)
- you could configure a specific module from the top level (e.g. show different privacy policies for different types of users)

And candidates often brought an FSD implementation.

### Problems we observed in candidates

Very often we observed the same problems across very different candidates:
- Modules are hard to disable
- It's hard to build communication between modules
- Modules are hard to lift into a sibling project
- Module contracts are non-obvious
- You can't just make changes to a specific module's settings (you can at the global level, but not at the module level)
- It's completely unclear how to fit a harness needed for AI-Assisted development into this project organization

Many candidates were quite strong developers, but the commonly accepted concept limited them.

To check how FSD meets today's requirements for digital products, I ran a small study on a public open-source project — an app that helps people quit smoking.


I wanted to know "how easy it is to disable a feature in a project", "how hard it is to build inter-module communication", "how hard it is to lift a module into a sibling project", "how easy it is to understand the contracts of any given module". The symptoms repeated.

[The app that helps people quit smoking](https://github.com/penteleichuk/Moke-Smoke.git)

No offense to the project's authors — I respect people who do such things open source, huge respect for your work. In this case I'm evaluating not the code, but the power of the concept — whether it's enough for the modern realities.
`;

const RAW_EN_FSD_ANALYSIS = `### Code around layers vs business around functions

The thing is that FSD organizes code around architectural layers:
entities → features → widgets → pages

But business thinks differently.

Business thinks in functionality:
Authentication, Profile, Orders, Payment, Loyalty.

As a result, a single business feature in FSD can be spread across multiple layers at once. And then it becomes not so obvious:

- Where does this functionality end?
- What exactly needs to be moved for it to work in another app?
- How do you fully disable it?
- What is its public API?
- Where does the team's responsibility boundary lie?

### Bottom line

FSD is an architecture of code organization.
But for a large digital platform you also need an architecture of functional modules.
`;

const CONCLUSION_IMG_ROW_RU: ArticleBlock = {
  type: "img-row",
  items: [
    {
      src: "app-entrypoint.png",
      alt: "Точка входа в приложение",
      caption: "Точка входа в приложение",
    },
    {
      src: "app-entrypoint__defaults.png",
      alt: "Конфигурация через defaults",
      caption: "Конфигурация через defaults",
    },
    {
      src: "module-internals.png",
      alt: "Внутренняя структура модуля",
      caption: "Внутренняя структура модуля",
    },
  ],
};

const CONCLUSION_IMG_ROW_EN: ArticleBlock = {
  type: "img-row",
  items: [
    {
      src: "app-entrypoint.png",
      alt: "Application entry point",
      caption: "Application entry point",
    },
    {
      src: "app-entrypoint__defaults.png",
      alt: "Configuration via defaults",
      caption: "Configuration via defaults",
    },
    {
      src: "module-internals.png",
      alt: "Module internals",
      caption: "Module internals",
    },
  ],
};

const CONCLUSION_BLOCKS_RU: ArticleBlock[] = [
  { type: "h2", text: "Следующий уровень: архитектура функциональных модулей" },
  {
    type: "p",
    text: "FSD хорошо решает задачу организации кода внутри приложения. Но когда приложение становится частью большой цифровой платформы, возникает следующий уровень проблем: как организовать сами функциональные модули — их границы, контракты, зависимости, конфигурацию, жизненный цикл и переиспользование.",
  },
  {
    type: "p",
    text: "И здесь, на мой взгляд, архитектура должна подняться на следующий уровень абстракции.",
  },
  {
    type: "p",
    text: "По крайней мере, в открытом виде я пока не вижу достаточно зрелых решений, которые системно закрывают эти задачи.",
  },
  {
    type: "p",
    text: "Поэтому я попробовал сформулировать, из каких частей вообще должна состоять такая система:",
  },
  {
    type: "ol",
    items: [
      "**Ядро** — оркестратор модулей, управляющий их жизненным циклом, зависимостями и конфигурацией.",
      "**Модуль как first-class сущность архитектуры** — функциональная единица с чёткими границами, контрактом и жизненным циклом. При этом внутри модуля вполне могут использоваться лучшие практики FSD.",
      "**Инструменты** — генераторы модулей и приложений, сборка, управление зависимостями и релизами, автоматизация жизненного цикла.",
      "**Мета-уровень** — автоматическая проверка архитектуры, контрактов и поведения системы: спецификации, валидация, harness и AI-инструменты.",
      "**Экосистема стандартных модулей** — готовые переиспользуемые блоки для типовых задач: authentication, remote config, analytics, storage и других общих возможностей.",
    ],
  },
  {
    type: "p",
    text: "Именно эту концепцию я называю **Mobile Core**.",
  },
  {
    type: "p",
    text: "У нас уже есть реализация многих из этих идей, которая работает в production. Но мне кажется интереснее сейчас не просто показать готовое решение, а разобраться в самом подходе.",
  },
  {
    type: "ol",
    items: [
      "Какими свойствами должен обладать функциональный модуль?",
      "Каким должен быть его контракт?",
      "Как должно работать управление зависимостями и конфигурацией?",
      "Как модуль должен подключаться, отключаться и переиспользоваться в другом приложении?",
      "Как встроить AI-assisted разработку непосредственно в архитектуру?",
    ],
  },
  CONCLUSION_IMG_ROW_RU,
  {
    type: "p",
    text: "Эти скриншоты — лишь небольшой фрагмент того, как эта концепция выглядит на практике.",
  },
  {
    type: "p",
    text: "Но это пока не финальная архитектура и не готовый универсальный стандарт. Скорее, это рабочая гипотеза, которая уже частично проверена production-практикой.",
  },
  {
    type: "p",
    text: "В этой статье я хотел показать саму проблему: когда цифровой продукт растёт, одной организации кода внутри приложения становится недостаточно. Возникает необходимость управлять уже не только слоями и зависимостями, но и самими функциональными модулями — их границами, контрактами, конфигурацией, жизненным циклом и переиспользованием.",
  },
  {
    type: "p",
    text: "Для меня это следующий уровень архитектурной абстракции поверх FSD.",
  },
  {
    type: "p",
    text: "Если FSD отвечает на вопрос «как организовать код внутри приложения?», то функциональная модульность пытается ответить на следующий вопрос:",
  },
  {
    type: "callout",
    tone: "info",
    body: "«Как организовать само приложение как систему независимых, переиспользуемых и управляемых функциональных модулей?»",
  },
  {
    type: "p",
    text: "Именно эту идею я хочу исследовать дальше.",
  },
  {
    type: "p",
    text: "В следующих статьях попробую разобрать её по слоям и сформулировать требования к каждому из них:",
  },
  {
    type: "ul",
    items: [
      "каким должен быть функциональный модуль;",
      "где проходит его граница;",
      "каким должен быть его публичный контракт;",
      "как управлять зависимостями между модулями;",
      "как конфигурировать модуль с верхнего уровня;",
      "как подключать и отключать функциональность;",
      "как переносить модуль между приложениями;",
      "и, наконец, как встроить AI-assisted разработку непосредственно в архитектуру продукта.",
    ],
  },
  {
    type: "p",
    text: "Это пока только начало разговора.",
  },
];

const CONCLUSION_BLOCKS_EN: ArticleBlock[] = [
  { type: "h2", text: "The next level: architecture of functional modules" },
  {
    type: "p",
    text: "FSD does a great job organizing code inside an application. But when the application becomes part of a larger digital platform, a next level of problems arises: how to organize the functional modules themselves — their boundaries, contracts, dependencies, configuration, lifecycle, and reuse.",
  },
  {
    type: "p",
    text: "And here, in my view, architecture has to rise to the next level of abstraction.",
  },
  {
    type: "p",
    text: "At least in the open, I don't see mature solutions that systematically address these tasks.",
  },
  {
    type: "p",
    text: "So I tried to formulate what parts such a system should consist of:",
  },
  {
    type: "ol",
    items: [
      "**Core** — module orchestrator managing their lifecycle, dependencies, and configuration.",
      "**Module as a first-class architectural entity** — a functional unit with clear boundaries, a contract, and a lifecycle. FSD best practices can still be used perfectly well inside a module.",
      "**Tooling** — module and app generators, build, dependency and release management, lifecycle automation.",
      "**Meta-level** — automated validation of architecture, contracts, and system behavior: specifications, validation, harness, and AI tools.",
      "**Ecosystem of standard modules** — ready-made reusable blocks for typical tasks: authentication, remote config, analytics, storage, and other common capabilities.",
    ],
  },
  {
    type: "p",
    text: "I call this concept **Mobile Core**.",
  },
  {
    type: "p",
    text: "We already have an implementation of many of these ideas that runs in production. But right now I'd rather not just show a finished solution — I'd like to dig into the approach itself.",
  },
  {
    type: "ol",
    items: [
      "What properties should a functional module have?",
      "What should its contract look like?",
      "How should dependency and configuration management work?",
      "How should a module be connected, disconnected, and reused in another app?",
      "How do we embed AI-assisted development directly into the architecture?",
    ],
  },
  CONCLUSION_IMG_ROW_EN,
  {
    type: "p",
    text: "These screenshots are just a small fragment of what this concept looks like in practice.",
  },
  {
    type: "p",
    text: "But this is not a final architecture and not a ready-made universal standard. It's more like a working hypothesis that's already been partially validated by production practice.",
  },
  {
    type: "p",
    text: "In this article I wanted to show the problem itself: when a digital product grows, organizing code inside an application is no longer enough. You have to manage not just layers and dependencies, but the functional modules themselves — their boundaries, contracts, configuration, lifecycle, and reuse.",
  },
  {
    type: "p",
    text: "For me, this is the next level of architectural abstraction on top of FSD.",
  },
  {
    type: "p",
    text: "If FSD answers the question \"how to organize code inside an application?\", then functional modularity tries to answer the next one:",
  },
  {
    type: "callout",
    tone: "info",
    body: "How do you organize the application itself as a system of independent, reusable, and manageable functional modules?",
  },
  {
    type: "p",
    text: "This is exactly the idea I want to explore further.",
  },
  {
    type: "p",
    text: "In the next articles I'll try to break it down layer by layer and formulate the requirements for each:",
  },
  {
    type: "ul",
    items: [
      "what a functional module should look like;",
      "where its boundary lies;",
      "what its public contract should be;",
      "how to manage dependencies between modules;",
      "how to configure a module from the top level;",
      "how to enable and disable functionality;",
      "how to move a module between applications;",
      "and finally, how to embed AI-assisted development directly into the product architecture.",
    ],
  },
  {
    type: "p",
    text: "This is only the beginning of the conversation.",
  },
];

export const articleRu: Article = {
  slug: "feature-sliced-design-real-life",
  title: "От Feature Sliced Design к функциональной модульности: эволюция архитектурной концепции",
  lead:
    "Обсудим что нужно чтобы организовать модульный подход к организации кода для больших цифровых продуктов",
  date: "2026-07-25",
  tags: ["Mobile", "Architecture", "Modules", "FSD", "Research"],
  imageBase: "/notes/feature-sliced-design-real-life",
  blocks: [
    ...parseArticle(RAW_RU_INTRO, "Иллюстрация к статье"),
    ...parseArticle(RAW_RU_FSD, "Иллюстрация к статье"),
    TABS_RU,
    ...parseArticle(RAW_RU_FSD_ANALYSIS, "Иллюстрация к статье"),
    ...CONCLUSION_BLOCKS_RU,
  ],
};

export const articleEn: Article = {
  slug: "feature-sliced-design-real-life",
  title: "Functional Modularity vs Feature Sliced Design",
  lead:
    "A teardown of a real open-source RN project built on FSD: 23 layer violations, 5 files that know everything — and how to organize modules differently.",
  date: "2026-07-25",
  tags: ["Mobile", "Architecture", "Modules", "FSD", "Research"],
  imageBase: "/notes/feature-sliced-design-real-life",
  blocks: [
    ...parseArticle(RAW_EN_INTRO, "Article illustration"),
    ...parseArticle(RAW_EN_FSD, "Article illustration"),
    TABS_EN,
    ...parseArticle(RAW_EN_FSD_ANALYSIS, "Article illustration"),
    ...CONCLUSION_BLOCKS_EN,
  ],
};

export function getArticle(slug: string, lang: Language): Article | null {
  if (slug !== "feature-sliced-design-real-life") return null;
  return lang === "en" ? articleEn : articleRu;
}

export const articlesBySlug: Record<string, Article> = {
  [articleRu.slug]: articleRu,
};
