import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome5 } from "@expo/vector-icons";
import { RootStackParamList } from "../navigation/types";

type NotesNavigationProp = StackNavigationProp<RootStackParamList, "Notes">;

type Note = {
  id: number;
  content: string;
};

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [note, setNote] = useState("");
  const navigation = useNavigation<NotesNavigationProp>();
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

      const savedNotesStr = await AsyncStorage.getItem(`notes_${user.username}`);
      const savedNotes: Note[] = savedNotesStr ? JSON.parse(savedNotesStr) : [];
      setNotes(savedNotes);
    })();
  }, []);

  const addNote = async () => {
    if (!note.trim() || !username) return;
    const newNote: Note = {
      id: Date.now(),
      content: note,
    };
    const updatedNotes = [...notes, newNote];
    await AsyncStorage.setItem(`notes_${username}`, JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
    setNote("");
  };

  const deleteNote = async (id: number) => {
    if (!username) return;
    const updatedNotes = notes.filter((n) => n.id !== id);
    await AsyncStorage.setItem(`notes_${username}`, JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
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
          <FontAwesome5 name="arrow-left" size={20} color="#00b894" style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>Notes</Text>
      </View>
      <TextInput
        style={styles.textarea}
        placeholder="Write a note..."
        placeholderTextColor="#888"
        value={note}
        multiline
        onChangeText={setNote}
      />
      <TouchableOpacity style={styles.addButton} onPress={addNote}>
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Add Note</Text>
      </TouchableOpacity>
      <Text style={styles.subtitle}>Your Notes:</Text>
      <View style={styles.notesContainer}>
        {notes.length === 0 ? (
          <Text style={styles.noNotes}>No notes added yet!</Text>
        ) : (
          notes.map((n) => (
            <View key={n.id} style={styles.noteCard}>
              <Text style={styles.noteContent}>{n.content}</Text>
              <TouchableOpacity onPress={() => deleteNote(n.id)}>
                <FontAwesome5 name="trash-alt" size={16} color="#e74c3c" style={styles.deleteIcon} />
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
    marginBottom: 15,
  },
  backIcon: {
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 0,
  },
  textarea: {
    width: "100%",
    minHeight: 70,
    padding: 10,
    fontSize: 14,
    borderRadius: 8,
    borderWidth: 0,
    backgroundColor: "#1f1f1f",
    color: "#fff",
    marginBottom: 10,
    textAlignVertical: "top",
  },
  addButton: {
    backgroundColor: "#00b894",
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  notesContainer: {
    marginTop: 10,
  },
  noteCard: {
    backgroundColor: "#1f1f1f",
    borderRadius: 8,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  noteContent: {
    fontSize: 14,
    color: "#ddd",
    flex: 1,
    marginRight: 10,
  },
  deleteIcon: {
    marginLeft: 10,
  },
  noNotes: {
    textAlign: "center",
    color: "#aaa",
    marginTop: 10,
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