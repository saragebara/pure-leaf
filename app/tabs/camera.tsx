import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  SafeAreaView, Alert, Animated, Dimensions, Image,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { Colors, BorderRadius } from '../../constants/theme';
import { detectLitter, LitterResult } from '../../lib/gemini';
import { calculatePoints } from '../../lib/points';

//for testing the after screen without eating my gemini API
const DEV_SHOW_AFTER_ONLY = false;

//for green card sizing
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const TROPHY_IMG = require('../../assets/images/app-logo.png');
const STAR_IMG   = require('../../assets/images/points.png');

//the main flow has 4 steps:
//before_camera  - user points camera at litter
//before_result - gemini gets a count, show the sheet
//after_camera - user points camera at the cleaned area
//after_result - show how many items cleaned + points earned
type FlowStep = 'before_camera' | 'before_result' | 'after_camera' | 'after_result';

export default function CameraScreen() {
  const navigation = useNavigation<any>();
  //expo-camera hook for app permission request
  const [permission, requestPermission] = useCameraPermissions();
  //tracks which screen/step in the cleanup flow we're on, initially on before stage
  const [step, setStep] = useState<FlowStep>('before_camera');
  //true while waiting for gemini API
  const [loading, setLoading] = useState(false);
  //storing both scan results to diff them at the end
  const [beforeResult, setBeforeResult] = useState<LitterResult | null>(null);
  const [afterResult, setAfterResult]   = useState<LitterResult | null>(null);
  const cameraRef = useRef<CameraView>(null); 
  const pulseAnim = useRef(new Animated.Value(1)).current; //pulse animation for shutter

  //dev showing only the after screen
  if (DEV_SHOW_AFTER_ONLY) {
    const mockPoints = {
      itemsCleaned: 12,
      points: 240,
    };
    //mockup for testing
    return (
      <AfterResultScreen
        points={{
          itemsCleaned: 8,
          points: 160,
          bonus: 40,
          bonusLabel: "Cleanup Streak Bonus",
        }}
        onReset={() => {}}
        onLeaderboard={() => {}}
      />
    );
  }

  //starting the shutter button pulse loop once on mount
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.07, duration: 850, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 850, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  //permission still loading
  if (!permission) return <View style={styles.container} />;

  //permission denied
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Text style={styles.permissionEmoji}>📷</Text>
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionSubtitle}>
          LitterLens needs your camera to detect and count litter.
        </Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  //core function that captures a frame and sends it to gemini
  async function takePicture() {
    if (!cameraRef.current || loading) return;
    setLoading(true);
    try {
      //base64 encoding for image in order to pass it into JSON request to gemini
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

  //wipe states
  function resetFlow() {
    setStep('before_camera');
    setBeforeResult(null);
    setAfterResult(null);
  }

  //calculate points after getting both scans, diff amount of litter vs amount cleaned up
  const points = beforeResult && afterResult
    ? calculatePoints(beforeResult.count, afterResult.count)
    : null;

  return (
    <View style={styles.container}>
      {(step === 'before_camera' || step === 'after_camera') && (
        <>
          <CameraView ref={cameraRef} style={styles.camera} facing="back" />
          {/* semi transparent green bar at the bottom that stores shutter and text */}
          <View style={styles.bottomBar}>
            <View style={styles.detectionBadge}>
              <Text style={styles.sparkle}>✦</Text>
              <Text style={styles.detectionText}>
                {loading ? 'Analyzing...' : step === 'before_camera' ? '0 items detected' : 'Tap to verify'}
              </Text>
              <Text style={styles.sparkle}>✦</Text>
            </View>
            <Animated.View style={{ transform: [{ scale: loading ? 1 : pulseAnim }] }}>
              {/* loading */}
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
      {/* what gemini found */}
      {step === 'before_result' && beforeResult && (
        <BeforeResultSheet
          result={beforeResult}
          onSnap={() => setStep('after_camera')}
          onDiscard={resetFlow}
        />
      )}
      {/* result after cleanup */}
      {step === 'after_result' && afterResult && beforeResult && points && (
      <AfterResultScreen
        points={points}
        onReset={resetFlow}
        onLeaderboard={() => navigation.navigate('Leaderboard')}
      />
    )}
    </View>
  );
}

// == Before Result Sheet =====================================================
function BeforeResultSheet({
  result, onSnap, onDiscard,
}: { result: LitterResult; onSnap: () => void; onDiscard: () => void }) {
  //starts offscreen
  const slideAnim = useRef(new Animated.Value(60)).current;
  //fades in
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 55, friction: 11 }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* this did not work */}
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} />

      {/* main card */}
      <Animated.View
        style={[
          styles.floatingCard,
          { transform: [{ translateY: slideAnim }], opacity: fadeAnim },
        ]}
      >
        {/* count */}
        <Text style={styles.sheetCount}>{result.count} Items Detected!</Text>
        <Text style={styles.sheetSubtitle}>Get Cleaning!</Text>

        {/* item list + info */}
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
          {result.items.length > 5 && ( //if there's more than 5 don't list them out
            <Text style={styles.moreItems}>+{result.items.length - 5} more items</Text>
          )}
        </View>

        {/* prompts user after before pic */}
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

// == After Result Screen ======================================================
function AfterResultScreen({
    points, onReset, onLeaderboard,
}: {
  points: ReturnType<typeof calculatePoints>;
  onReset: () => void;
  onLeaderboard: () => void;
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
      {/* Green top — rounded bottom corners, drop shadow onto white card */}
      <View style={styles.afterGreenTop}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }}>
          <Image source={TROPHY_IMG} style={styles.trophyImage} resizeMode="contain" />
        </Animated.View>

        <Text style={styles.greatJob}>Great Job!</Text>
        <Text style={styles.litterally}>
          You <Text style={styles.litterYellow}>litter</Text>ally rule
        </Text>
        <Text style={styles.cleanedLabel}>You cleaned up</Text>

        {/* Big number inline with small "items" word */}
        <View style={styles.cleanedRow}>
          <Text style={styles.cleanedCount}>{points.itemsCleaned}</Text>
          <Text style={styles.cleanedWord}>items</Text>
        </View>
      </View>

      {/* White floating card*/}
      <View style={styles.pointsCardWrapper}>
        <View style={styles.pointsCard}>
          <Text style={styles.youEarned}>You earned</Text>
          <View style={styles.pointsRow}>
            <Image source={STAR_IMG} style={styles.starImage} resizeMode="contain" />
            <Text style={styles.pointsNumber}>{points.points} points</Text>
          </View>

          <TouchableOpacity
            style={styles.leaderboardBtn}
            onPress={onLeaderboard}
            activeOpacity={0.85}
          >
            <Text style={styles.leaderboardBtnText}>View Leaderboard</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.homeBtn} onPress={onReset} activeOpacity={0.85}>
            <Text style={styles.homeBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// == Styles ===================================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(34, 100, 34, 0.82)',
    paddingTop: 18, paddingBottom: 96,
    alignItems: 'center', gap: 16,
  },
  detectionBadge: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sparkle: { color: Colors.accent, fontSize: 16 },
  detectionText: { color: '#fff', fontSize: 20, fontWeight: '800' },
  shutter: {
    width: 74, height: 74, borderRadius: 37,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    borderWidth: 5, borderColor: 'rgba(255,255,255,0.5)',
  },
  shutterDisabled: { opacity: 0.6 },
  shutterInner: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: '#fff', borderWidth: 2, borderColor: 'rgba(0,0,0,0.08)',
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

  //Before result overlay + floating card
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  floatingCard: {
    position: 'absolute',
    //Vertically centered-ish, sits in lower portion of screen
    bottom: 60,
    left: 24,
    right: 24,
    backgroundColor: '#fff',
    borderRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 20,
  },
  sheetCount: {
    fontSize: 32, fontWeight: '900', color: Colors.primary,
    textAlign: 'center', marginBottom: 2,
  },
  sheetSubtitle: {
    fontSize: 15, color: Colors.textSecondary,
    textAlign: 'center', marginBottom: 16,
  },
  itemsList: { marginBottom: 20, gap: 8 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  itemDot: { color: Colors.primary, fontSize: 18, width: 16 },
  itemLabel: { flex: 1, fontSize: 15, color: Colors.text, textTransform: 'capitalize' },
  itemConfBadge: {
    backgroundColor: Colors.primaryPale,
    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3,
  },
  itemConf: { fontSize: 11, color: Colors.primary, fontWeight: '600' },
  moreItems: { fontSize: 13, color: Colors.textMuted, fontStyle: 'italic' },
  //Green color, centered
  sheetCta: {
    fontSize: 28, fontWeight: '900', color: Colors.primary,
    textAlign: 'center', lineHeight: 34, marginBottom: 20,
  },
  snapBtn: {
    backgroundColor: Colors.accent, borderRadius: 999,
    paddingVertical: 17, alignItems: 'center', marginBottom: 10,
  },
  snapBtnText: { fontSize: 16, fontWeight: '800', color: '#1a1a1a' },
  discardBtn: {
    borderWidth: 1.5, borderColor: '#1C9849zx',
    borderRadius: 999, paddingVertical: 15, alignItems: 'center',
  },
  discardBtnText: { fontSize: 15, fontWeight: '600', color: Colors.text },

  //After result
  afterContainer: { flex: 1, backgroundColor: '#F5F5F0' },

  afterGreenTop: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 45,
    paddingBottom: 60,
    //rounded bottom corners
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    //drop shadow onto the background below
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 16,
    zIndex: 1,
  },
  trophyImage: { width: 150, height: 150, marginBottom: 14 },
  greatJob: { fontSize: 45, fontWeight: '900', color: '#fff', marginBottom: 2 },
  litterally: { fontSize: 45, fontWeight: '500', color: '#fff', marginBottom: 14 },
  litterYellow: { color: Colors.accent },
  cleanedLabel: { fontSize: 25, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },

  cleanedRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  cleanedCount: { fontSize: 70, fontWeight: '900', color: '#fff', lineHeight: 70 },
  cleanedWord: { fontSize: 28, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },

  //white card
  pointsCardWrapper: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 40,
    zIndex: 1,
    marginTop: -40
  },
  pointsCard: {
    backgroundColor: '#F0F0F0',
    borderTopLeftRadius: 80,
    borderTopRightRadius: 80,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 70,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  youEarned: { fontSize: 15, color: Colors.textSecondary },
  pointsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  starImage: { width: 36, height: 36 },
  pointsNumber: { fontSize: 44, fontWeight: '900', color: Colors.text },
  leaderboardBtn: {
    backgroundColor: Colors.primary, borderRadius: 999,
    paddingVertical: 15, alignItems: 'center', width: '100%',
  },
  leaderboardBtnText: { color: '#fff', fontSize: 20, fontWeight: '400' },
  homeBtn: {
    borderWidth: 1.5, borderColor: '#1C9849',
    borderRadius: 999, paddingVertical: 14, alignItems: 'center', width: '100%',
  },
  homeBtnText: { fontSize: 20, fontWeight: '400', color: Colors.text },
});
