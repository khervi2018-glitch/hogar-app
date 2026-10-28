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

// Color e icono para cada estado del job
const ESTADOS = {
  pendiente: { color: '#f59e0b', bg: '#fef3c7', label: 'Pendiente', icon: '⏳' },
  aceptado: { color: '#3b82f6', bg: '#dbeafe', label: 'Aceptado', icon: '👍' },
  en_progreso: { color: '#8b5cf6', bg: '#ede9fe', label: 'En progreso', icon: '🔧' },
  finalizado: { color: '#10b981', bg: '#d1fae5', label: 'Finalizado', icon: '✅' },
  cancelado: { color: '#ef4444', bg: '#fee2e2', label: 'Cancelado', icon: '❌' },
};

export default function MyJobsScreen({ navigation }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadJobs() {
    try {
      const data = await getMyJobs();
      setJobs(data);
    } catch (error) {
      console.log('Error cargando jobs:', error.response?.data ?? error.message);
    } finally {
      setLoading(false);
    }
  }

  // Recarga cada vez que la pantalla gana foco (ej: al volver de crear un job)
  useFocusEffect(
    useCallback(() => {
      loadJobs();
    }, []),
  );

  function renderJob({ item }) {
    const estado = ESTADOS[item.estado] ?? ESTADOS.pendiente;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
      >
        <View style={styles.cardTop}>
          <Text style={styles.category}>
            {item.categoria?.icono} {item.categoria?.nombre}
          </Text>
          <View style={[styles.badge, { backgroundColor: estado.bg }]}>
            <Text style={[styles.badgeText, { color: estado.color }]}>
              {estado.icon} {estado.label}
            </Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.descripcion}
        </Text>

        <Text style={styles.technician}>
          🛠️ {item.tecnico?.user?.nombre ?? 'Técnico'}
        </Text>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <FlatList
      data={jobs}
      keyExtractor={(item) => item.id}
      renderItem={renderJob}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={loadJobs} />
      }
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>
            Aún no tienes trabajos. ¡Busca un técnico y crea tu primera solicitud!
          </Text>
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
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  category: { fontSize: 15, fontWeight: '600' },
  badge: { borderRadius: 12, paddingVertical: 4, paddingHorizontal: 10 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  description: { fontSize: 14, color: '#444', marginBottom: 8 },
  technician: { fontSize: 13, color: '#666' },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyText: { fontSize: 16, color: '#666', textAlign: 'center' },
});