import { describe, it, expect, vi } from "vitest";
import { exportarArquivo } from "../../src/lib/exportar-arquivo";

describe("exportarArquivo no APK", () => {
  it("grava no cache e abre o compartilhar do Android", async () => {
    const deps = {
      nativo: true,
      writeFile: vi.fn(async () => ({ uri: "file:///cache/trein.trein-backup" })),
      share: vi.fn(async () => ({})),
    };
    await exportarArquivo("trein.trein-backup", "conteudo", deps);
    expect(deps.writeFile).toHaveBeenCalledWith(expect.objectContaining({ path: "trein.trein-backup", data: "conteudo" }));
    expect(deps.share).toHaveBeenCalledWith(expect.objectContaining({ url: "file:///cache/trein.trein-backup" }));
  });
});
