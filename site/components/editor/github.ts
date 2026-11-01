import { EDITORIAL_REPO } from "@/content/editor";

const API = `https://api.github.com/repos/${EDITORIAL_REPO}`;

export class AuthError extends Error {}

const TYPES: Record<string, string> = { svg: "image/svg+xml", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif" };

export class Repo {
  constructor(private token: string) {}

  private async call(path: string, init: RequestInit = {}, accept = "application/vnd.github+json") {
    const response = await fetch(`${API}/${path}`, {
      ...init,
      cache: "no-store",
      headers: { Accept: accept, Authorization: `Bearer ${this.token}`, ...init.headers },
    });

    if (response.status === 401 || response.status === 403) throw new AuthError(`GitHub ответил ${response.status}`);
    return response;
  }

  private raw(path: string) {
    return this.call(`contents/${encodeURI(path)}`, {}, "application/vnd.github.raw+json");
  }

  async text(path: string) {
    const response = await this.raw(path);

    if (!response.ok) throw new Error(`${path}: ${response.status}`);
    return response.text();
  }

  async json<T>(path: string): Promise<T> {
    return JSON.parse(await this.text(path));
  }

  async image(path: string) {
    const response = await this.raw(path);

    if (!response.ok) throw new Error(`${path}: ${response.status}`);
    const type = TYPES[path.split(".").pop()?.toLowerCase() ?? ""] ?? "application/octet-stream";

    return URL.createObjectURL(new Blob([await response.arrayBuffer()], { type }));
  }

  /* All JSON files of a directory by chapter; a directory git does not have yet is empty */
  async folder<T>(dir: string): Promise<Record<string, T>> {
    const response = await this.call(`contents/${dir}`);

    if (response.status === 404) return {};
    if (!response.ok) throw new Error(`${dir}: ${response.status}`);
    const files: { name: string; path: string }[] = await response.json();
    const out: Record<string, T> = {};

    for (let i = 0; i < files.length; i += 12) {
      await Promise.all(
        files.slice(i, i + 12).map(async ({ name, path }) => {
          out[name.replace(/\.json$/, "")] = await this.json<T>(path);
        }),
      );
    }
    return out;
  }

  async headCommit() {
    const response = await this.call("commits/main");

    if (!response.ok) throw new Error(`commits/main: ${response.status}`);
    return (await response.json()).sha as string;
  }

  private async shaOf(path: string): Promise<string | undefined> {
    const response = await this.call(`contents/${encodeURI(path)}`);

    if (response.status === 404) return undefined;
    if (!response.ok) throw new Error(`${path}: ${response.status}`);
    return (await response.json()).sha;
  }

  /* Every decision is a commit. Someone pushing in between moves the sha: read it again once. */
  async save(path: string, value: unknown, message: string) {
    const bytes = new TextEncoder().encode(`${JSON.stringify(value, null, 1)}\n`);
    const content = btoa(String.fromCharCode(...Array.from(bytes)));

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const sha = await this.shaOf(path);
      const response = await this.call(`contents/${encodeURI(path)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, content, sha }),
      });

      if (response.ok) return;
      if (response.status !== 409 && response.status !== 422) throw new Error(`${path}: ${response.status}`);
    }
    throw new Error("Не удалось сохранить: файл меняется. Попробуйте ещё раз.");
  }
}
