import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { register } from '../services/authService';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { signIn } = useAuth();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleRegister() {
    if (!nombre || !email || !password) {
      Alert.alert('Faltan datos', 'Nombre, email y contraseña son obligatorios');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Contraseña corta', 'Usa al menos 6 caracteres');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        password,
        telefono: telefono.trim(),
      });
      // Registro exitoso → login automatico para entrar directo
      await signIn(email.trim().toLowerCase(), password);
    } catch (error) {
      const status = error.response?.status;
      const msg =
        status === 409
          ? 'Ese email ya está registrado'
          : status === 400
          ? 'Revisa los datos ingresados'
          : 'No se pudo crear la cuenta. Intenta de nuevo.';
      Alert.alert('Error', msg);
      console.log('Error registro:', error.response?.data ?? error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Crear cuenta</Text>
      <Text style={styles.subtitle}>Únete a CHAMBA</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        value={nombre}
        onChangeText={setNombre}
      />
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
        placeholder="Teléfono (opcional)"
        value={telefono}
        onChangeText={setTelefono}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña (mín. 6 caracteres)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Crear cuenta</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 28 },
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
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  linkButton: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#2563eb', fontSize: 15 },
});