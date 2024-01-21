import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.botfi.native',
  appName: 'BotFi',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    "url": "https://native-dev.botfi.app",
    "cleartext": true
  },
  plugins: {
    CapacitorHttp: {
      //enabled: true,
    }
  }
};

export default config;
