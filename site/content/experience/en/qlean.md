---
company: "Qlean.ru / D2C Tech"
role: "Head of Mobile Engineering / Architect"
period:
  from: "2023-06"
  present: true
location: "Moscow"
order: 1
aboutShort: "A mobile-first company in the 'household delegation' space: 10+ apps (B2C / B2B) for clients, cleaners, couriers, pickup-point owners, warehouse staff, factory workers and the sales team — tens of thousands of users and more than 10 interacting roles."
aboutTags:
  - Bare React-native
  - B2C
  - B2B
  - Mobile-first
  - Modular Superapp
  - Backend For Fronted
  - Mobile app core
  - High-load
  - Micro Services
  - Micro Frontend
  - gRPC / gql / REST
  - Fastlane
  - Native modules
highlights:
  - cross-platform in 3 stores
  - Scrum / Trunk-Based Development
  - senior-only mobile team
  - mobile engineers write the BFF
  - 12 apps shipped to production
  - 50+ reusable modules
  - docs for every core layer and process
  - architecture committee and design docs
  - ~100 technical interviews
media:
  - src: "/screenshots/qlean/d2c-apps.png"
    caption: "D2C Tech product landscape — 10+ apps"
  - src: "/screenshots/qlean/superapp-main.png"
    caption: "Super-app core: single entry, navigation, theming"
  - src: "/screenshots/qlean/qlean-apps.png"
    caption: "Qlean customer-facing apps"
  - src: "/screenshots/qlean/qlean-warehouse-main.png"
    caption: "Warehouse app (pickup-point workflows)"
  - src: "/screenshots/qlean/qlean-agents-main.png"
    caption: "App for pickup-point owners"
  - src: "/screenshots/qlean/qr-scanner.png"
    caption: "QR scanner — a core module"
  - src: "/screenshots/qlean/cleaners-order.png"
    caption: "Cleaner order: card, statuses, photo report"
  - src: "/screenshots/qlean/cleaners-yellow-labels.png"
    caption: "Yellow labels — UI pattern for status highlights"
  - src: "/screenshots/qlean/couriers-feed.png"
    caption: "Courier order feed"
  - src: "/screenshots/qlean/couriers-submodules.png"
    caption: "Courier app submodules map"
  - src: "/screenshots/qlean/couriers-mockups.png"
    caption: "Courier app design mockups"
  - src: "/screenshots/qlean/couriers-reject-assignment.png"
    caption: "Assignment rejection flow"
  - src: "/screenshots/qlean/mobile-core-tests.png"
    caption: "Core tests in CI — per-module runs"
  - src: "/screenshots/qlean/mobile-core-test-coverage.png"
    caption: "Core test coverage"
  - src: "/screenshots/qlean/gitlab-bff-pipelines.png"
    caption: "GitLab pipelines for the BFF gateways"
  - src: "/screenshots/qlean/qlean-warehouse-entry.png"
    caption: "Warehouse app entry screen"
  - src: "/screenshots/qlean/courier-calls.mp4"
    type: "video"
    poster: "/screenshots/qlean/couriers-feed.png"
    caption: "Demo: courier calls inside the app"
  - src: "/screenshots/qlean/couriers-photo-module-demo.mov"
    type: "video"
    poster: "/screenshots/qlean/cleaners-order.png"
    caption: "Demo: photo module (item intake)"
---

- Own and evolve the company's mobile applications — full-stack product engineering at every level.
- Grew the mobile core, created and documented 50+ reusable modules, drove ~90% test coverage on the core, and built a knowledge base for every architectural layer.
- Built the mobile release cycle: before I joined, new apps used to take forever to ship.
- Wrote docs and architectural decisions for every layer of the core and every process (mobile, BFF, release management), defended them in front of the architecture committee — some implemented by me, some by the team.
- Ran interviews, performance reviews, onboarding.
- Rebuilt the engineering process so apps compose from reusable modules like Lego bricks — small, independent, loosely coupled; some shared (`authentication`, `devtools`), some app-local (`courierDocuments`). Before the rebuild, logic duplication between apps was around 60–70%; after — single-digit overlap (~15–20%).
- Owned the P&L of the mobile team and managed technical budgets.

### Achievements

- App development put on a single track — **a conveyor belt: a small team shipping many apps**.
- **12 apps** shipped to production (joined when 3 were live).
- **50+ modules** in the super-app core, reused across apps. The module structure is detailed down to the smallest detail, which opened up new automation opportunities.
- **New mobile project launch time: years → months → weeks**.
- Cut logic duplication between apps from 60–70% down to single-digit overlap.
- Introduced AI tooling into mobile processes (creating new modules, automating code review and testing, style unification, automatic documentation). Our modules are specified in detail at every level and templated, so fine-tuned AI agents successfully replace humans on many tasks.
- **~100 technical interviews**; successful onboarding and training of new hires.
