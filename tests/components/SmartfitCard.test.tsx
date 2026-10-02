import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SmartfitCard } from "../../src/components/SmartfitCard";

describe("SmartfitCard", () => {
  it("avisa que é a hora da Smartfit e pede as fotos", () => {
    render(<SmartfitCard />);
    expect(screen.getByText("Hora da Smartfit")).toBeInTheDocument();
    expect(screen.getByText(/fotos/)).toBeInTheDocument();
  });
});
