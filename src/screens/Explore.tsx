import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const tools = [
  {
    id: 'notes',
    name: 'Notes',
    icon: <FontAwesome5 name="sticky-note" size={40} color="#00b894" />,
    path: 'Notes',
  },
  {
    id: 'mood',
    name: 'Mood Tracker',
    icon: <FontAwesome5 name="chart-line" size={40} color="#00b894" />,
    path: 'MoodTracker',
  },
  {
    id: 'chatbot',
    name: 'AI Chatbot',
    icon: <FontAwesome5 name="robot" size={40} color="#00b894" />,
    path: 'Chatbot',
  },
  {
    id: 'sober',
    name: 'Sobriety Tracker',
    icon: <FontAwesome5 name="wine-glass-alt" size={40} color="#00b894" />,
    path: 'SoberTracker',
  },
];

export default function Explore() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore Tools</Text>
      <FlatList
        data={tools}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ marginTop: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate(item.path as never)}
            activeOpacity={0.8}
          >
            <View style={styles.icon}>{item.icon}</View>
            <Text style={styles.name}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
    color: '#fff',
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#1f1f1f',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    margin: 7,
    minWidth: 140,
    minHeight: 120,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  icon: {
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
});