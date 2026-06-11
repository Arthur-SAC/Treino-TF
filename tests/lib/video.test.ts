// tests/lib/video.test.ts
import { describe, it, expect } from "vitest";
import { toEmbed } from "../../src/lib/video";

describe("toEmbed", () => {
  it("YouTube watch → embed", () => {
    expect(toEmbed("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toEqual({
      kind: "youtube",
      src: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    });
  });
  it("youtu.be → embed", () => {
    expect(toEmbed("https://youtu.be/dQw4w9WgXcQ")?.src).toBe("https://www.youtube.com/embed/dQw4w9WgXcQ");
  });
  it("shorts → embed", () => {
    expect(toEmbed("https://www.youtube.com/shorts/dQw4w9WgXcQ")?.src).toContain("/embed/dQw4w9WgXcQ");
  });
  it("watch com list antes do v= → embed", () => {
    expect(toEmbed("https://www.youtube.com/watch?list=PLabc&v=dQw4w9WgXcQ")?.src).toContain("/embed/dQw4w9WgXcQ");
  });
  it("arquivo .mp4 → video", () => {
    expect(toEmbed("https://site.com/clip.mp4")).toEqual({ kind: "video", src: "https://site.com/clip.mp4" });
  });
  it("link comum → link", () => {
    expect(toEmbed("https://site.com/aula")).toEqual({ kind: "link", src: "https://site.com/aula" });
  });
  it("não-URL → null", () => {
    expect(toEmbed("nada")).toBeNull();
    expect(toEmbed("")).toBeNull();
  });
});
