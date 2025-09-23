import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

const PALETTE = {
  darkBg: "#181d1b",
  cardBg: "#212824",
  cardBorder: "#2b3830",
  accent: "#00b894",
  accentSoft: "#009f7a",
  accentLight: "#b2f5d6",
  secondary: "#2c4037",
  completed: "#27ae60",
  disabled: "#2a3330",
  textMain: "#e8f6ef",
  textSecondary: "#b5d6c6",
  textMuted: "#7ea899",
};

export default function Challenges() {
  const [isCompleted, setIsCompleted] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const userStr = await AsyncStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user) {
        setUsername(null);
        return;
      }
      setUsername(user.username);

      const today = new Date().toDateString();
      const challengeDateKey = `challengeDate_${user.username}`;
      const challengeCompletedKey = `challengeCompleted_${user.username}`;

      const storedDate = await AsyncStorage.getItem(challengeDateKey);

      if (storedDate !== today) {
        await AsyncStorage.setItem(challengeDateKey, today);
        await AsyncStorage.removeItem(challengeCompletedKey);
        setIsCompleted(false);
      } else {
        const completed = (await AsyncStorage.getItem(challengeCompletedKey)) === 'true';
        setIsCompleted(completed);
      }
    })();
  }, []);

  const addHistoryEntry = async (action: string) => {
    if (!username) return;
    const historyKey = `history_${username}`;
    const newEntry = {
      tool: 'Challenges',
      action,
      timestamp: new Date().toISOString(),
    };
    const existingHistoryStr = await AsyncStorage.getItem(historyKey);
    const existingHistory = existingHistoryStr ? JSON.parse(existingHistoryStr) : [];
    await AsyncStorage.setItem(historyKey, JSON.stringify([...existingHistory, newEntry]));
  };

  const handleComplete = async () => {
    if (!username) return;

    const challengeCompletedKey = `challengeCompleted_${username}`;
    const completedTasksKey = `completedTasks_${username}`;

    await AsyncStorage.setItem(challengeCompletedKey, 'true');

    const completedTasksStr = await AsyncStorage.getItem(completedTasksKey);
    const completedTasks = completedTasksStr ? JSON.parse(completedTasksStr) : {};
    completedTasks.challenge = true;
    await AsyncStorage.setItem(completedTasksKey, JSON.stringify(completedTasks));

    await addHistoryEntry("Completed Today's Challenge");

    setIsCompleted(true);
    navigation.navigate('Program' as never);
  };

  if (username === null) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.error}>User not logged in</Text>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <FontAwesome5 name="arrow-left" size={22} color={PALETTE.accent} />
        </Pressable>
        <Text style={styles.heading}>Challenges</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <FontAwesome5 name="medal" size={30} color={PALETTE.accent} />
        </View>
        <Text style={styles.cardTitle}>Today's Challenge</Text>
        <Text style={styles.challengeText}>Meditate for 20 minutes</Text>
        <Text style={styles.timer}>24 hours left</Text>
        {isCompleted ? (
          <Text style={styles.completed}>✅ Challenge Completed!</Text>
        ) : (
          <Pressable style={styles.button} onPress={handleComplete}>
            <Text style={styles.buttonText}>Mark as Completed</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: PALETTE.darkBg,
    paddingTop: Platform.OS === 'web' ? 0 : 40,
    alignItems: "center",
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    width: "100%",
  },
  backBtn: {
    marginRight: 13,
    padding: 5,
  },
  heading: {
    fontSize: 26,
    color: PALETTE.textMain,
    fontWeight: '700',
    textAlign: 'left',
  },
  card: {
    backgroundColor: PALETTE.cardBg,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 36,
    paddingTop: 22,
    paddingBottom: 18,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 7,
    borderLeftWidth: 4,
    borderLeftColor: "transparent",
    borderWidth: 1,
    borderColor: PALETTE.cardBorder,
    transitionDuration: "200ms",
    minWidth: 250,
    minHeight: 160,
    width: "90%",
    maxWidth: 400,
  },
  iconWrap: {
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    color: PALETTE.textMain,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  challengeText: {
    fontSize: 15,
    color: PALETTE.textSecondary,
    textAlign: "center",
    marginBottom: 7,
    fontWeight: "500",
  },
  timer: {
    fontSize: 13,
    color: PALETTE.textMuted,
    marginBottom: 13,
    textAlign: "center",
  },
  button: {
    backgroundColor: PALETTE.accent,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 0.15,
  },
  completed: {
    color: PALETTE.completed,
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: PALETTE.darkBg,
  },
  error: {
    color: "red",
    fontSize: 16,
    marginTop: 20,
  },
});