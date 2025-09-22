import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome5 } from "@expo/vector-icons";
import axios from "axios";
import { RootStackParamList } from "../navigation/types";

type ChatbotNavigationProp = StackNavigationProp<RootStackParamList, "Chatbot">;

type Message = {
  role: "user" | "psychologist";
  content: string;
};

export default function Chatbot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<ChatbotNavigationProp>();
  const [username, setUsername] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    (async () => {
      const userStr = await AsyncStorage.getItem("user");
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
              role: "psychologist",
              content: "Hello! I’m here to help you. How are you feeling today?",
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
      role: "user",
      content: input,
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    await saveToLocalStorage(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      // You can swap this with your own API as needed:
      // const API_URL = "https://api-inference.huggingface.co/models/tiiuae/falcon-7b-instruct";
      // const headers = {
      //   Authorization: `Bearer YOUR_HF_API_KEY`,
      //   "Content-Type": "application/json",
      // };
      // const payload = {
      //   inputs: `You are an empathetic and professional psychologist who responds briefly and thoughtfully.\nUser: ${input}\nPsychologist:`,
      // };
      // const response = await axios.post(API_URL, payload, { headers });
      // let botContent = response.data?.[0]?.generated_text || "";
      // botContent = botContent.split("Psychologist:")[1]?.split("User:")[0]?.trim() || "I'm here to listen. Please tell me more.";

      // For development: simple empathy mock AI (remove if using real API)
      let botContent = "";
      if (input.toLowerCase().includes("sad") || input.toLowerCase().includes("depressed")) {
        botContent = "I'm sorry you're feeling this way. Can you tell me more about what's troubling you?";
      } else if (input.toLowerCase().includes("happy")) {
        botContent = "That's wonderful to hear! What's making you feel happy today?";
      } else {
        botContent = "I'm here to listen. Please tell me more.";
      }

      const botResponse: Message = {
        role: "psychologist",
        content: botContent,
      };
      const finalMessages = [...updatedMessages, botResponse];
      setMessages(finalMessages);
      await saveToLocalStorage(finalMessages);
    } catch (error) {
      const errorMessage: Message = {
        role: "psychologist",
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
      role: "psychologist",
      content: "Hello! I’m here to help you. How are you feeling today?",
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
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#121212" }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Explore" as never)}>
          <FontAwesome5 name="arrow-left" size={20} color="#00b894" style={styles.icon} />
        </TouchableOpacity>
        <Text style={styles.title}>AI Psychologist</Text>
        <TouchableOpacity onPress={clearHistory}>
          <FontAwesome5 name="trash" size={20} color="#00b894" style={styles.icon} />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.chatWindow}
        ref={scrollRef}
        contentContainerStyle={{ paddingBottom: 80 }}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.message,
              msg.role === "user" ? styles.userMessage : styles.botMessage,
            ]}
          >
            <Text style={{ fontWeight: "bold" }}>
              {msg.role === "user" ? "You" : "Psychologist"}:
            </Text>
            <Text> {msg.content}</Text>
          </View>
        ))}
        {loading && (
          <View style={styles.loading}>
            <ActivityIndicator color="#00b894" size="small" />
            <Text style={{ color: "#00b894", marginLeft: 5 }}>The psychologist is thinking...</Text>
          </View>
        )}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Share your thoughts here..."
          placeholderTextColor="#888"
          onSubmitEditing={sendMessage}
          editable={!loading}
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={loading}>
          <FontAwesome5 name="paper-plane" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#1f1f1f",
  },
  icon: {
    marginHorizontal: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  chatWindow: {
    flex: 1,
    backgroundColor: "#000",
    padding: 10,
  },
  message: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    maxWidth: "75%",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#00b894",
    color: "#fff",
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#333",
    color: "#fff",
  },
  loading: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#1f1f1f",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#333",
    color: "#fff",
    fontSize: 16,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#00b894",
    borderRadius: 20,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
});