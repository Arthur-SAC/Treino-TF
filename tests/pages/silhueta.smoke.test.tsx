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
      waistCm: 78,
      hipCm: 110,
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText(/WHR/).length).toBeGreaterThan(0);
      // 78/110 = 0,709. Evita 80/110 (~0,73) de propósito: 0,73 é agora o
      // próprio targetWhr default (whrExcelente da fase 2, ver
      // settings-helpers.ts), e coincidir os dois faria "WHR 0,73" e
      // "alvo 0,73" baterem no mesmo getByText.
      expect(screen.getByText(/0[.,]71/)).toBeInTheDocument();
    });
  });

  it("orienta a registrar medida quando não há dados", async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/registre uma medida/i)).toBeInTheDocument();
    });
  });
});
