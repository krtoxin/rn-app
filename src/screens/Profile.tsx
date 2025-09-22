import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Stats = {
  challenges: number;
  breathingExercises: number;
  sobrietyCategories: number;
  moodEntries: number;
};

export default function Profile({ onLogout }: { onLogout: () => void }) {
  const [username, setUsername] = useState<string>('');
  const [stats, setStats] = useState<Stats>({
    challenges: 0,
    breathingExercises: 0,
    sobrietyCategories: 0,
    moodEntries: 0,
  });

  useEffect(() => {
    (async () => {
      const userStr = await AsyncStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user) {
        onLogout();
        return;
      }
      setUsername(user.username);

      const completedTasksStr = await AsyncStorage.getItem(`completedTasks_${user.username}`);
      const completedBreathingStr = await AsyncStorage.getItem(`completedExercises_${user.username}`);
      const soberCategoriesStr = await AsyncStorage.getItem(`soberCategories_${user.username}`);
      const moodDataStr = await AsyncStorage.getItem(`selectedMood_${user.username}`);

      const completedTasks = completedTasksStr ? JSON.parse(completedTasksStr) : {};
      const completedBreathing = completedBreathingStr ? JSON.parse(completedBreathingStr) : [];
      const soberCategories = soberCategoriesStr ? JSON.parse(soberCategoriesStr) : [];
      const moodData = moodDataStr ? 1 : 0;

      setStats({
        challenges: completedTasks.challenge ? 1 : 0,
        breathingExercises: Array.isArray(completedBreathing) ? completedBreathing.length : 0,
        sobrietyCategories: Array.isArray(soberCategories) ? soberCategories.length : 0,
        moodEntries: moodData,
      });
    })();
  }, [onLogout]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('isLoggedIn');
    onLogout();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={styles.heading}>Profile</Text>

      <View style={styles.section}>
        <Text style={styles.subHeading}>User Info</Text>
        <Text style={styles.infoText}>
          <Text style={{ fontWeight: 'bold' }}>Username:</Text> {username}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subHeading}>Your Statistics</Text>
        <View style={styles.statsList}>
          <Text style={styles.statItem}>✅ Challenges Completed: {stats.challenges}</Text>
          <Text style={styles.statItem}>💨 Breathing Exercises Completed: {stats.breathingExercises}</Text>
          <Text style={styles.statItem}>🍃 Sobriety Categories Tracked: {stats.sobrietyCategories}</Text>
          <Text style={styles.statItem}>😊 Mood Entries: {stats.moodEntries}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
  },
  heading: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#fff",
  },
  section: {
    backgroundColor: "#1f1f1f",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  subHeading: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: "bold",
    color: "#fff",
  },
  infoText: {
    fontSize: 16,
    marginVertical: 5,
    color: "#fff",
  },
  statsList: {
    marginTop: 5,
    marginBottom: 5,
  },
  statItem: {
    fontSize: 16,
    color: "#fff",
    marginVertical: 2,
  },
  logoutButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 5,
    padding: 12,
    alignItems: "center",
    marginTop: 20,
    marginHorizontal: 40,
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});