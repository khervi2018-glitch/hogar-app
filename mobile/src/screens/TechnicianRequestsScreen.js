import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getMyJobs } from '../services/jobsService';

export default function TechnicianRequestsScreen({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const all = await getMyJobs('tecnico');
      // Solo los pendientes (esperando que el tecnico acepte)
      setRequests(all.filter((j) => j.estado === 'pendiente'));
    } catch (e) {
      console.log('Error solicitudes:', e.response?.data ?? e.message);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  function renderItem({ item }) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
      >
        <Text style={styles.category}>
          {item.categoria?.icono} {item.categoria?.nombre}
        </Text>
        <Text style={styles.desc} numberOfLines={2}>{item.descripcion}</Text>
        <Text style={styles.client}>👤 {item.cliente?.nombre}</Text>
        <Text style={styles.address}>📍 {item.direccionTrabajo}</Text>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <FlatList
      data={requests}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.emptyText}>No tienes solicitudes nuevas</Text>
          <Text style={styles.emptySub}>Aquí llegarán los trabajos que te soliciten</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, flexGrow: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  category: { fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  desc: { fontSize: 14, color: '#444', marginBottom: 8 },
  client: { fontSize: 13, color: '#666', marginBottom: 2 },
  address: { fontSize: 13, color: '#666' },
  emptyIcon: { fontSize: 44, marginBottom: 10 },
  emptyText: { fontSize: 17, fontWeight: '600', color: '#333' },
  emptySub: { fontSize: 14, color: '#888', marginTop: 6, textAlign: 'center' },
});