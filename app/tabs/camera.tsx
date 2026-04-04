import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  SafeAreaView, Alert, Animated, Dimensions, Image,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { Colors, BorderRadius } from '../../constants/theme';
import { detectLitter, LitterResult } from '../../lib/gemini';
import { calculatePoints } from '../../lib/points';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const TROPHY_IMG = require('../../assets/images/app-logo.png');
const STAR_IMG   = require('../../assets/images/points.png');

type FlowStep = 'before_camera' | 'before_result' | 'after_camera' | 'after_result';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [step, setStep] = useState<FlowStep>('before_camera');
  const [loading, setLoading] = useState(false);
  const [beforeResult, setBeforeResult] = useState<LitterResult | null>(null);
  const [afterResult, setAfterResult]   = useState<LitterResult | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.07, duration: 850, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 850, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Text style={styles.permissionEmoji}>📷</Text>
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionSubtitle}>
          PureLeaf needs your camera to detect and count litter.
        </Text>
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

  const points = beforeResult && afterResult
    ? calculatePoints(beforeResult.count, afterResult.count)
    : null;

  return (
    <View style={styles.container}>
      {/* ── Camera view ── */}
      {(step === 'before_camera' || step === 'after_camera') && (
        <>
          <CameraView ref={cameraRef} style={styles.camera} facing="back" />

          {/* Semi-transparent green bottom bar overlaid on camera */}
          <View style={styles.bottomBar}>
            <View style={styles.detectionBadge}>
              <Text style={styles.sparkle}>✦</Text>
              <Text style={styles.detectionText}>
                {loading
                  ? 'Analyzing...'
                  : step === 'before_camera'
                  ? '0 items detected'
                  : 'Tap to verify'}
              </Text>
              <Text style={styles.sparkle}>✦</Text>
            </View>

            <Animated.View style={{ transform: [{ scale: loading ? 1 : pulseAnim }] }}>
              <TouchableOpacity
                style={[styles.shutter, loading && styles.shutterDisabled]}
                onPress={takePicture}
                disabled={loading}
                activeOpacity={0.85}
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

      {/* ── Before result sheet ── */}
      {step === 'before_result' && beforeResult && (
        <BeforeResultSheet
          result={beforeResult}
          onSnap={() => setStep('after_camera')}
          onDiscard={resetFlow}
        />
      )}

      {/* ── After result screen ── */}
      {step === 'after_result' && afterResult && beforeResult && points && (
        <AfterResultScreen
          points={points}
          onReset={resetFlow}
        />
      )}
    </View>
  );
}

// ── Before Result Sheet ──────────────────────────────────────────────────────
function BeforeResultSheet({
  result, onSnap, onDiscard,
}: { result: LitterResult; onSnap: () => void; onDiscard: () => void }) {
  const slideAnim = useRef(new Animated.Value(400)).current;
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0, useNativeDriver: true, tension: 55, friction: 11,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Blurred camera bg — green tint */}
      <View style={styles.beforeBg} />

      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        {/* Count + subtitle */}
        <Text style={styles.sheetCount}>{result.count} Items{'\n'}Detected!</Text>
        <Text style={styles.sheetSubtitle}>Get Cleaning!</Text>

        {/* Item list */}
        <View style={styles.itemsList}>
          {result.items.slice(0, 5).map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <Text style={styles.itemDot}>•</Text>
              <Text style={styles.itemLabel}>{item.label}</Text>
              <View style={styles.itemConfBadge}>
                <Text style={styles.itemConf}>{item.confidence}</Text>
              </View>
            </View>
          ))}
          {result.items.length > 5 && (
            <Text style={styles.moreItems}>+{result.items.length - 5} more items</Text>
          )}
        </View>

        {/* CTA */}
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

// ── After Result Screen ──────────────────────────────────────────────────────
function AfterResultScreen({
  points, onReset,
}: {
  points: ReturnType<typeof calculatePoints>;
  onReset: () => void;
}) {
  const scaleAnim   = useRef(new Animated.Value(0.4)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 45, friction: 8 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.afterContainer}>
      {/* Green top section */}
      <View style={styles.afterGreenTop}>
        {/* Trophy — swap emoji for image when ready */}
        <Image source={TROPHY_IMG} style={styles.trophyImage} resizeMode="contain" />
        {/* <Animated.Text
          style={[styles.trophyEmoji, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}
        >
          🏆
        </Animated.Text> */}

        <Text style={styles.greatJob}>Great Job!</Text>
        <Text style={styles.litterally}>
          You <Text style={styles.litterYellow}>litter</Text>ally rule
        </Text>
        <Text style={styles.cleanedLabel}>You cleaned up</Text>
        <Text style={styles.cleanedCount}>{points.itemsCleaned}</Text>
        <Text style={styles.cleanedWord}>items</Text>
      </View>

      {/* White bottom card*/}
      <View style={styles.pointsCard}>
        <Text style={styles.youEarned}>You earned</Text>

        <View style={styles.pointsRow}>
          {/* Swap for image: */}
          <Image source={STAR_IMG} style={styles.starImage} />
          {/* <Text style={styles.starEmoji}>⭐</Text> */}
          <Text style={styles.pointsNumber}>{points.points} points</Text>
        </View>

        <TouchableOpacity style={styles.leaderboardBtn} onPress={() => router.push('/tabs/leaderboard')} activeOpacity={0.85}>
          <Text style={styles.leaderboardBtnText}>View Leaderboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.homeBtn} onPress={onReset} activeOpacity={0.85}>
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },

  // Semi-transparent bottom bar sitting over the camera
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(34, 100, 34, 0.82)', // semi-transparent green
    paddingTop: 18,
    paddingBottom: 96,
    alignItems: 'center',
    gap: 16,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  detectionBadge: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sparkle: { color: Colors.accent, fontSize: 16 },
  detectionText: { color: '#fff', fontSize: 20, fontWeight: '800' },

  shutter: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  shutterDisabled: { opacity: 0.6 },
  shutterInner: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.08)',
  },

  // Permission
  permissionContainer: {
    flex: 1, backgroundColor: Colors.offWhite,
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  permissionEmoji: { fontSize: 64, marginBottom: 16 },
  permissionTitle: { fontSize: 24, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  permissionSubtitle: {
    fontSize: 16, color: Colors.textSecondary,
    textAlign: 'center', marginBottom: 32, lineHeight: 24,
  },
  permissionBtn: {
    backgroundColor: Colors.primary, paddingHorizontal: 32,
    paddingVertical: 16, borderRadius: BorderRadius.full,
  },
  permissionBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Before result
  beforeBg: { ...StyleSheet.absoluteFillObject, backgroundColor: Colors.primary },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 36, borderTopRightRadius: 36,
    paddingHorizontal: 28, paddingTop: 32, paddingBottom: 52,
  },
  sheetCount: {
    fontSize: 38, fontWeight: '900', color: Colors.primary,
    lineHeight: 44, marginBottom: 4,
  },
  sheetSubtitle: { fontSize: 16, color: Colors.textSecondary, marginBottom: 18 },
  itemsList: { marginBottom: 22, gap: 8 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  itemDot: { color: Colors.primary, fontSize: 18, width: 16 },
  itemLabel: { flex: 1, fontSize: 15, color: Colors.text, textTransform: 'capitalize' },
  itemConfBadge: {
    backgroundColor: Colors.primaryPale,
    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3,
  },
  itemConf: { fontSize: 11, color: Colors.primary, fontWeight: '600' },
  moreItems: { fontSize: 13, color: Colors.textMuted, fontStyle: 'italic' },
  sheetCta: {
    fontSize: 32, fontWeight: '900', color: Colors.text,
    lineHeight: 38, marginBottom: 24,
  },
  snapBtn: {
    backgroundColor: Colors.accent, borderRadius: 999,
    paddingVertical: 17, alignItems: 'center', marginBottom: 12,
  },
  snapBtnText: { fontSize: 16, fontWeight: '800', color: '#1a1a1a' },
  discardBtn: {
    borderWidth: 1.5, borderColor: '#ccc',
    borderRadius: 999, paddingVertical: 15, alignItems: 'center',
  },
  discardBtnText: { fontSize: 15, fontWeight: '600', color: Colors.text },

  // After result
  afterContainer: { flex: 1, backgroundColor: Colors.primary },
  afterGreenTop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  trophyEmoji: { fontSize: 80, marginBottom: 12 },
  trophyImage: { width: 90, height: 90, marginBottom: 12 }, // for when you swap to image
  greatJob: { fontSize: 26, fontWeight: '900', color: '#fff', marginBottom: 2 },
  litterally: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 12 },
  litterYellow: { color: Colors.accent },
  cleanedLabel: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 0 },
  cleanedCount: { fontSize: 52, fontWeight: '900', color: '#fff', lineHeight: 58 },
  cleanedWord: { fontSize: 18, color: 'rgba(255,255,255,0.85)', marginBottom: 8 },

  pointsCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 48,
    alignItems: 'center',
    gap: 14,
  },
  youEarned: { fontSize: 15, color: Colors.textSecondary },
  pointsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  starEmoji: { fontSize: 34 },
  starImage: { width: 34, height: 34 }, // for when you swap to image
  pointsNumber: { fontSize: 42, fontWeight: '900', color: Colors.text },
  leaderboardBtn: {
    backgroundColor: Colors.primary, borderRadius: 999,
    paddingVertical: 15, alignItems: 'center', width: '100%',
  },
  leaderboardBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  homeBtn: {
    borderWidth: 1.5, borderColor: '#ccc',
    borderRadius: 999, paddingVertical: 14, alignItems: 'center', width: '100%',
  },
  homeBtnText: { fontSize: 15, fontWeight: '600', color: Colors.text },
});
