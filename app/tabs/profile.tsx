import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, Image,
} from 'react-native';
import { Colors, BorderRadius } from '../../constants/theme';

//profile picture (chiikawa hearts teehehee)
const PFP_6 = require('../../assets/images/pfp6.png');

//hardcoded user profile data
const MOCK_PROFILE = {
  username: 'LeafLover',
  points: 2400,
  itemsCleaned: 240,
  streak: 12,
};

//three achievement cards
//added the actual badge illustration for them
//its kind of ugly so maybe fix this in the future
//"unlocked: false" dims the card and image so it looks grayed out
const ACHIEVEMENTS = [
  {
    title: 'First Cleanup',
    desc: 'Cleaned 10 items',
    unlocked: true,
    image: require('../../assets/images/user-achievement1.png'),
  },
  {
    title: 'Streak Master',
    desc: '7 days in a row',
    unlocked: true,
    image: require('../../assets/images/user-achievement2.png'),
  },
  {
    title: 'Point Pro',
    desc: 'Earn 3,000 pts',
    unlocked: false,
    image: require('../../assets/images/user-achievement3.png'),
  },
];

//hardcoded cleanup history
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
        <View style={styles.avatarRing}> 
          {/* circular pfp with ring around it */}
          <Image
            source={PFP_6}
            style={styles.avatarImage}
            resizeMode="cover"
          />
        </View>
        <Text style={styles.username}>{MOCK_PROFILE.username}</Text>
      </View>

      {/* stats card overlaps the green header with negative marginTop  */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          {/* points */}
          <Image
            source={require('../../assets/images/points.png')}
            style={styles.statIcon}
            resizeMode="contain"
          />
          <Text style={styles.statValue}>{MOCK_PROFILE.points.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          {/* items cleaned */}
          <Image
            source={require('../../assets/images/user-trash.png')}
            style={styles.statIcon}
            resizeMode="contain"
          />
          <Text style={styles.statValue}>{MOCK_PROFILE.itemsCleaned}</Text>
          <Text style={styles.statLabel}>Items Cleaned</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          {/* streak */}
          <Image
            source={require('../../assets/images/user-streak.png')}
            style={styles.statIcon}
            resizeMode="contain"
          />
          <Text style={styles.statValue}>{MOCK_PROFILE.streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* achievements */}
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achievementsRow}>
          {ACHIEVEMENTS.map((a, i) => (
            <View
              key={i}
              style={[styles.achievementCard, !a.unlocked && styles.achievementLocked]}
            >
              {/* badge image. if not unlocked then dim */}
              <Image
                source={a.image}
                style={[styles.achievementImage, !a.unlocked && { opacity: 0.35 }]}
                resizeMode="contain"
              />
              <Text style={[styles.achievementTitle, !a.unlocked && styles.lockedText]}>
                {a.title}
              </Text>
              <Text style={[styles.achievementDesc, !a.unlocked && styles.lockedText]}>
                {a.desc}
              </Text>
            </View>
          ))}
        </View>

        {/* recent activtiy */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityList}>
          {ACTIVITY.map((a, i) => (
            <View key={i} style={styles.activityRow}>
              {/* green checkmark on the left */}
              <View style={styles.activityCheck}>
                <Text style={styles.checkmark}>✓</Text>
              </View>
              {/* text, info/points/desc */}
              <View style={styles.activityInfo}>
                <Text style={styles.activityPoints}>+{a.points} points</Text>
                <Text style={styles.activityDesc}>{a.desc}</Text>
              </View>
              {/* date completed */}
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

  //green banner at the top
  header: {
    backgroundColor: Colors.primary,
    paddingBottom: 72,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  //white ring around pfp
  avatarRing: {
    marginTop: 20,
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  avatarImage: { //pfp
    width: 86,
    height: 86,
    borderRadius: 43,
  },
  username: { fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: 0.2 },

  //light green card 
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#CADEA2',
    marginHorizontal: 20,
    marginTop: -44, //floats above Yay
    borderRadius: 28,
    paddingVertical: 20, paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 10,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statIcon: { width: 26, height: 26 },
  statValue: { fontSize: 22, fontWeight: '900', color: Colors.text },
  statLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500', textAlign: 'center' },
  statDivider: { width: 1, backgroundColor: 'rgb(255, 255, 255)', marginVertical: 4 }, //white divider lines

  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40, gap: 14 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: Colors.text },

  //achievements
  achievementsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  achievementCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  //gray and reduced opacity for locked achievements
  achievementLocked: { backgroundColor: '#F0F0F0', opacity: 0.65 },
  achievementImage: { width: 44, height: 44 },
  achievementTitle: { fontSize: 12, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  achievementDesc: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center' },
  lockedText: { color: Colors.textMuted },

  //rows for activity feed
  activityList: { gap: 10 },
  activityRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16, padding: 14, gap: 12,
  },
  //checkmarks
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
