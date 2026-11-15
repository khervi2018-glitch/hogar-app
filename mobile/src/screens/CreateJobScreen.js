import React, { useLayoutEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { createJob } from '../services/jobsService';
import { colors, spacing, radius, fontSize } from '../theme/colors';
import { getCategoryIcon } from '../theme/categoryIcons';

const MAX_DESCRIPCION = 500;

export default function CreateJobScreen({ route, navigation }) {
  const { technician } = route.params;
  const insets = useSafeAreaInsets();

  const headerHeight = useHeaderHeight();
  const scrollRef = useRef(null);
  const categorias = technician.categorias ?? [];
  const nombre = technician.user?.nombre ?? 'Técnico';
  const rating = Number(technician.calificacionPromedio ?? 0);

  // Si el tecnico tiene una sola categoria, queda seleccionada de entrada
  const [selectedCategory, setSelectedCategory] = useState(
    categorias.length === 1 ? categorias[0] : null,
  );
  const [descripcion, setDescripcion] = useState('');
  const [direccion, setDireccion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused] = useState(null); // 'descripcion' | 'direccion' | null

  // Barra superior naranja, igual que en el detalle del tecnico
  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Solicitar servicio',
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: colors.white,
      headerShadowVisible: false,
    });
  }, [navigation]);

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
        `${nombre} recibirá tu solicitud.`,
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
        <KeyboardAvoidingView
      style={styles.screen}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* ---------- Tecnico ---------- */}
        <View style={styles.techCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{nombre.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.techLabel}>Solicitud para</Text>
            <Text style={styles.techName}>{nombre}</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={13} color={colors.warning} />
            <Text style={styles.ratingText}>
              {rating > 0 ? rating.toFixed(1) : 'Nuevo'}
            </Text>
          </View>
        </View>

        {/* ---------- Servicio ---------- */}
        <Text style={styles.label}>¿Qué servicio necesitas?</Text>
        <View style={styles.chipsWrap}>
          {categorias.map((cat) => {
            const { icon, color } = getCategoryIcon(cat.nombre);
            const selected = selectedCategory?.id === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                activeOpacity={0.8}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.chip,
                  selected && { backgroundColor: color + '1A', borderColor: color },
                ]}
              >
                <Ionicons name={icon} size={16} color={color} />
                <Text style={[styles.chipText, selected && { color }]}>
                  {cat.nombre}
                </Text>
                {selected && (
                  <Ionicons name="checkmark-circle" size={16} color={color} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ---------- Descripcion ---------- */}
        <Text style={styles.label}>Describe el problema</Text>
        <View
          style={[
            styles.inputBox,
            styles.textAreaBox,
            focused === 'descripcion' && styles.inputBoxFocused,
          ]}
        >
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ej: Se dañó el interruptor de la sala, no enciende la luz"
            placeholderTextColor={colors.textMuted}
            value={descripcion}
            onChangeText={setDescripcion}
            onFocus={() => setFocused('descripcion')}
            onBlur={() => setFocused(null)}
            multiline
            maxLength={MAX_DESCRIPCION}
          />
        </View>
        <Text style={styles.counter}>
          {descripcion.length}/{MAX_DESCRIPCION}
        </Text>

        {/* ---------- Direccion ---------- */}
        <Text style={styles.label}>Dirección del trabajo</Text>
        <View
          style={[styles.inputBox, focused === 'direccion' && styles.inputBoxFocused]}
        >
          <Ionicons
            name="location-outline"
            size={20}
            color={focused === 'direccion' ? colors.primary : colors.textMuted}
          />
          <TextInput
            style={styles.input}
            placeholder="Ej: Av. Los Álamos 123, San Isidro"
            placeholderTextColor={colors.textMuted}
            value={direccion}
            onChangeText={setDireccion}
            onFocus={() => {
              setFocused('direccion');
              // Espera a que el teclado termine de abrir y baja hasta el campo
              setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 250);
            }}
            onBlur={() => setFocused(null)}
          />
        </View>

        {/* ---------- Aviso del precio ---------- */}
        <View style={styles.infoBox}>
          <Ionicons name="chatbubbles-outline" size={20} color={colors.primaryDark} />
          <Text style={styles.infoText}>
            El precio se acuerda con el técnico por chat, después de que acepte tu
            solicitud. Enviarla no tiene costo.
          </Text>
        </View>
      </ScrollView>

      {/* ---------- Boton fijo ---------- */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          activeOpacity={0.85}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons name="paper-plane" size={20} color={colors.white} />
              <Text style={styles.buttonText}>Enviar solicitud</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.backgroundAlt },
  content: { padding: spacing.md, paddingBottom: spacing.lg },

  // Tarjeta del tecnico
  techCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    borderWidth: 2,
    borderColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: colors.primary, fontSize: fontSize.lg + 2, fontWeight: 'bold' },
  techLabel: { fontSize: fontSize.xs, color: colors.textMuted },
  techName: { fontSize: fontSize.md + 1, fontWeight: 'bold', color: colors.text },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.warningSoft,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
  },
  ratingText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },

  // Etiquetas
  label: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  // Chips
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
    paddingHorizontal: spacing.sm + 6,
  },
  chipText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },

  // Campos
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm + 4,
  },
  inputBoxFocused: { borderColor: colors.primary },
  textAreaBox: { alignItems: 'flex-start' },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    paddingVertical: spacing.sm + 4,
  },
  textArea: { minHeight: 110, textAlignVertical: 'top' },
  counter: {
    alignSelf: 'flex-end',
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  // Aviso
  infoBox: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.sm + 4,
    marginTop: spacing.lg,
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
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
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    minHeight: 54,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: colors.white, fontSize: fontSize.md + 1, fontWeight: '700' },
});