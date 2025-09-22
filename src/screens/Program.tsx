import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types'; 

type ProgramNavigationProp = StackNavigationProp<RootStackParamList, 'Program'>;

export default function Program() {
  const navigation = useNavigation<ProgramNavigationProp>();
  const [completedTasks, setCompletedTasks] = useState<{ [key: string]: boolean }>({});
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const userStr = await AsyncStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      setUsername(user?.username);

      if (user?.username) {
        const today = new Date().toDateString();
        const programDateKey = `programDate_${user.username}`;
        const completedTasksKey = `completedTasks_${user.username}`;

        const storedDate = await AsyncStorage.getItem(programDateKey);
        if (storedDate !== today) {
          await AsyncStorage.setItem(programDateKey, today);
          await AsyncStorage.removeItem(completedTasksKey);
          setCompletedTasks({});
        } else {
          const tasksStr = await AsyncStorage.getItem(completedTasksKey);
          setCompletedTasks(tasksStr ? JSON.parse(tasksStr) : {});
        }
      }
    })();
  }, []);

  const markTaskCompleted = async (taskName: string) => {
    if (!username) return;

    const completedTasksKey = `completedTasks_${username}`;
    const updatedTasks = { ...completedTasks, [taskName]: true };

    await AsyncStorage.setItem(completedTasksKey, JSON.stringify(updatedTasks));
    setCompletedTasks(updatedTasks);
  };

  const clearTodayData = async () => {
    if (!username) return;

    const programDateKey = `programDate_${username}`;
    const completedTasksKey = `completedTasks_${username}`;
    const challengeCompletedKey = `challengeCompleted_${username}`;
    const challengeDateKey = `challengeDate_${username}`;

    await AsyncStorage.removeItem(completedTasksKey);
    await AsyncStorage.removeItem(programDateKey);
    await AsyncStorage.removeItem(challengeCompletedKey);
    await AsyncStorage.removeItem(challengeDateKey);
    setCompletedTasks({});
    Alert.alert("Success", "All data for today has been cleared!");
  };

  if (!username) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.error}>User not logged in</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={styles.title}>Today's Program</Text>

      {/* Journal */}
      <View style={styles.card}>
        <View style={styles.icon}>
          <FontAwesome5 name="pencil-alt" size={20} color="#00b894" />
        </View>
        <View style={styles.content}>
          <Text style={styles.heading}>Reflect on your day</Text>
          <Text style={styles.text}>Write about how you feel today.</Text>
        </View>
        {completedTasks.journal ? (
          <Text style={styles.completed}>✅ Completed</Text>
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Journal')}
          >
            <Text style={styles.buttonText}>Start Journal</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Breathing Exercise */}
      <View style={styles.card}>
        <View style={styles.icon}>
          <FontAwesome5 name="lungs" size={20} color="#00b894" />
        </View>
        <View style={styles.content}>
          <Text style={styles.heading}>Deep Breathing Exercise</Text>
          <Text style={styles.text}>Take a 5-minute breathing session.</Text>
        </View>
        {completedTasks.breathing ? (
          <Text style={styles.completed}>✅ Completed</Text>
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Breathing')}
          >
            <Text style={styles.buttonText}>Start Now</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Daily Challenge */}
      <View style={styles.card}>
        <View style={styles.icon}>
          <FontAwesome5 name="trophy" size={20} color="#00b894" />
        </View>
        <View style={styles.content}>
          <Text style={styles.heading}>Daily Challenge</Text>
          <Text style={styles.text}>Complete today's small challenge.</Text>
        </View>
        {completedTasks.challenge ? (
          <Text style={styles.completed}>✅ Completed</Text>
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Challenges')}
          >
            <Text style={styles.buttonText}>View Challenge</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Clear Data Button */}
      <TouchableOpacity style={styles.clearButton} onPress={clearTodayData}>
        <Text style={styles.clearButtonText}>Clear Today's Data</Text>
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
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "600",
    color: "#fff",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1f1f1f",
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  icon: {
    marginRight: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 2,
  },
  text: {
    fontSize: 12,
    color: "#ccc",
  },
  button: {
    backgroundColor: "#00b894",
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  completed: {
    color: "#00d084",
    fontWeight: "bold",
    fontSize: 12,
    marginLeft: 8,
  },
  clearButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 5,
    padding: 12,
    alignItems: "center",
    marginTop: 20,
    marginHorizontal: 40,
  },
  clearButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
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
    textAlign: "center",
    marginTop: 20,
  },
});