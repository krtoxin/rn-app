import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Props = {
  onLogin: () => void;
} & NativeStackScreenProps<any, any>;

const API_URL = 'https://urban-capybara-jjqq5vr7prjq3q9q6-9000.app.github.dev/api/login';

export default function Login({ navigation, onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    console.log('API_URL =', API_URL);
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',

        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        await AsyncStorage.setItem('isLoggedIn', 'true');
        onLogin();
        navigation.replace('Program');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error, please try again.');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h2}>Login</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <TextInput
        style={styles.input}
        placeholder="Username"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Login</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.link}
        onPress={() => navigation.navigate('Register')}
        disabled={loading}
      >
        <Text style={{ color: '#00796b', textDecorationLine: 'underline' }}>
          Don't have an account? Register
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  h2: {
    color: '#000',
    marginBottom: 20,
    fontSize: 24,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    maxWidth: 350,
    padding: 10,
    marginVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f8f8f8',
  },
  button: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: '#00796b',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  link: {
    marginTop: 15,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
});
