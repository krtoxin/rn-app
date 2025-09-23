import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';

type MoodTrackerNavigationProp = StackNavigationProp<RootStackParamList, 'MoodTracker'>;

type Mood = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type SavedMood = {
  mood: string;
  date: string;
};

const PALETTE = {
  darkBg: '#181d1b',
  cardBg: '#212824',
  cardBorder: '#2b3830',
  accent: '#00b894',
  accentSoft: '#009f7a',
  textMain: '#e8f6ef',
  textSecondary: '#b5d6c6',
  secondary: '#2c4037',
};

const moods: Mood[] = [
  {
    id: 'happy',
    name: 'Happy',
    icon: 'smile',
    color: '#00d084',
  },
  {
    id: 'neutral',
    name: 'Neutral',
    icon: 'meh',
    color: '#f1c40f',
  },
  {
    id: 'sad',
    name: 'Sad',
    icon: 'frown',
    color: '#3498db',
  },
  {
    id: 'angry',
    name: 'Angry',
    icon: 'angry',
    color: '#e74c3c',
  },
  {
    id: 'love',
    name: 'In Love',
    icon: 'grin-hearts',
    color: '#ff69b4',
  },
  {
    id: 'confused',
    name: 'Confused',
    icon: 'question-circle',
    color: '#9b59b6',
  },
];

function chunkArray<T>(arr: T[], size: number): T[][] {
  const res: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    res.push(arr.slice(i, i + size));
  }
  return res;
}

export default function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [savedMood, setSavedMood] = useState<SavedMood | null>(null);
  const navigation = useNavigation<MoodTrackerNavigationProp>();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const userStr = await AsyncStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user) {
        setUsername(null);
        return;
      }
      setUsername(user.username);

      const storedMoodStr = await AsyncStorage.getItem(`selectedMood_${user.username}`);
      const storedMood: SavedMood | null = storedMoodStr ? JSON.parse(storedMoodStr) : null;
      if (storedMood) {
        setSavedMood(storedMood);
        setSelectedMood(storedMood.mood);
      }
    })();
  }, []);

  const addHistoryEntry = async (moodName: string) => {
    if (!username) return;
    const historyKey = `history_${username}`;
    const newEntry = {
      tool: 'Mood Tracker',
      action: `Saved Mood: ${moodName}`,
      timestamp: new Date().toISOString(),
    };
    const existingHistoryStr = await AsyncStorage.getItem(historyKey);
    const existingHistory = existingHistoryStr ? JSON.parse(existingHistoryStr) : [];
    await AsyncStorage.setItem(historyKey, JSON.stringify([...existingHistory, newEntry]));
  };

  const saveMood = async (mood: string) => {
    if (!username) return;
    const moodData: SavedMood = {
      mood,
      date: new Date().toLocaleString(),
    };
    await AsyncStorage.setItem(`selectedMood_${username}`, JSON.stringify(moodData));
    setSavedMood(moodData);
    setSelectedMood(mood);

    const moodName = moods.find((m) => m.id === mood)?.name ?? mood;
    await addHistoryEntry(moodName);
  };

  if (!username) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.error}>User not logged in</Text>
      </View>
    );
  }

  const moodRows = chunkArray(moods, 3);

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityLabel="Back"
        >
          <FontAwesome5 name="arrow-left" size={24} color={PALETTE.accent} />
        </TouchableOpacity>
        <Text style={styles.title}>Mood Tracker</Text>
      </View>
      <View style={styles.moodsContainer}>
        {moodRows.map((row, i) => (
          <View style={styles.moodRow} key={i}>
            {row.map((mood) => {
              const isSelected = selectedMood === mood.id;
              return (
                <TouchableOpacity
                  key={mood.id}
                  style={[
                    styles.moodCard,
                    isSelected && {
                      borderColor: mood.color,
                      borderWidth: 2,
                      shadowColor: mood.color,
                      shadowOpacity: 0.16,
                      shadowRadius: 10,
                      elevation: 7,
                    },
                  ]}
                  onPress={() => saveMood(mood.id)}
                  activeOpacity={0.85}
                >
                  <FontAwesome5 name={mood.icon as any} size={36} color={mood.color} />
                  <Text style={styles.moodName}>{mood.name}</Text>
                </TouchableOpacity>
              );
            })}
            {row.length < 3 &&
              Array.from({ length: 3 - row.length }).map((_, idx) => (
                <View
                  style={[
                    styles.moodCard,
                    { backgroundColor: 'transparent', borderWidth: 0, elevation: 0 },
                  ]}
                  key={`empty-${idx}`}
                  pointerEvents="none"
                />
              ))}
          </View>
        ))}
      </View>
      {savedMood && (
        <View style={styles.savedMoodContainer}>
          <Text style={styles.savedTitle}>Your Mood Today:</Text>
          <Text style={styles.savedMood}>
            {moods.find((m) => m.id === savedMood.mood)?.name ?? savedMood.mood} on {savedMood.date}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const CARD_SIZE = 110;
const CARD_GAP = 18;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.darkBg,
    paddingHorizontal: 14,
    paddingTop: Platform.OS === 'web' ? 28 : 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
    paddingTop: 8,
    paddingLeft: 6,
  },
  backButton: {
    marginRight: 18,
    marginLeft: 4,
    padding: 0,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: PALETTE.textMain,
    letterSpacing: 1,
  },
  moodsContainer: {
    marginTop: 6,
    marginBottom: 26,
    alignItems: 'center',
    width: '100%',
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: CARD_GAP,
    width: '100%',
  },
  moodCard: {
    backgroundColor: PALETTE.cardBg,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    width: CARD_SIZE,
    height: CARD_SIZE,
    marginHorizontal: CARD_GAP / 2,
    borderWidth: 0,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    transitionDuration: '200ms',
  },
  moodName: {
    marginTop: 13,
    fontSize: 17,
    color: PALETTE.textMain,
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  savedMoodContainer: {
    marginTop: 14,
    alignItems: 'center',
  },
  savedTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 10,
    color: PALETTE.textMain,
    letterSpacing: 0.7,
  },
  savedMood: {
    fontSize: 16,
    color: PALETTE.accent,
    fontWeight: '600',
  },
  error: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PALETTE.darkBg,
  },
});
