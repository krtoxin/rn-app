import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

type ProgramNavigationProp = StackNavigationProp<RootStackParamList, 'Program'>;

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

export default function Program() {
  const navigation = useNavigation<ProgramNavigationProp>();
  const [completedTasks, setCompletedTasks] = useState<{ [key: string]: boolean }>({});
  const [username, setUsername] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const isFocused = useIsFocused();

  useEffect(() => {
    (async () => {
      const userStr = await AsyncStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      setUsername(user?.username);

      if (user?.username) {
        const today = new Date().toDateString();
        const programDateKey = `programDate_${user.username}`;
        const completedTasksKey = `completedTasks_${user.username}`;

        const storedDate = await AsyncStorage.getItem(programDateKey);
        if (storedDate !== today) {
          await AsyncStorage.setItem(programDateKey, today);
          await AsyncStorage.removeItem(completedTasksKey);
          setCompletedTasks({});
        } else {
          const tasksStr = await AsyncStorage.getItem(completedTasksKey);
          setCompletedTasks(tasksStr ? JSON.parse(tasksStr) : {});
        }
      }
    })();
  }, [isFocused]);

  const cardMaxWidth = width > 600 ? 500 : '100%';
  const isWide = width > 600;

  const clearTodayData = async () => {
    if (!username) return;
    const programDateKey = `programDate_${username}`;
    const completedTasksKey = `completedTasks_${username}`;
    const challengeCompletedKey = `challengeCompleted_${username}`;
    const challengeDateKey = `challengeDate_${username}`;
    await AsyncStorage.removeItem(completedTasksKey);
    await AsyncStorage.removeItem(programDateKey);
    await AsyncStorage.removeItem(challengeCompletedKey);
    await AsyncStorage.removeItem(challengeDateKey);
    setCompletedTasks({});
    Alert.alert('Success', 'All data for today has been cleared!');
  };

  if (!username) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.error}>User not logged in</Text>
      </View>
    );
  }

  function Card({
    icon,
    iconColor,
    heading,
    text,
    completed,
    onPress,
    actionLabel,
    testID,
  }: {
    icon: string;
    iconColor?: string;
    heading: string;
    text: string;
    completed: boolean;
    onPress: () => void;
    actionLabel: string;
    testID?: string;
  }) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          { maxWidth: cardMaxWidth, width: '100%' },
          completed && styles.cardCompleted,
          pressed && !completed && styles.cardPressed,
        ]}
        onPress={completed ? undefined : onPress}
        android_ripple={!completed ? { color: PALETTE.accentSoft + '22' } : undefined}
        disabled={completed}
        testID={testID}
      >
        <View style={styles.cardLeft}>
          <View style={[styles.iconCircle, completed && styles.iconCircleCompleted]}>
            <FontAwesome5 name={icon} size={27} color={iconColor || PALETTE.accent} />
          </View>
        </View>
        <View style={styles.cardContentRow}>
          <View style={styles.cardContent}>
            <Text
              style={[
                styles.heading,
                completed && { color: PALETTE.completed },
                isWide && { fontSize: 21 },
              ]}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {heading}
            </Text>
            <Text
              style={[
                styles.text,
                completed && { color: PALETTE.textMuted },
                isWide && { fontSize: 15.5 },
              ]}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              ellipsizeMode="tail"
            >
              {text}
            </Text>
          </View>
          <View style={styles.cardAction}>
            {completed ? (
              <FontAwesome5
                name="check-circle"
                size={22}
                color={PALETTE.completed}
                style={styles.completedCheckOnly}
              />
            ) : (
              <View style={styles.actionWrap}>
                <Text style={styles.actionText}>{actionLabel}</Text>
                <FontAwesome5 name="arrow-right" size={15} color={PALETTE.accent} />
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 56, alignItems: 'center' }}
    >
      <Text
        style={[styles.title, isWide && { fontSize: 32, marginTop: 30 }]}
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
      >
        Today's Program
      </Text>

      <Card
        icon="pencil-alt"
        heading="Reflect on your day"
        text="Write about how you feel today."
        completed={!!completedTasks.journal}
        onPress={() => navigation.navigate('Journal')}
        actionLabel="Start"
        testID="journal-card"
      />

      <Card
        icon="lungs"
        heading="Deep Breathing Exercise"
        text="Take a 5-minute breathing session."
        completed={!!completedTasks.breathing}
        onPress={() => navigation.navigate('Breathing')}
        actionLabel="Start"
        testID="breathing-card"
      />

      <Card
        icon="trophy"
        heading="Daily Challenge"
        text="Complete today's small challenge."
        completed={!!completedTasks.challenge}
        onPress={() => navigation.navigate('Challenges')}
        actionLabel="Start"
        testID="challenge-card"
      />

      <Pressable
        style={({ pressed }) => [
          styles.clearButton,
          { maxWidth: cardMaxWidth, width: '100%' },
          pressed && styles.clearButtonPressed,
        ]}
        onPress={clearTodayData}
        testID="clear-today"
      >
        <FontAwesome5
          name="redo-alt"
          size={18}
          color={PALETTE.textMuted}
          style={{ marginRight: 8 }}
        />
        <Text style={styles.clearButtonText}>Clear Today's Data</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.darkBg,
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'web' ? 28 : 10,
  },
  title: {
    fontSize: 26,
    textAlign: 'center',
    marginBottom: 26,
    fontWeight: '700',
    color: PALETTE.textMain,
    letterSpacing: 1,
    marginTop: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.cardBg,
    borderRadius: 18,
    marginBottom: 24,
    paddingVertical: 22,
    paddingHorizontal: 22,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 5,
    borderLeftWidth: 5,
    borderLeftColor: 'transparent',
    borderWidth: 1,
    borderColor: PALETTE.cardBorder,
    opacity: 1,
    minHeight: 90,
    transitionDuration: '200ms',
  },
  cardPressed: {
    backgroundColor: PALETTE.secondary,
    borderColor: PALETTE.accentSoft + '55',
    elevation: 10,
    shadowOpacity: 0.18,
    transform: [{ scale: 0.99 }],
  },
  cardCompleted: {
    borderLeftColor: PALETTE.completed,
    backgroundColor: '#1b241e',
    opacity: 0.92,
  },
  cardLeft: {
    marginRight: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    backgroundColor: PALETTE.secondary,
    borderRadius: 50,
    width: 54,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PALETTE.accent,
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 7,
    elevation: 2,
  },
  iconCircleCompleted: {
    backgroundColor: '#16301b',
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
    minWidth: 34,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 8,
  },
  actionWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1d3328',
    borderRadius: 7,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  actionText: {
    color: PALETTE.accent,
    fontWeight: '700',
    fontSize: 14,
    marginRight: 7,
    letterSpacing: 0.2,
  },
  completedCheckOnly: {
    marginLeft: 3,
  },
  clearButton: {
    backgroundColor: PALETTE.clearBtn,
    borderRadius: 11,
    paddingVertical: 13,
    paddingHorizontal: 14,
    alignItems: 'center',
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 7,
    minWidth: 160,
    justifyContent: 'center',
    transitionDuration: '200ms',
    marginBottom: 17,
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
    letterSpacing: 0.18,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PALETTE.darkBg,
  },
  error: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});
