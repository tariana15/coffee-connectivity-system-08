
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.bcbeb9799222464f82e294bbd69ce635',
  appName: 'coffee-connectivity-system',
  webDir: 'dist',
  server: {
    url: 'https://bcbeb979-9222-464f-82e2-94bbd69ce635.lovableproject.com?forceHideBadge=true',
    cleartext: true
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
