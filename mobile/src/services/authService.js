import axios from 'axios';
import { API_URL } from '../config/api';
import * as SecureStore from 'expo-secure-store';

export async function login(email, password) {
  const response = await axios.post(`${API_URL}/auth/login`, {
    email,
    password,
  });

  return response.data; // { access_token: '...' }
}

export async function register({ nombre, email, password, telefono }) {
  const response = await axios.post(`${API_URL}/users`, {
    tipo: 'cliente', // todos se registran como cliente; luego pueden volverse tecnico
    nombre,
    email,
    password,
    telefono,
  });
    return response.data;
}

export async function changePassword(passwordActual, passwordNueva) {
  const token = await SecureStore.getItemAsync('token');
  const response = await axios.patch(
    `${API_URL}/auth/password`,
    { passwordActual, passwordNueva },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data;
}