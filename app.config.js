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
        NSCameraUsageDescription: 'Quisat Attendant uses the camera to scan student cards.',
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
      eas: {
        projectId: '4fbc83c5-edb9-437d-affa-a20aa3641ab6',
      },
    },
    owner: 'thecodeartisan',
    plugins: [
      'expo-secure-store',
      'expo-status-bar',
      ['expo-camera', { cameraPermission: 'Quisat Attendant uses the camera to scan student cards.', recordAudioAndroid: false }],
      [
        'expo-build-properties',
        {
          android: {
            // APK size: real phones only (no x86 emulator code), R8 code and resource
            // shrinking, and compressed native libraries.
            buildArchs: ['arm64-v8a', 'armeabi-v7a'],
            enableMinifyInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true,
            useLegacyPackaging: true,
          },
        },
      ],
    ],
  },
};
