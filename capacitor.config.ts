import { CapacitorConfig } from '@capacitor/cli';


const config: CapacitorConfig = {
  appId: 'app.botfi.native',
  appName: 'BotFi',
  webDir: 'dist',
  server: {
    androidScheme: 'https',

    // remove is plthugin during production build:  @jcesarmobile/ssl-skip
    url:  "https://192.168.8.100:5173",
    cleartext: true,
  },
  
  android: {
    webContentsDebuggingEnabled: false,
    allowMixedContent: true 
  },

  plugins: {
    CapacitorHttp: {
      enabled: false,
    },
    CapacitorCookies: {
      enabled: true,
    },
  }
};

export default config;
