import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from './screens/Login';
import Register from './screens/Register';
import MainTabs from './navigation/MainTabs';

import Program from './screens/Program';
import Explore from './screens/Explore';
import History from './screens/History';
import Profile from './screens/Profile';
import Journal from './screens/Journal';
import Breathing from './screens/Breathing';
import BreathingDetails from './screens/BreathingDetails';
import BreathingStart from './screens/BreathingStart';
import Challenges from './screens/Challenges';
import Notes from './screens/Notes';
import MoodTracker from './screens/MoodTracker';
import Chatbot from './screens/Chatbot';
import SoberTracker from './screens/SoberTracker';

const AuthStack = createNativeStackNavigator();
function AuthStackScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login">
        {props => <Login {...props} onLogin={onLogin} />}
      </AuthStack.Screen>
      <AuthStack.Screen name="Register">
        {props => <Register {...props} onRegister={() => props.navigation.replace('Login')} />}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  );
}

const AppStack = createNativeStackNavigator();
function AppStackScreen({ onLogout }: { onLogout: () => void }) {
  return (
    <AppStack.Navigator>
      <AppStack.Screen name="MainTabs" options={{ headerShown: false }}>
        {props => <MainTabs {...props} onLogout={onLogout} />}
      </AppStack.Screen>
      <AppStack.Screen name="Journal" component={Journal} />
      <AppStack.Screen name="Breathing" component={Breathing} />
      <AppStack.Screen name="BreathingDetails" component={BreathingDetails} />
      <AppStack.Screen name="BreathingStart" component={BreathingStart} />
      <AppStack.Screen name="Challenges" component={Challenges} />
      <AppStack.Screen name="Notes" component={Notes} />
      <AppStack.Screen name="MoodTracker" component={MoodTracker} />
      <AppStack.Screen name="Chatbot" component={Chatbot} />
      <AppStack.Screen name="SoberTracker" component={SoberTracker} />
    </AppStack.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    (async () => {
      const loginStatus = await AsyncStorage.getItem('isLoggedIn');
      setIsLoggedIn(loginStatus === 'true');
      setIsLoading(false);
    })();
  }, []);

  const handleLogin = async () => {
    await AsyncStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <AppStackScreen onLogout={handleLogout} />
      ) : (
        <AuthStackScreen onLogin={handleLogin} />
      )}
    </NavigationContainer>
  );
}