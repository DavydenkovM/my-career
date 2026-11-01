/* Encrypts the GitHub token with the editor's password in the browser: AES-GCM, a key from PBKDF2. */
const ITERATIONS = 600_000;

const toBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...Array.from(bytes)));
const fromBase64 = (text: string) => Uint8Array.from(atob(text), (char) => char.charCodeAt(0));

const source = (bytes: Uint8Array) => bytes as unknown as BufferSource;

async function keyFrom(password: string, salt: BufferSource) {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);

  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function lockToken(token: string, password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await keyFrom(password, source(salt));
  const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv: source(iv) }, key, new TextEncoder().encode(token));

  return [salt, iv, new Uint8Array(data)].map(toBase64).join(".");
}

/* A wrong password fails the GCM tag check and throws */
export async function unlockToken(lock: string, password: string) {
  const [salt, iv, data] = lock.split(".").map(fromBase64);
  const key = await keyFrom(password, source(salt));
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: source(iv) }, key, source(data));

  return new TextDecoder().decode(plain);
}
