import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config/api';
import { getUserIdFromToken } from '../utils/jwt';


// Busca tecnicos cercanos a las coordenadas dadas
// categoriaId es opcional (para filtrar por Electricidad, Gasfiteria, etc.)
export async function searchNearby(lat, lng, categoriaId = null) {
  const token = await SecureStore.getItemAsync('token');

  const params = {
    latitud: lat,
    longitud: lng,
  };
  if (categoriaId) {
    params.categoriaId = categoriaId;
  }

  const response = await axios.get(
    `${API_URL}/technician-profiles/search/nearby`,
    {
      params,
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  return response.data;
}

// Trae las categorias de servicio disponibles (para que el tecnico elija)
export async function getCategories() {
  const token = await SecureStore.getItemAsync('token');
  const response = await axios.get(`${API_URL}/service-categories`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// Crea el perfil de tecnico del usuario logueado
export async function createTechnicianProfile({
  dni,
  direccion,
  radioCoberturaKm,
  latitud,
  longitud,
  categoriaIds,
}) {
  const token = await SecureStore.getItemAsync('token');
  const userId = getUserIdFromToken(token);

  const response = await axios.post(
    `${API_URL}/technician-profiles`,
    {
      userId,
      dni,
      direccion,
      radioCoberturaKm,
      latitud,
      longitud,
      categoriaIds,
    },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data;
}

// Devuelve el perfil de tecnico del usuario logueado, o null si no tiene
export async function getMyTechnicianProfile() {
  const token = await SecureStore.getItemAsync('token');
  const userId = getUserIdFromToken(token);

  // Traemos todos los perfiles y buscamos el del usuario actual
  const response = await axios.get(`${API_URL}/technician-profiles`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const mine = response.data.find((p) => p.user?.id === userId);
  return mine ?? null;
}

// Trae los tecnicos mejor calificados (para mostrar en el inicio)
export async function getTopTechnicians() {
  const token = await SecureStore.getItemAsync('token');
  const response = await axios.get(`${API_URL}/technician-profiles`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  // Ordenar por calificacion descendente y tomar los primeros 5
  return response.data
    .sort((a, b) => (b.calificacionPromedio ?? 0) - (a.calificacionPromedio ?? 0))
    .slice(0, 5);
}