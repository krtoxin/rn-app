import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MainTabs from './MainTabs';

import Journal from '../screens/Journal';
import Breathing from '../screens/Breathing';
import Challenges from '../screens/Challenges';
import SoberTracker from '../screens/SoberTracker';
import MoodTracker from '../screens/MoodTracker';
import Notes from '../screens/Notes';
import Chatbot from '../screens/Chatbot';

import { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

type RootNavigatorProps = {
  onLogout: () => void;
};

export default function RootNavigator({ onLogout }: RootNavigatorProps) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs">{() => <MainTabs onLogout={onLogout} />}</Stack.Screen>
      <Stack.Screen name="Journal" component={Journal} />
      <Stack.Screen name="Breathing" component={Breathing} />
      <Stack.Screen name="Challenges" component={Challenges} />
      <Stack.Screen name="SoberTracker" component={SoberTracker} />
      <Stack.Screen name="MoodTracker" component={MoodTracker} />
      <Stack.Screen name="Notes" component={Notes} />
      <Stack.Screen name="Chatbot" component={Chatbot} />
    </Stack.Navigator>
  );
}
