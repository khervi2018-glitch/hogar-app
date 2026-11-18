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
import { getConversations } from '../services/chatService';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, radius, fontSize } from '../theme/colors';
import { getCategoryIcon } from '../theme/categoryIcons';

// "14:32" si es de hoy, "Ayer", o "12 nov."
function formatearCuando(valor) {
  if (!valor) return '';
  const fecha = new Date(valor);
  if (isNaN(fecha.getTime())) return '';
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(hoy.getDate() - 1);

  if (fecha.toDateString() === hoy.toDateString()) {
    return fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }
  if (fecha.toDateString() === ayer.toDateString()) return 'Ayer';
  return fecha.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
}

export default function ConversationsScreen({ navigation }) {
  const { mode } = useAuth();
  const esTecnico = mode === 'tecnico';
  const accent = esTecnico ? colors.tech : colors.primary;
  const accentSoft = esTecnico ? colors.techSoft : colors.primarySoft;

  const [conversaciones, setConversaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      setConversaciones(await getConversations(mode));
    } catch (e) {
      console.log('Error conversaciones:', e.response?.data ?? e.message);
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  // Recarga al volver a la pestaña (ej: despues de chatear) y al cambiar de modo
  useFocusEffect(
    useCallback(() => {
      load();
    }, [mode]),
  );

  function renderItem({ item }) {
    const nombre = item.otroUsuario?.nombre ?? (esTecnico ? 'Cliente' : 'Técnico');
    const { icon, color } = getCategoryIcon(item.categoria);
    const ultimo = item.ultimoMensaje;

    return (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('Chat', { jobId: item.jobId, otherName: nombre })}
      >
        <View style={[styles.avatar, { backgroundColor: accentSoft }]}>
          <Text style={[styles.avatarText, { color: accent }]}>
            {nombre.charAt(0).toUpperCase()}
          </Text>
          {/* Mini icono de la categoria del trabajo */}
          <View style={[styles.catBadge, { backgroundColor: color }]}>
            <Ionicons name={icon} size={10} color={colors.white} />
          </View>
        </View>

        <View style={styles.middle}>
          <View style={styles.topLine}>
            <Text style={styles.name} numberOfLines={1}>{nombre}</Text>
            <Text style={styles.time}>{formatearCuando(item.actividad)}</Text>
          </View>
          <Text style={styles.categoria} numberOfLines={1}>
            {item.categoria ?? 'Servicio'}
          </Text>
          {ultimo ? (
            <Text style={styles.preview} numberOfLines={1}>
              {ultimo.esMio && <Text style={styles.previewYou}>Tú: </Text>}
              {ultimo.contenido}
            </Text>
          ) : (
            <Text style={[styles.preview, styles.previewEmpty]} numberOfLines={1}>
              Aún no hay mensajes. ¡Saluda!
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={accent} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.screen}
      data={conversaciones}
      keyExtractor={(item) => item.jobId}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[accent]}
          tintColor={accent}
        />
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: accentSoft }]}>
            <Ionicons name="chatbubbles-outline" size={36} color={accent} />
          </View>
          <Text style={styles.emptyTitle}>Aún no tienes conversaciones</Text>
          <Text style={styles.emptyText}>
            {esTecnico
              ? 'Cuando aceptes un trabajo podrás chatear con el cliente aquí.'
              : 'Cuando un técnico acepte tu solicitud podrás chatear con él aquí.'}
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  list: { flexGrow: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },

  // Fila
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    paddingVertical: spacing.sm + 6,
    paddingHorizontal: spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: fontSize.lg + 2, fontWeight: 'bold' },
  catBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  middle: { flex: 1 },
  topLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  name: { flex: 1, fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  time: { fontSize: fontSize.xs, color: colors.textMuted },
  categoria: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 1 },
  preview: { fontSize: fontSize.sm, color: colors.text, marginTop: 3 },
  previewYou: { color: colors.textMuted, fontWeight: '600' },
  previewEmpty: { color: colors.textMuted, fontStyle: 'italic' },
  separator: { height: 1, backgroundColor: colors.border, marginLeft: 52 + spacing.md * 2 },

  // Vacio
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs + 2,
    lineHeight: 20,
  },
});