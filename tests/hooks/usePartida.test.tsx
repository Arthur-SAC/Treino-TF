import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { usePartida } from "../../src/hooks/usePartida";
import { db } from "../../src/lib/db";

// Revisão da entrega 2: a altura vinha do useSetting, que devolve o padrão até
// o banco responder — o card calculava um frame com 173 e depois pulava pra
// altura dela. Nenhuma renderização "pronta" pode usar a altura errada.
beforeEach(async () => {
  await db.measurements.clear();
  await db.settings.clear();
  await db.measurements.add({ date: "2026-09-24", weightKg: 96, waistCm: 99, neckCm: 40 } as never);
  await db.settings.put({ key: "heightCm", value: 160 });
});

describe("usePartida", () => {
  it("só fica pronto quando a altura dela carregou — sem um frame com a altura padrão", async () => {
    const vistos: number[] = [];
    const { result } = renderHook(() => {
      const r = usePartida();
      if (!r.carregando && r.projecao) vistos.push(r.projecao.gorduraPct);
      return r;
    });
    await waitFor(() => expect(result.current.projecao).not.toBeNull());
    expect(new Set(vistos).size).toBe(1);
  });
});
