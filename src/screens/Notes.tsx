import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RootStackParamList } from '../navigation/types';

type NotesNavigationProp = StackNavigationProp<RootStackParamList, 'Notes'>;

type Note = {
  id: number;
  content: string;
};

const PALETTE = {
  darkBg: '#181d1b',
  cardBg: '#212824',
  cardBorder: '#2b3830',
  accent: '#00b894',
  accentSoft: '#009f7a',
  textMain: '#e8f6ef',
  textSecondary: '#b5d6c6',
};

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [note, setNote] = useState('');
  const navigation = useNavigation<NotesNavigationProp>();
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
    setNote('');
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
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityLabel="Back"
        >
          <FontAwesome5
            name="arrow-left"
            size={20}
            color={PALETTE.accent}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Notes</Text>
      </View>
      <TextInput
        style={styles.textarea}
        placeholder="Write a note..."
        placeholderTextColor={PALETTE.textSecondary}
        value={note}
        multiline
        onChangeText={setNote}
      />
      <TouchableOpacity
        style={[
          styles.addButton,
          { backgroundColor: note.trim() ? PALETTE.accent : PALETTE.cardBorder },
        ]}
        onPress={addNote}
        disabled={!note.trim()}
        activeOpacity={0.8}
      >
        <Text style={styles.addButtonText}>Add Note</Text>
      </TouchableOpacity>
      <Text style={styles.subtitle}>Your Notes:</Text>
      <View style={styles.notesContainer}>
        {notes.length === 0 ? (
          <Text style={styles.noNotes}>No notes added yet!</Text>
        ) : (
          notes.map((n) => (
            <View key={n.id} style={styles.noteCard}>
              <Text style={styles.noteContent}>{n.content}</Text>
              <TouchableOpacity onPress={() => deleteNote(n.id)} style={styles.deleteButton}>
                <FontAwesome5
                  name="trash-alt"
                  size={16}
                  color="#e74c3c"
                  style={styles.deleteIcon}
                />
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
    flex: 1,
    backgroundColor: PALETTE.darkBg,
    paddingHorizontal: 14,
    paddingTop: Platform.OS === 'web' ? 28 : 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  backButton: {
    marginRight: 8,
    padding: 6,
    borderRadius: 10,
  },
  backIcon: {
    marginRight: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: PALETTE.textMain,
    letterSpacing: 0.8,
    marginLeft: 8,
  },
  textarea: {
    width: '100%',
    minHeight: 68,
    padding: 12,
    fontSize: 15,
    borderRadius: 11,
    backgroundColor: PALETTE.cardBg,
    color: PALETTE.textMain,
    marginBottom: 10,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: PALETTE.cardBorder,
  },
  addButton: {
    borderRadius: 9,
    paddingVertical: 11,
    paddingHorizontal: 20,
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 18,
    marginTop: 18,
    fontWeight: 'bold',
    color: PALETTE.textMain,
    letterSpacing: 0.6,
  },
  notesContainer: {
    marginTop: 12,
  },
  noteCard: {
    backgroundColor: PALETTE.cardBg,
    borderRadius: 12,
    padding: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 11,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: PALETTE.cardBorder,
  },
  noteContent: {
    fontSize: 14.5,
    color: PALETTE.textMain,
    flex: 1,
    marginRight: 14,
  },
  deleteButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(231,76,60,0.09)',
  },
  deleteIcon: {
    marginLeft: 0,
  },
  noNotes: {
    textAlign: 'center',
    color: PALETTE.textSecondary,
    marginTop: 10,
    fontSize: 14,
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
