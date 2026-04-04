import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity,
} from 'react-native';
import { Colors, BorderRadius } from '../../constants/theme';

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
        <View style={styles.avatarContainer}>
          <View style={styles.avatar} />
        </View>
        <Text style={styles.username}>{MOCK_PROFILE.username}</Text>
      </View>

      {/* Stats row */}
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
              <Text style={[styles.achievementEmoji, !a.unlocked && styles.achievementEmojiLocked]}>
                {a.emoji}
              </Text>
              <Text style={[styles.achievementTitle, !a.unlocked && styles.lockedText]}>{a.title}</Text>
              <Text style={[styles.achievementDesc,  !a.unlocked && styles.lockedText]}>{a.desc}</Text>
            </View>
          ))}
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityList}>
          {ACTIVITY.map((a, i) => (
            <View key={i} style={styles.activityRow}>
              <View style={styles.activityCheck}>
                <Text style={styles.checkEmoji}>✓</Text>
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
  container: { flex: 1, backgroundColor: Colors.offWhite },
  header: {
    backgroundColor: Colors.primary,
    paddingBottom: 56,
    alignItems: 'center',
  },
  avatarContainer: {
    marginTop: 24,
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  username: { fontSize: 26, fontWeight: '900', color: '#fff' },

  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    marginHorizontal: 20,
    marginTop: -28,
    borderRadius: BorderRadius.lg,
    padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12,
    elevation: 6,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statEmoji: { fontSize: 24 },
  statValue: { fontSize: 22, fontWeight: '900', color: Colors.text },
  statLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  statDivider: { width: 1, backgroundColor: Colors.border, marginHorizontal: 8 },

  content: { padding: 20, gap: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, marginTop: 8 },

  achievementsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12,
  },
  achievementCard: {
    width: '47%', backgroundColor: Colors.white,
    borderRadius: BorderRadius.md, padding: 16,
    alignItems: 'flex-start', gap: 4,
  },
  achievementLocked: { backgroundColor: '#F5F5F5', opacity: 0.6 },
  achievementEmoji: { fontSize: 28 },
  achievementEmojiLocked: { opacity: 0.4 },
  achievementTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  achievementDesc: { fontSize: 12, color: Colors.textSecondary },
  lockedText: { color: Colors.textMuted },

  activityList: { gap: 10 },
  activityRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md, padding: 14, gap: 12,
  },
  activityCheck: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primaryPale,
    alignItems: 'center', justifyContent: 'center',
  },
  checkEmoji: { color: Colors.primary, fontSize: 16, fontWeight: '800' },
  activityInfo: { flex: 1, gap: 2 },
  activityPoints: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  activityDesc: { fontSize: 13, color: Colors.textSecondary },
  activityWhen: { fontSize: 12, color: Colors.textMuted },
});
