import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "io.github.arthursac.treino",
  appName: "Treino",
  webDir: "dist-app",
  plugins: {
    // Quem decide quando atualizar é src/lib/atualizacao.ts.
    CapacitorUpdater: { autoUpdate: false },
    LocalNotifications: { smallIcon: "ic_stat_treino", iconColor: "#c9a2a0" },
  },
};

export default config;
