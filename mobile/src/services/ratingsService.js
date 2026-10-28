import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config/api';

export async function createRating(jobId, puntaje, comentario) {
  const token = await SecureStore.getItemAsync('token');
  const response = await axios.post(
    `${API_URL}/jobs/${jobId}/ratings`,
    { puntaje, comentario },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data;
}

export async function getJobRatings(jobId) {
  const token = await SecureStore.getItemAsync('token');
  const response = await axios.get(`${API_URL}/jobs/${jobId}/ratings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}