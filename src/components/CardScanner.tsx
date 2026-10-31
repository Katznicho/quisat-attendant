import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, type } from '../theme';
import { cardNumberFromQr } from '../utils/format';
import Button from './Button';

type Props = {
  /** Called once per scan with the card number. Scanning stays off while `paused`. */
  onScanned: (cardNumber: string) => void;
  paused?: boolean;
};

/** Live camera viewfinder that reads the QR code printed on a Pocket Pay card. */
export default function CardScanner({ onScanned, paused }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [notCard, setNotCard] = useState(false);
  // The camera fires many events per second; only the first one per code counts.
  const lastCode = useRef<{ data: string; at: number } | null>(null);

  if (!permission) {
    return (
      <View style={[styles.frame, styles.center]}>
        <ActivityIndicator color={colors.onPrimary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.frame, styles.center, styles.permission]}>
        <View style={styles.permissionIcon}>
          <Ionicons name="camera-outline" size={30} color={colors.primary} />
        </View>
        <Text style={styles.permissionTitle}>Allow camera to scan cards</Text>
        <Text style={styles.permissionText}>The camera is only used to read the QR code on a student's card.</Text>
        <Button
          title={permission.canAskAgain ? 'Allow camera' : 'Open settings'}
          icon={permission.canAskAgain ? 'camera' : 'settings-outline'}
          onPress={() => (permission.canAskAgain ? requestPermission() : Linking.openSettings())}
          style={{ alignSelf: 'stretch' }}
        />
      </View>
    );
  }

  return (
    <View style={styles.frame}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={
          paused
            ? undefined
            : ({ data }) => {
                const now = Date.now();
                if (lastCode.current && lastCode.current.data === data && now - lastCode.current.at < 2500) {
                  return;
                }
                lastCode.current = { data, at: now };

                const number = cardNumberFromQr(data);
                if (!number) {
                  setNotCard(true);
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
                  return;
                }
                setNotCard(false);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                onScanned(number);
              }
        }
      />

      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.reticle} pointerEvents="none">
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
        </View>

        <View style={styles.hintPill} pointerEvents="none">
          {paused ? <ActivityIndicator size="small" color={colors.onPrimary} /> : null}
          <Text style={styles.hintText}>
            {paused ? 'Looking up card…' : notCard ? 'That QR code is not a Quisat card' : 'Point at the QR code on the card'}
          </Text>
        </View>

        <Pressable
          onPress={() => setTorch((on) => !on)}
          style={[styles.torch, torch && styles.torchOn]}
          accessibilityRole="button"
          accessibilityLabel={torch ? 'Turn off light' : 'Turn on light'}
          hitSlop={8}
        >
          <Ionicons name={torch ? 'flashlight' : 'flashlight-outline'} size={20} color={torch ? colors.primary : colors.onPrimary} />
        </Pressable>
      </View>
    </View>
  );
}

const RETICLE = 210;
const CORNER = 34;
const STROKE = 4;

const styles = StyleSheet.create({
  frame: { height: 340, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: '#0A0F24' },
  center: { alignItems: 'center', justifyContent: 'center' },
  permission: { backgroundColor: colors.surface, padding: spacing.xl, gap: spacing.md, borderWidth: 1, borderColor: colors.border },
  permissionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionTitle: { ...type.heading, color: colors.text, textAlign: 'center' },
  permissionText: { ...type.small, color: colors.muted, textAlign: 'center', marginBottom: spacing.sm },
  overlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' },
  reticle: { width: RETICLE, height: RETICLE },
  corner: { position: 'absolute', width: CORNER, height: CORNER, borderColor: '#FFFFFF' },
  tl: { top: 0, left: 0, borderTopWidth: STROKE, borderLeftWidth: STROKE, borderTopLeftRadius: 14 },
  tr: { top: 0, right: 0, borderTopWidth: STROKE, borderRightWidth: STROKE, borderTopRightRadius: 14 },
  bl: { bottom: 0, left: 0, borderBottomWidth: STROKE, borderLeftWidth: STROKE, borderBottomLeftRadius: 14 },
  br: { bottom: 0, right: 0, borderBottomWidth: STROKE, borderRightWidth: STROKE, borderBottomRightRadius: 14 },
  hintPill: {
    position: 'absolute',
    bottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.scrim,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  hintText: { color: colors.onPrimary, fontSize: 14, fontWeight: '600' },
  torch: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.scrim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  torchOn: { backgroundColor: '#FFFFFF' },
});
