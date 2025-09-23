import { StyleSheet, ActivityIndicator, View, Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';

import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';

export default function ModalScreen() {
  const spinAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    ).start();
  }, [spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <ThemedView style={styles.container}>
      <Animated.View style={[styles.accentCircle, { transform: [{ rotate: spin }] }]}>
        <ActivityIndicator size="large" color="#00b894" />
      </Animated.View>
      <ThemedText type="title" style={styles.loadingText}>Loading...</ThemedText>
      <ThemedText style={styles.subText}>Please wait while we get things ready for you.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: "#181d1b",
  },
  accentCircle: {
    backgroundColor: "#212824",
    borderColor: "#00b894",
    borderWidth: 3,
    borderRadius: 60,
    width: 74,
    height: 74,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: "#00b894",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    elevation: 5,
  },
  loadingText: {
    color: "#e8f6ef",
    marginBottom: 8,
    fontSize: 23,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  subText: {
    color: "#b5d6c6",
    fontSize: 15.5,
    textAlign: "center",
  },
});