import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCurrentLocation } from '../services/locationService';
import { getCategories, createTechnicianProfile } from '../services/techniciansService';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/FormInput';
import { useKeyboardHeight } from '../hooks/useKeyboardHeight';
import { colors, spacing, radius, fontSize } from '../theme/colors';
import { getCategoryIcon } from '../theme/categoryIcons';

const OPCIONES_RADIO = [3, 5, 10, 15, 25];

export default function BecomeTechnicianScreen({ navigation }) {
  const { refreshTechnicianStatus, setMode } = useAuth();
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();

  const [categories, setCategories] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [dni, setDni] = useState('');
  const [direccion, setDireccion] = useState('');
  const [radio, setRadio] = useState(5);
  const [coords, setCoords] = useState(null);
  const [loadingCats, setLoadingCats] = useState(true);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Hazte técnico',
      headerStyle: { backgroundColor: colors.tech },
      headerTintColor: colors.white,
      headerShadowVisible: false,
    });
  }, [navigation]);

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
    if (!/^\d{8}$/.test(dni.trim())) {
      Alert.alert('DNI inválido', 'El DNI debe tener 8 dígitos');
      return;
    }
    if (!direccion.trim()) {
      Alert.alert('Falta la dirección', 'Ingresa tu dirección base');
      return;
    }
    if (selectedIds.length === 0) {
      Alert.alert('Servicios', 'Elige al menos un servicio que ofreces');
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
        radioCoberturaKm: radio,
        latitud: coords.lat,
        longitud: coords.lng,
        categoriaIds: selectedIds,
      });

      // Avisar a la app que ahora este usuario ES tecnico
      await refreshTechnicianStatus();

      Alert.alert(
        '¡Listo! 🛠️',
        'Ya eres técnico en CHAMBA. Los clientes cercanos podrán encontrarte.',
        [
          { text: 'Después', style: 'cancel', onPress: () => navigation.goBack() },
          {
            text: 'Ir a modo técnico',
            onPress: () => {
              navigation.goBack();
              setMode('tecnico');
            },
          },
        ],
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
    <View style={[styles.screen, { paddingBottom: keyboardHeight }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* ---------- Intro ---------- */}
        <View style={styles.intro}>
          <Ionicons name="briefcase" size={26} color={colors.tech} />
          <Text style={styles.introText}>
            Completa tu perfil para empezar a recibir solicitudes de clientes cerca de ti.
          </Text>
        </View>

        {/* ---------- Datos ---------- */}
        <Text style={styles.section}>Tus datos</Text>
        <View style={styles.card}>
          <FormInput
            label="DNI"
            icon="card-outline"
            placeholder="Ej: 72345678"
            value={dni}
            onChangeText={setDni}
            keyboardType="number-pad"
            maxLength={8}
            accent={colors.tech}
          />
          <FormInput
            label="Dirección base"
            icon="location-outline"
            placeholder="Ej: Av. Los Álamos 123, San Isidro"
            value={direccion}
            onChangeText={setDireccion}
            accent={colors.tech}
            style={{ marginBottom: 0 }}
          />
        </View>

        {/* ---------- Servicios ---------- */}
        <Text style={styles.section}>¿Qué servicios ofreces?</Text>
        <View style={styles.card}>
          {loadingCats ? (
            <ActivityIndicator color={colors.tech} style={{ marginVertical: spacing.sm }} />
          ) : (
            <View style={styles.chipsWrap}>
              {categories.map((cat) => {
                const { icon, color } = getCategoryIcon(cat.nombre);
                const selected = selectedIds.includes(cat.id);
                return (
                  <TouchableOpacity
                    key={cat.id}
                    activeOpacity={0.8}
                    onPress={() => toggleCategory(cat.id)}
                    style={[
                      styles.chip,
                      selected && { backgroundColor: color + '1A', borderColor: color },
                    ]}
                  >
                    <Ionicons name={icon} size={16} color={color} />
                    <Text style={[styles.chipText, selected && { color }]}>{cat.nombre}</Text>
                    {selected && <Ionicons name="checkmark-circle" size={16} color={color} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
          <Text style={styles.hint}>Puedes elegir varios.</Text>
        </View>

        {/* ---------- Zona ---------- */}
        <Text style={styles.section}>Zona de trabajo</Text>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>¿Hasta qué distancia atiendes?</Text>
          <View style={styles.radioRow}>
            {OPCIONES_RADIO.map((km) => {
              const activo = radio === km;
              return (
                <TouchableOpacity
                  key={km}
                  style={[styles.radioChip, activo && styles.radioChipActive]}
                  onPress={() => setRadio(km)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.radioText, activo && styles.radioTextActive]}>
                    {km} km
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.locationButton, coords && styles.locationButtonDone]}
            onPress={handleGetLocation}
            disabled={gettingLocation}
            activeOpacity={0.85}
          >
            {gettingLocation ? (
              <ActivityIndicator color={colors.tech} />
            ) : (
              <>
                <Ionicons
                  name={coords ? 'checkmark-circle' : 'navigate-outline'}
                  size={20}
                  color={colors.tech}
                />
                <Text style={styles.locationText}>
                  {coords ? 'Ubicación registrada' : 'Usar mi ubicación actual'}
                </Text>
              </>
            )}
          </TouchableOpacity>
          {coords && (
            <TouchableOpacity onPress={handleGetLocation}>
              <Text style={styles.relocate}>Actualizar ubicación</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* ---------- Boton fijo ---------- */}
      <View
        style={[
          styles.footer,
          { paddingBottom: keyboardHeight > 0 ? spacing.sm + 4 : insets.bottom + spacing.md },
        ]}
      >
        <TouchableOpacity
          style={[styles.button, submitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons name="construct" size={20} color={colors.white} />
              <Text style={styles.buttonText}>Convertirme en técnico</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.backgroundAlt },
  content: { padding: spacing.md, paddingBottom: spacing.lg },

  intro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    backgroundColor: colors.techSoft,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  introText: { flex: 1, fontSize: fontSize.sm, color: colors.text, lineHeight: 20 },

  section: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  cardLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  hint: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: spacing.sm },

  // Chips de servicios
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm + 4,
  },
  chipText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },

  // Radio de cobertura
  radioRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  radioChip: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingVertical: 6,
    paddingHorizontal: spacing.md - 2,
  },
  radioChipActive: { backgroundColor: colors.tech, borderColor: colors.tech },
  radioText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  radioTextActive: { color: colors.white },

  // Ubicacion
  locationButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.tech,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    paddingVertical: spacing.md - 2,
    minHeight: 50,
  },
  locationButtonDone: { borderStyle: 'solid', backgroundColor: colors.techSoft },
  locationText: { color: colors.tech, fontWeight: '700', fontSize: fontSize.md - 1 },
  relocate: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: fontSize.xs + 1,
    marginTop: spacing.sm,
    textDecorationLine: 'underline',
  },

  // Boton fijo
  footer: {
    backgroundColor: colors.background,
    paddingTop: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.tech,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    minHeight: 54,
  },
  buttonText: { color: colors.white, fontSize: fontSize.md + 1, fontWeight: '700' },
});