import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';

type HistoryEntry = {
  action: string;
  tool: string;
  timestamp: string | number;
};

export default function History() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const userStr = await AsyncStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user) {
        setUsername(null);
        return;
      }
      setUsername(user.username);

      const storedHistoryStr = await AsyncStorage.getItem(`history_${user.username}`);
      const storedHistory = storedHistoryStr ? JSON.parse(storedHistoryStr) : [];
      setHistory(storedHistory);
    })();
  }, []);

  if (!username) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.error}>User not logged in</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={20} color="#00b894" style={styles.icon} />
        </TouchableOpacity>
        <Text style={styles.title}>Your Activity History</Text>
      </View>

      <View style={styles.historyContainer}>
        {history.length === 0 ? (
          <Text style={styles.noHistory}>No activity history recorded yet.</Text>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item }) => (
              <View style={styles.historyCard}>
                <Text style={styles.entryText}>
                  <Text style={{ fontWeight: 'bold' }}>{item.action}</Text>
                  {' - '}
                  {item.tool} on{' '}
                  {typeof item.timestamp === 'string'
                    ? new Date(item.timestamp).toLocaleString()
                    : new Date(item.timestamp).toLocaleString()}
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
  },
  historyContainer: {
    marginTop: 20,
    flex: 1,
  },
  historyCard: {
    backgroundColor: '#1f1f1f',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  entryText: {
    fontSize: 14,
    color: '#ddd',
  },
  noHistory: {
    textAlign: 'center',
    color: '#aaa',
    marginTop: 30,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  error: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});