import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome5 } from "@expo/vector-icons";
import { RootStackParamList } from "../navigation/types";

type MoodTrackerNavigationProp = StackNavigationProp<RootStackParamList, "MoodTracker">;

type Mood = {
  id: string;
  name: string;
  icon: React.ReactNode;
};

type SavedMood = {
  mood: string;
  date: string;
};

export default function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [savedMood, setSavedMood] = useState<SavedMood | null>(null);
  const navigation = useNavigation<MoodTrackerNavigationProp>();
  const [username, setUsername] = useState<string | null>(null);

  const moods: Mood[] = [
    {
      id: "happy",
      name: "Happy",
      icon: <FontAwesome5 name="smile" size={40} color="#00d084" />,
    },
    {
      id: "neutral",
      name: "Neutral",
      icon: <FontAwesome5 name="meh" size={40} color="#f1c40f" />,
    },
    {
      id: "sad",
      name: "Sad",
      icon: <FontAwesome5 name="frown" size={40} color="#3498db" />,
    },
    {
      id: "angry",
      name: "Angry",
      icon: <FontAwesome5 name="angry" size={40} color="#e74c3c" />,
    },
    {
      id: "love",
      name: "In Love",
      icon: <FontAwesome5 name="grin-hearts" size={40} color="#ff69b4" />,
    },
  ];

  useEffect(() => {
    (async () => {
      const userStr = await AsyncStorage.getItem("user");
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
      tool: "Mood Tracker",
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

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Explore" as never)}>
          <FontAwesome5 name="arrow-left" size={20} color="#00d084" style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>Mood Tracker</Text>
      </View>
      <View style={styles.moodsContainer}>
        {moods.map((mood) => (
          <TouchableOpacity
            key={mood.id}
            style={[
              styles.moodCard,
              selectedMood === mood.id && {
                backgroundColor: "#1f1f1f",
                shadowColor: "#00d084",
                shadowOpacity: 0.6,
                shadowOffset: { width: 0, height: 0 },
                shadowRadius: 8,
                elevation: 8,
              },
            ]}
            onPress={() => saveMood(mood.id)}
            activeOpacity={0.8}
          >
            {mood.icon}
            <Text style={styles.moodName}>{mood.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {savedMood && (
        <View style={styles.savedMoodContainer}>
          <Text style={styles.savedTitle}>Your Mood Today:</Text>
          <Text style={styles.savedMood}>
            {savedMood.mood.charAt(0).toUpperCase() + savedMood.mood.slice(1)} on {savedMood.date}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#121212",
    minHeight: "100%",
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
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
  moodsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 20,
  },
  moodCard: {
    backgroundColor: "#2c2c2c",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    width: "30%",
    marginBottom: 20,
  },
  moodName: {
    marginTop: 10,
    fontSize: 14,
    color: "#ddd",
    textAlign: "center",
  },
  savedMoodContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  savedTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#fff",
  },
  savedMood: {
    fontSize: 16,
    color: "#00d084",
  },
  error: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
});
