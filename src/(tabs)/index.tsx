import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const PALETTE = {
  darkBg: '#181d1b',
  cardBg: '#212824',
  accent: '#00b894',
  textMain: '#e8f6ef',
  textSecondary: '#b5d6c6',
};

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <FontAwesome5 name="leaf" size={36} color={PALETTE.accent} />
      </View>
      <Text style={styles.title}>Welcome!</Text>
      <Text style={styles.subtitle}>Your wellness journey starts here.</Text>
      <Text style={styles.muted}>
        Use the tabs below to track your progress, practice mindfulness, and challenge yourself
        daily.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.darkBg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoCircle: {
    backgroundColor: PALETTE.cardBg,
    borderRadius: 44,
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: PALETTE.accent,
    shadowColor: PALETTE.accent,
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: PALETTE.textMain,
    marginBottom: 8,
    letterSpacing: 1,
    textAlign: 'center',
    width: '100%',
  },
  subtitle: {
    fontSize: 18,
    color: PALETTE.accent,
    marginBottom: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
    textAlign: 'center',
    width: '100%',
  },
  muted: {
    fontSize: 15.5,
    color: PALETTE.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    width: '100%',
  },
});
