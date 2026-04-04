import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Image,
} from 'react-native';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';

const MOCK_USERS = [
  { rank: 1, username: 'CoolCleaner',   points: 350, isYou: false },
  { rank: 2, username: 'EcoWarrior',    points: 300, isYou: false },
  { rank: 3, username: 'LitterLess',    points: 290, isYou: false },
  { rank: 4, username: 'CleanQueen',    points: 280, isYou: false },
  { rank: 5, username: 'GreatSweeper',  points: 270, isYou: false },
  { rank: 6, username: 'GreenHero',     points: 240, isYou: false },
  { rank: 7, username: 'ParkProtector', points: 210, isYou: false },
  { rank: 8, username: 'You',           points: 190, isYou: true  },
];

const PERIODS = ['This Week', 'This Month', 'All Time'];

function RankBadge({ rank }: { rank: number }) {
  const colors: Record<number, string> = {
    1: Colors.rank1,
    2: Colors.rank2,
    3: Colors.rank3,
  };
  const bg = colors[rank] ?? Colors.border;
  const textColor = rank <= 3 ? (rank === 2 ? '#fff' : Colors.text) : Colors.textSecondary;
  return (
    <View style={[styles.rankBadge, { backgroundColor: bg }]}>
      <Text style={[styles.rankText, { color: textColor }]}>{rank}</Text>
    </View>
  );
}

export default function LeaderboardScreen() {
  const [activePeriod, setActivePeriod] = useState('This Week');
  const you = MOCK_USERS.find(u => u.isYou)!;
  const others = MOCK_USERS.filter(u => !u.isYou);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>

      {/* Period tabs */}
      <View style={styles.periodRow}>
        {PERIODS.map(p => (
          <TouchableOpacity
            key={p}
            style={[styles.periodTab, activePeriod === p && styles.periodTabActive]}
            onPress={() => setActivePeriod(p)}
            activeOpacity={0.7}
          >
            <Text style={[styles.periodText, activePeriod === p && styles.periodTextActive]}>
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {others.map(user => (
          <View key={user.rank} style={styles.row}>
            <RankBadge rank={user.rank} />
            <View style={styles.avatar} />
            <Text style={styles.username}>{user.username}</Text>
            <Text style={[styles.points, user.rank === 1 && styles.pointsGold]}>
              {user.points} pts
            </Text>
          </View>
        ))}

        {/* Your rank card */}
        <View style={styles.youCard}>
          <View style={styles.youCardHeader}>
            <Text style={styles.youCardTitle}>Your Rank</Text>
            <Text style={styles.youCardSubtitle}>Great work! Keep it up!</Text>
          </View>
          <View style={styles.row}>
            <RankBadge rank={you.rank} />
            <View style={styles.avatar} />
            <Text style={[styles.username, styles.usernameYou]}>{you.username}</Text>
            <Text style={styles.points}>{you.points} pts</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.offWhite },
  title: {
    fontSize: 32, fontWeight: '900', color: Colors.text,
    textAlign: 'center', paddingTop: 16, paddingBottom: 16,
  },
  periodRow: {
    flexDirection: 'row', marginHorizontal: 20,
    backgroundColor: '#EEEEEE', borderRadius: BorderRadius.full,
    padding: 4, marginBottom: 20,
  },
  periodTab: {
    flex: 1, paddingVertical: 8, borderRadius: BorderRadius.full, alignItems: 'center',
  },
  periodTabActive: { backgroundColor: Colors.primary },
  periodText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  periodTextActive: { color: '#fff' },

  scroll: { paddingHorizontal: 20, paddingBottom: 40, gap: 4 },

  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: BorderRadius.md,
    padding: 14, gap: 12,
  },
  rankBadge: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  rankText: { fontSize: 14, fontWeight: '800' },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.border,
  },
  username: { flex: 1, fontSize: 16, fontWeight: '600', color: Colors.text },
  usernameYou: { fontWeight: '800' },
  points: { fontSize: 15, fontWeight: '700', color: Colors.textSecondary },
  pointsGold: { color: Colors.accent },

  youCard: {
    marginTop: 12,
    backgroundColor: '#C8E6C9',
    borderRadius: BorderRadius.lg,
    padding: 16, gap: 12,
  },
  youCardHeader: { gap: 2 },
  youCardTitle: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  youCardSubtitle: { fontSize: 13, color: Colors.primary, opacity: 0.75 },
});
