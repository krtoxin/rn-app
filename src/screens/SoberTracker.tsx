import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Platform } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { RootStackParamList } from "../navigation/types";

const PALETTE = {
  darkBg: "#181d1b",
  cardBg: "#212824",
  cardBorder: "#2b3830",
  accent: "#00b894",
  accentSoft: "#009f7a",
  error: "#e74c3c",
  textMain: "#e8f6ef",
  textSecondary: "#b5d6c6",
  secondary: "#2c4037",
};

type SoberTrackerNavigationProp = StackNavigationProp<RootStackParamList, "SoberTracker">;

type Category = {
  name: string;
  startDate: string;
};

export default function SoberTracker() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [inputDate, setInputDate] = useState("");
  const navigation = useNavigation<SoberTrackerNavigationProp>();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const userStr = await AsyncStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user) {
        setUsername(null);
        return;
      }
      setUsername(user.username);

      const storedCategoriesStr = await AsyncStorage.getItem(`soberCategories_${user.username}`);
      const storedCategories: Category[] = storedCategoriesStr ? JSON.parse(storedCategoriesStr) : [];
      setCategories(storedCategories);
    })();
  }, []);

  const calculateSoberDays = (startDate: string) => {
    const today = new Date();
    const diff = Math.floor((today.getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff : 0;
  };

  const addHistoryEntry = async (action: string, category: string) => {
    if (!username) return;
    const historyKey = `history_${username}`;
    const newEntry = {
      tool: "Sober Tracker",
      action: `${action}: ${category}`,
      timestamp: new Date().toISOString(),
    };
    const existingHistoryStr = await AsyncStorage.getItem(historyKey);
    const existingHistory = existingHistoryStr ? JSON.parse(existingHistoryStr) : [];
    await AsyncStorage.setItem(historyKey, JSON.stringify([...existingHistory, newEntry]));
  };

  const addCategory = async () => {
    if (!selectedCategory || !inputDate || !username) return;
    const newCategory: Category = { name: selectedCategory, startDate: inputDate };
    const updatedCategories = [...categories, newCategory];
    await AsyncStorage.setItem(`soberCategories_${username}`, JSON.stringify(updatedCategories));
    setCategories(updatedCategories);
    await addHistoryEntry("Started Tracking", selectedCategory);
    setSelectedCategory("");
    setInputDate("");
  };

  const resetCategory = async (name: string) => {
    if (!username) return;
    Alert.alert(
      "Reset Progress",
      `Are you sure you want to reset progress for "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            const updatedCategories = categories.filter((cat) => cat.name !== name);
            await AsyncStorage.setItem(`soberCategories_${username}`, JSON.stringify(updatedCategories));
            setCategories(updatedCategories);
            await addHistoryEntry("Reset Progress", name);
          },
        },
      ]
    );
  };

  if (!username) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.error}>User not logged in</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <FontAwesome5 name="arrow-left" size={22} color={PALETTE.accent} />
        </TouchableOpacity>
        <Text style={styles.title}>Sobriety Tracker</Text>
        <View style={{ width: 36 }} /> {/* Placeholder for symmetry */}
      </View>

      <View style={styles.addContainer}>
        <Text style={styles.subtitle}>Add Sobriety Category</Text>
        <TextInput
          style={styles.input}
          placeholder="Category"
          placeholderTextColor={PALETTE.textSecondary}
          value={selectedCategory}
          onChangeText={setSelectedCategory}
        />
        <TextInput
          style={styles.input}
          placeholder="Start Date (YYYY-MM-DD)"
          placeholderTextColor={PALETTE.textSecondary}
          value={inputDate}
          onChangeText={setInputDate}
        />
        <TouchableOpacity style={styles.addButton} onPress={addCategory}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Add Category</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.categoryList}>
        {categories.length === 0 ? (
          <Text style={styles.noCategories}>No sobriety categories added yet.</Text>
        ) : (
          categories.map((cat, index) => (
            <View key={index} style={styles.categoryCard}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.categoryName}>{cat.name}</Text>
                <Text style={styles.categoryDate}>
                  Sober for <Text style={styles.soberDays}>{calculateSoberDays(cat.startDate)}</Text> days since{" "}
                  <Text style={styles.soberDate}>{new Date(cat.startDate).toDateString()}</Text>
                </Text>
              </View>
              <TouchableOpacity style={styles.resetButton} onPress={() => resetCategory(cat.name)}>
                <FontAwesome5 name="redo" size={15} color="#fff" style={{ marginRight: 7 }} />
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: PALETTE.darkBg,
    flex: 1,
  },
  scrollContent: {
    padding: 0,
    paddingBottom: 24,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: PALETTE.darkBg,
    paddingTop: Platform.OS === "web" ? 28 : 16,
    paddingHorizontal: 10,
    marginBottom: 18,
    width: "100%",
  },
  backButton: {
    padding: 7,
    borderRadius: 9,
  },
  title: {
    fontSize: 23,
    fontWeight: "700",
    color: PALETTE.textMain,
    letterSpacing: 0.6,
    textAlign: "center",
    flex: 1,
  },
  addContainer: {
    alignItems: "center",
    backgroundColor: PALETTE.cardBg,
    padding: 18,
    borderRadius: 16,
    marginBottom: 30,
    width: "93%",
    maxWidth: 370,
    shadowColor: "#000",
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 7,
    elevation: 2,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 14,
    color: PALETTE.textMain,
    fontWeight: "bold",
    letterSpacing: 0.15,
  },
  input: {
    width: "100%",
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: PALETTE.cardBorder,
    backgroundColor: PALETTE.darkBg,
    color: PALETTE.textMain,
    fontSize: 15,
  },
  addButton: {
    backgroundColor: PALETTE.accent,
    color: "#fff",
    borderRadius: 8,
    paddingVertical: 11,
    paddingHorizontal: 22,
    marginTop: 12,
    alignItems: "center",
    width: "100%",
  },
  categoryList: {
    marginTop: 6,
    width: "93%",
    maxWidth: 370,
  },
  categoryCard: {
    backgroundColor: PALETTE.cardBg,
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
    shadowColor: "#000",
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 7,
    elevation: 1,
    borderWidth: 1,
    borderColor: PALETTE.cardBorder,
    minHeight: 64,
  },
  categoryName: {
    fontSize: 16.5,
    fontWeight: "bold",
    marginBottom: 5,
    color: PALETTE.textMain,
    letterSpacing: 0.1,
  },
  categoryDate: {
    fontSize: 14.5,
    color: PALETTE.textSecondary,
    marginTop: 2,
    flexWrap: "wrap",
    fontWeight: "400",
  },
  soberDays: {
    fontWeight: "bold",
    color: PALETTE.accent,
    fontSize: 16,
  },
  soberDate: {
    fontWeight: "bold",
    color: PALETTE.textMain,
    fontSize: 15,
  },
  resetButton: {
    backgroundColor: PALETTE.accent,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 15,
    alignSelf: "center",
    shadowColor: PALETTE.accent,
    shadowOpacity: 0.10,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  resetButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    letterSpacing: 0.2,
  },
  noCategories: {
    textAlign: "center",
    color: PALETTE.textSecondary,
    fontSize: 16,
    marginTop: 16,
  },
  error: {
    color: PALETTE.error,
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: PALETTE.darkBg,
  },
});