import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { RootStackParamList } from "../navigation/types";

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
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Explore" as never)}>
          <FontAwesome5 name="arrow-left" size={20} color="#00b894" style={styles.icon} />
        </TouchableOpacity>
        <Text style={styles.title}>Sobriety Tracker</Text>
      </View>
      <View style={styles.addContainer}>
        <Text style={styles.subtitle}>Add Sobriety Category</Text>
        <TextInput
          style={styles.input}
          placeholder="Category"
          placeholderTextColor="#888"
          value={selectedCategory}
          onChangeText={setSelectedCategory}
        />
        <TextInput
          style={styles.input}
          placeholder="Start Date (YYYY-MM-DD)"
          placeholderTextColor="#888"
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
              <View>
                <Text style={styles.categoryName}>{cat.name}</Text>
                <Text style={styles.categoryDate}>
                  Sober for <Text style={{ fontWeight: "bold" }}>{calculateSoberDays(cat.startDate)}</Text> days since{" "}
                  <Text style={{ fontWeight: "bold" }}>{new Date(cat.startDate).toDateString()}</Text>
                </Text>
              </View>
              <TouchableOpacity style={styles.resetButton} onPress={() => resetCategory(cat.name)}>
                <FontAwesome5 name="redo" size={14} color="#fff" style={{ marginRight: 5 }} />
                <Text style={{ color: "#fff" }}>Reset</Text>
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
  icon: {
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#fff",
  },
  addContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
    color: "#fff",
  },
  input: {
    width: "100%",
    padding: 10,
    margin: 5,
    borderRadius: 5,
    borderWidth: 0,
    backgroundColor: "#1f1f1f",
    color: "#fff",
    fontSize: 14,
  },
  addButton: {
    backgroundColor: "#00b894",
    color: "#fff",
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
    alignItems: "center",
  },
  categoryList: {
    marginTop: 20,
  },
  categoryCard: {
    backgroundColor: "#1f1f1f",
    padding: 15,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#fff",
  },
  categoryDate: {
    fontSize: 14,
    color: "#ccc",
  },
  resetButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  noCategories: {
    textAlign: "center",
    color: "#aaa",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
});