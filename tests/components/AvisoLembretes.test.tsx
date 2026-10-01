import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { db } from "../../src/lib/db";

// Sem permissão os lembretes do APK não tocam, e nada na tela diria por quê.
const h = vi.hoisted(() => ({
  nativo: true,
  plugin: {
    checkPermissions: vi.fn(async () => ({ display: "prompt" })),
    requestPermissions: vi.fn(async () => ({ display: "granted" })),
    checkExactNotificationSetting: vi.fn(async () => ({ exact_alarm: "granted" })),
    changeExactNotificationSetting: vi.fn(async () => ({})),
  },
}));
vi.mock("../../src/lib/plataforma", () => ({ isNativo: () => h.nativo }));
vi.mock("@capacitor/local-notifications", () => ({ LocalNotifications: h.plugin }));

import { AvisoLembretes } from "../../src/components/AvisoLembretes";

beforeEach(async () => {
  h.nativo = true;
  await db.settings.clear();
});

describe("AvisoLembretes", () => {
  it("no Chrome não aparece", async () => {
    h.nativo = false;
    const { container } = render(<AvisoLembretes />);
    await new Promise((r) => setTimeout(r, 20));
    expect(container.textContent).toBe("");
  });

  it("sem permissão: botão ativa, pede ao Android e liga os lembretes", async () => {
    await db.settings.put({ key: "notificationsEnabled", value: false });
    render(<AvisoLembretes />);
    fireEvent.click(await screen.findByRole("button", { name: /ativar lembretes/i }));
    await waitFor(async () => expect((await db.settings.get("notificationsEnabled"))?.value).toBe(true));
    expect(h.plugin.requestPermissions).toHaveBeenCalled();
  });

  it("sem alarme exato: explica e abre o ajuste", async () => {
    h.plugin.checkPermissions.mockResolvedValueOnce({ display: "granted" });
    h.plugin.checkExactNotificationSetting.mockResolvedValueOnce({ exact_alarm: "denied" });
    render(<AvisoLembretes />);
    fireEvent.click(await screen.findByRole("button", { name: /permitir horário exato/i }));
    expect(h.plugin.changeExactNotificationSetting).toHaveBeenCalled();
  });

  it("tudo certo: não aparece", async () => {
    h.plugin.checkPermissions.mockResolvedValueOnce({ display: "granted" });
    const { container } = render(<AvisoLembretes />);
    await new Promise((r) => setTimeout(r, 30));
    expect(container.textContent).toBe("");
  });
});
