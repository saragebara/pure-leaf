import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  Modal, ScrollView, SafeAreaView, Alert, Animated, Dimensions,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { detectLitter, LitterResult } from '../../lib/gemini';
import { calculatePoints } from '../../lib/points';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type FlowStep = 'before_camera' | 'before_result' | 'after_camera' | 'after_result';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [step, setStep] = useState<FlowStep>('before_camera');
  const [loading, setLoading] = useState(false);
  const [beforeResult, setBeforeResult] = useState<LitterResult | null>(null);
  const [afterResult, setAfterResult] = useState<LitterResult | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse animation for shutter button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Text style={styles.permissionEmoji}>📷</Text>
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionSubtitle}>LitterLens needs your camera to detect and count litter.</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  async function takePicture() {
    if (!cameraRef.current || loading) return;
    setLoading(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.6, base64: true });
      if (!photo?.base64) throw new Error('No image data');
      const result = await detectLitter(photo.base64);
      if (step === 'before_camera') {
        setBeforeResult(result);
        setStep('before_result');
      } else {
        setAfterResult(result);
        setStep('after_result');
      }
    } catch (e: any) {
      Alert.alert('Detection failed', e.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function resetFlow() {
    setStep('before_camera');
    setBeforeResult(null);
    setAfterResult(null);
  }

  const isBefore = step === 'before_camera' || step === 'before_result';
  const detectedCount = isBefore ? (beforeResult?.count ?? 0) : (afterResult?.count ?? 0);

  const points = beforeResult && afterResult
    ? calculatePoints(beforeResult.count, afterResult.count)
    : null;

  return (
    <View style={styles.container}>
      {/* Camera viewfinder */}
      {(step === 'before_camera' || step === 'after_camera') && (
        <>
          <CameraView ref={cameraRef} style={styles.camera} facing="back">
            {/* Detection overlay label */}
            <View style={styles.cameraTopBar}>
              <Text style={styles.cameraTopLabel}>
                {step === 'before_camera' ? '🔍 Point at litter area' : '✅ Same spot — after cleaning'}
              </Text>
            </View>
          </CameraView>

          {/* Bottom bar */}
          <View style={styles.bottomBar}>
            <View style={styles.detectionBadge}>
              <Text style={styles.sparkle}>✦</Text>
              <Text style={styles.detectionText}>
                {loading ? 'Analyzing...' : step === 'before_camera' ? 'Tap to scan' : 'Tap to verify'}
              </Text>
              <Text style={styles.sparkle}>✦</Text>
            </View>

            <Animated.View style={{ transform: [{ scale: loading ? 1 : pulseAnim }] }}>
              <TouchableOpacity
                style={[styles.shutter, loading && styles.shutterDisabled]}
                onPress={takePicture}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading
                  ? <ActivityIndicator color={Colors.primary} size="large" />
                  : <View style={styles.shutterInner} />
                }
              </TouchableOpacity>
            </Animated.View>
          </View>
        </>
      )}

      {/* Before result modal */}
      {step === 'before_result' && beforeResult && (
        <BeforeResultSheet
          result={beforeResult}
          onSnap={() => setStep('after_camera')}
          onDiscard={resetFlow}
        />
      )}

      {/* After result / points screen */}
      {step === 'after_result' && afterResult && beforeResult && points && (
        <AfterResultScreen
          beforeCount={beforeResult.count}
          afterCount={afterResult.count}
          points={points}
          onReset={resetFlow}
        />
      )}
    </View>
  );
}

// ── Before Result Sheet ─────────────────────────────────────────────────────
function BeforeResultSheet({
  result, onSnap, onDiscard,
}: { result: LitterResult; onSnap: () => void; onDiscard: () => void }) {
  const slideAnim = useRef(new Animated.Value(300)).current;
  useEffect(() => {
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 60, friction: 10 }).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Blurred green background (simplified) */}
      <View style={styles.beforeBg} />
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.sheetCount}>{result.count} Items{'\n'}Detected!</Text>
        <Text style={styles.sheetSubtitle}>Get Cleaning!</Text>

        <View style={styles.itemsList}>
          {result.items.slice(0, 5).map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <Text style={styles.itemDot}>•</Text>
              <Text style={styles.itemLabel}>{item.label}</Text>
              <Text style={styles.itemConf}>{item.confidence}</Text>
            </View>
          ))}
          {result.items.length > 5 && (
            <Text style={styles.moreItems}>+{result.items.length - 5} more items</Text>
          )}
        </View>

        <Text style={styles.sheetCta}>Ready to{'\n'}Show Your Work?</Text>

        <TouchableOpacity style={styles.snapBtn} onPress={onSnap} activeOpacity={0.85}>
          <Text style={styles.snapBtnText}>Snap Picture</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.discardBtn} onPress={onDiscard} activeOpacity={0.85}>
          <Text style={styles.discardBtnText}>Discard This Picture</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ── After Result / Points Screen ────────────────────────────────────────────
function AfterResultScreen({
  beforeCount, afterCount, points, onReset,
}: {
  beforeCount: number;
  afterCount: number;
  points: ReturnType<typeof calculatePoints>;
  onReset: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.afterContainer}>
      <View style={styles.afterGreenTop}>
        <Animated.Text style={[styles.trophyEmoji, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
          🏆
        </Animated.Text>
        <Text style={styles.greatJob}>Great Job!</Text>
        <Text style={styles.litterally}>
          You <Text style={styles.litterYellow}>litter</Text>ally rule
        </Text>
        <Text style={styles.cleanedLabel}>You cleaned up</Text>
        <Text style={styles.cleanedCount}>{points.itemsCleaned} items</Text>
        {points.bonusLabel && (
          <View style={styles.bonusBadge}>
            <Text style={styles.bonusBadgeText}>⚡ {points.bonusLabel}</Text>
          </View>
        )}
      </View>

      <View style={styles.pointsCard}>
        <Text style={styles.youEarned}>You earned</Text>
        <View style={styles.pointsRow}>
          <Text style={styles.starEmoji}>⭐</Text>
          <Text style={styles.pointsNumber}>{points.points} points</Text>
        </View>
        {points.bonus > 0 && (
          <Text style={styles.bonusBreakdown}>
            ({points.itemsCleaned} items × 10 + {points.bonus} bonus)
          </Text>
        )}

        <TouchableOpacity style={styles.leaderboardBtn} activeOpacity={0.85}>
          <Text style={styles.leaderboardBtnText}>View Leaderboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.homeBtn} onPress={onReset} activeOpacity={0.85}>
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },

  cameraTopBar: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  cameraTopLabel: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    color: '#fff',
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
    fontWeight: '600',
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.primary,
    paddingTop: 16,
    paddingBottom: 90,
    alignItems: 'center',
    gap: 16,
  },
  detectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sparkle: { color: Colors.accent, fontSize: 16 },
  detectionText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  shutterDisabled: { opacity: 0.6 },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: Colors.border,
  },

  // Permission screen
  permissionContainer: {
    flex: 1, backgroundColor: Colors.offWhite,
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  permissionEmoji: { fontSize: 64, marginBottom: 16 },
  permissionTitle: { fontSize: 24, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  permissionSubtitle: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', marginBottom: 32, lineHeight: 24 },
  permissionBtn: {
    backgroundColor: Colors.primary, paddingHorizontal: 32, paddingVertical: 16,
    borderRadius: BorderRadius.full,
  },
  permissionBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Before result sheet
  beforeBg: { ...StyleSheet.absoluteFillObject, backgroundColor: Colors.primary },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 32,
    paddingBottom: 48,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 20,
    elevation: 20,
  },
  sheetCount: {
    fontSize: 36, fontWeight: '900', color: Colors.primary,
    marginBottom: 4, lineHeight: 42,
  },
  sheetSubtitle: { fontSize: 16, color: Colors.textSecondary, marginBottom: 16 },
  itemsList: { marginBottom: 20, gap: 6 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemDot: { color: Colors.primary, fontSize: 16, width: 16 },
  itemLabel: { fontSize: 15, color: Colors.text, flex: 1, textTransform: 'capitalize' },
  itemConf: {
    fontSize: 11, color: Colors.textMuted,
    backgroundColor: Colors.primaryPale,
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 10, overflow: 'hidden',
  },
  moreItems: { fontSize: 13, color: Colors.textMuted, fontStyle: 'italic' },
  sheetCta: {
    fontSize: 30, fontWeight: '900', color: Colors.text,
    marginBottom: 24, lineHeight: 36,
  },
  snapBtn: {
    backgroundColor: Colors.accent, borderRadius: BorderRadius.full,
    paddingVertical: 16, alignItems: 'center', marginBottom: 12,
  },
  snapBtnText: { fontSize: 16, fontWeight: '700', color: Colors.text },
  discardBtn: {
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: BorderRadius.full, paddingVertical: 16, alignItems: 'center',
  },
  discardBtnText: { fontSize: 16, fontWeight: '600', color: Colors.text },

  // After result
  afterContainer: { flex: 1 },
  afterGreenTop: {
    flex: 1, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    paddingTop: 60, paddingBottom: 48,
  },
  trophyEmoji: { fontSize: 72, marginBottom: 16 },
  greatJob: { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 4 },
  litterally: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 8 },
  litterYellow: { color: Colors.accent },
  cleanedLabel: { fontSize: 16, color: 'rgba(255,255,255,0.75)', marginBottom: 4 },
  cleanedCount: { fontSize: 40, fontWeight: '900', color: '#fff', marginBottom: 8 },
  bonusBadge: {
    backgroundColor: Colors.accent, borderRadius: BorderRadius.full,
    paddingHorizontal: 16, paddingVertical: 6,
  },
  bonusBadgeText: { fontSize: 14, fontWeight: '700', color: Colors.text },

  pointsCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 32, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 16,
  },
  youEarned: { fontSize: 16, color: Colors.textSecondary, marginBottom: 8 },
  pointsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  starEmoji: { fontSize: 32 },
  pointsNumber: { fontSize: 40, fontWeight: '900', color: Colors.text },
  bonusBreakdown: { fontSize: 13, color: Colors.textMuted, marginBottom: 20 },
  leaderboardBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.full,
    paddingVertical: 14, paddingHorizontal: 40,
    alignItems: 'center', marginBottom: 12, width: '100%',
  },
  leaderboardBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  homeBtn: {
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: BorderRadius.full, paddingVertical: 14, paddingHorizontal: 40,
    alignItems: 'center', width: '100%',
  },
  homeBtnText: { fontSize: 16, fontWeight: '600', color: Colors.text },
});
