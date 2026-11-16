import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getMe } from '../services/usersService';
import { colors, spacing, radius, fontSize } from '../theme/colors';

export default function ProfileScreen({ navigation }) {
  const { signOut, mode, setMode, isTechnician } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const esTecnico = mode === 'tecnico';
  const accent = esTecnico ? colors.tech : colors.primary;
  const accentSoft = esTecnico ? colors.techSoft : colors.primarySoft;

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          setUser(await getMe());
        } catch (e) {
          console.log('Error perfil:', e.response?.data ?? e.message);
        } finally {
          setLoading(false);
        }
      })();
    }, []),
  );

  function switchToTechnician() {
    if (!isTechnician) {
      Alert.alert(
        'Aún no eres técnico',
        'Primero crea tu perfil de técnico para poder recibir trabajos.',
      );
      return;
    }
    setMode('tecnico');
  }

  function confirmarSalida() {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: signOut },
    ]);
  }

  const nombre = user?.nombre ?? 'Mi cuenta';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* ---------- Cabecera ---------- */}
      <View style={styles.headerCard}>
        <View style={[styles.avatar, { backgroundColor: accentSoft, borderColor: accent }]}>
          {loading ? (
            <ActivityIndicator color={accent} />
          ) : (
            <Text style={[styles.avatarText, { color: accent }]}>
              {nombre.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>

        <Text style={styles.name}>{nombre}</Text>
        {user?.email && <Text style={styles.email}>{user.email}</Text>}

        <View style={[styles.modeBadge, { backgroundColor: accentSoft }]}>
          <Ionicons name={esTecnico ? 'construct' : 'home'} size={14} color={accent} />
          <Text style={[styles.modeText, { color: accent }]}>
            Modo {esTecnico ? 'Técnico' : 'Cliente'}
          </Text>
        </View>
      </View>

      {/* ---------- Datos ---------- */}
      {user?.telefono && (
        <View style={styles.card}>
          <View style={styles.dataRow}>
            <Ionicons name="call-outline" size={18} color={colors.textMuted} />
            <Text style={styles.dataText}>{user.telefono}</Text>
          </View>
        </View>
      )}

      {/* ---------- Opciones ---------- */}
      <Text style={styles.sectionTitle}>Modo de uso</Text>
      <View style={styles.card}>
        {esTecnico ? (
          <OptionRow
            icon="home-outline"
            color={colors.primary}
            title="Cambiar a modo Cliente"
            subtitle="Busca técnicos y pide servicios"
            onPress={() => setMode('cliente')}
          />
        ) : (
          <OptionRow
            icon="construct-outline"
            color={colors.tech}
            title="Cambiar a modo Técnico"
            subtitle={isTechnician ? 'Recibe y gestiona trabajos' : 'Requiere perfil de técnico'}
            onPress={switchToTechnician}
          />
        )}

        {!isTechnician && (
          <>
            <View style={styles.divider} />
            <OptionRow
              icon="briefcase-outline"
              color={colors.tech}
              title="Convertirme en técnico"
              subtitle="Ofrece tus servicios en CHAMBA"
              onPress={() => navigation.navigate('BecomeTechnician')}
            />
          </>
        )}
      </View>

      {/* ---------- Cerrar sesion ---------- */}
      <TouchableOpacity style={styles.logout} onPress={confirmarSalida} activeOpacity={0.85}>
        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>

      <Text style={styles.version}>CHAMBA · versión 1.0</Text>
    </ScrollView>
  );
}

// Fila de opcion con icono, texto y flecha
function OptionRow({ icon, color, title, subtitle, onPress }) {
  return (
    <TouchableOpacity style={styles.optionRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.optionIcon, { backgroundColor: color + '1A' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.optionTitle}>{title}</Text>
        {subtitle && <Text style={styles.optionSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.backgroundAlt },
  content: { padding: spacing.md, paddingBottom: spacing.xl },

  // Cabecera
  headerCard: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: radius.full,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm + 4,
  },
  avatarText: { fontSize: 34, fontWeight: 'bold' },
  name: { fontSize: fontSize.xl, fontWeight: 'bold', color: colors.text },
  email: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.full,
    paddingVertical: 5,
    paddingHorizontal: spacing.sm + 4,
    marginTop: spacing.sm + 4,
  },
  modeText: { fontWeight: '700', fontSize: fontSize.sm },

  // Tarjetas y secciones
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm + 4,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    paddingVertical: spacing.md - 2,
  },
  dataText: { fontSize: fontSize.md - 1, color: colors.text },
  divider: { height: 1, backgroundColor: colors.border },

  // Opciones
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    paddingVertical: spacing.sm + 6,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTitle: { fontSize: fontSize.md - 1, fontWeight: '600', color: colors.text },
  optionSubtitle: { fontSize: fontSize.xs + 1, color: colors.textMuted, marginTop: 1 },

  // Cerrar sesion
  logout: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.danger,
    borderRadius: radius.md,
    paddingVertical: spacing.md - 2,
    marginTop: spacing.lg,
  },
  logoutText: { color: colors.danger, fontSize: fontSize.md, fontWeight: '700' },
  version: {
    textAlign: 'center',
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
});