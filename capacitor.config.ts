import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.travelshare.app',
  appName: 'TravelShare',
  webDir: 'out',
  server: {
    // Uncomment these for live reload during development
    // url: 'http://192.168.1.X:3000',
    // cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
