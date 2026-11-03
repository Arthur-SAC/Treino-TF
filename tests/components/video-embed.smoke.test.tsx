// tests/components/video-embed.smoke.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { VideoEmbed } from "../../src/components/VideoEmbed";

describe("VideoEmbed", () => {
  it("mostra a capa e só monta o player depois do toque", () => {
    const { container } = render(<VideoEmbed url="https://youtu.be/dQw4w9WgXcQ" />);
    expect(container.querySelector("iframe")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Assistir o vídeo" }));
    const iframe = container.querySelector("iframe");
    expect(iframe?.getAttribute("src")).toContain("/embed/dQw4w9WgXcQ");
    // Sem origem o YouTube recusa o player (erro de configuração).
    expect(iframe?.getAttribute("referrerpolicy")).toBe("strict-origin-when-cross-origin");
  });
  it("sempre oferece abrir no YouTube", () => {
    render(<VideoEmbed url="https://youtu.be/dQw4w9WgXcQ" />);
    expect(screen.getByText(/Abrir no YouTube/).closest("a")?.getAttribute("href")).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  });
  it("busca do YouTube vira botão de busca, não player quebrado", () => {
    const { container } = render(<VideoEmbed url="https://www.youtube.com/results?search_query=hip+roll+drill" />);
    expect(container.querySelector("iframe")).toBeNull();
    expect(screen.getByText("busca: hip roll drill")).toBeInTheDocument();
  });
  it("não renderiza nada pra url vazia", () => {
    const { container } = render(<VideoEmbed url="" />);
    expect(container.firstChild).toBeNull();
  });
});
