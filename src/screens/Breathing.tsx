import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../navigation/types';

type BreathingNavigationProp = StackNavigationProp<RootStackParamList, 'Breathing'>;

type Exercise = {
  id: number;
  name: string;
  duration: string;
  icon: React.ReactNode;
};

export default function Breathing() {
  const [completedExercises, setCompletedExercises] = useState<number[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const navigation = useNavigation<BreathingNavigationProp>();

  const exercises: Exercise[] = [
    {
      id: 1,
      name: 'Clear Mind',
      duration: '1 min',
      icon: <FontAwesome5 name="wind" size={30} color="#00d084" />,
    },
    {
      id: 2,
      name: 'Let Go of Worries',
      duration: '2 min',
      icon: <FontAwesome5 name="smile" size={30} color="#00d084" />,
    },
    {
      id: 3,
      name: 'Dream',
      duration: '3 min',
      icon: <FontAwesome5 name="moon" size={30} color="#00d084" />,
    },
  ];

  useEffect(() => {
    (async () => {
      const userStr = await AsyncStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user) {
        setUsername(null);
        return;
      }
      setUsername(user.username);

      const completedExercisesKey = `completedExercises_${user.username}`;
      const completed = await AsyncStorage.getItem(completedExercisesKey);
      const arr: number[] = completed ? JSON.parse(completed) : [];
      setCompletedExercises(arr);
    })();
  }, []);

  const addHistoryEntry = async (exerciseName: string) => {
    if (!username) return;
    const historyKey = `history_${username}`;
    const newEntry = {
      tool: 'Breathing',
      action: `Completed Exercise: ${exerciseName}`,
      timestamp: new Date().toISOString(),
    };
    const existingHistoryStr = await AsyncStorage.getItem(historyKey);
    const existingHistory = existingHistoryStr ? JSON.parse(existingHistoryStr) : [];
    await AsyncStorage.setItem(historyKey, JSON.stringify([...existingHistory, newEntry]));
  };

  const handleExerciseClick = async (exercise: Exercise) => {
    navigation.navigate('BreathingDetails', { exerciseId: exercise.id.toString() });
    await addHistoryEntry(exercise.name);
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
          <FontAwesome5 name="arrow-left" size={24} color="#00d084" style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.heading}>Breathing</Text>
      </View>
      <FlatList
        data={exercises}
        numColumns={3}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleExerciseClick(item)}
            activeOpacity={0.8}
          >
            {item.icon}
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.duration}>{item.duration}</Text>
            {completedExercises.includes(item.id) && (
              <Text style={styles.completed}>✅ Completed</Text>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backIcon: {
    marginRight: 10,
  },
  heading: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
  },
  grid: {
    marginTop: 20,
    gap: 15,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    margin: 5,
    flex: 1,
    minWidth: 90,
    maxWidth: 120,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  title: {
    marginTop: 10,
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
  duration: {
    fontSize: 12,
    color: '#aaa',
  },
  completed: {
    marginTop: 10,
    fontSize: 12,
    color: '#00d084',
    fontWeight: 'bold',
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