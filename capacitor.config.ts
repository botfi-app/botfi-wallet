import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.botfi.pwa',
  appName: 'botfi-wallet',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
