import { describe, it, expect } from "vitest";
import { encryptBackup, decryptBackup } from "../../src/lib/backup";

describe("encrypt/decrypt backup", () => {
  it("round-trip preserva dados", async () => {
    const payload = { hello: "mundo", n: 42, list: [1, 2, 3] };
    const password = "minha-senha-secreta";
    const encrypted = await encryptBackup(payload, password);
    expect(encrypted).toBeTypeOf("string");
    expect(encrypted.length).toBeGreaterThan(20);
    const decrypted = await decryptBackup<typeof payload>(encrypted, password);
    expect(decrypted).toEqual(payload);
  });

  it("senha errada falha decifrar", async () => {
    const encrypted = await encryptBackup({ x: 1 }, "senha-certa");
    await expect(decryptBackup(encrypted, "senha-errada")).rejects.toThrow();
  });

  it("payload corrompido falha", async () => {
    await expect(decryptBackup("conteudo-nao-base64-valido!!!", "qq")).rejects.toThrow();
  });
});
