import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ChatsPlaceholderScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>💬</Text>
      <Text style={styles.text}>Aquí verás tus conversaciones</Text>
      <Text style={styles.sub}>Pronto activaremos esta sección</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  icon: { fontSize: 48, marginBottom: 12 },
  text: { fontSize: 18, fontWeight: '600', color: '#333' },
  sub: { fontSize: 14, color: '#888', marginTop: 6 },
});