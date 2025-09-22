import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={24} color="#00b894" style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>Today's Challenge</Text>
      </View>
      <View style={styles.challenge}>
        <Text style={styles.heading}>Meditate for 20 minutes</Text>
        <Text style={styles.timer}>24 hours left</Text>
        {isCompleted ? (
          <Text style={styles.completed}>✅ Challenge Completed!</Text>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleComplete}>
            <Text style={styles.buttonText}>Mark as Completed</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#121212",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  backIcon: {
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#fff",
  },
  challenge: {
    backgroundColor: "#1f1f1f",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
    width: "100%",
    maxWidth: 400,
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#fff",
    textAlign: "center",
  },
  timer: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#00b894",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  completed: {
    color: "#00d084",
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 6,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  error: {
    color: "red",
    fontSize: 16,
    marginTop: 20,
  },
});