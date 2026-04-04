import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';

//reusable tab icon wrapper (green circle highlight when focused)
function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      <Text style={styles.tabEmoji}>{emoji}</Text>
    </View>
  );
}

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        //hiding default header on each screen
        headerShown: false,
        tabBarStyle: styles.tabBar,
        //hiding labels cuz clutter
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen //profile (left tab)
        name="tabs/profile"
        options={{ 
          tabBarIcon: ({ focused }) => <TabIcon emoji="🌿" label="Profile" focused={focused} />,
        }}
      />
      <Tabs.Screen //camera (center tab)
        name="tabs/camera"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.cameraTab, focused && styles.cameraTabFocused]}>
              <Text style={styles.tabEmoji}>📷</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen //leaderboard (right tab)
        name="tabs/leaderboard"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏆" label="Leaderboard" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  //tab bar at the bottom
  tabBar: {
    backgroundColor: Colors.white,
    borderTopWidth: 0,
    height: 90,
    paddingBottom: 20,
    paddingTop: 10,

    //soft shadow, no border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
  },
  tabIcon: { //standard icon container
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  tabIconFocused: { //when icon is clicked/focused
    backgroundColor: Colors.primaryPale,
  },
  tabEmoji: {
    fontSize: 24,
  },
  cameraTab: { //slightly bigger and placed higher to emphasize
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryPale,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  cameraTabFocused: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
});
