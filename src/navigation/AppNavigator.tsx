import React, {useState, useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import {Text, View, ActivityIndicator, StyleSheet} from 'react-native';
import {onAuthStateChanged, getCurrentUser, getUserProfile} from '../services/firebase';
import {User} from 'firebase/auth';
import {UserProfile} from '../types';

import AuthScreen from '../screens/AuthScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import TrackScreen from '../screens/TrackScreen';
import SocialScreen from '../screens/SocialScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({label, focused}: {label: string; focused: boolean}) {
  return (
    <View style={tabStyles.iconContainer}>
      <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>
        {label}
      </Text>
      {focused && <View style={tabStyles.indicator} />}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: '#444',
    letterSpacing: 0,
  },
  labelActive: {
    color: '#c9a96e',
  },
  indicator: {
    width: 14,
    height: 1,
    backgroundColor: '#c9a96e',
    marginTop: 6,
  },
});

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0a0a0f',
          borderTopColor: '#1a1a1f',
          borderTopWidth: 0.5,
          paddingTop: 8,
          paddingBottom: 8,
          height: 80,
        },
        tabBarActiveTintColor: '#c9a96e',
        tabBarInactiveTintColor: '#444',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500' as const,
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
        tabBarIcon: ({focused}) => {
          const icons: Record<string, string> = {Home: '⌂', Track: '+', Social: '✦', Settings: '⚙'};
          return <Text style={{fontSize: 18, color: focused ? '#c9a96e' : '#444'}}>{icons[route.name] || '•'}</Text>;
        },
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Track" component={TrackScreen} />
      <Tab.Screen name="Social" component={SocialScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async u => {
      setUser(u);
      if (u) {
        const profile = await getUserProfile(u.uid);
        // Show onboarding if no profile or weight/age is 0 (not yet set)
        setNeedsOnboarding(!profile || profile.weight === 0 || profile.age === 0);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingLogo}>TIPSY</Text>
        <ActivityIndicator size="small" color="#c9a96e" style={{marginTop: 24}} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : needsOnboarding ? (
          <Stack.Screen name="Onboarding">
            {() => <OnboardingScreen onComplete={() => setNeedsOnboarding(false)} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="Leaderboard"
              component={LeaderboardScreen}
              options={{presentation: 'modal'}}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingLogo: {
    fontSize: 24,
    fontWeight: '300',
    color: '#c9a96e',
    letterSpacing: 8,
  },
});
