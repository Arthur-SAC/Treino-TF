import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "io.github.arthursac.treino",
  appName: "Treino",
  webDir: "dist-app",
  plugins: {
    // Quem decide quando atualizar é src/lib/atualizacao.ts.
    // statsUrl vazio: por padrão o plugin manda eventos do aparelho pra Capgo,
    // e os dados dela ficam só no celular.
    CapacitorUpdater: { autoUpdate: false, statsUrl: "" },
    LocalNotifications: { smallIcon: "ic_stat_treino", iconColor: "#c9a2a0" },
  },
};

export default config;
