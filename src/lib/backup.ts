// AES-GCM com chave derivada por PBKDF2(SHA-256, 250k iterações).
// Formato do output: base64( salt(16) || iv(12) || ciphertext )

const ITERATIONS = 250_000;
const SALT_LEN = 16;
const IV_LEN = 12;

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: ITERATIONS, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function encryptBackup(payload: unknown, password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LEN));
  const key = await deriveKey(password, salt);
  const data = new TextEncoder().encode(JSON.stringify(payload));
  const cipher = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data),
  );
  const buf = new Uint8Array(salt.length + iv.length + cipher.length);
  buf.set(salt, 0);
  buf.set(iv, salt.length);
  buf.set(cipher, salt.length + iv.length);
  return bytesToBase64(buf);
}

export async function decryptBackup<T = unknown>(encoded: string, password: string): Promise<T> {
  const buf = base64ToBytes(encoded);
  if (buf.length < SALT_LEN + IV_LEN + 1) throw new Error("Backup inválido");
  const salt = buf.slice(0, SALT_LEN);
  const iv = buf.slice(SALT_LEN, SALT_LEN + IV_LEN);
  const cipher = buf.slice(SALT_LEN + IV_LEN);
  const key = await deriveKey(password, salt);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipher);
  return JSON.parse(new TextDecoder().decode(plain)) as T;
}
