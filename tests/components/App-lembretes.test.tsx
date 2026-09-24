import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";

const { reagendar } = vi.hoisted(() => ({ reagendar: vi.fn(async () => {}) }));
vi.mock("../../src/lib/plataforma", () => ({ isNativo: () => false }));
vi.mock("../../src/lib/lembretes/agendar", () => ({ reagendar }));

import { useLembretes } from "../../src/lib/lembretes/useLembretes";

const comRota = ({ children }: { children: ReactNode }) => <MemoryRouter>{children}</MemoryRouter>;

describe("useLembretes", () => {
  it("no Chrome (PWA) não agenda nada nativo", () => {
    renderHook(() => useLembretes(), { wrapper: comRota });
    expect(reagendar).not.toHaveBeenCalled();
  });
});
