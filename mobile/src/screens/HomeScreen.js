import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getCategories, getTopTechnicians } from '../services/techniciansService';
import { getCategoryIcon } from '../theme/categoryIcons';
import { colors, spacing, radius, fontSize } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { getMe } from '../services/usersService';

export default function HomeScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [topTechs, setTopTechs] = useState([]);
  const [loading, setLoading] = useState(true);
    const [nombre, setNombre] = useState('');
  const { isTechnician } = useAuth();

  useEffect(() => {
    getMe()
      .then((u) => setNombre(u?.nombre?.split(' ')[0] ?? ''))
      .catch(() => {});
  }, []);

  useEffect(() => {
    Promise.all([getCategories(), getTopTechnicians()])
      .then(([cats, techs]) => {
        setCategories(cats);
        setTopTechs(techs);
      })
      .catch((e) => console.log('Error inicio:', e.message))
      .finally(() => setLoading(false));
  }, []);

  function irABuscar(categoria = null) {
    navigation.navigate('Technicians', categoria ? { categoria } : undefined);
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: spacing.xl }}
    >
      {/* Saludo */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hola{nombre ? `, ${nombre}` : ''} 👋</Text>
        <Text style={styles.question}>¿Qué necesitas resolver hoy?</Text>
      </View>

      {/* Buscador */}
      <TouchableOpacity style={styles.searchBar} onPress={() => irABuscar()}>
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <Text style={styles.searchPlaceholder}>Buscar un servicio o técnico...</Text>
      </TouchableOpacity>

      {/* Categorias */}
      <Text style={styles.sectionTitle}>Categorías</Text>
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
      ) : (
        <View style={styles.grid}>
          {categories.map((cat) => {
            const { icon, color } = getCategoryIcon(cat.nombre);
            return (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryCard}
                onPress={() => irABuscar(cat)}
              >
                <View style={[styles.categoryIconCircle, { backgroundColor: color + '18' }]}>
                  <Ionicons name={icon} size={28} color={color} />
                </View>
                <Text style={styles.categoryName} numberOfLines={2}>
                  {cat.nombre}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Tecnicos mejor calificados */}
      {topTechs.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mejor calificados ⭐</Text>
            <TouchableOpacity onPress={() => irABuscar()}>
              <Text style={styles.verTodo}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: spacing.md }}
          >
            {topTechs.map((tech) => (
              <TouchableOpacity
                key={tech.id}
                style={styles.techCard}
                onPress={() => navigation.navigate('TechnicianDetail', { technician: tech })}
              >
                <View style={styles.techAvatar}>
                  <Text style={styles.techAvatarText}>
                    {tech.user?.nombre?.charAt(0) ?? '?'}
                  </Text>
                </View>
                <Text style={styles.techName} numberOfLines={1}>
                  {tech.user?.nombre}
                </Text>
                <View style={styles.techRating}>
                  <Ionicons name="star" size={13} color="#f59e0b" />
                  <Text style={styles.techRatingText}>
                    {Number(tech.calificacionPromedio) > 0
                      ? Number(tech.calificacionPromedio).toFixed(1)
                      : 'Nuevo'}
                  </Text>
                </View>
                <Text style={styles.techCat} numberOfLines={1}>
                  {tech.categorias?.[0]?.nombre ?? 'Servicios'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      {/* Banner: tecnicos cerca */}
      <TouchableOpacity style={styles.banner} onPress={() => irABuscar()}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>Técnicos cerca de ti</Text>
          <Text style={styles.bannerSub}>Profesionales verificados en tu zona</Text>
        </View>
        <Ionicons name="arrow-forward-circle" size={36} color={colors.white} />
      </TouchableOpacity>

      {/* Como funciona */}
      <Text style={styles.sectionTitle}>¿Cómo funciona CHAMBA?</Text>
      <View style={styles.stepsBox}>
        {[
          { icon: 'search', text: 'Busca el técnico que necesitas cerca de ti' },
          { icon: 'chatbubbles', text: 'Coordina los detalles por el chat' },
          { icon: 'star', text: 'Recibe el servicio y califica tu experiencia' },
        ].map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={styles.stepIcon}>
              <Ionicons name={step.icon} size={20} color={colors.primary} />
            </View>
            <Text style={styles.stepText}>{step.text}</Text>
          </View>
        ))}
      </View>

      {/* Banner: hazte tecnico */}
            {/* Banner: hazte tecnico (solo si aun no lo es) */}
      {!isTechnician && (
      <TouchableOpacity
        style={styles.techBanner}
        onPress={() => navigation.navigate('BecomeTechnician')}
      >
        <Ionicons name="construct" size={28} color={colors.tech} />
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Text style={styles.techBannerTitle}>¿Ofreces servicios?</Text>
          <Text style={styles.techBannerSub}>Únete como técnico y recibe trabajos</Text>
        </View>
                <Ionicons name="chevron-forward" size={22} color={colors.tech} />
      </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: spacing.md,
  },
  header: { marginTop: spacing.md, marginBottom: spacing.md },
  greeting: { fontSize: fontSize.md, color: colors.textMuted },
  question: { fontSize: fontSize.xl, fontWeight: 'bold', color: colors.text, marginTop: 2 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchPlaceholder: { color: colors.textMuted, fontSize: fontSize.md, marginLeft: spacing.sm },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  verTodo: { color: colors.primary, fontWeight: '600', fontSize: fontSize.sm, marginBottom: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryCard: { width: '31%', alignItems: 'center', marginBottom: spacing.lg },
  categoryIconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryName: { fontSize: fontSize.sm, color: colors.text, textAlign: 'center' },

  // Tecnicos top
  techCard: {
    width: 130,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginRight: spacing.md,
    marginBottom: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  techAvatar: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  techAvatarText: { fontSize: 22, fontWeight: 'bold', color: colors.primary },
  techName: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  techRating: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  techRatingText: { fontSize: fontSize.xs, color: colors.textMuted, marginLeft: 3 },
  techCat: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },

  // Banner principal
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  bannerTitle: { color: colors.white, fontSize: fontSize.lg, fontWeight: 'bold' },
  bannerSub: { color: colors.white, fontSize: fontSize.sm, marginTop: 4, opacity: 0.95 },

  // Como funciona
  stepsBox: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  stepText: { flex: 1, fontSize: fontSize.sm, color: colors.text },

  // Banner tecnico
  techBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.techSoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  techBannerTitle: { fontSize: fontSize.md, fontWeight: 'bold', color: colors.text },
  techBannerSub: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
});