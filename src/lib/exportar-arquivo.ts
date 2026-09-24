// Dentro do APK o <a download> não faz nada (o WebView ignora downloads):
// grava no cache do app e abre o compartilhar do Android (Drive, Arquivos…).
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { isNativo } from "./plataforma";

interface Deps {
  nativo: boolean;
  writeFile: (o: { path: string; data: string; directory: Directory; encoding: Encoding }) => Promise<{ uri: string }>;
  share: (o: { title: string; url: string }) => Promise<unknown>;
}
const padrao = (): Deps => ({
  nativo: isNativo(),
  writeFile: (o) => Filesystem.writeFile(o),
  share: (o) => Share.share(o),
});

export async function exportarArquivo(nome: string, conteudo: string, deps: Deps = padrao()): Promise<void> {
  if (deps.nativo) {
    const { uri } = await deps.writeFile({ path: nome, data: conteudo, directory: Directory.Cache, encoding: Encoding.UTF8 });
    await deps.share({ title: nome, url: uri });
    return;
  }
  const url = URL.createObjectURL(new Blob([conteudo], { type: "application/octet-stream" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = nome;
  link.click();
  URL.revokeObjectURL(url);
}
