import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { RootStackParamList } from '../navigation/types';

type BreathingNavigationProp = StackNavigationProp<RootStackParamList, 'Breathing'>;

type Exercise = {
  id: number;
  name: string;
  duration: string;
  icon: React.ReactNode;
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

export default function Breathing() {
  const [completedExercises, setCompletedExercises] = useState<number[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const navigation = useNavigation<BreathingNavigationProp>();
  const { width } = useWindowDimensions();

  const exercises: Exercise[] = [
    {
      id: 1,
      name: 'Clear Mind',
      duration: '1 min',
      icon: <FontAwesome5 name="wind" size={30} color={PALETTE.accent} />,
    },
    {
      id: 2,
      name: 'Let Go of Worries',
      duration: '2 min',
      icon: <FontAwesome5 name="smile" size={30} color={PALETTE.accent} />,
    },
    {
      id: 3,
      name: 'Dream',
      duration: '3 min',
      icon: <FontAwesome5 name="moon" size={30} color={PALETTE.accent} />,
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

  const CARD_WIDTH = 120;
  const CARD_GAP = 16;
  const GRID_MAX_WIDTH = CARD_WIDTH * 3 + CARD_GAP * 2;
  const gridWidth = Math.min(width - 24, GRID_MAX_WIDTH);
  const actualCardWidth = (gridWidth - CARD_GAP * 2) / 3;

  return (
    <View style={styles.outerContainer}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <FontAwesome5 name="arrow-left" size={22} color={PALETTE.accent} />
        </Pressable>
        <Text style={styles.heading}>Breathing</Text>
      </View>
      <View style={[styles.gridWrap, { width: gridWidth, alignSelf: 'center' }]}>
        <FlatList
          data={exercises}
          numColumns={3}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{
            paddingTop: 22,
            paddingBottom: 16,
            gap: CARD_GAP,
          }}
          columnWrapperStyle={{
            justifyContent: 'space-between',
            gap: CARD_GAP,
            marginBottom: CARD_GAP,
          }}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.card,
                {
                  width: actualCardWidth,
                  minHeight: 130,
                  paddingTop: 18,
                  paddingBottom: 14,
                },
                completedExercises.includes(item.id) && styles.cardCompleted,
                pressed && styles.cardPressed,
              ]}
              onPress={() => handleExerciseClick(item)}
              android_ripple={{ color: PALETTE.accentSoft + '22' }}
            >
              <View style={styles.iconWrap}>{item.icon}</View>
              <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
                {item.name}
              </Text>
              <Text style={styles.duration}>{item.duration}</Text>
              <View style={styles.completedWrap}>
                {completedExercises.includes(item.id) && (
                  <FontAwesome5 name="check-circle" size={18} color={PALETTE.completed} />
                )}
              </View>
            </Pressable>
          )}
        />
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
  gridWrap: {
    flexGrow: 0,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: PALETTE.cardBg,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'flex-start',
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
    marginVertical: 0,
  },
  cardPressed: {
    backgroundColor: PALETTE.secondary,
    borderColor: PALETTE.accentSoft + '55',
    elevation: 7,
    shadowOpacity: 0.2,
    transform: [{ scale: 0.98 }],
  },
  cardCompleted: {
    borderLeftColor: PALETTE.completed,
    backgroundColor: '#1b241e',
    opacity: 0.93,
  },
  iconWrap: {
    marginBottom: 7,
  },
  title: {
    marginTop: 2,
    fontSize: 13,
    color: PALETTE.textMain,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 3,
    width: '100%',
    paddingHorizontal: 4,
  },
  duration: {
    fontSize: 12,
    color: PALETTE.textMuted,
    marginBottom: 1,
    fontWeight: '500',
    textAlign: 'center',
  },
  completedWrap: {
    marginTop: 7,
    minHeight: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PALETTE.darkBg,
  },
  error: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});
