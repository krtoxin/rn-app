import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';

const PALETTE = {
  darkBg: "#181d1b",
  cardBg: "#212824",
  cardBorder: "#2b3830",
  accent: "#00b894",
  textMain: "#e8f6ef",
  textSecondary: "#b5d6c6",
};

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
      setHistory(storedHistory.reverse()); 
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
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <FontAwesome5 name="arrow-left" size={22} color={PALETTE.accent} />
        </TouchableOpacity>
        <Text style={styles.title}>Your Activity History</Text>
        <View style={{ width: 22 }} /> 
      </View>

      <FlatList
        data={history}
        keyExtractor={(_, idx) => idx.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator
        renderItem={({ item }) => (
          <View style={styles.historyCard}>
            <Text style={styles.entryAction}>{item.action}</Text>
            <View style={styles.entryMetaRow}>
              <FontAwesome5 name="tools" size={13} color={PALETTE.accent} style={{ marginRight: 7 }} />
              <Text style={styles.entryMeta}>{item.tool}</Text>
              <FontAwesome5 name="clock" size={12} color={PALETTE.textSecondary} style={{ marginLeft: 14, marginRight: 5 }} />
              <Text style={styles.entryDate}>
                {typeof item.timestamp === 'string'
                  ? new Date(item.timestamp).toLocaleString()
                  : new Date(item.timestamp).toLocaleString()}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.darkBg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: PALETTE.darkBg,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "web" ? 27 : 18,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.cardBorder,
    marginBottom: 0,
  },
  backButton: {
    padding: 7,
    borderRadius: 9,
  },
  title: {
    fontSize: 21,
    fontWeight: "bold",
    color: PALETTE.textMain,
    letterSpacing: 0.5,
    textAlign: "center",
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 10, 
    paddingTop: 18,
    paddingBottom: 24,
  },
  historyCard: {
    backgroundColor: PALETTE.cardBg,
    borderRadius: 13,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: PALETTE.cardBorder,
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  entryAction: {
    color: PALETTE.textMain,
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 7,
    letterSpacing: 0.2,
  },
  entryMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  entryMeta: {
    color: PALETTE.textSecondary,
    fontWeight: "600",
    fontSize: 14.2,
  },
  entryDate: {
    color: PALETTE.textSecondary,
    fontSize: 13.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: PALETTE.darkBg,
  },
  error: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
});