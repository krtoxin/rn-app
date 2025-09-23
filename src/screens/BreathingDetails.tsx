import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, Pressable, View, Platform } from 'react-native';
import { RootStackParamList } from '../navigation/types';

type ExerciseDetails = {
  [key: string]: {
    name: string;
    inhale: string;
    exhale: string;
    duration: string;
  };
};

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
      const completedArr: (string | number)[] = completedExercisesStr
        ? JSON.parse(completedExercisesStr)
        : [];
      setIsCompleted(
        completedArr.includes(Number(exerciseId)) || completedArr.includes(exerciseId),
      );
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
    <View style={styles.outerContainer}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <FontAwesome5 name="arrow-left" size={22} color={PALETTE.accent} />
        </Pressable>
        <Text style={styles.heading}>Breathing</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <FontAwesome5 name="lungs" size={30} color={PALETTE.accent} />
        </View>
        <Text
          style={styles.cardTitle}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
        >
          {exercise.name}
        </Text>
        <Text style={styles.cardInfo}>
          Inhale: {exercise.inhale} | Exhale: {exercise.exhale}
        </Text>
        <Text style={styles.duration}>Duration: {exercise.duration}</Text>
        <View style={styles.completedWrap}>
          {isCompleted ? (
            <FontAwesome5 name="check-circle" size={18} color={PALETTE.completed} />
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && { backgroundColor: PALETTE.accentSoft },
              ]}
              onPress={() => navigation.navigate('BreathingStart', { exerciseId })}
            >
              <Text style={styles.buttonText}>Start</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: PALETTE.darkBg,
    paddingTop: Platform.OS === 'web' ? 0 : 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
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
    margin: 24,
    paddingTop: 22,
    paddingBottom: 18,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 7,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
    borderWidth: 1,
    borderColor: PALETTE.cardBorder,
    transitionDuration: '200ms',
    minWidth: 220,
    minHeight: 150,
  },
  iconWrap: {
    marginBottom: 9,
  },
  cardTitle: {
    marginTop: 2,
    fontSize: 17,
    color: PALETTE.textMain,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 4,
    width: '100%',
    paddingHorizontal: 4,
  },
  cardInfo: {
    fontSize: 13.5,
    color: PALETTE.textSecondary,
    fontWeight: '400',
    letterSpacing: 0.08,
    marginBottom: 4,
    textAlign: 'center',
  },
  duration: {
    fontSize: 13,
    color: PALETTE.textMuted,
    fontWeight: '500',
    marginBottom: 7,
    textAlign: 'center',
  },
  completedWrap: {
    marginTop: 7,
    minHeight: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: PALETTE.accent,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.15,
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
  },
});
