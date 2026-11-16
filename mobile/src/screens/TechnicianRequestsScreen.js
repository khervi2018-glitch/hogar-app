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
import { Ionicons } from '@expo/vector-icons';
import { getMyJobs } from '../services/jobsService';
import { colors, spacing, radius, fontSize } from '../theme/colors';
import { getCategoryIcon } from '../theme/categoryIcons';

function formatearFecha(valor) {
  if (!valor) return null;
  const fecha = new Date(valor);
  if (isNaN(fecha.getTime())) return null;
  return fecha.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
}

export default function TechnicianRequestsScreen({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  function renderItem({ item }) {
    const { icon, color } = getCategoryIcon(item.categoria?.nombre);
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
          <View style={styles.newBadge}>
            <View style={styles.newDot} />
            <Text style={styles.newText}>Nueva</Text>
          </View>
        </View>

        <Text style={styles.desc} numberOfLines={2}>{item.descripcion}</Text>

        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={15} color={colors.textMuted} />
          <Text style={styles.infoText} numberOfLines={1}>{item.cliente?.nombre ?? 'Cliente'}</Text>
          {fecha && (
            <>
              <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
              <Text style={styles.infoMuted}>{fecha}</Text>
            </>
          )}
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={15} color={colors.textMuted} />
          <Text style={styles.infoText} numberOfLines={1}>{item.direccionTrabajo}</Text>
        </View>

        <View style={styles.cta}>
          <Text style={styles.ctaText}>Ver y responder</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.tech} />
        </View>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.tech} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.screen}
      data={requests}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.tech]}
          tintColor={colors.tech}
        />
      }
      ListHeaderComponent={
        requests.length > 0 ? (
          <Text style={styles.summary}>
            Tienes <Text style={styles.summaryStrong}>{requests.length}</Text>{' '}
            {requests.length === 1 ? 'solicitud pendiente' : 'solicitudes pendientes'}
          </Text>
        ) : null
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="notifications-outline" size={36} color={colors.tech} />
          </View>
          <Text style={styles.emptyText}>No tienes solicitudes nuevas</Text>
          <Text style={styles.emptySub}>
            Aquí llegarán los trabajos que te soliciten. Desliza hacia abajo para actualizar.
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.backgroundAlt },
  list: { padding: spacing.md, flexGrow: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
  },

  summary: { fontSize: fontSize.sm, color: colors.textMuted, marginBottom: spacing.sm + 4 },
  summaryStrong: { fontWeight: '700', color: colors.tech },

  // Tarjeta
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.tech,
    padding: spacing.md,
    marginBottom: spacing.sm + 4,
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
  newBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.warningSoft,
    borderRadius: radius.full,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm + 2,
  },
  newDot: { width: 7, height: 7, borderRadius: radius.full, backgroundColor: colors.warning },
  newText: { fontSize: fontSize.xs, fontWeight: '700', color: '#92400e' },
  desc: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
    marginTop: spacing.sm + 4,
    marginBottom: spacing.sm,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  infoText: { flexShrink: 1, fontSize: fontSize.sm - 1, color: colors.text },
  infoMuted: { fontSize: fontSize.xs, color: colors.textMuted },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
    marginTop: spacing.sm + 4,
    paddingTop: spacing.sm + 2,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  ctaText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.tech },

  // Vacio
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: radius.full,
    backgroundColor: colors.techSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyText: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  emptySub: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs + 2,
    textAlign: 'center',
    lineHeight: 20,
  },
});