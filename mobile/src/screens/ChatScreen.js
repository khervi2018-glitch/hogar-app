import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {
  connectChat,
  joinJobRoom,
  sendChatMessage,
  onNewMessage,
  disconnectChat,
  getChatHistory,
} from '../services/chatService';
import { getUserIdFromToken } from '../utils/jwt';

export default function ChatScreen({ route }) {
  const { jobId, otherName } = route.params;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [userId, setUserId] = useState(null);
  const [status, setStatus] = useState('Conectando...');
  const listRef = useRef(null);

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
    return (
      <View style={[styles.bubble, esMio ? styles.mine : styles.theirs]}>
        <Text style={esMio ? styles.mineText : styles.theirsText}>
          {item.contenido}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {status && (
        <View style={styles.statusBar}>
          {status === 'Conectando...' && <ActivityIndicator size="small" />}
          <Text style={styles.statusText}>{status}</Text>
        </View>
      )}

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item, index) => item.id ?? String(index)}
        renderItem={renderMessage}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder={`Mensaje para ${otherName ?? ''}...`}
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
    backgroundColor: '#fef3c7',
    gap: 8,
  },
  statusText: { fontSize: 13, color: '#92400e' },
  list: { padding: 12 },
  bubble: {
    maxWidth: '78%',
    borderRadius: 16,
    paddingVertical: 9,
    paddingHorizontal: 13,
    marginBottom: 8,
  },
  mine: {
    alignSelf: 'flex-end',
    backgroundColor: '#2563eb',
    borderBottomRightRadius: 4,
  },
  theirs: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  mineText: { color: '#fff', fontSize: 15 },
  theirsText: { color: '#111', fontSize: 15 },
  inputRow: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#2563eb',
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendText: { color: '#fff', fontSize: 18 },
});