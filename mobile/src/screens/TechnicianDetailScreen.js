import React, { useLayoutEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, fontSize } from '../theme/colors';
import { getCategoryIcon } from '../theme/categoryIcons';

export default function TechnicianDetailScreen({ route, navigation }) {
  // El tecnico llega como parametro de navegacion desde la lista
  const { technician } = route.params;
  const insets = useSafeAreaInsets();

  // Datos preparados de forma segura.
  // Number(...) evita que la app falle si PostgreSQL devuelve los decimales como texto ("4.50").
  const nombre = technician.user?.nombre ?? 'Técnico';
  const inicial = nombre.charAt(0).toUpperCase();
  const rating = Number(technician.calificacionPromedio ?? 0);
  const distancia =
    technician.distanciaKm != null ? Number(technician.distanciaKm) : null;
  const radio =
    technician.radioCoberturaKm != null ? Number(technician.radioCoberturaKm) : null;
  const categorias = technician.categorias ?? [];

  // Barra superior naranja, unida visualmente con la cabecera
  useLayoutEffect(() => {
    navigation.setOptions({
      title: '',
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: colors.white,
      headerShadowVisible: false,
    });
  }, [navigation]);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ---------- Cabecera ---------- */}
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{inicial}</Text>
          </View>
          <Text style={styles.name}>{nombre}</Text>

          <View style={styles.badgesRow}>
            <View style={styles.badge}>
              <Ionicons name="star" size={14} color="#fde047" />
              <Text style={styles.badgeText}>
                {rating > 0 ? rating.toFixed(1) : 'Nuevo'}
              </Text>
            </View>

            {distancia != null && (
              <View style={styles.badge}>
                <Ionicons name="location" size={14} color={colors.white} />
                <Text style={styles.badgeText}>
                  A {distancia.toFixed(1)} km de ti
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ---------- Servicios ---------- */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="construct-outline" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Servicios que ofrece</Text>
          </View>

          {categorias.length === 0 ? (
            <Text style={styles.mutedText}>Aún no registra servicios.</Text>
          ) : (
            <View style={styles.chipsWrap}>
              {categorias.map((cat) => {
                const { icon, color } = getCategoryIcon(cat.nombre);
                return (
                  <View
                    key={cat.id}
                    style={[styles.chip, { backgroundColor: color + '1A' }]}
                  >
                    <Ionicons name={icon} size={16} color={color} />
                    <Text style={[styles.chipText, { color }]}>{cat.nombre}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* ---------- Zona de trabajo ---------- */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="map-outline" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Zona de trabajo</Text>
          </View>
          <Text style={styles.bodyText}>
            {radio != null
              ? `Atiende hasta ${radio} km a la redonda de su ubicación.`
              : 'Zona de atención no especificada.'}
          </Text>
        </View>

        {/* ---------- Cómo se acuerda el precio ---------- */}
        <View style={[styles.card, styles.infoCard]}>
          <View style={styles.cardHeader}>
            <Ionicons name="chatbubbles-outline" size={20} color={colors.primaryDark} />
            <Text style={[styles.cardTitle, { color: colors.primaryDark }]}>
              ¿Cómo funciona?
            </Text>
          </View>
          <Text style={styles.bodyText}>
            Envía tu solicitud describiendo el trabajo. Luego conversan por chat
            y acuerdan el precio antes de empezar.
          </Text>
        </View>
      </ScrollView>

      {/* ---------- Botón fijo abajo ---------- */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('CreateJob', { technician })}
        >
          <Ionicons name="paper-plane" size={20} color={colors.white} />
          <Text style={styles.buttonText}>Solicitar servicio</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.backgroundAlt },
  scrollContent: { paddingBottom: 120 }, // espacio para que el boton fijo no tape contenido

  // Cabecera
  hero: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 3,
    borderColor: colors.primaryLight,
  },
  avatarText: { color: colors.primary, fontSize: 36, fontWeight: 'bold' },
  name: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radius.full,
  },
  badgeText: { color: colors.white, fontSize: fontSize.sm, fontWeight: '600' },

  // Tarjetas
  card: {
    backgroundColor: colors.background,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoCard: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryLight,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm + 4,
  },
  cardTitle: { fontSize: fontSize.md, fontWeight: 'bold', color: colors.text },
  bodyText: { fontSize: fontSize.sm + 1, color: colors.textMuted, lineHeight: 21 },
  mutedText: { fontSize: fontSize.sm, color: colors.textMuted },

  // Chips de categorias
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm + 4,
    borderRadius: radius.full,
  },
  chipText: { fontSize: fontSize.sm, fontWeight: '600' },

  // Boton fijo
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    paddingTop: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  buttonText: { color: colors.white, fontSize: fontSize.md + 1, fontWeight: '700' },
});