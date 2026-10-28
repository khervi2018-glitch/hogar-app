import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { getCurrentLocation } from '../services/locationService';
import {
  getCategories,
  createTechnicianProfile,
} from '../services/techniciansService';

export default function BecomeTechnicianScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [dni, setDni] = useState('');
  const [direccion, setDireccion] = useState('');
  const [radio, setRadio] = useState('5');
  const [coords, setCoords] = useState(null);
  const [loadingCats, setLoadingCats] = useState(true);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((e) => console.log('Error categorias:', e.message))
      .finally(() => setLoadingCats(false));
  }, []);

  function toggleCategory(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function handleGetLocation() {
    setGettingLocation(true);
    try {
      const loc = await getCurrentLocation();
      setCoords(loc);
    } catch (e) {
      Alert.alert('Ubicación', 'No se pudo obtener tu ubicación. Actívala en ajustes.');
    } finally {
      setGettingLocation(false);
    }
  }

  async function handleSubmit() {
    if (!dni.trim() || !direccion.trim()) {
      Alert.alert('Faltan datos', 'Ingresa tu DNI y dirección');
      return;
    }
    if (selectedIds.length === 0) {
      Alert.alert('Categorías', 'Elige al menos un servicio que ofreces');
      return;
    }
    if (!coords) {
      Alert.alert('Ubicación', 'Toca "Usar mi ubicación actual" primero');
      return;
    }

    setSubmitting(true);
    try {
      await createTechnicianProfile({
        dni: dni.trim(),
        direccion: direccion.trim(),
        radioCoberturaKm: Number(radio) || 5,
        latitud: coords.lat,
        longitud: coords.lng,
        categoriaIds: selectedIds,
      });
      Alert.alert(
        '¡Listo! 🛠️',
        'Ya eres técnico en CHAMBA. Los clientes cercanos podrán encontrarte.',
        [{ text: 'Genial', onPress: () => navigation.goBack() }],
      );
    } catch (error) {
      const msg = error.response?.data?.message;
      Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg ?? 'No se pudo crear el perfil');
      console.log('Error perfil tecnico:', error.response?.data ?? error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.intro}>
        Completa tu perfil para empezar a recibir solicitudes de trabajo.
      </Text>

      <Text style={styles.label}>DNI</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 72345678"
        value={dni}
        onChangeText={setDni}
        keyboardType="number-pad"
      />

      <Text style={styles.label}>Dirección base</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Av. Los Álamos 123, San Isidro"
        value={direccion}
        onChangeText={setDireccion}
      />

      <Text style={styles.label}>Radio de cobertura (km)</Text>
      <TextInput
        style={styles.input}
        placeholder="5"
        value={radio}
        onChangeText={setRadio}
        keyboardType="number-pad"
      />

      <Text style={styles.label}>¿Qué servicios ofreces?</Text>
      {loadingCats ? (
        <ActivityIndicator color="#2563eb" style={{ marginVertical: 12 }} />
      ) : (
        <View style={styles.chipsWrap}>
          {categories.map((cat) => {
            const selected = selectedIds.includes(cat.id);
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => toggleCategory(cat.id)}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSel]}>
                  {cat.icono} {cat.nombre}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <Text style={styles.label}>Tu ubicación</Text>
      <TouchableOpacity
        style={styles.locationButton}
        onPress={handleGetLocation}
        disabled={gettingLocation}
      >
        <Text style={styles.locationText}>
          {gettingLocation
            ? 'Obteniendo...'
            : coords
            ? '✅ Ubicación registrada'
            : '📍 Usar mi ubicación actual'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>Convertirme en técnico</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  intro: { fontSize: 15, color: '#555', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#666', marginTop: 14, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  chipText: { fontSize: 15 },
  chipTextSel: { color: '#fff' },
  locationButton: {
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  locationText: { color: '#2563eb', fontWeight: '600', fontSize: 15 },
  submitButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 28,
  },
  submitText: { color: '#fff', fontSize: 17, fontWeight: '600' },
});