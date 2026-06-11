// tests/pages/silhueta.smoke.test.tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Silhouette } from "../../src/pages/body/Silhouette";
import { db } from "../../src/lib/db";

beforeEach(async () => {
  await db.measurements.clear();
  await db.settings.clear();
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/corpo/silhueta"]}>
      <Routes>
        <Route path="/corpo/silhueta" element={<Silhouette />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Silhouette smoke", () => {
  it("mostra WHR e %BF a partir da última medida", async () => {
    await db.settings.put({ key: "heightCm", value: 165 });
    await db.measurements.add({
      date: "2026-06-10",
      neckCm: 33,
      shouldersCm: 105,
      waistCm: 80,
      hipCm: 110,
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText(/WHR/).length).toBeGreaterThan(0);
      expect(screen.getByText(/0[.,]73/)).toBeInTheDocument(); // 80/110 = 0,727
    });
  });

  it("orienta a registrar medida quando não há dados", async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/registre uma medida/i)).toBeInTheDocument();
    });
  });
});
