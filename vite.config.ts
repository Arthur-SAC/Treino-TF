import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/*.svg"],
      manifest: {
        name: "Trein-Final",
        short_name: "Trein-Final",
        description: "App pessoal de transição",
        lang: "pt-BR",
        theme_color: "#1a0a0e",
        background_color: "#1a0a0e",
        display: "standalone",
        orientation: "portrait",
        scope: "./",
        start_url: "./",
        icons: [
          { src: "icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
          { src: "icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
          { src: "icons/maskable-icon.svg", sizes: "512x512", type: "image/svg+xml", purpose: "maskable" },
        ],
      },
      workbox: {
        navigateFallback: "index.html",
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "document",
            handler: "NetworkFirst",
          },
          {
            urlPattern: ({ request }) =>
              ["script", "style", "image", "font"].includes(request.destination),
            handler: "StaleWhileRevalidate",
          },
        ],
      },
    }),
  ],
  base: "./",
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./tests/setup.ts"],
    css: false,
  },
});
