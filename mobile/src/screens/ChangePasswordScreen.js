import React, { useLayoutEffect, useState } from 'react';
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
import { changePassword } from '../services/authService';
import FormInput from '../components/FormInput';
import { useKeyboardHeight } from '../hooks/useKeyboardHeight';
import { colors, spacing, radius, fontSize } from '../theme/colors';

export default function ChangePasswordScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();

  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [repetir, setRepetir] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Cambiar contraseña',
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: colors.white,
      headerShadowVisible: false,
    });
  }, [navigation]);

  async function handleSubmit() {
    if (!actual || !nueva || !repetir) {
      Alert.alert('Faltan datos', 'Completa los tres campos');
      return;
    }
    if (nueva.length < 6) {
      Alert.alert('Contraseña corta', 'La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (nueva !== repetir) {
      Alert.alert('No coinciden', 'La nueva contraseña y su repetición no son iguales');
      return;
    }
    if (nueva === actual) {
      Alert.alert('Misma contraseña', 'La nueva contraseña debe ser distinta a la actual');
      return;
    }

    setSubmitting(true);
    try {
      await changePassword(actual, nueva);
      Alert.alert('Listo 🔒', 'Tu contraseña fue actualizada', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      const status = error.response?.status;
      const msg = error.response?.data?.message;
      if (status === 429) {
        Alert.alert('Demasiados intentos', 'Espera un minuto e inténtalo de nuevo');
      } else {
        Alert.alert(
          'No se pudo cambiar',
          Array.isArray(msg) ? msg.join('\n') : msg ?? 'Intenta de nuevo',
        );
      }
      console.log('Error cambio de contraseña:', error.response?.data ?? error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={[styles.screen, { paddingBottom: keyboardHeight }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.intro}>
          <Ionicons name="shield-checkmark" size={26} color={colors.primary} />
          <Text style={styles.introText}>
            Por seguridad, primero confirma tu contraseña actual.
          </Text>
        </View>

        <View style={styles.card}>
          <FormInput
            label="Contraseña actual"
            icon="lock-closed-outline"
            placeholder="Tu contraseña actual"
            value={actual}
            onChangeText={setActual}
            secure
          />
          <FormInput
            label="Nueva contraseña"
            icon="key-outline"
            placeholder="Mínimo 6 caracteres"
            value={nueva}
            onChangeText={setNueva}
            secure
          />
          <FormInput
            label="Repetir nueva contraseña"
            icon="key-outline"
            placeholder="Escríbela otra vez"
            value={repetir}
            onChangeText={setRepetir}
            secure
            style={{ marginBottom: 0 }}
          />
          {repetir.length > 0 && nueva !== repetir && (
            <Text style={styles.warning}>Las contraseñas no coinciden</Text>
          )}
        </View>
      </ScrollView>

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
            <Text style={styles.buttonText}>Guardar nueva contraseña</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.backgroundAlt },
  content: { padding: spacing.md },
  intro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  introText: { flex: 1, fontSize: fontSize.sm, color: colors.text, lineHeight: 20 },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  warning: {
    color: colors.danger,
    fontSize: fontSize.xs + 1,
    marginTop: spacing.sm,
  },
  footer: {
    backgroundColor: colors.background,
    paddingTop: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  buttonText: { color: colors.white, fontSize: fontSize.md + 1, fontWeight: '700' },
});