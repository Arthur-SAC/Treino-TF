import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Dois builds do mesmo código: o do GitHub Pages (PWA, com service worker) e
// o do APK (`--mode app`): base "/" e sem service worker, porque dentro do APK
// quem atualiza é o capacitor-updater.
export default defineConfig(({ mode }) => {
  const app = mode === "app";
  return {
    plugins: [
      react(),
      ...(app ? [] : [VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["icons/*.svg"],
        manifest: {
          name: "Treino",
          short_name: "Treino",
          description: "App pessoal de treino e rotina",
          lang: "pt-BR",
          theme_color: "#1a0a0e",
          background_color: "#1a0a0e",
          display: "standalone",
          orientation: "portrait",
          scope: "/Treino-TF/",
          start_url: "/Treino-TF/",
          icons: [
            { src: "icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
            { src: "icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
            { src: "icons/maskable-icon.svg", sizes: "512x512", type: "image/svg+xml", purpose: "maskable" },
          ],
        },
        workbox: {
          navigateFallback: "/Treino-TF/index.html",
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
      })]),
    ],
    base: app ? "/" : "/Treino-TF/",
    build: app ? { outDir: "dist-app" } : undefined,
    test: {
      globals: true,
      environment: "happy-dom",
      setupFiles: ["./tests/setup.ts"],
      css: false,
    },
  };
});
