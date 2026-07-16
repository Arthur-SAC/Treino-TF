import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { db } from "../../src/lib/db";
import { SkincareRoutineModal } from "../../src/components/SkincareRoutineModal";

beforeEach(async () => {
  await db.skincareRoutines.clear();
  await db.skincareLogs.clear();
  await db.skincareRoutines.add({
    name: "Rosto · manhã",
    time: "morning",
    target: "face",
    steps: [
      { productName: "Gel salicílico", technique: "Massagem 30s, enxágua", waitMin: 0 },
      { productName: "Protetor solar toque seco", technique: "2 dedos, rosto e pescoço", waitMin: 2 },
    ],
  });
});

describe("SkincareRoutineModal", () => {
  it("mostra os passos do roteiro e o tempo de espera", async () => {
    render(<SkincareRoutineModal time="morning" onClose={() => {}} />);
    expect(await screen.findByText("Gel salicílico")).toBeInTheDocument();
    expect(screen.getByText("Protetor solar toque seco")).toBeInTheDocument();
    expect(screen.getByText(/espere 2 min/i)).toBeInTheDocument();
  });

  it("marca a rotina inteira como feita gravando os logs", async () => {
    render(<SkincareRoutineModal time="morning" onClose={() => {}} />);
    fireEvent.click(await screen.findByRole("button", { name: /marcar rotina como feita/i }));
    // o botão vira "Desfazer" quando tudo está feito
    await screen.findByRole("button", { name: /desfazer/i });
    const logs = await db.skincareLogs.toArray();
    expect(logs.some((l) => l.completed)).toBe(true);
  });
});
