import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { login as loginRequest } from '../services/authService';
import { getMyTechnicianProfile } from '../services/techniciansService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // mientras revisa si hay sesion guardada
  const [mode, setMode] = useState('cliente'); // 'cliente' | 'tecnico'
  const [isTechnician, setIsTechnician] = useState(false);

  // Al abrir la app, recuperar el token guardado (si existe)
  useEffect(() => {
    async function loadToken() {
      try {
        const saved = await SecureStore.getItemAsync('token');
        if (saved) setToken(saved);
        
        if (saved) {
          setToken(saved);
          await refreshTechnicianStatus(); // ← saber si es tecnico al abrir
        }
      } finally {
        setLoading(false);
      }
    }
    loadToken();
  }, []);

  // Si el backend responde 401 (token vencido o invalido), cerrar sesion automaticamente.
  // Se excluye el login, donde un 401 solo significa "contraseña incorrecta".
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const status = error.response?.status;
        const url = error.config?.url ?? '';
        if (status === 401 && !url.includes('/auth/login')) {
          await signOut();
        }
        return Promise.reject(error);
      },
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  async function signIn(email, password) {
    const data = await loginRequest(email, password);
    const newToken = data.access_token; // ← ajusta si tu API devuelve otro nombre
    await SecureStore.setItemAsync('token', newToken);
    setToken(newToken);

    await SecureStore.setItemAsync('token', newToken);
    setToken(newToken);
    setMode('cliente');
    await refreshTechnicianStatus();
  }

  async function signOut() {
    await SecureStore.deleteItemAsync('token');
    setToken(null);

    setMode('cliente');
    setIsTechnician(false);
  
  }

  async function refreshTechnicianStatus() {
    try {
      const profile = await getMyTechnicianProfile();
      setIsTechnician(!!profile);
    } catch (e) {
      setIsTechnician(false);
    }
  }

  return (
    <AuthContext.Provider value={{ 
      token, loading, 
        
        mode,
        setMode,
        isTechnician,
        refreshTechnicianStatus,
        signIn,
        signOut, 
      
      }}>
      {children}
    </AuthContext.Provider>
  );
  
}

export function useAuth() {
  return useContext(AuthContext);
}