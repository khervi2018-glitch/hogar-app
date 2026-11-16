import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config/api';
import { getUserIdFromToken } from '../utils/jwt';

export async function createJob({
  technicianProfileId,
  serviceCategoryId,
  descripcion,
  direccionTrabajo,
}) {
  const token = await SecureStore.getItemAsync('token');
  const clienteId = getUserIdFromToken(token);

  const response = await axios.post(
    `${API_URL}/jobs`,
    {
      clienteId,
      technicianProfileId,
      serviceCategoryId,
      descripcion,
      direccionTrabajo,
    },
    { headers: { Authorization: `Bearer ${token}` } },
  );

  return response.data;
}

// Trae los trabajos del usuario segun el modo: 'cliente' o 'tecnico'
export async function getMyJobs(rol) {
  const token = await SecureStore.getItemAsync('token');

  const response = await axios.get(`${API_URL}/jobs/mine`, {
    params: { rol },
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
}

export async function getJobById(jobId) {
  const token = await SecureStore.getItemAsync('token');
  const response = await axios.get(`${API_URL}/jobs/${jobId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function updateJobStatus(jobId, estado) {
  const token = await SecureStore.getItemAsync('token');
  const response = await axios.patch(
    `${API_URL}/jobs/${jobId}/status`,
    { estado },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data;
}