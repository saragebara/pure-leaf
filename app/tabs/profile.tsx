import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, Image,
} from 'react-native';
import { Colors, BorderRadius } from '../../constants/theme';

// const AVATAR_IMG        = require('../../assets/images/___.png');
const SETTINGS_ICON     = require('../../assets/images/settings.png');
const ACHIEVEMENT_ICONS = {
  firstCleanup:  require('../../assets/images/user-achievement1.png'),
  streakMaster:  require('../../assets/images/user-achievement2.png'),
  pointPro:      require('../../assets/images/user-achievement3.png'),
  litterKing:    require('../../assets/images/user-achievement3.png'),
};

const MOCK_PROFILE = {
  username: 'LeafLover',
  points: 2400,
  itemsCleaned: 240,
  streak: 12,
};

const ACHIEVEMENTS = [
  { title: 'First Cleanup', desc: 'Cleaned 10 items', unlocked: true,  emoji: '🌱' },
  { title: 'Streak Master', desc: '7 days in a row',  unlocked: true,  emoji: '🔥' },
  { title: 'Point Pro',     desc: 'Earn 1000 pts',    unlocked: false, emoji: '⭐' },
  { title: 'Litter King',   desc: 'Clean 500 items',  unlocked: false, emoji: '👑' },
];

const ACTIVITY = [
  { points: 40, desc: 'Cleaned up 4 items', when: 'Today' },
  { points: 80, desc: 'Cleaned up 8 items', when: 'Yesterday' },
  { points: 30, desc: 'Cleaned up 3 items', when: '2 days ago' },
];

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Green header */}
      <View style={styles.header}>
        <SafeAreaView />

        {/* Settings button top-right 
        This looks uggo i might take it out*/}
        <TouchableOpacity style={styles.settingsBtn}>
          {/* <Image source={SETTINGS_ICON} style={styles.settingsIcon} /> */}
          {/* <View style={styles.settingsCircle} /> */}
        </TouchableOpacity>

        {/* Avatar */}
        <View style={styles.avatarRing}>
          <View style={styles.avatarCircle}>
            {/* <Image source={AVATAR_IMG} style={styles.avatarImg} /> */}
          </View>
        </View>
        <Text style={styles.username}>{MOCK_PROFILE.username}</Text>
      </View>

      {/* Stats card — overlaps green header */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statEmoji}>⭐</Text>
          <Text style={styles.statValue}>{MOCK_PROFILE.points.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statEmoji}>🗑️</Text>
          <Text style={styles.statValue}>{MOCK_PROFILE.itemsCleaned}</Text>
          <Text style={styles.statLabel}>Items Cleaned</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statEmoji}>🔥</Text>
          <Text style={styles.statValue}>{MOCK_PROFILE.streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Achievements */}
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achievementsGrid}>
          {ACHIEVEMENTS.map((a, i) => (
            <View key={i} style={[styles.achievementCard, !a.unlocked && styles.achievementLocked]}>
              <Text style={[styles.achievementEmoji, !a.unlocked && { opacity: 0.35 }]}>
                {a.emoji}
              </Text>
              <Text style={[styles.achievementTitle, !a.unlocked && styles.lockedText]}>
                {a.title}
              </Text>
              <Text style={[styles.achievementDesc, !a.unlocked && styles.lockedText]}>
                {a.desc}
              </Text>
            </View>
          ))}
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityList}>
          {ACTIVITY.map((a, i) => (
            <View key={i} style={styles.activityRow}>
              <View style={styles.activityCheck}>
                <Text style={styles.checkmark}>✓</Text>
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityPoints}>+{a.points} points</Text>
                <Text style={styles.activityDesc}>{a.desc}</Text>
              </View>
              <Text style={styles.activityWhen}>{a.when}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F0' },

  header: {
    backgroundColor: Colors.primary,
    paddingBottom: 72,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  settingsBtn: {
    position: 'absolute', top: 16, right: 20,
  },
  settingsCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  settingsIcon: { width: 36, height: 36 }, // for image swap

  avatarRing: {
    marginTop: 20,
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  avatarCircle: {
    width: 86, height: 86, borderRadius: 43,
    backgroundColor: 'rgba(255,255,255,0.35)',
    overflow: 'hidden',
  },
  avatarImg: { width: 86, height: 86 }, // for image swap

  username: { fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: 0.2 },

  // Stats card overlaps header
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    marginHorizontal: 20,
    marginTop: -44,
    borderRadius: 28,
    paddingVertical: 20, paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 10,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statEmoji: { fontSize: 24 },
  statValue: { fontSize: 22, fontWeight: '900', color: Colors.text },
  statLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500', textAlign: 'center' },
  statDivider: { width: 1, backgroundColor: '#C8E6C9', marginVertical: 4 },

  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40, gap: 14 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: Colors.text },

  achievementsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12,
  },
  achievementCard: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16, gap: 6,
  },
  achievementLocked: { backgroundColor: '#F0F0F0', opacity: 0.65 },
  achievementEmoji: { fontSize: 28 },
  achievementTitle: { fontSize: 13, fontWeight: '700', color: Colors.text },
  achievementDesc: { fontSize: 12, color: Colors.textSecondary },
  lockedText: { color: Colors.textMuted },

  activityList: { gap: 10 },
  activityRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16, padding: 14, gap: 12,
  },
  activityCheck: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.primaryPale,
    alignItems: 'center', justifyContent: 'center',
  },
  checkmark: { color: Colors.primary, fontSize: 16, fontWeight: '900' },
  activityInfo: { flex: 1, gap: 2 },
  activityPoints: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  activityDesc: { fontSize: 13, color: Colors.textSecondary },
  activityWhen: { fontSize: 12, color: Colors.textMuted },
});
