import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { getJobById, updateJobStatus } from '../services/jobsService';
import { createRating, getJobRatings } from '../services/ratingsService';
import { getUserIdFromToken } from '../utils/jwt';

const ESTADOS = {
  pendiente: { color: '#f59e0b', bg: '#fef3c7', label: '⏳ Pendiente' },
  aceptado: { color: '#3b82f6', bg: '#dbeafe', label: '👍 Aceptado' },
  en_progreso: { color: '#8b5cf6', bg: '#ede9fe', label: '🔧 En progreso' },
  finalizado: { color: '#10b981', bg: '#d1fae5', label: '✅ Finalizado' },
  cancelado: { color: '#ef4444', bg: '#fee2e2', label: '❌ Cancelado' },
};

export default function JobDetailScreen({ route, navigation }) {
  const { jobId } = route.params;

  const [job, setJob] = useState(null);
  const [userId, setUserId] = useState(null);
  const [yaCalifique, setYaCalifique] = useState(false);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  // Estado del formulario de calificacion
  const [puntaje, setPuntaje] = useState(0);
  const [comentario, setComentario] = useState('');

  async function loadJob() {
    setYaCalifique(false); // limpiar estado de un job anterior
    try {
      const token = await SecureStore.getItemAsync('token');
      const uid = getUserIdFromToken(token);
      setUserId(uid);

      const data = await getJobById(jobId);
      //console.log('Job abierto:', data.id, '| estado:', data.estado);
      setJob(data);

      if (data.estado === 'finalizado') {
        const ratings = await getJobRatings(jobId);
        setYaCalifique(ratings.some((r) => r.author?.id === uid));
        //console.log('Ratings del job:', JSON.stringify(ratings.map(r => ({ autor: r.author?.id })), null, 2));
        //console.log('Mi userId:', uid);
      } else {
        setYaCalifique(false); // resetear si el job no esta finalizado
      }
    } catch (error) {
      console.log('Error cargando job:', error.response?.data ?? error.message);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadJob();
    }, [jobId]),
  );

  async function cambiarEstado(nuevoEstado, confirmMsg) {
    Alert.alert('Confirmar', confirmMsg, [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí',
        onPress: async () => {
          setWorking(true);
          try {
            await updateJobStatus(jobId, nuevoEstado);
            await loadJob();
          } catch (error) {
            console.log(error.response?.data ?? error.message);
            Alert.alert('Error', 'No se pudo actualizar el estado');
          } finally {
            setWorking(false);
          }
        },
      },
    ]);
  }

  async function enviarCalificacion() {
    if (puntaje === 0) {
      Alert.alert('Falta el puntaje', 'Toca las estrellas para calificar');
      return;
    }
    setWorking(true);
    try {
      await createRating(jobId, puntaje, comentario.trim() || undefined);
      Alert.alert('¡Gracias! ⭐', 'Tu calificación fue registrada');
      setPuntaje(0);
      setComentario('');
      await loadJob();
    } catch (error) {
      console.log(error.response?.data ?? error.message);
      Alert.alert('Error', 'No se pudo enviar la calificación');
    } finally {
      setWorking(false);
    }
  }

  if (loading || !job) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const estado = ESTADOS[job.estado] ?? ESTADOS.pendiente;
  const soyCliente = userId === job.clienteId;
  const soyTecnico = userId === job.tecnico?.user?.id;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.badge, { backgroundColor: estado.bg }]}>
        <Text style={[styles.badgeText, { color: estado.color }]}>
          {estado.label}
        </Text>
      </View>

      <Text style={styles.category}>
        {job.categoria?.icono} {job.categoria?.nombre}
      </Text>
      <Text style={styles.description}>{job.descripcion}</Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoLine}>📍 {job.direccionTrabajo}</Text>
        <Text style={styles.infoLine}>👤 Cliente: {job.cliente?.nombre}</Text>
        <Text style={styles.infoLine}>
          🛠️ Técnico: {job.tecnico?.user?.nombre}
        </Text>
      </View>
       {/* Chat disponible cuando el trabajo esta activo */}
      {['aceptado', 'en_progreso'].includes(job.estado) && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#10b981' }]}
          onPress={() =>
            navigation.navigate('Chat', {
              jobId: job.id,
              otherName: soyCliente
                ? job.tecnico?.user?.nombre
                : job.cliente?.nombre,
            })
          }
        >
          <Text style={styles.actionText}>💬 Abrir chat</Text>
        </TouchableOpacity>
      )}

      {/* Acciones del TECNICO segun el estado */}
      {soyTecnico && job.estado === 'pendiente' && (
        <TouchableOpacity
          style={styles.actionButton}
          disabled={working}
          onPress={() => cambiarEstado('aceptado', '¿Aceptar este trabajo?')}
        >
          <Text style={styles.actionText}>👍 Aceptar trabajo</Text>
        </TouchableOpacity>
      )}
      {soyTecnico && job.estado === 'aceptado' && (
        <TouchableOpacity
          style={styles.actionButton}
          disabled={working}
          onPress={() => cambiarEstado('en_progreso', '¿Iniciar el trabajo?')}
        >
          <Text style={styles.actionText}>🔧 Iniciar trabajo</Text>
        </TouchableOpacity>
      )}
      {soyTecnico && job.estado === 'en_progreso' && (
        <TouchableOpacity
          style={styles.actionButton}
          disabled={working}
          onPress={() => cambiarEstado('finalizado', '¿Marcar como finalizado?')}
        >
          <Text style={styles.actionText}>✅ Finalizar trabajo</Text>
        </TouchableOpacity>
      )}

      {/* El CLIENTE puede cancelar mientras este pendiente */}
      {soyCliente && job.estado === 'pendiente' && (
        <TouchableOpacity
          style={[styles.actionButton, styles.cancelButton]}
          disabled={working}
          onPress={() => cambiarEstado('cancelado', '¿Cancelar esta solicitud?')}
        >
          <Text style={styles.actionText}>❌ Cancelar solicitud</Text>
        </TouchableOpacity>
      )}

      {/* Calificacion: solo con el job finalizado y si aun no califique */}
      {job.estado === 'finalizado' && !yaCalifique && (
        <View style={styles.ratingBox}>
          <Text style={styles.ratingTitle}>
            Califica a {soyCliente ? job.tecnico?.user?.nombre : job.cliente?.nombre}
          </Text>

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity key={n} onPress={() => setPuntaje(n)}>
                <Text style={styles.star}>{n <= puntaje ? '⭐' : '☆'}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.commentInput}
            placeholder="Comentario (opcional)"
            value={comentario}
            onChangeText={setComentario}
            multiline
          />

          <TouchableOpacity
            style={styles.actionButton}
            disabled={working}
            onPress={enviarCalificacion}
          >
            {working ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionText}>Enviar calificación</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {job.estado === 'finalizado' && yaCalifique && (
        <View style={styles.thanksBox}>
          <Text style={styles.thanksText}>⭐ Ya calificaste este trabajo</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  badgeText: { fontSize: 14, fontWeight: '600' },
  category: { fontSize: 20, fontWeight: 'bold', marginBottom: 6 },
  description: { fontSize: 15, color: '#444', marginBottom: 16 },
  infoBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
  },
  infoLine: { fontSize: 14, color: '#333', marginBottom: 6 },
  actionButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  cancelButton: { backgroundColor: '#ef4444' },
  actionText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  ratingBox: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
    marginTop: 10,
  },
  ratingTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 12 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 14 },
  star: { fontSize: 38, marginHorizontal: 6 },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  thanksBox: {
    backgroundColor: '#d1fae5',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  thanksText: { color: '#065f46', fontWeight: '600' },
});