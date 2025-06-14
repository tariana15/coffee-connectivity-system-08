
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ff76785e4fd44b46837a67b9fe6b6a36',
  appName: 'coffee-connectivity-system-08',
  webDir: 'dist',
  server: {
    url: 'https://ff76785e-4fd4-4b46-837a-67b9fe6b6a36.lovableproject.com?forceHideBadge=true',
    cleartext: true,
    androidScheme: 'https'
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      keystorePassword: undefined,
      keystoreAliasPassword: undefined,
    }
  }
};

export default config;
