import React, { useState, useCallback, useLayoutEffect, useRef } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { getJobById, updateJobStatus } from '../services/jobsService';
import { createRating, getJobRatings } from '../services/ratingsService';
import { getUserIdFromToken } from '../utils/jwt';
import { useKeyboardHeight } from '../hooks/useKeyboardHeight';
import { colors, spacing, radius, fontSize } from '../theme/colors';
import { getCategoryIcon } from '../theme/categoryIcons';

const ESTADOS = {
  pendiente:   { label: 'Pendiente',   icon: 'time-outline',             color: colors.warning, bg: colors.warningSoft },
  aceptado:    { label: 'Aceptado',    icon: 'thumbs-up-outline',        color: colors.info,    bg: colors.infoSoft },
  en_progreso: { label: 'En progreso', icon: 'construct-outline',        color: '#8b5cf6',      bg: '#ede9fe' },
  finalizado:  { label: 'Finalizado',  icon: 'checkmark-circle-outline', color: colors.success, bg: colors.successSoft },
  cancelado:   { label: 'Cancelado',   icon: 'close-circle-outline',     color: colors.danger,  bg: colors.dangerSoft },
};

// Pasos de la barra de progreso
const PASOS = [
  { estado: 'pendiente',   label: 'Solicitado' },
  { estado: 'aceptado',    label: 'Aceptado' },
  { estado: 'en_progreso', label: 'En curso' },
  { estado: 'finalizado',  label: 'Listo' },
];

function formatearFecha(valor) {
  if (!valor) return null;
  const fecha = new Date(valor);
  if (isNaN(fecha.getTime())) return null;
  return fecha.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function JobDetailScreen({ route, navigation }) {
  const { jobId } = route.params;
  const keyboardHeight = useKeyboardHeight();
  const scrollRef = useRef(null);

  const [job, setJob] = useState(null);
  const [userId, setUserId] = useState(null);
  const [yaCalifique, setYaCalifique] = useState(false);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  // Estado del formulario de calificacion
  const [puntaje, setPuntaje] = useState(0);
  const [comentario, setComentario] = useState('');

  // Barra superior naranja
  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Detalle del trabajo',
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: colors.white,
      headerShadowVisible: false,
    });
  }, [navigation]);

  async function loadJob() {
    setYaCalifique(false); // limpiar estado de un job anterior
    try {
      const token = await SecureStore.getItemAsync('token');
      const uid = getUserIdFromToken(token);
      setUserId(uid);

      const data = await getJobById(jobId);
      setJob(data);

      if (data.estado === 'finalizado') {
        const ratings = await getJobRatings(jobId);
        setYaCalifique(ratings.some((r) => r.author?.id === uid));
      } else {
        setYaCalifique(false);
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
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const estado = ESTADOS[job.estado] ?? ESTADOS.pendiente;
  const soyCliente = userId === job.clienteId;
  const soyTecnico = userId === job.tecnico?.user?.id;
  const otroNombre = soyCliente ? job.tecnico?.user?.nombre : job.cliente?.nombre;
  const { icon: catIcon, color: catColor } = getCategoryIcon(job.categoria?.nombre);
  const fecha = formatearFecha(job.createdAt);
  const precio = job.precioAcordado != null ? Number(job.precioAcordado) : null;
  const pasoActual = PASOS.findIndex((p) => p.estado === job.estado);

  // Accion principal del tecnico segun el estado
  let accionTecnico = null;
  if (soyTecnico && job.estado === 'pendiente') {
    accionTecnico = { estado: 'aceptado', msg: '¿Aceptar este trabajo?', label: 'Aceptar trabajo', icon: 'thumbs-up' };
  } else if (soyTecnico && job.estado === 'aceptado') {
    accionTecnico = { estado: 'en_progreso', msg: '¿Iniciar el trabajo?', label: 'Iniciar trabajo', icon: 'construct' };
  } else if (soyTecnico && job.estado === 'en_progreso') {
    accionTecnico = { estado: 'finalizado', msg: '¿Marcar como finalizado?', label: 'Finalizar trabajo', icon: 'checkmark-circle' };
  }

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: spacing.xl + keyboardHeight }]}
      keyboardShouldPersistTaps="handled"
    >
      {/* ---------- Tarjeta principal ---------- */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={[styles.catIcon, { backgroundColor: catColor + '1A' }]}>
            <Ionicons name={catIcon} size={24} color={catColor} />
          </View>
          <Text style={styles.category} numberOfLines={1}>
            {job.categoria?.nombre ?? 'Servicio'}
          </Text>
          <View style={[styles.badge, { backgroundColor: estado.bg }]}>
            <Ionicons name={estado.icon} size={14} color={estado.color} />
            <Text style={[styles.badgeText, { color: estado.color }]}>{estado.label}</Text>
          </View>
        </View>
        <Text style={styles.description}>{job.descripcion}</Text>
      </View>

      {/* ---------- Progreso ---------- */}
      {job.estado === 'cancelado' ? (
        <View style={styles.cancelledBox}>
          <Ionicons name="close-circle" size={20} color={colors.danger} />
          <Text style={styles.cancelledText}>Este trabajo fue cancelado.</Text>
        </View>
      ) : (
        <View style={styles.card}>
          <View style={styles.stepsRow}>
            {PASOS.map((paso, i) => {
              const hecho = i <= pasoActual;
              return (
                <React.Fragment key={paso.estado}>
                  <View style={styles.step}>
                    <View style={[styles.stepDot, hecho && styles.stepDotDone]}>
                      {hecho && <Ionicons name="checkmark" size={14} color={colors.white} />}
                    </View>
                    <Text style={[styles.stepLabel, hecho && styles.stepLabelDone]}>
                      {paso.label}
                    </Text>
                  </View>
                  {i < PASOS.length - 1 && (
                    <View style={[styles.stepLine, i < pasoActual && styles.stepLineDone]} />
                  )}
                </React.Fragment>
              );
            })}
          </View>
        </View>
      )}

      {/* ---------- Datos ---------- */}
      <View style={styles.card}>
        <InfoRow icon="location-outline" label="Dirección" value={job.direccionTrabajo} />
        <InfoRow icon="person-outline" label="Cliente" value={job.cliente?.nombre} />
        <InfoRow icon="construct-outline" label="Técnico" value={job.tecnico?.user?.nombre} />
        {fecha && <InfoRow icon="calendar-outline" label="Solicitado el" value={fecha} />}
        {precio != null && !isNaN(precio) && (
          <InfoRow icon="cash-outline" label="Precio acordado" value={`S/ ${precio.toFixed(2)}`} />
        )}
      </View>

      {/* ---------- Acciones ---------- */}
      {accionTecnico && (
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary, working && styles.buttonDisabled]}
          disabled={working}
          activeOpacity={0.85}
          onPress={() => cambiarEstado(accionTecnico.estado, accionTecnico.msg)}
        >
          <Ionicons name={accionTecnico.icon} size={20} color={colors.white} />
          <Text style={styles.buttonPrimaryText}>{accionTecnico.label}</Text>
        </TouchableOpacity>
      )}

      {/* Chat disponible cuando el trabajo esta activo */}
      {['aceptado', 'en_progreso'].includes(job.estado) && (
        <TouchableOpacity
          style={[styles.button, styles.buttonOutline]}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate('Chat', { jobId: job.id, otherName: otroNombre })
          }
        >
          <Ionicons name="chatbubbles-outline" size={20} color={colors.primary} />
          <Text style={styles.buttonOutlineText}>Abrir chat con {otroNombre ?? ''}</Text>
        </TouchableOpacity>
      )}

      {/* El CLIENTE puede cancelar mientras este pendiente */}
      {soyCliente && job.estado === 'pendiente' && (
        <TouchableOpacity
          style={[styles.button, styles.buttonDanger, working && styles.buttonDisabled]}
          disabled={working}
          activeOpacity={0.85}
          onPress={() => cambiarEstado('cancelado', '¿Cancelar esta solicitud?')}
        >
          <Ionicons name="close-circle-outline" size={20} color={colors.danger} />
          <Text style={styles.buttonDangerText}>Cancelar solicitud</Text>
        </TouchableOpacity>
      )}

      {/* ---------- Calificacion ---------- */}
      {job.estado === 'finalizado' && !yaCalifique && (
        <View style={styles.card}>
          <Text style={styles.ratingTitle}>Califica a {otroNombre}</Text>
          <Text style={styles.ratingSubtitle}>¿Cómo fue tu experiencia?</Text>

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity key={n} onPress={() => setPuntaje(n)} hitSlop={6}>
                <Ionicons
                  name={n <= puntaje ? 'star' : 'star-outline'}
                  size={38}
                  color={n <= puntaje ? colors.warning : colors.border}
                />
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.commentInput}
            placeholder="Comentario (opcional)"
            placeholderTextColor={colors.textMuted}
            value={comentario}
            onChangeText={setComentario}
            onFocus={() =>
              setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 250)
            }
            multiline
          />

          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary, { marginBottom: 0 }, working && styles.buttonDisabled]}
            disabled={working}
            activeOpacity={0.85}
            onPress={enviarCalificacion}
          >
            {working ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="star" size={18} color={colors.white} />
                <Text style={styles.buttonPrimaryText}>Enviar calificación</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {job.estado === 'finalizado' && yaCalifique && (
        <View style={styles.thanksBox}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={styles.thanksText}>Ya calificaste este trabajo. ¡Gracias!</Text>
        </View>
      )}
    </ScrollView>
  );
}

// Fila de dato con icono
function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value ?? '—'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.backgroundAlt },
  content: { padding: spacing.md },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
  },

  // Tarjetas
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm + 4,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 2 },
  catIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  category: { flex: 1, fontSize: fontSize.lg, fontWeight: 'bold', color: colors.text },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.full,
    paddingVertical: 5,
    paddingHorizontal: spacing.sm + 2,
  },
  badgeText: { fontSize: fontSize.xs, fontWeight: '700' },
  description: {
    fontSize: fontSize.md - 1,
    color: colors.text,
    lineHeight: 22,
    marginTop: spacing.sm + 4,
  },

  // Progreso
  stepsRow: { flexDirection: 'row', alignItems: 'flex-start' },
  step: { alignItems: 'center', width: 62 },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  stepLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  stepLabelDone: { color: colors.text, fontWeight: '700' },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginTop: 12,
  },
  stepLineDone: { backgroundColor: colors.primary },
  cancelledBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    padding: spacing.sm + 4,
    marginBottom: spacing.sm + 4,
  },
  cancelledText: { color: '#991b1b', fontWeight: '600', fontSize: fontSize.sm },

  // Datos
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    paddingVertical: spacing.sm,
  },
  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: { fontSize: fontSize.xs, color: colors.textMuted },
  infoValue: { fontSize: fontSize.md - 1, color: colors.text, fontWeight: '600' },

  // Botones
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    paddingVertical: spacing.md - 1,
    marginBottom: spacing.sm + 2,
    minHeight: 52,
  },
  buttonPrimary: { backgroundColor: colors.primary },
  buttonPrimaryText: { color: colors.white, fontSize: fontSize.md, fontWeight: '700' },
  buttonOutline: {
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  buttonOutlineText: { color: colors.primary, fontSize: fontSize.md, fontWeight: '700' },
  buttonDanger: {
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.danger,
  },
  buttonDangerText: { color: colors.danger, fontSize: fontSize.md, fontWeight: '700' },
  buttonDisabled: { opacity: 0.6 },

  // Calificacion
  ratingTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  ratingSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  commentInput: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm + 4,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: fontSize.md - 1,
    color: colors.text,
    marginBottom: spacing.sm + 4,
  },
  thanksBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.successSoft,
    borderRadius: radius.md,
    padding: spacing.sm + 6,
  },
  thanksText: { color: '#065f46', fontWeight: '600', fontSize: fontSize.sm },
});