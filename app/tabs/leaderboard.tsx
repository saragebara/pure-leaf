import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Image,
} from 'react-native';
import { Colors, BorderRadius } from '../../constants/theme';

//cute leaf icon
const LEAF_ICON = require('../../assets/images/leaf.png');
//pfps
const PFP_1 = require('../../assets/images/pfp1.png');
const PFP_2 = require('../../assets/images/pfp2.png');
const PFP_3 = require('../../assets/images/pfp3.png');
const PFP_4 = require('../../assets/images/pfp4.png');
const PFP_5 = require('../../assets/images/pfp5.png');
const PFP_6 = require('../../assets/images/pfp6.png');

//hardcoded leaderboard users (top 5)
const MOCK_USERS = [
  { rank: 1, username: 'CoolCleaner',   points: 350, isYou: false, avatar: PFP_1 },
  { rank: 2, username: 'EcoWarrior',    points: 300, isYou: false, avatar: PFP_2 },
  { rank: 3, username: 'LitterLess',    points: 290, isYou: false, avatar: PFP_3 },
  { rank: 4, username: 'CleanQueen',    points: 280, isYou: false, avatar: PFP_4 },
  { rank: 5, username: 'GreatSweeper',  points: 270, isYou: false, avatar: PFP_5 },
  // { rank: 6, username: 'GreenHero',     points: 240, isYou: false },
  // { rank: 7, username: 'ParkProtector', points: 210, isYou: false },
  { rank: 8, username: 'You',           points: 190, isYou: true, avatar: PFP_6  },
];


//time periods for leaderboard
const PERIODS = ['This Week', 'This Month', 'All Time'];

//colored circle showing rank numbers
//top 3 get gold/silver/bronze, everyone else gets a plain gray circle
function RankBadge({ rank }: { rank: number }) {
  const bgMap: Record<number, string> = { 1: '#F5C518', 2: '#C0C0C0', 3: '#CD7F32' };
  const bg = bgMap[rank] ?? '#EEEEEE';
  //if top 3 then make the text color white so it actually shows up
  const textColor = rank <= 3 ? '#fff' : Colors.textSecondary;
  return (
    <View style={[styles.rankBadge, { backgroundColor: bg }]}>
      <Text style={[styles.rankText, { color: textColor }]}>{rank}</Text>
    </View>
  );
}

//circular avatar 
function Avatar({source, size = 40,}: {
  source: any; size?: number;}) {
  return (
    <Image
      source={source}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
      }}
      resizeMode="cover"
    />
  );
}

//background tint for top 3 + white for everyone else
function rowBg(rank: number) {
  if (rank === 1) return '#FFFBEA';
  if (rank === 2) return '#F8F8F8';
  if (rank === 3) return '#FFF6EE';
  return Colors.white;
}

export default function LeaderboardScreen() {
  //tracks which time period tab is selected. initially set to week
  const [activePeriod, setActivePeriod] = useState('This Week');
  //splitting  list to render "you" separately
  const you = MOCK_USERS.find(u => u.isYou)!;
  const others = MOCK_USERS.filter(u => !u.isYou);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>
      {/* select time period */}
      <View style={styles.periodWrapper}>
        <View style={styles.periodRow}>
          {PERIODS.map(p => {
            const active = activePeriod === p;
            return (
              <TouchableOpacity
                key={p}
                style={[styles.periodTab, active && styles.periodTabActive]}
                onPress={() => setActivePeriod(p)}
                activeOpacity={0.7}
              >
                {/* cutie patootie leaf icon absolute position based on period */}
                {active && (
                  <Image source={LEAF_ICON} style={styles.tabLeaf} resizeMode="contain" />
                )}
                <Text style={[styles.periodText, active && styles.periodTextActive]}>{p}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* main leaderboard view (everyone except the main user) */}
        {others.map(user => (
          <View key={user.rank} style={[styles.row, { backgroundColor: rowBg(user.rank) }]}>
            <RankBadge rank={user.rank} />
            <Avatar source = {user.avatar} />
            <Text style={styles.username}>{user.username}</Text>
            <Text style={[styles.points, user.rank === 1 && styles.pointsGold]}>
              {user.points} pts
            </Text>
          </View>
        ))}

        {/* "your rank" card */}
        <View style={styles.youCardWrapper}>
          <Image source={LEAF_ICON} style={styles.youCardLeafOverflow} resizeMode="contain" />
          <View style={styles.youCard}>
            <View style={styles.youCardHeader}>
              <Text style={styles.youCardTitle}>Your Rank</Text>
              <Text style={styles.youCardSubtitle}>Great work! Keep it up!</Text>
            </View>
            <View style={[styles.row, styles.youRow]}>
              <RankBadge rank={you.rank} />
              <Avatar source = {you.avatar} />
              <Text style={[styles.username, styles.usernameYou]}>{you.username}</Text>
              <Text style={styles.points}>{you.points} pts</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F0' },
  title: {
    fontSize: 32, fontWeight: '900', color: Colors.text,
    textAlign: 'center', paddingTop: 16, paddingBottom: 8,
  },

  periodWrapper: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
  },
  periodRow: {
    flexDirection: 'row',
    backgroundColor: '#E5E5E5',
    borderRadius: 999,
    padding: 4,
  },
  periodTab: {
    flex: 1, paddingVertical: 9,
    borderRadius: 999, alignItems: 'center',
    overflow: 'visible', //overflow visible so the leaf icon can stick out above the button
  },
  periodTabActive: { backgroundColor: Colors.primary },
  periodText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  periodTextActive: { color: '#fff' },
  tabLeaf: {
    position: 'absolute',
    top: -20,
    width: 20, height: 20,
  },

  scroll: { paddingHorizontal: 20, paddingBottom: 48, gap: 8 },

  //leaderboard rows
  row: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 16, paddingVertical: 12, paddingHorizontal: 14, gap: 12,
  },
  rankBadge: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  rankText: { fontSize: 14, fontWeight: '800' },
  avatar: { backgroundColor: '#D0D0D0' },
  username: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.text },
  usernameYou: { fontWeight: '800' },
  points: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
  pointsGold: { color: '#B8860B', fontWeight: '800' },

  youCardWrapper: {
    marginTop: 28, //room for overflowing leaf
    position: 'relative',
  },
  youCardLeafOverflow: {
    position: 'absolute',
    top: -28,
    right: 16,
    width: 44, height: 44,
    zIndex: 10,
  },
  youCard: {
    backgroundColor: '#CADEA2',
    borderRadius: 24,
    padding: 18, gap: 12,
    overflow: 'hidden',
  },
  youCardHeader: { gap: 2 },
  youCardTitle: { fontSize: 17, fontWeight: '800', color: '#1a5c1a' },
  youCardSubtitle: { fontSize: 13, color: '#2e7d2e' },
  youRow: { backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 14 },
});
