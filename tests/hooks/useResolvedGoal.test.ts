import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { db } from "../../src/lib/db";
import { useResolvedGoal } from "../../src/hooks/useResolvedGoal";

async function cenario(cycle: string, waistCm?: number) {
  await db.settings.put({ key: "activeCycle", value: cycle });
  if (waistCm !== undefined) await db.measurements.add({ date: "2026-07-01", waistCm });
}

describe("useResolvedGoal", () => {
  it("na hipertrofia com a cintura acima do limiar, a meta é manutenção", async () => {
    await cenario("hipertrofia", 99);
    const { result } = renderHook(() => useResolvedGoal());
    await waitFor(() => expect(result.current).toBe("manutencao"));
    // e continua manutenção depois que a medição carrega
    await new Promise((r) => setTimeout(r, 50));
    expect(result.current).toBe("manutencao");
  });

  it("na hipertrofia com a cintura no limiar ou abaixo, a meta vira superávit", async () => {
    await cenario("hipertrofia", 84);
    const { result } = renderHook(() => useResolvedGoal());
    await waitFor(() => expect(result.current).toBe("superavit"));
  });

  it("sem medição nenhuma, a hipertrofia fica no caminho conservador", async () => {
    await cenario("hipertrofia");
    const { result } = renderHook(() => useResolvedGoal());
    await waitFor(() => expect(result.current).toBe("manutencao"));
  });

  it("na Entrada a meta é déficit, com ou sem cintura registrada", async () => {
    await cenario("entrada-1", 99);
    const { result } = renderHook(() => useResolvedGoal());
    await waitFor(() => expect(result.current).toBe("deficit"));
  });
});
