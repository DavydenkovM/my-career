"use client";

import ReactMarkdown from "react-markdown";
import { Div, followLink, rehypePlugins, remarkPlugins } from "@/components/editor/markdown";

/* What the book's markup looks like in the portal: authors check a new construct here */
const SAMPLE = `## Шаг 1. Пример

**Экран меню** · \`src/modules/menu/containers/main/index.tsx\`

\`\`\`tsx
import { wallet } from '../../../loyalty/model/wallet';

const points = Math.floor(drink.price * wallet.rate);
\`\`\`

> [!IMPORTANT]
> **Предскажите.** Что сломается? Сверьтесь с [ответом 1](#answer-1).

\`\`\`bash title="Команды"
cd course/workspace/windows-and-channels/coffee
npx tsc --noEmit
\`\`\`

\`\`\`bash title="Шорткат"
npm run course -- check windows-and-channels
\`\`\`

## Ответы

<details id="answer-1">
<summary>Ответ 1</summary>

Строка с \`wallet.rate\`.

</details>
`;

export default function Markup() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <article onClick={followLink} className="prose prose-stone max-w-none prose-code:before:content-none prose-code:after:content-none">
        <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins} components={{ div: Div }}>{SAMPLE}</ReactMarkdown>
      </article>
    </main>
  );
}
