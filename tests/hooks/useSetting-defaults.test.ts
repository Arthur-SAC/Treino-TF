import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSetting } from "../../src/hooks/useSetting";
import { getSetting, DEFAULTS, type Settings } from "../../src/lib/settings-helpers";

// Trava o fix round 3 da Task 7: useSetting.ts tinha sua PRÓPRIA cópia de
// DEFAULTS, e ela divergiu em silêncio da de settings-helpers.ts
// (walkGoalMin ficou em 75 lá enquanto settings-helpers.ts já tinha subido
// pra 120). A tela Hoje lê pelo hook — o caminho SÍNCRONO —, não por
// `getSetting` — o caminho assíncrono —, então o bug ficou invisível pros
// testes que só exercitavam `getSetting` (como settings-walk.test.ts).
//
// As chaves vêm de `Object.keys(DEFAULTS)`, não de uma lista copiada à mão:
// uma lista própria também poderia divergir de `Settings` com o tempo, e o
// ponto deste teste é justamente não depender de ninguém lembrar de manter
// duas listas sincronizadas.
const CHAVES = Object.keys(DEFAULTS) as (keyof Settings)[];

describe("useSetting (hook, síncrono) e getSetting (assíncrono) concordam em toda chave de Settings", () => {
  it.each(CHAVES)("%s: o padrão lido pelo hook é igual ao lido por getSetting", async (chave) => {
    const doGetSetting = await getSetting(chave);
    const { result } = renderHook(() => useSetting(chave));
    await waitFor(() => expect(result.current).toEqual(doGetSetting));
  });
});
