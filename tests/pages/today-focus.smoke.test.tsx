import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Today } from "../../src/pages/Today";
import { db } from "../../src/lib/db";
import { hojeISO } from "../../src/lib/today-date";

beforeEach(async () => {
  await db.measurements.clear();
  await db.photos.clear();
  await db.workoutSessions.clear();
  await db.settings.clear();
});

describe("Today focus smoke", () => {
  it("mostra o card de foco quando a medida está atrasada", async () => {
    const old = new Date();
    old.setDate(old.getDate() - 40);
    await db.measurements.add({ date: hojeISO(old), waistCm: 80, hipCm: 110 });
    render(
      <MemoryRouter>
        <Today />
      </MemoryRouter>,
    );
    await waitFor(() => {
      // ✦ prefixa só o card de foco (o nudge antigo de baixo também diz "Hora de medir")
      expect(screen.getByText(/✦ Hora de medir/)).toBeInTheDocument();
    });
  });
});
