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
| Объём кода \`src/\` | 6 слоёв, 96+ директорий со слайсами |

### Структура src/

\`\`\`
src/
├── app/         ← композиция: navigation, providers, store
├── processes/   ← (отсутствует, уместно)
├── pages/       ← переименован в screens/ «для mobile»
├── widgets/     ← 15 составных UI-блоков
├── features/    ← 15 верхнеуровневых «фич», 40 вложенных
├── entities/    ← 12 доменных сущностей
└── shared/      ← переиспользуемые абстракции (ui, lib, api, config)
\`\`\`

И всё это собрано в один \`combineReducers\` в \`src/app/providers/StoreProvider/config/reducer.ts\` и один \`Stack.Navigator\` в \`src/app/navigation/ui/Navigation.tsx\`.

## Гипотеза A — модули сложно выключить

Чтобы убрать из приложения фичу audio-плеера, нужно синхронно отредактировать минимум 5 файлов.

### A.1 Глобальный enum маршрутов

\`src/shared/config/navigation/model/types/navigation.ts\` (100 строк) — enum \`AppNavigation\` с 42 значениями. Любая новая или удалённая фича = правка одного общего enum + одного общего типа.

### A.2 Глобальный роутер

\`src/app/navigation/ui/Navigation.tsx\` (371 строка) — 42 экрана зарегистрированы руками в одном файле.

### A.3 Глобальный стор

\`src/app/providers/StoreProvider/config/reducer.ts\` — \`combineReducers\` всех фич.

### A.4 Глобальный persist-whitelist

\`src/app/providers/StoreProvider/config/persistedReducer.ts\` — whitelist персистируемых слайсов. Имена — строковые ключи, нигде не типизированы.

### A.5 Глобальный провайдер bottom-sheets

\`src/app/providers/SheetProvider/SheetProvider.tsx\` — 12 sheet-виджетов захардкожены. Агрегатор \`src/widgets/sheet/index.ts\` ещё раз перечисляет те же 12 импортов.

**Вывод:** в FSD нет механизма «фича сама себя регистрирует». Чтобы выключить — нужно знать устройство всего приложения.

## Гипотеза B — между модулями сложно построить коммуникацию

В проекте зафиксировано **23 нарушения направления зависимостей**.

### B.1 shared → feature (критическое)

\`src/shared/ui/PressableOpacity/ui/PressableOpacity.tsx\` импортирует селектор из фичи «вибрация». \`PressableOpacity\` — центральный UI-компонент, используется в 45 файлах.

### B.2 widget → feature (14 случаев)

Виджеты массово импортируют фичи — 14 случаев. Самые показательные: \`widgets/profile-setting-inputs\` импортирует 5 фич из \`features/setting/set-*\`, \`widgets/simulator\` — 3 фичи из \`features/smoked/*\`.

### B.3 feature → feature (5 случаев)

Фичи не изолированы. Самые «дорогие»: \`features/send-message-chat\` импортирует \`features/language-picker\`, \`features/feed/feed-create-post\` импортирует \`features/language-picker\`.

### B.4 feature → app (3 случая)

Самое грубое — фичи импортируют провайдер приложения. Без \`app/providers/SheetProvider\` фичи не работают вообще.

## Гипотеза C — модули сложно утащить в смежный проект

### C.1 Отсутствие агрегаторов верхнего уровня

Из 15 верхнеуровневых директорий в \`src/features/\` 5 крупнейших (\`auth\`, \`feed\`, \`player\`, \`setting\`, \`smoked\`) не имеют \`index.ts\` верхнего уровня.

Чтобы «утащить» \`features/auth/auth-by-google\` в другой проект — нужно 5–6 ручных правок: скопировать директорию, зарегистрировать редьюсер, добавить маршрут в enum, зарегистрировать экран, добавить в persist-whitelist, проверить сущности.

### C.2 Неявная связь через центральные конфиги

Фичи импортируют \`shared/config/navigation\`. Без воссоздания \`AppNavigation\`-enum (42 значения) фичи не компилируются.

## Гипотеза D — контракты модулей неочевидны

### D.1 Публичные API текут

\`src/features/setting/toggle-vibration/index.ts\` экспортирует сразу селектор, редьюсер и UI-компонент. Внутренне фиче нужен только \`reducer\`. Все три текут в общий namespace.

### D.2 Селектор используется как «контракт»

\`getLanguage\` из \`features/language-picker\` импортируется в 5 местах: hook фида, два хука чата, экран создания поста, экран аудио. Переименование селектора ломает 5 файлов. Нет интерфейса, нет DI, нет точки подмены.

### D.3 Типизация маршрутов — \`F = any\`

\`\`\`ts
export type NavigationStackLists<F = any> = {
  [AppNavigation.COURSE]: F;
  ...
};
\`\`\`

Контракт между фичей и навигацией — \`any\`. Опечатка в имени поля — runtime error.

## Сводная таблица нарушений

| Гипотеза | Факт в коде |
|---|---|
| Модули сложно выключить | 5 центральных файлов правятся вручную при отключении одной фичи |
| Сложная межмодульная коммуникация | 14 widget→feature импортов, 5 cross-feature импортов, 3 feature→app импорта |
| Сложно перенести в смежный проект | 15 «фич» верхнего уровня, у 5 из них нет агрегирующего \`index.ts\` |
| Контракты модулей неочевидны | Фичи экспортируют и reducer, и selector, и UI; навигация типизирована через \`F = any\` |
`;

const RESEARCH_EN = `## Object of study

| Parameter | Value |
|---|---|
| Repository | https://github.com/penteleichuk/Moke-Smoke |
| Stack | React Native 0.73 + Redux Toolkit + RN Navigation + Firebase |
| FSD compliance | Self-declared in README (with a deviation: pages → screens) |
| \`src/\` size | 6 layers, 96+ slice directories |

### src/ structure

\`\`\`
src/
├── app/         ← composition: navigation, providers, store
├── processes/   ← (absent, appropriate)
├── pages/       ← renamed to screens/ «for mobile»
├── widgets/     ← 15 composite UI blocks
├── features/    ← 15 top-level «features», 40 nested
├── entities/    ← 12 domain entities
└── shared/      ← reusable abstractions (ui, lib, api, config)
\`\`\`

All assembled into one \`combineReducers\` in \`src/app/providers/StoreProvider/config/reducer.ts\` and one \`Stack.Navigator\` in \`src/app/navigation/ui/Navigation.tsx\`.

## Hypothesis A — modules are hard to disable

To remove the audio-player feature you have to synchronously edit at least 5 files.

### A.1 Global route enum

\`src/shared/config/navigation/model/types/navigation.ts\` (100 lines) — an \`AppNavigation\` enum with 42 values. Any added or removed feature = editing one shared enum + one shared type.

### A.2 Global router

\`src/app/navigation/ui/Navigation.tsx\` (371 lines) — 42 screens manually registered in a single file.

### A.3 Global store

\`src/app/providers/StoreProvider/config/reducer.ts\` — \`combineReducers\` of all features.

### A.4 Global persist whitelist

\`src/app/providers/StoreProvider/config/persistedReducer.ts\` — whitelist of persisted slices. Names are string keys, never typed.

### A.5 Global bottom-sheets provider

\`src/app/providers/SheetProvider/SheetProvider.tsx\` — 12 sheet widgets hardcoded. The aggregator \`src/widgets/sheet/index.ts\` lists the same 12 imports again.

**Conclusion:** FSD has no mechanism for "a feature registers itself". To disable one you need to know the entire app's structure.

## Hypothesis B — inter-module communication is hard

**23 violations of dependency direction** were found in the project.

### B.1 shared → feature (critical)

\`src/shared/ui/PressableOpacity/ui/PressableOpacity.tsx\` imports a selector from the "vibration" feature. \`PressableOpacity\` is a central UI component used in 45 files.

### B.2 widget → feature (14 cases)

Widgets import features en masse — 14 cases. The worst: \`widgets/profile-setting-inputs\` imports 5 features from \`features/setting/set-*\`, \`widgets/simulator\` imports 3 features from \`features/smoked/*\`.

### B.3 feature → feature (5 cases)

Features aren't isolated. The most "expensive": \`features/send-message-chat\` imports \`features/language-picker\`, \`features/feed/feed-create-post\` imports \`features/language-picker\`.

### B.4 feature → app (3 cases)

The worst — features import the application provider. Without \`app/providers/SheetProvider\` the features don't work at all.

## Hypothesis C — modules are hard to lift into a sibling project

### C.1 Missing top-level aggregators

Of the 15 top-level directories in \`src/features/\`, the 5 largest (\`auth\`, \`feed\`, \`player\`, \`setting\`, \`smoked\`) have no top-level \`index.ts\`.

To lift \`features/auth/auth-by-google\` into another project you need 5–6 manual edits: copy the directory, register the reducer, add a route to the enum, register the screen, add to persist-whitelist, verify entities.

### C.2 Implicit link through central configs

Features import \`shared/config/navigation\`. Without recreating the \`AppNavigation\` enum (42 values), they don't compile.

## Hypothesis D — module contracts are unclear

### D.1 Leaky public APIs

\`src/features/setting/toggle-vibration/index.ts\` exports three things at once: a selector, a reducer and a UI component. Internally the feature only needs the reducer. All three leak into the global namespace.

### D.2 Selector used as a "contract"

\`getLanguage\` from \`features/language-picker\` is imported in 5 places: a feed hook, two chat hooks, a post-creation screen, an audio screen. Renaming the selector breaks 5 files. No interface, no DI, no swap point.

### D.3 Route typing — \`F = any\`

\`\`\`ts
export type NavigationStackLists<F = any> = {
  [AppNavigation.COURSE]: F;
  ...
};
\`\`\`

The contract between a feature and navigation is \`any\`. A typo in a field name → runtime error.

## Summary table of violations

| Hypothesis | Evidence in code |
|---|---|
| Modules are hard to disable | 5 central files manually edited to disable a single feature |
| Hard inter-module communication | 14 widget→feature imports, 5 cross-feature imports, 3 feature→app imports |
| Hard to move to a sibling project | 15 top-level "features", 5 of them without an aggregating \`index.ts\` |
| Unclear module contracts | Features export reducer, selector, and UI; navigation typed via \`F = any\` |
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

function withTabs(blocks: ArticleBlock[], tabs: ArticleBlock): ArticleBlock[] {
  return [...blocks, tabs];
}

const RAW_RU = `Я провёл небольшой независимый research по Feature-Sliced Design — FSD.

Для нетерпеливых его результаты в конце статьи :D

FSD - это один из самых популярных подходов к организации кода в React-Native мире.

Когда я проводил кандидатов в команду мобильной разработки - чтобы оценить архитектурное мышление кандидата мы давали небольшое тестовое задание,
спроектировать небольшое приложение таким образом чтобы:

- его части легко было переиспользовать в других приложениях (например вытащить аутентификацию или профиль)
- иметь возможность выключать определенную функциональность приложения (например выключить в приложении систему аналитики)
- иметь возможность выполнить настройку определенного модуля с верхнего уровня (например показывать разным типам пользователей разные privacy policy)

И кандидаты часто приносили FSD реализацию.

Очень часто мы наблюдали одни и теже проблемы у самых разных кандидатов:
- Модули сложно выключить
- Между модулями сложно строить коммуникацию
- Модули сложно утащить в смежный проект
- Контракты модулей неочевидны
- Нельзя просто так внести изменения в настройки определенного модуля (можно на глобальном уровне, но на модульном нет)
- Совсем неочевидно как в такую организацию проекта можно встроить harness необходимый для AI-Assisted разработки

Многие кандидаты были достаточно сильными разработчиками, но общепринятая концепция их ограничивала.

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

FSD — это архитектура организации кода.
Но для большой цифровой платформы нужна ещё и архитектура функциональных модулей.

Давайте забудем все чему нас учили, и подумаем - как организовать проект на верхнем уровне чтобы
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

А вот анализ реального FSD сайта как я и обещал

Я взял популярный репозиторий с официального сайта FSD - приложение которое помогает бросить курить https://github.com/penteleichuk/Moke-Smoke.git (git@github.com:penteleichuk/Moke-Smoke.git)

Без обид авторам проекта, уважаю людей которые делают такие штуки опенсорсно - огромное уважение за вашу работу
Но мне нужен был пример чтобы проиллюстрировать идею и чтобы не рассуждать голословно.

Здесь табы из директории research
Каждый таб из 3 в отдельном iframe или контейнере выводить (чтобы удобно было смотреть)
`;

const RAW_EN = `I did a small independent research on Feature-Sliced Design — FSD.

For the impatient — the results are at the end of the article :D

FSD is one of the most popular approaches to organizing code in the React Native world.

When I interviewed candidates for our mobile development team — to evaluate architectural thinking we gave them a small test task:
design a small application in such a way that:

- its parts could be easily reused in other applications (e.g. extract authentication or profile)
- you could turn off specific functionality of the app (e.g. disable the analytics system in the app)
- you could configure a specific module from the top level (e.g. show different privacy policies for different types of users)

And candidates often brought an FSD implementation.

Very often we observed the same problems across very different candidates:
- Modules are hard to disable
- It's hard to build communication between modules
- Modules are hard to lift into a sibling project
- Module contracts are non-obvious
- You can't just make changes to a specific module's settings (you can at the global level, but not at the module level)
- It's completely unclear how to fit a harness needed for AI-Assisted development into this project organization

Many candidates were quite strong developers, but the commonly accepted concept limited them.

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

FSD is an architecture of code organization.
But for a large digital platform you also need an architecture of functional modules.

Let's forget everything we were taught and think — how to organize a project at the top level to fix the shortcomings I listed above?

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

And here is the analysis of a real FSD site as I promised

I took a popular repository from the official FSD site — an app that helps quit smoking https://github.com/penteleichuk/Moke-Smoke.git (git@github.com:penteleichuk/Moke-Smoke.git)

No offense to the project's authors, I respect people who make such things open-source — huge respect for your work
But I needed an example to illustrate the idea and to not argue in the abstract.

Here are tabs from the research directory
Each tab of 3 should be displayed in a separate iframe or container (so it's convenient to view)
`;

export const articleRu: Article = {
  slug: "feature-sliced-design-real-life",
  title: "Функциональная Модульность vs Feature Sliced Design",
  lead:
    "Разбор реального open-source RN-проекта на FSD: 23 нарушения слоёв, 5 файлов, знающих про всё, и как организовать модули иначе.",
  date: "2026-07-25",
  tags: ["Mobile", "Architecture", "Modules", "FSD", "Research"],
  imageBase: "/notes/feature-sliced-design-real-life",
  blocks: withTabs(parseArticle(RAW_RU, "Иллюстрация к статье"), TABS_RU),
};

export const articleEn: Article = {
  slug: "feature-sliced-design-real-life",
  title: "Functional Modularity vs Feature Sliced Design",
  lead:
    "A teardown of a real open-source RN project built on FSD: 23 layer violations, 5 files that know everything — and how to organize modules differently.",
  date: "2026-07-25",
  tags: ["Mobile", "Architecture", "Modules", "FSD", "Research"],
  imageBase: "/notes/feature-sliced-design-real-life",
  blocks: withTabs(parseArticle(RAW_EN, "Article illustration"), TABS_EN),
};

export function getArticle(slug: string, lang: Language): Article | null {
  if (slug !== "feature-sliced-design-real-life") return null;
  return lang === "en" ? articleEn : articleRu;
}

export const articlesBySlug: Record<string, Article> = {
  [articleRu.slug]: articleRu,
};