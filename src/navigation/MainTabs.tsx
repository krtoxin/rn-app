import { FontAwesome5 } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import Explore from '../screens/Explore';
import History from '../screens/History';
import Profile from '../screens/Profile';
import Program from '../screens/Program';

const PALETTE = {
  tabBg: "#212824",
  accent: "#00b894",
  inactive: "#7ea899",
  activeBg: "#192825",
};

const Tab = createBottomTabNavigator();

function MyTabBar({ state, descriptors, navigation }: any) {
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: PALETTE.tabBg,
        borderRadius: 24,
        height: 62,
        alignItems: 'center',
        justifyContent: 'space-around',
        position: Platform.OS === "web" ? "fixed" : "absolute",
        left: Platform.OS === "web" ? "50%" : 0,
        transform: Platform.OS === "web" ? [{ translateX: -200 }] : undefined,
        width: Platform.OS === "web" ? 400 : "94%",
        bottom: Platform.OS === "web" ? 30 : 14,
        marginLeft: Platform.OS === "web" ? undefined : "3%",
        marginRight: Platform.OS === "web" ? undefined : "3%",
        shadowColor: "#000",
        shadowOpacity: 0.13,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

       const iconMap = {
        Program: "tasks",
  Explore: "compass",
  History: "history",
  Profile: "user",
} as const;

type TabRoute = keyof typeof iconMap;
const iconName = iconMap[route.name as TabRoute];

        const onPress = () => {
          if (!isFocused) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
            activeOpacity={0.85}
          >
            <View style={{
              backgroundColor: isFocused ? PALETTE.activeBg : 'transparent',
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 6,
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 60,
            }}>
              <FontAwesome5
                name={iconName}
                size={20}
                color={isFocused ? PALETTE.accent : PALETTE.inactive}
              />
              <Text style={{
                color: isFocused ? PALETTE.accent : PALETTE.inactive,
                fontSize: 12,
                fontWeight: isFocused ? '700' : '600',
                marginTop: 2,
              }}>
                {label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function MainTabs({ onLogout }: { onLogout: () => void }) {
  return (
    <Tab.Navigator
      tabBar={props => <MyTabBar {...props} />}
      screenOptions={{ headerShown: false }}
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