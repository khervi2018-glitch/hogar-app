import axios from 'axios';
import { API_URL } from '../config/api';

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