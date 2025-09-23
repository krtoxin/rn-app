import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const PALETTE = {
  darkBg: "#181d1b",
  cardBg: "#212824",
  cardBorder: "#2b3830",
  accent: "#00b894",
  error: "#e74c3c",
  textMain: "#e8f6ef",
  textSecondary: "#b5d6c6",
};

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
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40, alignItems: "center" }}>
      <Text style={styles.heading}>Profile</Text>

      <View style={styles.section}>
        <Text style={styles.subHeading}>User Info</Text>
        <View style={styles.infoRow}>
          <FontAwesome5 name="user" size={18} color={PALETTE.accent} style={{ marginRight: 7 }} />
          <Text style={styles.infoText}>
            <Text style={{ fontWeight: 'bold' }}>Username:</Text> {username}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.subHeading}>Your Statistics</Text>
        <View style={styles.statsList}>
          <View style={styles.statRow}>
            <FontAwesome5 name="trophy" size={16} color={PALETTE.accent} style={{ marginRight: 8 }} />
            <Text style={styles.statItem}>Challenges Completed: <Text style={{ color: PALETTE.accent }}>{stats.challenges}</Text></Text>
          </View>
          <View style={styles.statRow}>
            <FontAwesome5 name="lungs" size={16} color={PALETTE.accent} style={{ marginRight: 8 }} />
            <Text style={styles.statItem}>Breathing Exercises Completed: <Text style={{ color: PALETTE.accent }}>{stats.breathingExercises}</Text></Text>
          </View>
          <View style={styles.statRow}>
            <FontAwesome5 name="leaf" size={16} color={PALETTE.accent} style={{ marginRight: 8 }} />
            <Text style={styles.statItem}>Sobriety Categories Tracked: <Text style={{ color: PALETTE.accent }}>{stats.sobrietyCategories}</Text></Text>
          </View>
          <View style={styles.statRow}>
            <FontAwesome5 name="smile" size={16} color={PALETTE.accent} style={{ marginRight: 8 }} />
            <Text style={styles.statItem}>Mood Entries: <Text style={{ color: PALETTE.accent }}>{stats.moodEntries}</Text></Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <FontAwesome5 name="sign-out-alt" size={18} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.darkBg,
    padding: 0,
    width: "100%",
  },
  heading: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 28,
    color: PALETTE.textMain,
    letterSpacing: 1,
    width: "100%",
  },
  section: {
    backgroundColor: PALETTE.cardBg,
    borderRadius: 16,
    padding: 18,
    marginBottom: 22,
    width: "93%",
    maxWidth: 370,
    shadowColor: "#000",
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 7,
    elevation: 2,
    borderWidth: 1,
    borderColor: PALETTE.cardBorder,
  },
  subHeading: {
    fontSize: 20,
    marginBottom: 13,
    fontWeight: "bold",
    color: PALETTE.textMain,
    letterSpacing: 0.2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  infoText: {
    fontSize: 16,
    color: PALETTE.textMain,
    marginVertical: 2,
    letterSpacing: 0.15,
  },
  statsList: {
    marginTop: 0,
    marginBottom: 2,
    width: "100%",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  statItem: {
    fontSize: 16,
    color: PALETTE.textMain,
    flexShrink: 1,
  },
  logoutButton: {
    backgroundColor: PALETTE.accent,
    borderRadius: 9,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
    flexDirection: "row",
    marginTop: 8,
    marginBottom: 22,
    shadowColor: PALETTE.accent,
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.15,
  },
});