import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Faltan datos', 'Ingresa tu email y contraseña');
      return;
    }
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      // Si funciona, la navegacion cambia sola (lo veras en App.js)
    } catch (error) {
      const msg =
        error.response?.status === 401
          ? 'Email o contraseña incorrectos'
          : 'No se pudo conectar con el servidor';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CHAMBA</Text>
      <Text style={styles.subtitle}>Encuentra quien lo haga por ti</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Ingresar</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity
        style={{ marginTop: 20, alignItems: 'center' }}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={{ color: '#2563eb', fontSize: 15 }}>
          ¿No tienes cuenta? Regístrate
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});