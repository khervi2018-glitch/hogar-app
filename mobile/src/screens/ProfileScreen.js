import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { signOut, mode, setMode, isTechnician } = useAuth();

  function switchToTechnician() {
    if (!isTechnician) {
      Alert.alert(
        'Aún no eres técnico',
        'Primero crea tu perfil de técnico para poder recibir trabajos.',
      );
      return;
    }
    setMode('tecnico');
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>👤</Text>
      </View>

      <View style={[styles.modeBadge, mode === 'tecnico' ? styles.modeTec : styles.modeCli]}>
        <Text style={styles.modeText}>
          Modo {mode === 'tecnico' ? 'Técnico 🔧' : 'Cliente 🏠'}
        </Text>
      </View>

      {/* Switch de modo */}
      {mode === 'cliente' ? (
        <TouchableOpacity style={styles.option} onPress={switchToTechnician}>
          <Text style={styles.optionText}>🔧  Cambiar a modo Técnico</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.option} onPress={() => setMode('cliente')}>
          <Text style={styles.optionText}>🏠  Cambiar a modo Cliente</Text>
        </TouchableOpacity>
      )}

      {/* Convertirse en tecnico (solo si aun no lo es) */}
      {!isTechnician && (
        <TouchableOpacity
          style={styles.option}
          onPress={() => navigation.navigate('BecomeTechnician')}
        >
          <Text style={styles.optionText}>🛠️  Convertirme en técnico</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.logout} onPress={signOut}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#e5edff',
    justifyContent: 'center', alignItems: 'center',
    marginTop: 20, marginBottom: 12,
  },
  avatarText: { fontSize: 40 },
  modeBadge: { borderRadius: 20, paddingVertical: 6, paddingHorizontal: 16, marginBottom: 28 },
  modeCli: { backgroundColor: '#dbeafe' },
  modeTec: { backgroundColor: '#d1fae5' },
  modeText: { fontWeight: '600', color: '#333' },
  option: {
    width: '100%', backgroundColor: '#f3f4f6',
    borderRadius: 10, padding: 16, marginBottom: 12,
  },
  optionText: { fontSize: 16, color: '#333' },
  logout: {
    width: '100%', backgroundColor: '#ef4444',
    borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 20,
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});