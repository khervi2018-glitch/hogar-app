import * as Location from 'expo-location';

// Pide permiso y devuelve la ubicacion actual del dispositivo
// Retorna: { lat, lng } o lanza un error si no hay permiso
export async function getCurrentLocation() {
  // 1. Pedir permiso al usuario (Android/iOS muestran su dialogo nativo)
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== 'granted') {
    throw new Error('PERMISO_DENEGADO');
  }

  // 2. Obtener coordenadas
  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced, // suficiente para buscar tecnicos
  });

  return {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
  };
}