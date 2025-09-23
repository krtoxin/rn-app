import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, Dimensions, Platform } from 'react-native';

const PALETTE = {
  darkBg: "#181d1b",
  cardBg: "#212824",
  cardBorder: "#2b3830",
  accent: "#00b894",
  accentSoft: "#009f7a",
  accentLight: "#b2f5d6",
  secondary: "#2c4037",
  textMain: "#e8f6ef",
  textSecondary: "#b5d6c6",
  textMuted: "#7ea899",
};

const tools = [
  {
    id: 'notes',
    name: 'Notes',
    icon: 'sticky-note',
    path: 'Notes',
  },
  {
    id: 'mood',
    name: 'Mood Tracker',
    icon: 'chart-line',
    path: 'MoodTracker',
  },
  {
    id: 'chatbot',
    name: 'AI Chatbot',
    icon: 'robot',
    path: 'Chatbot',
  },
  {
    id: 'sober',
    name: 'Sobriety Tracker',
    icon: 'wine-glass-alt',
    path: 'SoberTracker',
  },
];

const CARD_MARGIN = 12;
const CARD_COLUMNS = 2;
const contentWidth = Dimensions.get('window').width - 24;
const CARD_SIZE = (contentWidth - CARD_MARGIN * (CARD_COLUMNS - 1)) / CARD_COLUMNS;

export default function Explore() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore Tools</Text>
      <FlatList
        data={tools}
        numColumns={CARD_COLUMNS}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.flatListContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { width: CARD_SIZE, minHeight: CARD_SIZE }]}
            onPress={() => navigation.navigate(item.path as never)}
            activeOpacity={0.85}
          >
            <View style={styles.iconCircle}>
              <FontAwesome5 name={item.icon as any} size={28} color={PALETTE.accent} />
            </View>
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
    alignItems: "center", 
    backgroundColor: PALETTE.darkBg,
    paddingHorizontal: 0,
    paddingTop: Platform.OS === 'web' ? 28 : 10,
  },
  title: {
    fontSize: 25,
    textAlign: "center",
    marginBottom: 0,
    fontWeight: "700",
    color: PALETTE.textMain,
    letterSpacing: 1,
    marginTop: 10,
    width: "100%",
  },
  flatListContent: {
    marginTop: 22,
    paddingBottom: 40,
    alignItems: "center", 
    width: "100%",
  },
  row: {
    justifyContent: "center", 
    width: "100%",
    marginBottom: CARD_MARGIN,
  },
  card: {
    backgroundColor: PALETTE.cardBg,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: CARD_MARGIN / 2,
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: PALETTE.cardBorder,
    paddingVertical: 24,
    paddingHorizontal: 10,
    minWidth: 130,
    maxWidth: 210,
    transitionDuration: "200ms"
  },
  iconCircle: {
    backgroundColor: PALETTE.secondary,
    borderRadius: 50,
    width: 54,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: PALETTE.accent,
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 7,
    elevation: 2,
    marginBottom: 14,
  },
  name: {
    fontSize: 15.5,
    fontWeight: '700',
    color: PALETTE.textMain,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});