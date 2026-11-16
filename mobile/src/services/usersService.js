import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config/api';
import { getUserIdFromToken } from '../utils/jwt';

// Datos del usuario logueado (nombre, email, telefono...)
export async function getMe() {
  const token = await SecureStore.getItemAsync('token');
  const userId = getUserIdFromToken(token);

  const response = await axios.get(`${API_URL}/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}