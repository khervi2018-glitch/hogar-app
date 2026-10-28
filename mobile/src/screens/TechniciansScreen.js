import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCurrentLocation } from '../services/locationService';
import { searchNearby } from '../services/techniciansService';
import { getCategoryIcon } from '../theme/categoryIcons';
import { colors, spacing, radius, fontSize } from '../theme/colors';

export default function TechniciansScreen({ navigation, route }) {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const categoria = route.params?.categoria;

  async function loadTechnicians() {
    setErrorMsg(null);
    try {
      const location = await getCurrentLocation();
      const data = await searchNearby(location.lat, location.lng, categoria?.id);
      setTechnicians(data);
    } catch (error) {
      if (error.message === 'PERMISO_DENEGADO') {
        setErrorMsg('CHAMBA necesita tu ubicación para buscar técnicos cerca.');
      } else {
        setErrorMsg('No se pudo cargar la lista. Desliza para reintentar.');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTechnicians();
  }, []);

  function renderTechnician({ item }) {
    const inicial = item.user?.nombre?.charAt(0) ?? '?';
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('TechnicianDetail', { technician: item })}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{inicial}</Text>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.name}>{item.user?.nombre}</Text>

          <View style={styles.chipsRow}>
            {item.categorias?.slice(0, 2).map((cat) => {
              const { icon, color } = getCategoryIcon(cat.nombre);
              return (
                <View key={cat.id} style={[styles.chip, { backgroundColor: color + '18' }]}>
                  <Ionicons name={icon} size={12} color={color} />
                  <Text style={[styles.chipText, { color }]}>{cat.nombre}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={14} color="#f59e0b" />
              <Text style={styles.metaText}>
                {item.calificacionPromedio > 0
                  ? item.calificacionPromedio.toFixed(1)
                  : 'Nuevo'}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="location" size={14} color={colors.primary} />
              <Text style={styles.metaText}>{item.distanciaKm?.toFixed(1)} km</Text>
            </View>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Buscando técnicos cerca de ti...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {categoria && (
        <View style={styles.filterBanner}>
          <Text style={styles.filterText}>
            Mostrando técnicos de {categoria.nombre}
          </Text>
        </View>
      )}

      <FlatList
        data={technicians}
        keyExtractor={(item) => item.id}
        renderItem={renderTechnician}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={loadTechnicians} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons
              name={errorMsg ? 'alert-circle-outline' : 'search-outline'}
              size={52}
              color={colors.textMuted}
            />
            <Text style={styles.emptyText}>
              {errorMsg ?? 'No hay técnicos disponibles en tu zona todavía.'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.backgroundAlt },
  list: { padding: spacing.md, flexGrow: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  loadingText: { marginTop: spacing.md, color: colors.textMuted },
  filterBanner: {
    backgroundColor: colors.primarySoft,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  filterText: { color: colors.primaryDark, fontSize: fontSize.sm, fontWeight: '600' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: { fontSize: 22, fontWeight: 'bold', color: colors.primary },
  cardBody: { flex: 1 },
  name: { fontSize: fontSize.md, fontWeight: 'bold', color: colors.text },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4, gap: 6 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    paddingVertical: 3,
    paddingHorizontal: 8,
    gap: 3,
  },
  chipText: { fontSize: fontSize.xs, fontWeight: '600' },
  metaRow: { flexDirection: 'row', marginTop: 6, gap: spacing.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: fontSize.sm, color: colors.textMuted },
});