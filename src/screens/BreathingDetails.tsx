import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../navigation/types';

type ExerciseDetails = {
  [key: string]: {
    name: string;
    inhale: string;
    exhale: string;
    duration: string;
  };
};

const exerciseDetails: ExerciseDetails = {
  '1': {
    name: 'Clear Mind',
    inhale: '4s',
    exhale: '7s',
    duration: '1:00',
  },
  '2': {
    name: 'Let Go of Worries',
    inhale: '5s',
    exhale: '6s',
    duration: '2:00',
  },
  '3': {
    name: 'Dream',
    inhale: '6s',
    exhale: '5s',
    duration: '3:00',
  },
};

type BreathingDetailsNavigationProp = StackNavigationProp<RootStackParamList, 'BreathingDetails'>;
type BreathingDetailsRouteProp = RouteProp<RootStackParamList, 'BreathingDetails'>;

export default function BreathingDetails() {
  const navigation = useNavigation<BreathingDetailsNavigationProp>();
  const route = useRoute<BreathingDetailsRouteProp>();
  const exerciseId = route.params.exerciseId;
  const [isCompleted, setIsCompleted] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  const exercise = exerciseDetails[exerciseId];

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
      const completedExercisesStr = await AsyncStorage.getItem(completedExercisesKey);
      const completedArr: (string | number)[] = completedExercisesStr ? JSON.parse(completedExercisesStr) : [];
      setIsCompleted(completedArr.includes(Number(exerciseId)) || completedArr.includes(exerciseId));
    })();
  }, [exerciseId]);

  if (!username) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.error}>User not logged in</Text>
      </View>
    );
  }

  if (!exercise) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.error}>Exercise not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back arrow */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={24} color="#00d084" />
        </TouchableOpacity>
      </View>
      <Text style={styles.heading}>{exercise.name}</Text>
      <Text style={styles.duration}>Duration: {exercise.duration}</Text>
      <Text style={styles.details}>
        {exercise.inhale} Inhale - {exercise.exhale} Exhale
      </Text>
      {isCompleted ? (
        <Text style={styles.completed}>✅ Task Completed!</Text>
      ) : (
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('BreathingStart', { exerciseId })}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Start</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    position: 'absolute',
    top: 32,
    left: 20,
  },
  heading: {
    fontSize: 28,
    marginVertical: 10,
    fontWeight: '600',
    color: '#fff',
  },
  duration: {
    fontSize: 18,
    color: '#bbb',
    marginVertical: 10,
  },
  details: {
    fontSize: 16,
    marginBottom: 20,
    color: '#ddd',
  },
  button: {
    backgroundColor: '#00d084',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginTop: 10,
  },
  completed: {
    color: '#00d084',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  error: {
    color: 'red',
    fontSize: 18,
  },
});