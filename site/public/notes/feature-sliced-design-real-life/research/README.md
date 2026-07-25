# Feature-Sliced Design: красивый плакат — хрупкая реальность

> Исследование на живом проекте **Moke-Smoke** (`penteleichuk/Moke-Smoke`)
> — React Native приложение «бросаю курить», про которое автор
> [отмечает](https://github.com/penteleichuk/Moke-Smoke) бейджем Feature-Sliced Design
> в README. Это **официальный референс FSD в категории RN/mobile**.

## TL;DR

FSD прекрасно выглядит на схеме «7 слоёв, импорт только сверху вниз».
Но когда приложение — это один большой Redux-стор, один глобальный
`AppNavigation`-enum и набор фич, общающихся через глобальное состояние,
**модульность превращается в иллюзию**. На Moke-Smoke видно, что:

| Гипотеза                                                        | Подтверждение в коде                                                                                                                                                |
|----------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Модули сложно выключить                                          | 5 центральных файлов правятся вручную при отключении одной фичи                                                                                                    |
| Между модулями сложно строить коммуникацию                       | 14 widget→feature импортов, 5 cross-feature импортов, 3 feature→app импорта, кнопка `PressableOpacity` зависит от фичи вибрации                                       |
| Модули сложно утащить в смежный проект                           | 15 «фич» верхнего уровня, у 5 из них нет агрегирующего `index.ts`; фичи зависят от центрального enum маршрутов и глобального `persistedReducer`                       |
| Контракты модулей неочевидны                                     | Публичные API текут: фичи экспортируют и reducer, и selector, и UI; селектор `getLanguage` используется как контракт; навигация типизирована через `F = any`         |

---

## 1. Объект исследования

| Параметр          | Значение                                                       |
|-------------------|----------------------------------------------------------------|
| Репозиторий       | `https://github.com/penteleichuk/Moke-Smoke`                   |
| Стек              | React Native 0.73 + Redux Toolkit + RN Navigation + Firebase    |
| FSD compliance    | Декларируется в README (`> With some deviations: pages → screens`) |
| Объём кода `src/` | 6 слоёв, 96+ директорий со слайсами                            |

```
src/
├── app/         ← композиция: navigation, providers, store
├── processes/   ← (отсутствует, уместно)
├── pages/       ← переименован в screens/ «для mobile»
├── widgets/     ← 15 составных UI-блоков
├── features/    ← 15 верхнеуровневых «фич», 40 вложенных
├── entities/    ← 12 доменных сущностей
└── shared/      ← переиспользуемые абстракции (ui, lib, api, config)
```

И всё это собрано в **один `combineReducers`** в `src/app/providers/StoreProvider/config/reducer.ts`
и **один `Stack.Navigator`** в `src/app/navigation/ui/Navigation.tsx`.

---

## 2. Гипотеза A — «Модули сложно выключить»

Чтобы убрать из приложения, скажем, **фичу audio-плеера**, нужно синхронно
отредактировать минимум 5 файлов, которые «знают про всё»:

### 2.1. Глобальный enum маршрутов
**Файл:** `src/shared/config/navigation/model/types/navigation.ts` (100 строк)

```ts
export enum AppNavigation {
  ...
  AUDIO_PLAY = 'AudioPlay',
  AUDIO      = 'Audio',
  ...
}
export type NavigationStackLists<F = any> = {
  ...
  [AppNavigation.AUDIO_PLAY]: undefined;
  [AppNavigation.AUDIO]:      undefined;
  ...
};
```

Любая новая/удалённая фича = правка одного общего enum + одного общего типа.
Это типичный «registry pattern наоборот» — когда контракт верхнего уровня
знает про всех.

### 2.2. Глобальный роутер
**Файл:** `src/app/navigation/ui/Navigation.tsx` (371 строка)

```tsx
import { AudioScreen }    from 'screens/audio/audio';
import { AudioPlayScreen } from 'screens/audio/audio-play';
...
<Stack.Screen name={AppNavigation.AUDIO}      component={AudioScreen} />
<Stack.Screen name={AppNavigation.AUDIO_PLAY} component={AudioPlayScreen} />
```

42 экрана зарегистрированы руками в одном файле.

### 2.3. Глобальный стор
**Файл:** `src/app/providers/StoreProvider/config/reducer.ts`

```ts
import { playerReducer } from 'features/player/player-control';
...
export const rootReducer = combineReducers({
  ...
  player: playerReducer,
  ...
});
```

### 2.4. Глобальный persist-whitelist
**Файл:** `src/app/providers/StoreProvider/config/persistedReducer.ts`

```ts
whitelist: ['auth', 'user', ..., 'player', 'tracker', ...]
```

Имена — строковые ключи, нигде не типизированы.

### 2.5. Глобальный провайдер bottom-sheets
**Файл:** `src/app/providers/SheetProvider/SheetProvider.tsx`

```tsx
<Bottom.SheetMotivate />
<Bottom.SheetNoSmoke />
<Bottom.SheetSmoke />
<Bottom.SheetDashboardBank />
<Bottom.SheetDashboardMoreTime />
<Bottom.SheetDashboardCiggy />
<Bottom.SheetDashboardHealth />
<Bottom.SheetDashboardEnergy />
<Bottom.SheetDashboardLungs />
<Bottom.SheetProgress />
<Bottom.SheetCharts />
<Bottom.SheetReview />
<Bottom.SheetNotification />
```

И сам агрегатор `src/widgets/sheet/index.ts` ещё раз перечисляет те же 12 импортов.
**Чтобы выключить «лёгкие» — нужно править `SheetProvider` и `widgets/sheet/index.ts`.**

### Вывод
В FSD нет механизма «фича сама себя регистрирует». Из-за этого фичи **не
plug-and-play**: чтобы выключить, нужно знать устройство всего приложения.
Для бизнеса это значит: A/B-тест фичи, white-label, временная фича на промо —
всё превращается в ручной рефактор 5 файлов и риск regression в каждом.

---

## 3. Гипотеза B — «Между модулями сложно построить коммуникацию»

FSD предполагает, что модули общаются через **«нижестоящие» слои**: фича
зависит от сущности, виджет — от фичи и сущности. На практике в проекте
зафиксировано **23 нарушения направления зависимостей**.

### 3.1. shared → feature (критическое)
**Файл:** `src/shared/ui/PressableOpacity/ui/PressableOpacity.tsx:1`

```ts
import { getVibrationIsEnabled } from 'features/setting/toggle-vibration';
```

`PressableOpacity` — центральный UI-компонент, используется в **45 файлах**.
Он импортирует селектор из фичи «вибрация». Это означает:

- любая кнопка в приложении зависит от фичи настройки;
- нельзя переиспользовать `PressableOpacity` в другом проекте без фичи;
- любое переименование `getVibrationIsEnabled` ломает **45 файлов**;
- unit-test компонента требует поднять store с фичей.

### 3.2. widget → feature (14 случаев)
Виджеты **не должны** импортировать фичи по FSD, но делают это массово:

```ts
// widgets/profile-setting-inputs/ui/ProfileSettingInputs.tsx
import { SetCigaretteCount }   from 'features/setting/set-cigarette-count';
import { SetCigaretteDay }     from 'features/setting/set-cigarette-day';
import { SetCigarettePrice }   from 'features/setting/set-cigarette-price';
import { SetHowMuchSmoke }     from 'features/setting/set-how-much-smoke';
import { SetUserName }         from 'features/setting/set-user-name';

// widgets/simulator/ui/Simulator/Simulator.tsx
import { DesireToSmoke }   from 'features/smoked/desire-to-smoke';
import { ISmoked }         from 'features/smoked/i-smoked';
import { NoDesireToSmoke } from 'features/smoked/no-desire-to-smoke';

// widgets/sheet/Dashboards/SheetBank/SheetDashboardBank.tsx:11
import { getCurrency } from 'features/currency-picker';

// widgets/sheet/SheetNotification/SheetNotification.tsx:3
import { usePermissionsNotifications } from 'features/setting/toggle-notification';
```

Полный список (14 импортов) — см. приложение A.

### 3.3. feature → feature (5 случаев)
Самые «дорогие» нарушения:

```ts
// features/send-message-chat/model/lib/hooks/useSendMessage/useSendMessage.ts:9
import { getLanguage } from 'features/language-picker';

// features/send-message-chat/model/lib/hooks/useChatOnline/useChatOnline.ts:3
import { getLanguage } from 'features/language-picker';

// features/feed/feed-create-post/ui/FeedCreatePost.tsx:2
import { getLanguage } from 'features/language-picker';

// features/feed/feed-liked/ui/FeedLiked/FeedLiked.tsx:8
import { useFeedLiked } from 'features/feed/feed-liked';
```

То есть фичи **не изолированы** — они тянут друг друга напрямую.
Это означает, что «выключить чат» нельзя без поломки feed, а выключить
«feed» — без поломки чата.

### 3.4. entity → feature
```ts
// entities/feed/model/lib/hooks/useFeeds.ts:2
import { getLanguage } from 'features/language-picker';
```

Сущность «feed» зависит от фичи «language-picker». Сущности по FSD должны
быть максимально чистыми; вместо этого они вынуждены «протекать» к
фичам, чтобы достать текущую локаль.

### 3.5. feature → app (3 случая)
**Самое грубое** — фичи импортируют провайдер приложения:

```ts
// features/open-card-progres/ui/OpenCardProgress.tsx:1
import { AppSheet, SheetCreateContext } from 'app/providers/SheetProvider';

// features/smoked/i-smoked/ui/ISmoked.tsx:2
import { AppSheet, SheetCreateContext } from 'app/providers/SheetProvider';

// features/smoked/no-desire-to-smoke/ui/NoDesireToSmoke.tsx:2
import { AppSheet, SheetCreateContext } from 'app/providers/SheetProvider';
```

Это инверсия зависимости: фичи (нижний слой) дёргают приложение (верхний
слой) за контекстом bottom-sheet. Архитектурно — антипаттерн, который
говорит, что без `app/providers/SheetProvider` фичи **не работают вообще**.

### 3.6. Сводная таблица

| Направление импорта            | Разрешено FSD | Факт в Moke-Smoke |
|--------------------------------|:-------------:|:-----------------:|
| `app → feature`                | ✅            | ✅ (нормально)    |
| `widget → feature`             | ❌            | **14 случаев**    |
| `widget → entity`              | ✅            | ✅                |
| `feature → feature`            | ❌            | **5 случаев**     |
| `feature → entity`             | ✅            | ✅                |
| `entity → feature`             | ❌            | **1 случай**      |
| `shared → feature`             | ❌            | **1 случай**      |
| `feature → app`                | ❌            | **3 случая**      |

### Вывод
FSD-картинка «импорт только сверху вниз» рушится в первом же крупном
проекте. Альтернатива (явные контракты, DI, pub/sub, message-bus) —
в Moke-Smoke не используется. Всё держится на общем Redux-сторе + прямых
импортах.

Для бизнеса это значит: регрессии в одной фиче легко валят другую,
стоимость слияния фич в общий релиз растёт нелинейно.

---

## 4. Гипотеза C — «Модули сложно утащить в смежный проект»

### 4.1. Отсутствие агрегаторов верхнего уровня

Из 15 верхнеуровневых директорий в `src/features/`:

| Фича              | Под-слайсы                                                       | `index.ts` верхнего уровня |
|-------------------|------------------------------------------------------------------|:--------------------------:|
| `auth`            | auth-by-apple, auth-by-email, auth-by-google, change-password, email-activation, forgot-password | ❌ |
| `feed`            | feed-create-comment, feed-create-post, feed-liked, feed-pressing  | ❌ |
| `player`          | player-control, player-track-control, player-track-navigator, remove-audio | ❌ |
| `setting`         | 7 под-фич (set-cigarette-count, set-cigarette-day, set-cigarette-price, set-how-much-smoke, set-user-name, toggle-notification, toggle-vibration) | ❌ |
| `smoked`          | desire-to-smoke, i-smoked, no-desire-to-smoke                    | ❌ |

Чтобы «утащить» `features/auth/auth-by-google` в другой проект — нужно:
1. Скопировать директорию.
2. Зарегистрировать редьюсер в новом `combineReducers`.
3. Добавить маршрут в новый enum `AppNavigation`.
4. Зарегистрировать экран в новом `RootNavigator`.
5. Зарегистрировать в `persistedReducer` whitelist.
6. Убедиться, что импортируемые сущности (`entities/auth`) тоже скопированы.

Это **5–6 ручных правок** на одну фичу. Не plug-and-play.

### 4.2. Неявная связь через центральные конфиги

`features/*` импортируют:

```ts
import { AppNavigation } from 'shared/config/navigation';
```

Без воссоздания `AppNavigation`-enum (42 значения) фичи **не компилируются**.

### 4.3. Фича как «модуль» не существует юридически

Сравните с «идеальной» модульной структурой:

```
features/
└── audio-player/      ← один package, один index.ts
    ├── model/
    ├── ui/
    └── index.ts        ← exports { reducer, component, hooks }
```

Реальность Moke-Smoke:

```
features/
└── player/            ← "имя фичи", но это только папка
    ├── player-control/index.ts            ← фича 1
    ├── player-track-control/index.ts      ← фича 2
    ├── player-track-navigator/index.ts    ← фича 3
    └── remove-audio/index.ts              ← фича 4
```

«Верхнеуровневая фича» `player` **не существует как сущность** — у неё
нет `index.ts`, нет reducer в `combineReducers` напрямую (он зарегистрирован
через `player-control`). То, что мы видим как «player» в навигации —
это **конвенция между 4 фичами**.

### Вывод
Утащить фичу = скопировать папку + воссоздать её **сиротский след** в 5
центральных файлах. Это не «модуль», это **«feature по соглашению»**.

---

## 5. Гипотеза D — «Контракты модулей неочевидны»

### 5.1. Публичные API текут
**Файл:** `src/features/setting/toggle-vibration/index.ts`

```ts
export { getVibrationIsEnabled } from './model/selectors/...';
export { vibrationReducer }       from './model/slices/vibrationSlice';
export { ToggleVibration }        from './ui/ToggleVibration';
```

Три экспорта: селектор, редьюсер и UI. Внутренне фиче нужен только
`vibrationReducer`. Селектор нужен `shared/ui/PressableOpacity`
(см. п. 3.1) — а это нарушение слоя. UI нужен одному экрану. И все три
текут в общий namespace.

### 5.2. Селектор используется как «контракт»

`getLanguage` из `features/language-picker` импортируется:

- `entities/feed/model/lib/hooks/useFeeds.ts`
- `features/send-message-chat/model/lib/hooks/useSendMessage/`
- `features/send-message-chat/model/lib/hooks/useChatOnline/`
- `features/feed/feed-create-post/ui/FeedCreatePost.tsx`
- `screens/audio/audio/ui/AudioScreen/AudioScreen.tsx`

Это **пять мест**, которые «договорились» использовать именно
`getLanguage`. Переименование селектора ломает 5 файлов. Заменить
источник языка (i18next, MMKV, сервер) — значит поправить 5 импортов
по всему проекту. Нет интерфейса, нет DI, нет точки подмены.

### 5.3. Типизация маршрутов — `F = any`

```ts
export type NavigationStackLists<F = any> = {
  [AppNavigation.PICKER]: F;
  [AppNavigation.INPUT]:  F;
  [AppNavigation.FRIEND_ID]: F;
  ...
};
```

Контракт между фичей и навигацией — **`any`**. Фичи получают
`navigation.navigate(AppNavigation.COURSE, { courseId: 42 })`, и тип
никак это не проверяет. Опечатка в имени поля — runtime error.

### 5.4. Аггрегатор «фичи» отсутствует → контракт = «договориться»

`src/features/feed/` — **нет `index.ts`**. Что экспортирует фича «feed»?
Открываем каждый под-слайс:

```
features/feed/
├── feed-create-comment/index.ts → { FeedCreateComment, ... }
├── feed-create-post/index.ts    → { FeedCreatePost, ... }
├── feed-liked/index.ts          → { useFeedLiked, FeedLiked }
└── feed-pressing/index.ts       → { FeedPressing }
```

Контракт «feed» — это **4 разрозненных публичных API**, между которыми
нет документации, нет типовой связи, только конвенция «вызывающий знает».

### Вывод
Фичи в Moke-Smoke **не имеют контракта** — у них есть «публичный API
по факту импортов». Это работает в маленьком проекте, но не масштабируется.

Для бизнеса: новичку в команде нужно «прочитать» фичу через её след в
проекте, а не через явный интерфейс. Onboarding дороже, баги чаще.

---

## 6. Что в Moke-Smoke сделано хорошо (честно)

Ради баланса:

- **Сегментация `model / ui / lib`** внутри фич — последовательная и
  чистая. Это помогает внутри фичи.
- **`entities/*/index.ts`** в большинстве случаев **дисциплинированно**
  оформлен (только редьюсер/селекторы/сервисы, без UI — за
  исключением `entities/auth/index.ts`, где торчит `AuthProvider`,
  что спорно).
- **Перевод `pages` → `screens`** — действительно уместное отклонение
  от FSD для RN.

---

## 7. Альтернативы (что стоит рассмотреть для RN)

| Подход                       | Что решает                                              |
|------------------------------|----------------------------------------------------------|
| **Module-federation / плагины** | Подключаемые модули со своей регистрацией              |
| **DI-контейнер (InversifyJS, tsyringe)** | Контракт через интерфейс, легко подменить / замокать |
| **Шина событий / Redux-Saga channels** | Декаплинг фич без прямого импорта                |
| **Явный «manifest» фичи**     | Каждая фича экспортирует `{routes, reducers, sheets}` — регистрация автоматическая |
| **Feature flags (LaunchDarkly / OpenFeature)** | Безболезненное «выключение» фичи |

FSD не исчерпывающий, это **один из** подходов. В чистом Redux-приложении
с большим navigation-графом он начинает **стоить дороже, чем даёт**.

---

## 8. Приложения

### Приложение A — все нарушения widget→feature

```
widgets/breathing-exercise/ui/BreathingExercise.tsx:1   → features/setting/toggle-vibration
widgets/result-board/ui/ResultBoard/ResultBoard.tsx:8   → features/currency-picker
widgets/profile-setting-inputs/ui/ProfileSettingInputs.tsx:1..5 → features/setting/set-* (5 шт.)
widgets/simulator/ui/Simulator/Simulator.tsx:1..3      → features/smoked/* (3 шт.)
widgets/simulator/ui/CountDownTimer/CountDownTimer.tsx:3 → features/setting/set-how-much-smoke
widgets/sheet/SheetNotification/SheetNotification.tsx:3 → features/setting/toggle-notification
widgets/sheet/Dashboards/SheetBank/SheetDashboardBank.tsx:11 → features/currency-picker
widgets/sheet/SheetProgress/SheetProgress.tsx:3          → features/open-card-progres
```

### Приложение B — все нарушения feature→feature

```
features/send-message-chat/model/lib/hooks/useSendMessage/useSendMessage.ts:9 → features/language-picker
features/send-message-chat/model/lib/hooks/useChatOnline/useChatOnline.ts:3   → features/language-picker
features/feed/feed-create-post/ui/FeedCreatePost.tsx:2                         → features/language-picker
features/feed/feed-liked/ui/FeedLiked/FeedLiked.tsx:8                          → features/feed/feed-liked
features/auth/forgot-password/ui/ForgotChange/ForgotChange.tsx:5               → features/auth/forgot-password
```

### Приложение C — центральные файлы, знающие про всё

| Файл                                                                     | Строк | Что в нём живёт                              |
|--------------------------------------------------------------------------|------:|-----------------------------------------------|
| `src/shared/config/navigation/model/types/navigation.ts`                 |   100 | Enum + типы маршрутов (42 значения)           |
| `src/app/navigation/ui/Navigation.tsx`                                   |   371 | Регистрация всех экранов                      |
| `src/app/providers/StoreProvider/config/reducer.ts`                      |    36 | `combineReducers` всех фич                    |
| `src/app/providers/StoreProvider/config/persistedReducer.ts`             |    33 | Whitelist персистируемых слайсов              |
| `src/app/providers/SheetProvider/SheetProvider.tsx`                      |    60 | Хардкод всех bottom-sheet виджетов            |
| `src/widgets/sheet/index.ts`                                             |    24 | Хардкод всех sheet-виджетов                   |

---

## 9. Использованные материалы

- Репозиторий: <https://github.com/penteleichuk/Moke-Smoke> (HEAD на момент анализа)
- README проекта (декларация FSD): <https://github.com/penteleichuk/Moke-Smoke#readme>
- Методология: <https://feature-sliced.design/>

---

## 10. Инфографика

- `infographic-concepts.html` — «Как FSD выглядит в теории» (для бизнеса и разработчиков).
- `infographic-disadvantages.html` — «Что мы увидели в живом проекте» — карта нарушений и их последствия.

Открывать в любом современном браузере, печатать в PDF через «Печать → Сохранить как PDF».