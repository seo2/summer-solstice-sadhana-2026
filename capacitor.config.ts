import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "org.3ho.summersolstice2026",
  appName: "Summer Solstice 2026",
  webDir: "out",
  server: {
    androidScheme: "https",
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#d78b4a",
    },
  },
};

export default config;
