import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Program from '../screens/Program';
import Explore from '../screens/Explore';
import History from '../screens/History';
import Profile from '../screens/Profile';
import { FontAwesome5, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function MainTabs({ onLogout }: { onLogout: () => void }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#121212', borderTopWidth: 0 },
        tabBarActiveTintColor: '#00b894',
        tabBarInactiveTintColor: '#aaa',
        tabBarLabelStyle: { fontSize: 10 },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Program') return <FontAwesome5 name="tasks" size={size} color={color} />;
          if (route.name === 'Explore') return <FontAwesome5 name="compass" size={size} color={color} />;
          if (route.name === 'History') return <FontAwesome5 name="history" size={size} color={color} />;
          if (route.name === 'Profile') return <FontAwesome5 name="user" size={size} color={color} />;
          return null;
        },
      })}
    >
      <Tab.Screen name="Program" component={Program} />
      <Tab.Screen name="Explore" component={Explore} />
      <Tab.Screen name="History" component={History} />
      <Tab.Screen name="Profile">
        {props => <Profile {...props} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}