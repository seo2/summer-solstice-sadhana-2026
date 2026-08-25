import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  // Note: Android package segments cannot start with a digit ("3ho"), so the
  // id uses "threeho". Immutable once published to the stores.
  appId: "org.threeho.eventapp",
  appName: "3HO Event App",
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
