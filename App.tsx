import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import CameraScreen from './app/tabs/camera';
import LeaderboardScreen from './app/tabs/leaderboard';
import ProfileScreen from './app/tabs/profile';
import { Colors } from './constants/theme';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: Colors.white,
              borderTopWidth: 1,
              borderTopColor: Colors.border,
              height: 80,
              paddingBottom: 16,
              paddingTop: 8,
            },
            tabBarShowLabel: false,
          }}
        >
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              tabBarIcon: ({ focused }) => (
                <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
                  <Text style={styles.tabEmoji}>🌿</Text>
                </View>
              ),
            }}
          />
          <Tab.Screen
            name="Camera"
            component={CameraScreen}
            options={{
              tabBarIcon: ({ focused }) => (
                <View style={[styles.cameraTab, focused && styles.cameraTabFocused]}>
                  <Text style={styles.tabEmoji}>📷</Text>
                </View>
              ),
            }}
          />
          <Tab.Screen
            name="Leaderboard"
            component={LeaderboardScreen}
            options={{
              tabBarIcon: ({ focused }) => (
                <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
                  <Text style={styles.tabEmoji}>🏆</Text>
                </View>
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
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