/**
 * Quisat Attendant: the canteen attendant app for Quisat Pocket Pay.
 * Set EXPO_PUBLIC_API_URL to point at a non-production backend.
 */
module.exports = {
  expo: {
    name: 'Quisat Attendant',
    slug: 'quisat-attendant',
    description: 'Cashless school canteen sales for Quisat Pocket Pay.',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    scheme: 'quisat-attendant',
    userInterfaceStyle: 'light',
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.quisat.attendant',
      buildNumber: '1',
      infoPlist: {
        CFBundleDisplayName: 'Quisat Attendant',
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      package: 'com.quisat.attendant',
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: './assets/icon.png',
        backgroundColor: '#ffffff',
      },
    },
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'https://app.quisat.com/api/v1',
    },
    plugins: ['expo-secure-store', 'expo-status-bar'],
  },
};
