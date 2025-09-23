import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { RootStackParamList } from '../navigation/types';

type JournalNavigationProp = StackNavigationProp<RootStackParamList, 'Journal'>;

type Entry = {
  date: string;
  entry: string;
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
  clearBtn: '#212c28',
  clearBtnPressed: '#1a2320',
  clearBtnText: '#b5d6c6',
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
    Alert.alert('Clear All Entries', 'Are you sure you want to clear all journal entries?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem(`journalEntries_${username}`);
          setEntries([]);
        },
      },
    ]);
  };

  if (!username) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.error}>User not logged in</Text>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      {/* Custom dark header */}
      <View style={styles.customHeader}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <FontAwesome5 name="arrow-left" size={20} color={PALETTE.accent} />
        </Pressable>
        <Text style={styles.headerTitle}>Journal</Text>
      </View>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.journalCard}>
          <View style={styles.cardLeft}>
            <View style={styles.iconCircle}>
              <FontAwesome5 name="pencil-alt" size={23} color={PALETTE.accent} />
            </View>
          </View>
          <View style={styles.cardContentRow}>
            <View style={styles.cardContent}>
              <Text
                style={styles.heading}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                Write your journal
              </Text>
              <Text
                style={styles.text}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
                ellipsizeMode="tail"
              >
                How are you feeling today?
              </Text>
            </View>
            <View style={styles.cardAction}>
              <FontAwesome5 name="pen" size={20} color={PALETTE.accent} />
            </View>
          </View>
        </View>
        {error && <Text style={styles.error}>{error}</Text>}
        <TextInput
          style={styles.textarea}
          placeholder="Type here"
          placeholderTextColor={PALETTE.textMuted}
          value={entry}
          multiline
          onChangeText={setEntry}
          autoCorrect
          accessibilityLabel="Journal input"
        />
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && { backgroundColor: PALETTE.accentSoft },
          ]}
          onPress={handleSave}
        >
          <Text style={styles.buttonText}>Save Entry</Text>
        </Pressable>
        <View style={styles.entriesContainer}>
          <Text style={styles.subTitle}>Previous Entries</Text>
          {entries.length === 0 ? (
            <Text style={styles.noEntries}>No entries yet.</Text>
          ) : (
            entries.map((item, idx) => (
              <View key={idx} style={styles.entry}>
                <Text style={styles.date}>{item.date}</Text>
                <Text style={styles.entryText}>{item.entry}</Text>
              </View>
            ))
          )}
          {entries.length > 0 && (
            <Pressable
              style={({ pressed }) => [styles.clearButton, pressed && styles.clearButtonPressed]}
              onPress={handleClearEntries}
            >
              <FontAwesome5
                name="trash-alt"
                size={16}
                color={PALETTE.textMuted}
                style={{ marginRight: 7 }}
              />
              <Text style={styles.clearButtonText}>Clear All Entries</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: PALETTE.darkBg,
  },
  customHeader: {
    backgroundColor: PALETTE.darkBg,
    paddingTop: Platform.OS === 'web' ? 0 : 40,
    paddingBottom: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#222',
    borderBottomWidth: 1,
    zIndex: 99,
  },
  backBtn: {
    marginRight: 12,
    padding: 5,
  },
  headerTitle: {
    fontSize: 22,
    color: PALETTE.textMain,
    fontWeight: 'bold',
  },
  container: {
    padding: 20,
    backgroundColor: PALETTE.darkBg,
    flex: 1,
  },
  journalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.cardBg,
    borderRadius: 18,
    marginBottom: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: PALETTE.accent,
    borderWidth: 1,
    borderColor: PALETTE.cardBorder,
    opacity: 1,
    minHeight: 80,
    transitionDuration: '200ms',
  },
  cardLeft: {
    marginRight: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    backgroundColor: PALETTE.secondary,
    borderRadius: 50,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PALETTE.accent,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 5,
    elevation: 2,
  },
  cardContentRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
    minWidth: 0,
  },
  heading: {
    fontSize: 17,
    fontWeight: '700',
    color: PALETTE.textMain,
    marginBottom: 2,
    letterSpacing: 0.4,
  },
  text: {
    fontSize: 13.5,
    color: PALETTE.textSecondary,
    fontWeight: '400',
    letterSpacing: 0.08,
  },
  cardAction: {
    minWidth: 32,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 8,
  },
  textarea: {
    width: '100%',
    height: 130,
    padding: 12,
    fontSize: 15,
    borderRadius: 10,
    borderWidth: 0,
    backgroundColor: '#232323',
    color: PALETTE.textMain,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  button: {
    backgroundColor: PALETTE.accent,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 18,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.15,
  },
  clearButton: {
    backgroundColor: PALETTE.clearBtn,
    borderRadius: 8,
    paddingVertical: 11,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: PALETTE.cardBorder,
  },
  clearButtonPressed: {
    backgroundColor: PALETTE.clearBtnPressed,
  },
  clearButtonText: {
    color: PALETTE.clearBtnText,
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 2,
    letterSpacing: 0.15,
  },
  entriesContainer: {
    marginTop: 15,
  },
  subTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 12,
    color: PALETTE.textMain,
  },
  entry: {
    backgroundColor: PALETTE.cardBg,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: PALETTE.cardBorder,
  },
  date: {
    fontSize: 12,
    color: '#7ed6a7',
    marginBottom: 3,
  },
  entryText: {
    color: PALETTE.textMain,
    fontSize: 15,
  },
  noEntries: {
    color: PALETTE.textMuted,
    fontSize: 15,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PALETTE.darkBg,
  },
});
