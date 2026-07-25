import type { Language } from "@/content/i18n";
import {
  parseArticle,
  type Article,
} from "@/content/articles/types";

const RAW_RU = `В предыдущем посте я выдвинул тезис, что «мейнстрим мобильной разработки» в 2026 году сломан.

Давайте разберёмся почему.

Для начала посмотрим на mobile landscape. Как сегодня вообще создают мобильные приложения?

[картинка: mobile-mainstream.png | Главные направления мобильной разработки в 2026 году]

[картинка: mobile-mainstream-alternatives.png | Альтернативные подходы и их компромиссы]

У каждого подхода есть свои сильные стороны и свои компромиссы.

**Native** даёт максимальный контроль, но фактически мы поддерживаем две платформы, две экосистемы и часто две команды.

**Flutter** позволяет максимально шарить код, но требует отдельной Dart-экосистемы и собственной rendering-модели.

**Kotlin Multiplatform** позволяет постепенно наращивать shared code, сохраняя нативный UI. Очень интересный подход, но архитектурно он сложнее.

**Compose Multiplatform** идёт ещё дальше и позволяет шарить UI, но экосистема пока моложе.

**React Native**, пожалуй, сегодня предлагает один из самых сбалансированных компромиссов. Но и здесь хватает своих особенностей.

И вот здесь, на мой взгляд, начинается самое интересное.

**Проблема не в том, что какой-то из этих инструментов плохой.**

Проблема в том, что они в основном отвечают на вопрос:

**Как разработать мобильное приложение?**

Как написать код.
Как отрендерить интерфейс.
Как работать с операционной системой.
Как переиспользовать код между платформами.

Но почти не отвечают на другой вопрос:

**Как организовать производство мобильных продуктов?**

Как разбить код на модули?
Как распределить ownership между командами?
Как выработать единые правила?
Как переиспользовать решения между продуктами?
Как организовать релизы и контроль качества?
Как встроить AI в SDLC?

Когда команда маленькая — можно договориться обо всём лично.

Когда команд становится несколько — нужны правила.

Когда команд становится больше десяти — нужны системы.

Большие технологические компании такие системы создают. Обычно внутри себя.

[картинка: big-companies-architecture.png | Крупные компании строят свои внутренние системы организации мобильной разработки]

Но на рынке мало открытых и воспроизводимых решений, которые помогали бы другим компаниям масштабировать мобильную разработку.

И получается парадокс:

**Инструментов для написания мобильных приложений становится всё больше. А систем для организации их производства — по-прежнему мало.**

За последние годы я успел набить достаточно шишек в этой области и сформировал свой подход к тому, как сделать мобильную разработку управляемой, предсказуемой для бизнеса и простой для масштабирования.

В следующей статье расскажу про **Mobile Core** — фундамент, вокруг которого можно строить такую систему.

А ещё поговорим о том, почему привычные подходы к организации фронтенд-кода, в частности Feature-Sliced Design, не всегда подходят для масштабирования больших мобильных команд.
`;

const RAW_EN = `In my previous post I argued that the "mobile mainstream" in 2026 is broken.

Let's figure out why.

First, let's look at the mobile landscape. How do people actually build mobile apps today?

[image: mobile-mainstream.png | Mainstream mobile development approaches in 2026]

[image: mobile-mainstream-alternatives.png | Alternative approaches and their trade-offs]

Every approach has its strengths and its trade-offs.

**Native** gives you maximum control, but in practice we maintain two platforms, two ecosystems and often two teams.

**Flutter** lets you share code to the maximum, but it requires a separate Dart ecosystem and its own rendering model.

**Kotlin Multiplatform** lets you gradually grow shared code while keeping native UI. A very interesting approach, but architecturally it's more complex.

**Compose Multiplatform** goes even further and lets you share UI, but the ecosystem is still younger.

**React Native** probably offers one of the most balanced trade-offs today. But it has its own quirks too.

And here, in my view, the most interesting part begins.

**The problem is not that any of these tools is bad.**

The problem is that they mostly answer the question:

**How do you develop a mobile application?**

How to write code.
How to render the interface.
How to work with the operating system.
How to reuse code across platforms.

But they barely answer another question:

**How do you organize the production of mobile products?**

How to split code into modules?
How to distribute ownership between teams?
How to establish common rules?
How to reuse solutions across products?
How to organize releases and quality control?
How to integrate AI into the SDLC?

When a team is small — you can agree on everything in person.

When there are several teams — you need rules.

When there are more than ten teams — you need systems.

Big tech companies build such systems. Usually internally.

[image: big-companies-architecture.png | Big tech companies build their own internal systems to organize mobile development]

But on the market there are few open and reproducible solutions that would help other companies scale mobile development.

And there is a paradox:

**More and more tools appear for writing mobile apps. But systems for organizing their production are still scarce.**

Over the past years I've gathered enough bruises in this area and shaped my own approach to making mobile development manageable, predictable for the business and easy to scale.

In the next article I'll talk about **Mobile Core** — the foundation around which such a system can be built.

And I'll also discuss why conventional approaches to organizing frontend code — Feature-Sliced Design in particular — don't always work for scaling large mobile teams.
`;

export const articleRu: Article = {
  slug: "mobile-landscape-2026",
  title: "Mobile landscape 2026",
  lead:
    "Почему «мейнстрим мобильной разработки» в 2026 году сломан — и какие системы нужны, чтобы это исправить.",
  date: "2026-07-23",
  tags: ["Mobile", "Architecture", "Process", "AI"],
  imageBase: "/notes/mobile-landscape-2026",
  blocks: parseArticle(RAW_RU, "Иллюстрация к статье"),
};

export const articleEn: Article = {
  slug: "mobile-landscape-2026",
  title: "Mobile landscape 2026",
  lead:
    "Why the 2026 mobile mainstream is broken — and what systems are needed to fix it.",
  date: "2026-07-23",
  tags: ["Mobile", "Architecture", "Process", "AI"],
  imageBase: "/notes/mobile-landscape-2026",
  blocks: parseArticle(RAW_EN, "Article illustration"),
};

export function getArticle(slug: string, lang: Language): Article | null {
  if (slug !== "mobile-landscape-2026") return null;
  return lang === "en" ? articleEn : articleRu;
}

// Used by static export / generateStaticParams — default language version
export const articlesBySlug: Record<string, Article> = {
  [articleRu.slug]: articleRu,
};