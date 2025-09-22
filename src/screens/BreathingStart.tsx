import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../navigation/types';

type BreathingStartNavigationProp = StackNavigationProp<RootStackParamList, 'BreathingStart'>;
type BreathingStartRouteProp = RouteProp<RootStackParamList, 'BreathingStart'>;

const exercises: Record<string, {
  name: string;
  inhale: number;
  hold: number;
  exhale: number;
  duration: number;
}> = {
  '1': {
    name: 'Clear Mind',
    inhale: 4,
    hold: 4,
    exhale: 7,
    duration: 60,
  },
  '2': {
    name: 'Let Go of Worries',
    inhale: 5,
    hold: 4,
    exhale: 6,
    duration: 120,
  },
  '3': {
    name: 'Dream',
    inhale: 6,
    hold: 5,
    exhale: 5,
    duration: 180,
  },
};

export default function BreathingStart() {
  const navigation = useNavigation<BreathingStartNavigationProp>();
  const route = useRoute<BreathingStartRouteProp>();
  const exerciseId = route.params.exerciseId;
  const exercise = exercises[exerciseId];

  const [phase, setPhase] = useState('Get Ready');
  const [countdown, setCountdown] = useState(3);
  const [totalTimeLeft, setTotalTimeLeft] = useState(exercise.duration);
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [showUI, setShowUI] = useState(false);
  const [exerciseComplete, setExerciseComplete] = useState(false);

  const currentPhase = useRef(0);
  const phaseProgress = useRef(0);
  const remainingTime = useRef(exercise.duration);
  const breathingInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const userStr = await AsyncStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      setUsername(user?.username || null);
    })();
  }, []);

  useEffect(() => {
    startCountdown();
    return () => {
      if (breathingInterval.current) clearInterval(breathingInterval.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCountdown = () => {
    let count = 3;
    setCountdown(count);

    const countdownInterval = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(countdownInterval);
        setShowUI(true);
        startBreathingCycle();
      }
    }, 1000);
  };

  const getPhaseDuration = (phase: string) => {
    if (phase === 'Inhale') return exercise.inhale;
    if (phase === 'Hold') return exercise.hold;
    if (phase === 'Exhale') return exercise.exhale;
    return 0;
  };

  const startBreathingCycle = () => {
    if (breathingInterval.current) clearInterval(breathingInterval.current);
    const phases = ['Inhale', 'Hold', 'Exhale'];
    setPhase(phases[currentPhase.current]);

    breathingInterval.current = setInterval(() => {
      phaseProgress.current += 0.1;
      remainingTime.current -= 0.1;

      const phaseDuration = getPhaseDuration(phases[currentPhase.current]);
      setProgress((phaseProgress.current / phaseDuration) * 100);
      setTotalTimeLeft(Math.max(remainingTime.current, 0));

      if (phaseProgress.current >= phaseDuration) {
        phaseProgress.current = 0;
        currentPhase.current = (currentPhase.current + 1) % phases.length;
        setPhase(phases[currentPhase.current]);
        setProgress(0);
      }

      if (remainingTime.current <= 0) {
        completeExercise();
      }
    }, 100);
  };

  const togglePause = () => {
    if (isRunning) {
      if (breathingInterval.current) clearInterval(breathingInterval.current);
    } else {
      startBreathingCycle();
    }
    setIsRunning(!isRunning);
  };

  const completeExercise = async () => {
    if (breathingInterval.current) clearInterval(breathingInterval.current);
    setExerciseComplete(true);

    if (!username) return;
    const completedExercisesKey = `completedExercises_${username}`;
    const completedExercisesStr = await AsyncStorage.getItem(completedExercisesKey);
    const completedExercises: string[] = completedExercisesStr ? JSON.parse(completedExercisesStr) : [];
    if (!completedExercises.includes(exerciseId)) {
      completedExercises.push(exerciseId);
      await AsyncStorage.setItem(completedExercisesKey, JSON.stringify(completedExercises));
    }

    setTimeout(() => {
      navigation.navigate('BreathingDetails', { exerciseId });
    }, 1000);
  };

  if (!exercise || !username) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.error}>Exercise not found or user not logged in</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header/back/timer */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={24} color="#00d084" />
        </TouchableOpacity>
        {showUI && !exerciseComplete && (
          <Text style={styles.timer}>{Math.ceil(totalTimeLeft)}s</Text>
        )}
      </View>
      <Text style={styles.heading}>{exercise.name}</Text>
      {exerciseComplete ? (
        <Text style={styles.completeMessage}>Exercise Complete!</Text>
      ) : (
        <>
          <Text style={styles.phase}>{phase}</Text>
          {showUI ? (
            <>
              <View style={styles.progressBarContainer}>
                <Animated.View
                  style={[
                    styles.progressBar,
                    {
                      width: `${progress}%`,
                      backgroundColor:
                        phase === 'Inhale'
                          ? '#00d084'
                          : phase === 'Hold'
                          ? '#f39c12'
                          : '#FF6347',
                    },
                  ]}
                />
              </View>
              <TouchableOpacity style={styles.pauseButton} onPress={togglePause}>
                {isRunning ? (
                  <FontAwesome5 name="pause" size={20} color="#fff" />
                ) : (
                  <FontAwesome5 name="play" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.countdown}>{countdown}</Text>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    alignItems: 'center',
  },
  heading: {
    fontSize: 28,
    color: '#fff',
    marginBottom: 10,
  },
  phase: {
    fontSize: 24,
    marginBottom: 20,
    color: '#fff',
  },
  progressBarContainer: {
    width: '80%',
    height: 20,
    backgroundColor: '#333',
    borderRadius: 10,
    marginBottom: 20,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 10,
  },
  countdown: {
    fontSize: 48,
    color: '#00d084',
    marginVertical: 20,
  },
  pauseButton: {
    backgroundColor: '#00d084',
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 20,
  },
  timer: {
    fontSize: 20,
    color: '#aaa',
    fontWeight: 'bold',
    marginLeft: 'auto',
  },
  completeMessage: {
    fontSize: 32,
    color: '#00d084',
    marginTop: 20,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  error: {
    color: "red",
    fontSize: 18,
    textAlign: "center",
  },
});