import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';

const PALETTE = {
  darkBg: '#181d1b',
  cardBg: '#212824',
  cardBorder: '#2b3830',
  accent: '#00b894',
  accentSoft: '#009f7a',
  textMain: '#e8f6ef',
  textSecondary: '#b5d6c6',
  secondary: '#2c4037',
};

type ChatbotNavigationProp = StackNavigationProp<RootStackParamList, 'Chatbot'>;

type Message = {
  role: 'user' | 'psychologist';
  content: string;
};

export default function Chatbot() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<ChatbotNavigationProp>();
  const [username, setUsername] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    (async () => {
      const userStr = await AsyncStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user) {
        setUsername(null);
        return;
      }
      setUsername(user.username);

      const savedMessagesStr = await AsyncStorage.getItem(`chatHistory_${user.username}`);
      const savedMessages: Message[] = savedMessagesStr
        ? JSON.parse(savedMessagesStr)
        : [
            {
              role: 'psychologist',
              content: 'Hello! I’m here to help you. How are you feeling today?',
            },
          ];
      setMessages(savedMessages);
    })();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const saveToLocalStorage = async (updatedMessages: Message[]) => {
    if (username) {
      await AsyncStorage.setItem(`chatHistory_${username}`, JSON.stringify(updatedMessages));
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !username) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    await saveToLocalStorage(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      let botContent = '';
      if (input.toLowerCase().includes('sad') || input.toLowerCase().includes('depressed')) {
        botContent =
          "I'm sorry you're feeling this way. Can you tell me more about what's troubling you?";
      } else if (input.toLowerCase().includes('happy')) {
        botContent = "That's wonderful to hear! What's making you feel happy today?";
      } else {
        botContent = "I'm here to listen. Please tell me more.";
      }

      const botResponse: Message = {
        role: 'psychologist',
        content: botContent,
      };
      const finalMessages = [...updatedMessages, botResponse];
      setMessages(finalMessages);
      await saveToLocalStorage(finalMessages);
    } catch (error) {
      const errorMessage: Message = {
        role: 'psychologist',
        content: "Something went wrong. Let's try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
      await saveToLocalStorage([...messages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!username) return;
    const initialMessage: Message = {
      role: 'psychologist',
      content: 'Hello! I’m here to help you. How are you feeling today?',
    };
    await AsyncStorage.setItem(`chatHistory_${username}`, JSON.stringify([initialMessage]));
    setMessages([initialMessage]);
  };

  if (!username) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.error}>User not logged in</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: PALETTE.darkBg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerIconBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <FontAwesome5 name="arrow-left" size={22} color={PALETTE.accent} />
        </TouchableOpacity>
        <Text style={styles.title}>AI Psychologist</Text>
        <TouchableOpacity
          onPress={clearHistory}
          style={styles.headerIconBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <FontAwesome5 name="trash" size={20} color={PALETTE.accent} />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.chatWindow}
        ref={scrollRef}
        contentContainerStyle={{ paddingBottom: 92, paddingTop: 8, alignItems: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[styles.message, msg.role === 'user' ? styles.userMessage : styles.botMessage]}
          >
            <Text style={{ flexShrink: 1 }}>
              <Text style={styles.msgLabel}>{msg.role === 'user' ? 'You' : 'Psychologist'}:</Text>
              <Text style={styles.msgText}> {msg.content}</Text>
            </Text>
          </View>
        ))}
        {loading && (
          <View style={[styles.message, styles.botMessage]}>
            <ActivityIndicator color={PALETTE.accent} size="small" />
            <Text style={{ color: PALETTE.accent, marginLeft: 8, fontWeight: '600' }}>
              Thinking...
            </Text>
          </View>
        )}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Share your thoughts here…"
          placeholderTextColor={PALETTE.textSecondary}
          onSubmitEditing={sendMessage}
          editable={!loading}
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={loading}>
          <FontAwesome5 name="paper-plane" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 14,
    backgroundColor: '#181d1b',
    borderBottomWidth: 1,
    borderBottomColor: '#232b27',
    justifyContent: 'space-between',
  },
  headerIconBtn: {
    padding: 7,
    borderRadius: 9,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: PALETTE.textMain,
    letterSpacing: 0.7,
  },
  chatWindow: {
    flex: 1,
    backgroundColor: PALETTE.darkBg,
    width: '100%',
    paddingHorizontal: 0,
  },
  message: {
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 16,
    marginBottom: 12,
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: PALETTE.accent,
    borderTopRightRadius: 5,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: PALETTE.cardBg,
    borderTopLeftRadius: 5,
    borderColor: PALETTE.cardBorder,
    borderWidth: 1,
  },
  msgLabel: {
    fontWeight: 'bold',
    color: PALETTE.textMain,
    fontSize: 15.5,
  },
  msgText: {
    color: PALETTE.textMain,
    fontSize: 15.5,
    fontWeight: '400',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 26 : 18,
    backgroundColor: '#181d1b',
    borderTopWidth: 1,
    borderTopColor: '#232b27',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: PALETTE.cardBg,
    color: PALETTE.textMain,
    fontSize: 16,
    marginRight: 10,
    borderWidth: 1,
    borderColor: PALETTE.cardBorder,
  },
  sendButton: {
    backgroundColor: PALETTE.accent,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
