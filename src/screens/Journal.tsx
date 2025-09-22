import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';

type JournalNavigationProp = StackNavigationProp<RootStackParamList, 'Journal'>;

type Entry = {
  date: string;
  entry: string;
};

export default function Journal() {
  const [entry, setEntry] = useState('');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<JournalNavigationProp>();

  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const userStr = await AsyncStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user) {
        navigation.navigate('Login' as never);
        return;
      }
      setUsername(user.username);

      const savedEntriesStr = await AsyncStorage.getItem(`journalEntries_${user.username}`);
      const savedEntries: Entry[] = savedEntriesStr ? JSON.parse(savedEntriesStr) : [];
      setEntries(savedEntries);
    })();
  }, []);

  const handleSave = async () => {
    if (!entry.trim()) {
      setError('Please write something before saving.');
      return;
    }

    const newEntry: Entry = {
      date: new Date().toLocaleString(),
      entry,
    };
    const updatedEntries = [...entries, newEntry];

    await AsyncStorage.setItem(`journalEntries_${username}`, JSON.stringify(updatedEntries));
    setEntries(updatedEntries);
    setEntry('');
    setError(null);

    const completedTasksKey = `completedTasks_${username}`;
    const completedTasksStr = await AsyncStorage.getItem(completedTasksKey);
    const completedTasks = completedTasksStr ? JSON.parse(completedTasksStr) : {};
    completedTasks.journal = true;
    await AsyncStorage.setItem(completedTasksKey, JSON.stringify(completedTasks));
  };

  const handleClearEntries = async () => {
    Alert.alert(
      'Clear All Entries',
      'Are you sure you want to clear all journal entries?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem(`journalEntries_${username}`);
            setEntries([]);
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
        <TouchableOpacity onPress={() => navigation.navigate('Program' as never)}>
          <FontAwesome5 name="arrow-left" size={20} color="#00b894" style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>Write Your Journal</Text>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      <TextInput
        style={styles.textarea}
        placeholder="How are you feeling today?"
        placeholderTextColor="#888"
        value={entry}
        multiline
        onChangeText={setEntry}
      />
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save Entry</Text>
      </TouchableOpacity>
      <View style={styles.entriesContainer}>
        <Text style={styles.subTitle}>Previous Entries</Text>
        {entries.length === 0 ? (
          <Text style={{ color: '#bbb' }}>No entries yet.</Text>
        ) : (
          entries.map((item, idx) => (
            <View key={idx} style={styles.entry}>
              <Text style={styles.date}>{item.date}</Text>
              <Text>{item.entry}</Text>
            </View>
          ))
        )}
        {entries.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClearEntries}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Clear All Entries</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#121212',
    minHeight: '100%',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backIcon: {
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  textarea: {
    width: '100%',
    height: 150,
    padding: 10,
    fontSize: 14,
    borderRadius: 8,
    borderWidth: 0,
    backgroundColor: '#1f1f1f',
    color: '#fff',
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#00b894',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 15,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 15,
    alignItems: 'center',
  },
  entriesContainer: {
    marginTop: 20,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  entry: {
    backgroundColor: '#1f1f1f',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  date: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 5,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
});