import { describe, it, expect } from "vitest";

describe("vitest + happy-dom + jest-dom", () => {
  it("provides a DOM and jest-dom matchers", () => {
    const el = document.createElement("div");
    el.textContent = "ok";
    document.body.appendChild(el);
    expect(el).toBeInTheDocument();
    expect(el).toHaveTextContent("ok");
  });
});
