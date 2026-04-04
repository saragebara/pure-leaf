import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Image,
} from 'react-native';
import { Colors, BorderRadius } from '../../constants/theme';

const LEAF_ICON        = require('../../assets/images/leaf.png');
// const AVATAR_PLACEHOLDER = require('../../assets/images/avatar_placeholder.png');

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

// Rank badge — matches Figma: gold/silver/bronze circles, plain gray for rest
function RankBadge({ rank }: { rank: number }) {
  const bgMap: Record<number, string> = {
    1: '#F5C518',  // gold
    2: '#C0C0C0',  // silver
    3: '#CD7F32',  // bronze
  };
  const bg = bgMap[rank] ?? '#EEEEEE';
  const textColor = rank <= 3 ? '#fff' : Colors.textSecondary;
  return (
    <View style={[styles.rankBadge, { backgroundColor: bg }]}>
      <Text style={[styles.rankText, { color: textColor }]}>{rank}</Text>
    </View>
  );
}

//TODO - replace View with Image when have pfp assets
function Avatar({ size = 40 }: { size?: number }) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      {/* <Image source={AVATAR_PLACEHOLDER} style={{ width: size, height: size, borderRadius: size/2 }} /> */}
    </View>
  );
}

export default function LeaderboardScreen() {
  const [activePeriod, setActivePeriod] = useState('This Week');
  const you    = MOCK_USERS.find(u => u.isYou)!;
  const others = MOCK_USERS.filter(u => !u.isYou);

  // Row background: rank 1 gets a soft gold tint, 2&3 get a subtle tint, 4+ plain white
  function rowBg(rank: number) {
    if (rank === 1) return '#FFFBEA';
    if (rank === 2) return '#F8F8F8';
    if (rank === 3) return '#FFF6EE';
    return Colors.white;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        {/* Leaf decoration — swap for image */}
        {/* <Image source={LEAF_ICON} style={styles.headerLeaf} /> */}
        <Text style={styles.headerLeafEmoji}>🌿</Text>
      </View>

      {/* Period selector */}
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
          <View key={user.rank} style={[styles.row, { backgroundColor: rowBg(user.rank) }]}>
            <RankBadge rank={user.rank} />
            <Avatar />
            <Text style={styles.username}>{user.username}</Text>
            <Text style={[
              styles.points,
              user.rank === 1 && styles.pointsGold,
            ]}>
              {user.points} pts
            </Text>
          </View>
        ))}

        {/* Your rank card */}
        <View style={styles.youCard}>
          {/* Leaf decoration top-right */}
          {/* <Text style={styles.youCardLeaf}>🌿</Text> */}
          <Image source={LEAF_ICON} style={styles.youCardLeafImg} />

          <View style={styles.youCardHeader}>
            <Text style={styles.youCardTitle}>Your Rank</Text>
            <Text style={styles.youCardSubtitle}>Great work! Keep it up!</Text>
          </View>
          <View style={[styles.row, styles.youRow]}>
            <RankBadge rank={you.rank} />
            <Avatar />
            <Text style={[styles.username, styles.usernameYou]}>{you.username}</Text>
            <Text style={styles.points}>{you.points} pts</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F0' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    paddingBottom: 14,
    gap: 8,
  },
  title: {
    fontSize: 32, fontWeight: '900', color: Colors.text,
  },
  headerLeafEmoji: { fontSize: 22, marginTop: 2 },
  headerLeafImg: { width: 24, height: 24 }, // for image swap

  periodRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#E5E5E5',
    borderRadius: 999,
    padding: 4,
    marginBottom: 16,
  },
  periodTab: {
    flex: 1, paddingVertical: 8,
    borderRadius: 999, alignItems: 'center',
  },
  periodTabActive: { backgroundColor: Colors.primary },
  periodText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  periodTextActive: { color: '#fff' },

  scroll: { paddingHorizontal: 20, paddingBottom: 48, gap: 8 },

  row: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 12, paddingHorizontal: 14,
    gap: 12,
  },
  rankBadge: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  rankText: { fontSize: 14, fontWeight: '800' },
  avatar: {
    backgroundColor: '#D0D0D0',
  },
  username: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.text },
  usernameYou: { fontWeight: '800' },
  points: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
  pointsGold: { color: '#B8860B', fontWeight: '800' },

  youCard: {
    marginTop: 12,
    backgroundColor: '#B5D99C',
    borderRadius: 24,
    padding: 18,
    gap: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  youCardLeaf: {
    position: 'absolute', top: 10, right: 14,
    fontSize: 28, opacity: 0.6,
  },
  youCardLeafImg: {
    position: 'absolute', top: 10, right: 14,
    width: 32, height: 32, opacity: 0.7,
  },
  youCardHeader: { gap: 2 },
  youCardTitle: { fontSize: 17, fontWeight: '800', color: '#1a5c1a' },
  youCardSubtitle: { fontSize: 13, color: '#2e7d2e' },
  youRow: { backgroundColor: 'rgba(255,255,255,0.45)', borderRadius: 14 },
});
