import React, { useState } from 'react';
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
import { createJob } from '../services/jobsService';

export default function CreateJobScreen({ route, navigation }) {
  const { technician } = route.params;

  // Si el tecnico tiene una sola categoria, queda seleccionada de entrada
  const [selectedCategory, setSelectedCategory] = useState(
    technician.categorias.length === 1 ? technician.categorias[0] : null,
  );
  const [descripcion, setDescripcion] = useState('');
  const [direccion, setDireccion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!selectedCategory) {
      Alert.alert('Falta el servicio', 'Elige qué tipo de servicio necesitas');
      return;
    }
    if (!descripcion.trim() || !direccion.trim()) {
      Alert.alert('Faltan datos', 'Describe el problema y la dirección');
      return;
    }

    setSubmitting(true);
    try {
      await createJob({
        technicianProfileId: technician.id,
        serviceCategoryId: selectedCategory.id,
        descripcion: descripcion.trim(),
        direccionTrabajo: direccion.trim(),
      });

      Alert.alert(
        'Solicitud enviada 🎉',
        `${technician.user.nombre} recibirá tu solicitud.`,
        [{ text: 'OK', onPress: () => navigation.popToTop() }],
      );
    } catch (error) {
      console.log('Error creando job:', error.response?.data ?? error.message);
      Alert.alert('Error', 'No se pudo enviar la solicitud. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Técnico</Text>
      <Text style={styles.technicianName}>{technician.user.nombre}</Text>

      <Text style={styles.label}>¿Qué servicio necesitas?</Text>
      <View style={styles.chipsRow}>
        {technician.categorias.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.chip,
              selectedCategory?.id === cat.id && styles.chipSelected,
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[
                styles.chipText,
                selectedCategory?.id === cat.id && styles.chipTextSelected,
              ]}
            >
              {cat.icono} {cat.nombre}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Describe el problema</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Ej: Se dañó el interruptor de la sala, no enciende la luz"
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Dirección del trabajo</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Av. Los Álamos 123, San Isidro"
        value={direccion}
        onChangeText={setDireccion}
      />

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>Enviar solicitud</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#666', marginTop: 16, marginBottom: 6 },
  technicianName: { fontSize: 18, fontWeight: 'bold' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
  chipTextSelected: { color: '#fff' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  submitButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 28,
  },
  submitText: { color: '#fff', fontSize: 17, fontWeight: '600' },
});