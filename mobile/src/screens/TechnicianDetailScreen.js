import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export default function TechnicianDetailScreen({ route, navigation }) {
  // El tecnico llega como parametro de navegacion desde la lista
  const { technician } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {technician.user.nombre.charAt(0)}
          </Text>
        </View>
        <Text style={styles.name}>{technician.user.nombre}</Text>
                <Text style={styles.rating}>
          ⭐ {(technician.calificacionPromedio ?? 0) > 0
            ? technician.calificacionPromedio.toFixed(1)
            : 'Sin calificaciones'}
        </Text>
                {technician.distanciaKm != null && (
          <Text style={styles.distance}>
            📍 A {technician.distanciaKm.toFixed(1)} km de ti
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Servicios</Text>
        {technician.categorias.map((cat) => (
          <View key={cat.id} style={styles.categoryRow}>
            <Text style={styles.categoryText}>
              {cat.icono} {cat.nombre}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Zona de trabajo</Text>
        <Text style={styles.infoText}>
          Cubre hasta {technician.radioCoberturaKm} km a la redonda
        </Text>
      </View>

      <TouchableOpacity
        style={styles.requestButton}
        onPress={() => navigation.navigate('CreateJob', { technician })}
      >
        <Text style={styles.requestButtonText}>Solicitar servicio</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  name: { fontSize: 22, fontWeight: 'bold' },
  rating: { fontSize: 16, color: '#666', marginTop: 4 },
  distance: { fontSize: 14, color: '#2563eb', marginTop: 4 },
  section: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  categoryRow: { paddingVertical: 6 },
  categoryText: { fontSize: 16 },
  infoText: { fontSize: 15, color: '#444' },
  requestButton: {
    backgroundColor: '#2563eb',
    margin: 20,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  requestButtonText: { color: '#fff', fontSize: 17, fontWeight: '600' },
});