// tests/components/video-embed.smoke.test.tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { VideoEmbed } from "../../src/components/VideoEmbed";

describe("VideoEmbed", () => {
  it("renderiza iframe pra link do YouTube", () => {
    const { container } = render(<VideoEmbed url="https://youtu.be/dQw4w9WgXcQ" />);
    const iframe = container.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe?.getAttribute("src")).toContain("/embed/dQw4w9WgXcQ");
  });
  it("não renderiza iframe pra url vazia", () => {
    const { container } = render(<VideoEmbed url="" />);
    expect(container.querySelector("iframe")).toBeNull();
  });
});
