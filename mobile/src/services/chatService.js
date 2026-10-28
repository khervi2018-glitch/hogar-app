import { io } from 'socket.io-client';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config/api';

let socket = null;

// Conecta el socket con el JWT (auth del handshake, como en React Native manda)
export async function connectChat() {
  const token = await SecureStore.getItemAsync('token');

  socket = io(API_URL, {
    auth: { token },
    transports: ['websocket'], // evita problemas de polling en RN
  });

  return new Promise((resolve, reject) => {
    socket.on('connect', () => resolve(socket));
    socket.on('connect_error', (err) => reject(err));
  });
}

export function joinJobRoom(jobId) {
  socket?.emit('joinJob', { jobId });
}

export function sendChatMessage(jobId, contenido) {
  socket?.emit('sendMessage', { jobId, contenido });
}

export function onNewMessage(callback) {
  socket?.on('newMessage', callback);
}

export function disconnectChat() {
  if (socket) {
    socket.off('newMessage');
    socket.disconnect();
    socket = null;
  }
}

// Historial via REST
export async function getChatHistory(jobId) {
  const token = await SecureStore.getItemAsync('token');
  const response = await axios.get(`${API_URL}/chat/${jobId}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}