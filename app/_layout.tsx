import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';

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
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="tabs/profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🌿" label="Profile" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="tabs/camera"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.cameraTab, focused && styles.cameraTabFocused]}>
              <Text style={styles.tabEmoji}>📷</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="tabs/leaderboard"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏆" label="Leaderboard" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    borderTopWidth: 0,
    height: 90,
    paddingBottom: 20,
    paddingTop: 10,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  tabIconFocused: {
    backgroundColor: Colors.primaryPale,
  },
  tabEmoji: {
    fontSize: 24,
  },
  cameraTab: {
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
