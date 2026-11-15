import React, { useState, useCallback, useMemo } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { getMyJobs } from '../services/jobsService';
import { colors, spacing, radius, fontSize } from '../theme/colors';
import { getCategoryIcon } from '../theme/categoryIcons';

// Color e icono para cada estado del job
const ESTADOS = {
  pendiente:   { label: 'Pendiente',   icon: 'time-outline',             color: colors.warning, bg: colors.warningSoft },
  aceptado:    { label: 'Aceptado',    icon: 'thumbs-up-outline',        color: colors.info,    bg: colors.infoSoft },
  en_progreso: { label: 'En progreso', icon: 'construct-outline',        color: '#8b5cf6',      bg: '#ede9fe' },
  finalizado:  { label: 'Finalizado',  icon: 'checkmark-circle-outline', color: colors.success, bg: colors.successSoft },
  cancelado:   { label: 'Cancelado',   icon: 'close-circle-outline',     color: colors.danger,  bg: colors.dangerSoft },
};

const ACTIVOS = ['pendiente', 'aceptado', 'en_progreso'];

const FILTROS = [
  { key: 'todos',     label: 'Todos' },
  { key: 'activos',   label: 'Activos' },
  { key: 'historial', label: 'Historial' },
];

function cumpleFiltro(job, filtro) {
  if (filtro === 'activos') return ACTIVOS.includes(job.estado);
  if (filtro === 'historial') return !ACTIVOS.includes(job.estado);
  return true;
}

function formatearFecha(valor) {
  if (!valor) return null;
  const fecha = new Date(valor);
  if (isNaN(fecha.getTime())) return null;
  return fecha.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
}

export default function MyJobsScreen({ navigation }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtro, setFiltro] = useState('todos');

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

  async function onRefresh() {
    setRefreshing(true);
    await loadJobs();
    setRefreshing(false);
  }

  // Recarga cada vez que la pantalla gana foco (ej: al volver de crear un job)
  useFocusEffect(
    useCallback(() => {
      loadJobs();
    }, []),
  );

  const conteos = useMemo(
    () => ({
      todos: jobs.length,
      activos: jobs.filter((j) => cumpleFiltro(j, 'activos')).length,
      historial: jobs.filter((j) => cumpleFiltro(j, 'historial')).length,
    }),
    [jobs],
  );

  const jobsFiltrados = useMemo(
    () => jobs.filter((j) => cumpleFiltro(j, filtro)),
    [jobs, filtro],
  );

  function renderJob({ item }) {
    const estado = ESTADOS[item.estado] ?? ESTADOS.pendiente;
    const { icon, color } = getCategoryIcon(item.categoria?.nombre);
    const tecnico = item.tecnico?.user?.nombre ?? 'Técnico';
    const fecha = formatearFecha(item.createdAt);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
      >
        <View style={styles.cardTop}>
          <View style={[styles.catIcon, { backgroundColor: color + '1A' }]}>
            <Ionicons name={icon} size={20} color={color} />
          </View>
          <Text style={styles.category} numberOfLines={1}>
            {item.categoria?.nombre ?? 'Servicio'}
          </Text>
          <View style={[styles.badge, { backgroundColor: estado.bg }]}>
            <Ionicons name={estado.icon} size={13} color={estado.color} />
            <Text style={[styles.badgeText, { color: estado.color }]}>
              {estado.label}
            </Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.descripcion}
        </Text>

        <View style={styles.cardBottom}>
          <View style={styles.miniAvatar}>
            <Text style={styles.miniAvatarText}>{tecnico.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.technician} numberOfLines={1}>{tecnico}</Text>
          {fecha && (
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={13} color={colors.textMuted} />
              <Text style={styles.dateText}>{fecha}</Text>
            </View>
          )}
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </View>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const mensajeVacio = {
    todos: 'Aún no tienes trabajos. ¡Busca un técnico y crea tu primera solicitud!',
    activos: 'No tienes trabajos en curso.',
    historial: 'Aún no tienes trabajos finalizados o cancelados.',
  }[filtro];

  return (
    <View style={styles.screen}>
      {/* ---------- Filtros ---------- */}
      <View style={styles.filters}>
        {FILTROS.map((f) => {
          const activo = filtro === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, activo && styles.filterChipActive]}
              onPress={() => setFiltro(f.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterText, activo && styles.filterTextActive]}>
                {f.label}
              </Text>
              <View style={[styles.countPill, activo && styles.countPillActive]}>
                <Text style={[styles.countText, activo && styles.countTextActive]}>
                  {conteos[f.key]}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ---------- Lista ---------- */}
      <FlatList
        data={jobsFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={renderJob}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="clipboard-outline" size={36} color={colors.primary} />
            </View>
            <Text style={styles.emptyText}>{mensajeVacio}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.backgroundAlt },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
  },

  // Filtros
  filters: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingVertical: 6,
    paddingLeft: spacing.sm + 6,
    paddingRight: 6,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  filterTextActive: { color: colors.white },
  countPill: {
    minWidth: 22,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.full,
    backgroundColor: colors.backgroundAlt,
    alignItems: 'center',
  },
  countPillActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  countText: { fontSize: fontSize.xs, fontWeight: '700', color: colors.textMuted },
  countTextActive: { color: colors.white },

  // Lista y tarjetas
  list: { padding: spacing.md, paddingTop: spacing.sm, flexGrow: 1 },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm + 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  catIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  category: { flex: 1, fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.full,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm + 2,
  },
  badgeText: { fontSize: fontSize.xs, fontWeight: '700' },
  description: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
    marginTop: spacing.sm + 4,
    marginBottom: spacing.sm + 4,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm + 4,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  miniAvatar: {
    width: 26,
    height: 26,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniAvatarText: { fontSize: fontSize.xs, fontWeight: '700', color: colors.primary },
  technician: { flex: 1, fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  dateText: { fontSize: fontSize.xs, color: colors.textMuted },

  // Vacio
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});