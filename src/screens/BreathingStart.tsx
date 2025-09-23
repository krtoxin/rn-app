import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View, Pressable, Platform } from 'react-native';
import { RootStackParamList } from '../navigation/types';

type BreathingStartNavigationProp = StackNavigationProp<RootStackParamList, 'BreathingStart'>;
type BreathingStartRouteProp = RouteProp<RootStackParamList, 'BreathingStart'>;

const PALETTE = {
  darkBg: '#181d1b',
  cardBg: '#212824',
  cardBorder: '#2b3830',
  accent: '#00b894',
  accentSoft: '#009f7a',
  accentLight: '#b2f5d6',
  secondary: '#2c4037',
  completed: '#27ae60',
  disabled: '#2a3330',
  textMain: '#e8f6ef',
  textSecondary: '#b5d6c6',
  textMuted: '#7ea899',
};

const exercises: Record<
  string,
  {
    name: string;
    inhale: number;
    hold: number;
    exhale: number;
    duration: number;
  }
> = {
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
    const completedExercises: string[] = completedExercisesStr
      ? JSON.parse(completedExercisesStr)
      : [];
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
    <View style={styles.outerContainer}>
      {/* Header/back/timer */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <FontAwesome5 name="arrow-left" size={22} color={PALETTE.accent} />
        </Pressable>
        {showUI && !exerciseComplete && (
          <Text style={styles.timer}>{Math.ceil(totalTimeLeft)}s</Text>
        )}
      </View>
      <View style={styles.card}>
        <View style={styles.cardLeft}>
          <View style={styles.iconCircle}>
            <FontAwesome5 name="lungs" size={24} color={PALETTE.accent} />
          </View>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardName}>{exercise.name}</Text>
        </View>
      </View>
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
                          ? PALETTE.accent
                          : phase === 'Hold'
                          ? '#f39c12'
                          : '#FF6347',
                    },
                  ]}
                />
              </View>
              <Pressable style={styles.pauseButton} onPress={togglePause}>
                {isRunning ? (
                  <FontAwesome5 name="pause" size={20} color="#fff" />
                ) : (
                  <FontAwesome5 name="play" size={20} color="#fff" />
                )}
              </Pressable>
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
  outerContainer: {
    flex: 1,
    backgroundColor: PALETTE.darkBg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'web' ? 0 : 40,
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
    zIndex: 10,
  },
  backBtn: {
    padding: 5,
  },
  timer: {
    fontSize: 20,
    color: PALETTE.textMuted,
    fontWeight: 'bold',
    marginLeft: 'auto',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.cardBg,
    borderRadius: 18,
    marginBottom: 30,
    paddingVertical: 18,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 5,
    borderLeftWidth: 5,
    borderLeftColor: PALETTE.accent,
    borderWidth: 1,
    borderColor: PALETTE.cardBorder,
    minHeight: 70,
    minWidth: 220,
    transitionDuration: '200ms',
  },
  cardLeft: {
    marginRight: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    backgroundColor: PALETTE.secondary,
    borderRadius: 50,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PALETTE.accent,
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 7,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '700',
    color: PALETTE.textMain,
    letterSpacing: 0.4,
  },
  phase: {
    fontSize: 23,
    marginBottom: 20,
    color: PALETTE.textMain,
    fontWeight: '600',
    textAlign: 'center',
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
    color: PALETTE.accent,
    marginVertical: 24,
    textAlign: 'center',
  },
  pauseButton: {
    backgroundColor: PALETTE.accent,
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 20,
  },
  completeMessage: {
    fontSize: 32,
    color: PALETTE.completed,
    marginTop: 20,
    textAlign: 'center',
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PALETTE.darkBg,
  },
  error: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
  },
});
