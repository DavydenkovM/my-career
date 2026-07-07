---
company: "Qlean.ru / D2C Tech"
role: "Руководитель отдела мобильной разработки / архитектор"
period:
  from: "2023-06"
  present: true
location: "Москва"
order: 1
aboutShort: "Mobile-first компания в сфере «делегирования быта»: 10+ приложений (B2C / B2B) для клиентов, клинеров, курьеров, владельцев ПВЗ, кладовщиков, фабричных рабочих и отдела продаж — десятки тысяч пользователей и более 10 типов ролей, которые взаимодействуют между собой."
aboutTags:
  - B2C
  - B2B
  - Mobile-first
  - Super-app
  - Backend For Fronted
  - Mobile app core
  - High-load
  - Micro Services
  - Micro Frontend
highlights:
  - cross-platform в 3 сторах
  - Scrum / Trunk-Based Development
  - senior-only мобильная команда
  - мобильные разработчики пишут BFF
  - 12 приложений в проде
  - 50+ переиспользуемых модулей
  - инструкции на каждый слой ядра и процесс
  - архитектурный комитет и дизайн-доки
  - ~100 технических интервью
media:
  - src: "/screenshots/qlean/d2c-apps.png"
    caption: "Ландшафт приложений D2C Tech — 10+ продуктов"
  - src: "/screenshots/qlean/superapp-main.png"
    caption: "Superapp-ядро: единый вход, навигация, theming"
  - src: "/screenshots/qlean/qlean-apps.png"
    caption: "Клиентские приложения Qlean"
  - src: "/screenshots/qlean/qlean-warehouse-main.png"
    caption: "Складское приложение (ПВЗ-процессы)"
  - src: "/screenshots/qlean/qlean-agents-main.png"
    caption: "Приложение для владельцев ПВЗ"
  - src: "/screenshots/qlean/qr-scanner.png"
    caption: "QR-сканер — типовой модуль ядра"
  - src: "/screenshots/qlean/cleaners-order.png"
    caption: "Заказ клиннера: карточка заказа, статусы, фото-отчёт"
  - src: "/screenshots/qlean/cleaners-yellow-labels.png"
    caption: "Жёлтые метки — UI-паттерн для подсветки статусов"
  - src: "/screenshots/qlean/couriers-feed.png"
    caption: "Лента заказов курьера"
  - src: "/screenshots/qlean/couriers-submodules.png"
    caption: "Карта субмодулей курьерского приложения"
  - src: "/screenshots/qlean/couriers-mockups.png"
    caption: "Дизайн-мокапы курьерского приложения"
  - src: "/screenshots/qlean/couriers-reject-assignment.png"
    caption: "Сценарий отказа от назначения"
  - src: "/screenshots/qlean/mobile-core-tests.png"
    caption: "Тесты ядра в CI — прогоны по модулям"
  - src: "/screenshots/qlean/mobile-core-test-coverage.png"
    caption: "Покрытие ядра тестами"
  - src: "/screenshots/qlean/gitlab-bff-pipelines.png"
    caption: "GitLab-пайплайны BFF-шлюзов"
  - src: "/screenshots/qlean/qlean-warehouse-entry.png"
    caption: "Мокап главного экрана Склада"
  - src: "/screenshots/qlean/courier-calls.mp4"
    type: "video"
    poster: "/screenshots/qlean/couriers-feed.png"
    caption: "Демо: звонки курьера через приложение"
  - src: "/screenshots/qlean/couriers-photo-module-demo.mov"
    type: "video"
    poster: "/screenshots/qlean/cleaners-order.png"
    caption: "Демо: фото-модуль (приёмка вещей)"
---

- Развитие и поддержка мобильных приложений компании — продуктовая разработка на всех уровнях.
- Развивал мобильное ядро, создал и документировал более 50 переиспользуемых модулей, обеспечил покрытие ядра ~90% тестами, собрал базу знаний по каждому архитектурному слою.
- Выстраивал мобильный релизный цикл: до моего прихода приложения долго не могли выйти в релиз.
- Писал инструкции и архитектурные решения на каждый слой ядра и на каждый процесс (мобилка, BFF, релизы-менеджмент), защищал их перед архитектурным комитетом, часть реализовывал лично, часть — командой.
- Проводил собеседования, перф-ревью, онбординг.
- Перестроил процесс разработки так, что приложения собираются из переиспользуемых модулей как из кубиков: модули маленькие, независимые, слабо-связанные; часть — общие (`authentication`, `devtools`), часть — локальные (`courierDocuments`). До перестройки дублирование логики между приложениями достигало 60–70%.
- P&L мобильной команды, управление техническими бюджетами

### Достижения

- Разработка приложений выстроена по единым рельсам - **конвеер, малой командой много приложений**
- **12 приложений** выпущено в продакшн (пришёл — было 3).
- **50+ модулей** к superapp-ядру, переиспользуемых между приложениями. Структура модулей проработана до мелочей что открыло новые возможности к автоматизации.
- **Скорость запуска** нового мобильного проекта: годы → месяцы → **недели**.
- Сокращение дублирования логики между приложениями с 60–70% до единичных пересечений.
- Внедрил ИИ-инструменты в мобильные процессы (создание новых модулей, автоматизация код-ревью и тестирования, унификация стилей, автоматическая документация). Наши модули достаточно детально специфицированы на каждом уровне и шаблонизированы. Поэтому дообученные ИИ-агенты во многих задачах успешно заменяют человека.
- **~100 технических интервью**.
