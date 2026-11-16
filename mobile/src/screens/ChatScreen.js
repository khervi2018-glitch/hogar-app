import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  connectChat,
  joinJobRoom,
  sendChatMessage,
  onNewMessage,
  disconnectChat,
  getChatHistory,
} from '../services/chatService';
import { getUserIdFromToken } from '../utils/jwt';
import { useKeyboardHeight } from '../hooks/useKeyboardHeight';
import { colors, spacing, radius, fontSize } from '../theme/colors';

function formatearHora(valor) {
  if (!valor) return null;
  const fecha = new Date(valor);
  if (isNaN(fecha.getTime())) return null;
  return fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatScreen({ route, navigation }) {
  const { jobId, otherName } = route.params;
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const tecladoAbierto = keyboardHeight > 0;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [userId, setUserId] = useState(null);
  const [status, setStatus] = useState('Conectando...');
  const listRef = useRef(null);

  // Barra superior naranja con el nombre de la otra persona
  useLayoutEffect(() => {
    navigation.setOptions({
      title: otherName ?? 'Chat',
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: colors.white,
      headerShadowVisible: false,
    });
  }, [navigation, otherName]);

  // Al abrir el teclado, bajar hasta el ultimo mensaje
  useEffect(() => {
    if (tecladoAbierto) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [tecladoAbierto]);

  useEffect(() => {
    let mounted = true;

    async function setup() {
      const token = await SecureStore.getItemAsync('token');
      setUserId(getUserIdFromToken(token));

      // 1. Historial primero
      try {
        const history = await getChatHistory(jobId);
        if (mounted) setMessages(history);
      } catch (e) {
        console.log('Error historial:', e.response?.data ?? e.message);
      }

      // 2. Socket en vivo
      try {
        await connectChat();
        joinJobRoom(jobId);
        onNewMessage((msg) => {
          if (mounted && msg.jobId === jobId) {
            setMessages((prev) => [...prev, msg]);
          }
        });
        if (mounted) setStatus(null); // conectado
      } catch (e) {
        console.log('Error socket:', e.message);
        if (mounted) setStatus('Sin conexión al chat');
      }
    }

    setup();

    // Al salir de la pantalla, desconectar
    return () => {
      mounted = false;
      disconnectChat();
    };
  }, [jobId]);

  function handleSend() {
    const contenido = text.trim();
    if (!contenido) return;
    sendChatMessage(jobId, contenido);
    setText('');
    // No agregamos el mensaje a mano: llegara por 'newMessage' (eco de la sala)
  }

  function renderMessage({ item }) {
    const esMio = item.senderId === userId;
    const hora = formatearHora(item.createdAt);
    return (
      <View style={[styles.bubble, esMio ? styles.mine : styles.theirs]}>
        <Text style={esMio ? styles.mineText : styles.theirsText}>{item.contenido}</Text>
        {hora && (
          <Text style={[styles.time, esMio ? styles.timeMine : styles.timeTheirs]}>
            {hora}
          </Text>
        )}
      </View>
    );
  }

  const puedeEnviar = text.trim().length > 0;

  return (
    // El espacio de abajo = altura del teclado, asi la caja de texto queda encima
      <View style={[styles.container, { paddingBottom: tecladoAbierto ? keyboardHeight + 12 : 0 }]}>
      {status && (
        <View style={styles.statusBar}>
          {status === 'Conectando...' && (
            <ActivityIndicator size="small" color={colors.warning} />
          )}
          <Text style={styles.statusText}>{status}</Text>
        </View>
      )}

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item, index) => item.id ?? String(index)}
        renderItem={renderMessage}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="chatbubbles-outline" size={34} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Aún no hay mensajes</Text>
            <Text style={styles.emptyText}>
              Saluda a {otherName ?? 'la otra persona'} y acuerden los detalles del trabajo.
            </Text>
          </View>
        }
      />

      <View
        style={[
          styles.inputRow,
          // Con teclado cerrado, deja espacio para la barra de gestos de Android
          { paddingBottom: tecladoAbierto ? spacing.sm : insets.bottom + spacing.sm },
        ]}
      >
        <TextInput
          style={styles.input}
          placeholder={`Mensaje para ${otherName ?? ''}...`}
          placeholderTextColor={colors.textMuted}
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !puedeEnviar && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!puedeEnviar}
          activeOpacity={0.85}
        >
          <Ionicons name="send" size={18} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundAlt },

  // Estado de conexion
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    padding: 6,
    backgroundColor: colors.warningSoft,
  },
  statusText: { fontSize: fontSize.xs + 1, color: '#92400e' },

  // Lista
  list: { padding: spacing.sm + 4, flexGrow: 1 },

  // Burbujas
  bubble: {
    maxWidth: '78%',
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm + 5,
    marginBottom: spacing.sm,
  },
  mine: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  theirs: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  mineText: { color: colors.white, fontSize: fontSize.md - 1, lineHeight: 21 },
  theirsText: { color: colors.text, fontSize: fontSize.md - 1, lineHeight: 21 },
  time: { fontSize: 11, marginTop: 2, alignSelf: 'flex-end' },
  timeMine: { color: 'rgba(255,255,255,0.75)' },
  timeTheirs: { color: colors.textMuted },

  // Vacio
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm + 4,
  },
  emptyTitle: { fontSize: fontSize.md, fontWeight: 'bold', color: colors.text },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 20,
  },

  // Caja de texto
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm + 2,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: fontSize.md - 1,
    color: colors.text,
    maxHeight: 110,
  },
  sendButton: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: { opacity: 0.4 },
});