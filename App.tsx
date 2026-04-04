import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text, View, StyleSheet, Image } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import CameraScreen      from './app/tabs/camera';
import LeaderboardScreen from './app/tabs/leaderboard';
import ProfileScreen     from './app/tabs/profile';
import { Colors }        from './constants/theme';

const ICON_PROFILE     = require('./assets/images/user-icon.png');
const ICON_CAMERA      = require('./assets/images/camera-icon.png');
const ICON_LEADERBOARD = require('./assets/images/leaderboard-icon.png');

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: styles.tabBar,
            tabBarShowLabel: false,
          }}
        >
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              tabBarIcon: ({ focused }) => (
                <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
                  <Image source={ICON_PROFILE} style={styles.tabImg} />
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
                  <Image source={ICON_CAMERA} style={styles.tabImgLg} />
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
                  <Image source={ICON_LEADERBOARD} style={styles.tabImg} />
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
  tabBar: {
    backgroundColor: Colors.white,
    borderTopWidth: 0,
    height: 82,
    paddingBottom: 18,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 16,
  },
  tabIcon: {
    alignItems: 'center', justifyContent: 'center',
    width: 46, height: 46, borderRadius: 23,
  },
  tabIconFocused: {
    backgroundColor: Colors.primaryPale,
  },
  tabImg: { width: 24, height: 24 },
  cameraTab: {
    alignItems: 'center', justifyContent: 'center',
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: '#E8F5E9',
    borderWidth: 2, borderColor: '#C8E6C9',
    marginBottom: 8,
  },
  cameraTabFocused: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  tabImgLg: { width: 28, height: 28 },
});