import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.botfi.native',
  appName: 'BotFi',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
    url:  "https://192.168.8.100:5173",
  },
  android: {
    webContentsDebuggingEnabled: false,
    allowMixedContent: true
  },
  plugins: { 
    CapacitorCookies: {
      enabled: true
    }
  }
};

export default config;
