import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MeasurementForm } from "../../src/components/MeasurementForm";

// 2026-11-04: na tela de boas-vindas o formulário não dizia como medir, e ela
// mediu o ombro só pelas costas (62 cm) em vez de dar a volta (~120). O "como
// medir" tem que estar no próprio formulário, onde quer que ele apareça.
describe("formulário de medidas ensina a medir", () => {
  it("traz o guia 'Como medir certo' dentro do formulário", () => {
    render(<MeasurementForm onSubmit={vi.fn()} />);
    expect(screen.getByText("Como medir certo")).toBeTruthy();
  });

  it("ao tocar no campo de ombros, mostra que é a volta inteira", () => {
    render(<MeasurementForm onSubmit={vi.fn()} />);
    const ombros = screen.getByLabelText("Ombros");
    fireEvent.focus(ombros);
    const id = ombros.getAttribute("aria-describedby");
    expect(id).toBeTruthy();
    expect(document.getElementById(id!)?.textContent).toMatch(/volta/i);
  });

  it("ao tocar na cintura, lembra do umbigo", () => {
    render(<MeasurementForm onSubmit={vi.fn()} />);
    const cintura = screen.getByLabelText("Cintura");
    fireEvent.focus(cintura);
    expect(document.getElementById(cintura.getAttribute("aria-describedby")!)?.textContent).toMatch(/umbigo/i);
  });

  it("ombro abaixo de 80 cm não salva: é a largura das costas, não a volta", () => {
    const onSubmit = vi.fn();
    render(<MeasurementForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText("Ombros"), { target: { value: "62" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar medida" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/parece a largura das costas/i)).toBeTruthy();
  });

  it("ombro em circunferência salva normal", () => {
    const onSubmit = vi.fn();
    render(<MeasurementForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText("Ombros"), { target: { value: "120,5" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar medida" }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ shouldersCm: 120.5 }));
  });
});
