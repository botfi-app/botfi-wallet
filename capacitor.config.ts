import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.botfi.native',
  appName: 'BotFi',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    "url": "http://192.168.8.100:5173",
    "cleartext": true
  }
};

export default config;
