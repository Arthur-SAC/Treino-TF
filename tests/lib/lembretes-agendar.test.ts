import { describe, it, expect, vi } from "vitest";
import { agendar, type PluginNotificacoes } from "../../src/lib/lembretes/agendar";

const fake = (pendentes: number[], exato = "granted") => {
  const p = {
    checkExactNotificationSetting: vi.fn(async () => ({ exact_alarm: exato })),
    getPending: vi.fn(async () => ({ notifications: pendentes.map((id) => ({ id })) })),
    cancel: vi.fn(async (_o: { notifications: Array<{ id: number }> }) => {}),
    schedule: vi.fn(async (_o: { notifications: unknown[] }) => ({})),
    registerActionTypes: vi.fn(async (_o: { types: Array<{ id: string; actions: Array<{ id: string; title: string }> }> }) => {}),
  };
  return p as typeof p & PluginNotificacoes;
};

describe("agendar", () => {
  it("cancela os pendentes antes de agendar a lista nova", async () => {
    const p = fake([1, 2]);
    const quando = new Date(2026, 8, 25, 6, 0);
    await agendar([{ id: 125092500, quando, titulo: "Alongamento", corpo: "5 min de manhã", rota: "/", dia: "2026-09-25" }], p);
    expect(p.cancel).toHaveBeenCalledWith({ notifications: [{ id: 1 }, { id: 2 }] });
    expect(p.cancel.mock.invocationCallOrder[0]).toBeLessThan(p.schedule.mock.invocationCallOrder[0]);
    expect(p.schedule.mock.calls[0][0].notifications[0]).toMatchObject({
      id: 125092500, title: "Alongamento", body: "5 min de manhã", schedule: { at: quando, allowWhileIdle: true }, extra: { rota: "/" },
    });
  });
  it("lista vazia (notificações desligadas) só cancela", async () => {
    const p = fake([7]);
    await agendar([], p);
    expect(p.cancel).toHaveBeenCalled();
    expect(p.schedule).not.toHaveBeenCalled();
  });
  it("sem pendentes não chama cancel", async () => {
    const p = fake([]);
    await agendar([], p);
    expect(p.cancel).not.toHaveBeenCalled();
  });
});

// Revisão final: no local-notifications 8.3, schedule() com isExactNotification
// (padrão true) e sem a permissão abre sozinho a tela "Alarmes e lembretes" do
// Android — e o reagendamento ao voltar pro app abria de novo, em loop.
describe("agendar — alarme exato", () => {
  const um = [{ id: 125092500, quando: new Date(2026, 8, 25, 6, 0), titulo: "Alongamento", corpo: "5 min de manhã", rota: "/", dia: "2026-09-25" }];
  const exatos = (p: ReturnType<typeof fake>) =>
    (p.schedule.mock.calls[0][0].notifications as Array<{ isExactNotification?: boolean }>).map((n) => n.isExactNotification);
  it("sem a permissão, agenda inexato — quem pede a permissão é o card do Hoje", async () => {
    const p = fake([], "denied");
    await agendar(um, p);
    expect(exatos(p)).toEqual([false]);
  });
  it("com a permissão, agenda exato", async () => {
    const p = fake([]);
    await agendar(um, p);
    expect(exatos(p)).toEqual([true]);
  });
});

describe("agendar — botões de ação", () => {
  const quando = new Date(2026, 8, 25, 6, 0);
  it("registra os três tipos de ação antes de agendar", async () => {
    const p = fake([]);
    await agendar([{ id: 1, quando, titulo: "Alongamento", corpo: "x", rota: "/", dia: "2026-09-25" }], p);
    expect(p.registerActionTypes).toHaveBeenCalledWith({ types: [
      { id: "feito", actions: [{ id: "feito", title: "Feito" }] },
      { id: "bebi", actions: [{ id: "bebi", title: "Bebi 200 ml" }] },
      { id: "deitei", actions: [{ id: "deitei", title: "Deitei" }] },
    ] });
    expect(p.registerActionTypes.mock.invocationCallOrder[0]).toBeLessThan(p.schedule.mock.invocationCallOrder[0]);
  });
  it("lembrete com ação sai com actionTypeId e extra completo; sem ação, sem actionTypeId", async () => {
    const p = fake([]);
    await agendar([
      { id: 1, quando, titulo: "Alongamento", corpo: "x", rota: "/", dia: "2026-09-25", acao: "feito", itemId: "alongamento-manha" },
      { id: 2, quando, titulo: "Backup", corpo: "y", rota: "/configuracoes", dia: "2026-09-25" },
    ], p);
    const [a, b] = p.schedule.mock.calls[0][0].notifications as Array<Record<string, unknown>>;
    expect(a).toMatchObject({ actionTypeId: "feito", extra: { rota: "/", dia: "2026-09-25", itemId: "alongamento-manha" } });
    expect(b).not.toHaveProperty("actionTypeId");
    expect(b.extra).toEqual({ rota: "/configuracoes", dia: "2026-09-25" });
  });
});
