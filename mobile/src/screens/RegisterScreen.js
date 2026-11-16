import React, { useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { register } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/FormInput';
import { useKeyboardHeight } from '../hooks/useKeyboardHeight';
import { colors, spacing, radius, fontSize } from '../theme/colors';

export default function RegisterScreen({ navigation }) {
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  async function handleRegister() {
    if (!nombre || !email || !password) {
      Alert.alert('Faltan datos', 'Nombre, email y contraseña son obligatorios');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Contraseña corta', 'Usa al menos 6 caracteres');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        password,
        telefono: telefono.trim(),
      });
      // Registro exitoso → login automatico
      await signIn(email.trim().toLowerCase(), password);
    } catch (error) {
      const status = error.response?.status;
      const msg =
        status === 409
          ? 'Ese email ya está registrado'
          : status === 400
          ? 'Revisa los datos ingresados'
          : 'No se pudo crear la cuenta. Intenta de nuevo.';
      Alert.alert('Error', msg);
      console.log('Error registro:', error.response?.data ?? error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: keyboardHeight + spacing.lg }}
      keyboardShouldPersistTaps="handled"
    >
      {/* ---------- Cabecera ---------- */}
      <View style={[styles.hero, { paddingTop: insets.top + spacing.md }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Crea tu cuenta</Text>
        <Text style={styles.subtitle}>Únete a CHAMBA en menos de un minuto</Text>
      </View>

      {/* ---------- Formulario ---------- */}
      <View style={styles.formCard}>
        <FormInput
          label="Nombre completo"
          icon="person-outline"
          placeholder="Ej: Juan Pérez"
          value={nombre}
          onChangeText={setNombre}
          autoCapitalize="words"
        />
        <FormInput
          label="Email"
          icon="mail-outline"
          placeholder="tucorreo@ejemplo.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <FormInput
          label="Teléfono (opcional)"
          icon="call-outline"
          placeholder="Ej: 987654321"
          value={telefono}
          onChangeText={setTelefono}
          keyboardType="phone-pad"
        />
        <FormInput
          label="Contraseña"
          icon="lock-closed-outline"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChangeText={setPassword}
          secure
        />

        <View style={styles.note}>
          <Ionicons name="information-circle-outline" size={18} color={colors.primaryDark} />
          <Text style={styles.noteText}>
            Si ofreces servicios, podrás activar tu perfil de técnico después, desde Mi perfil.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, submitting && { opacity: 0.7 }]}
          onPress={handleRegister}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Crear cuenta</Text>
          )}
        </TouchableOpacity>

        <View style={styles.linkRow}>
          <Text style={styles.linkMuted}>¿Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.link}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.backgroundAlt },
  hero: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl + spacing.lg,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  back: { alignSelf: 'flex-start', marginBottom: spacing.md },
  title: { color: colors.white, fontSize: fontSize.xxl, fontWeight: '800' },
  subtitle: { color: colors.white, opacity: 0.9, fontSize: fontSize.md, marginTop: 4 },
  formCard: {
    backgroundColor: colors.background,
    marginHorizontal: spacing.md,
    marginTop: -spacing.xl,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  note: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: spacing.sm + 4,
    marginBottom: spacing.md,
  },
  noteText: { flex: 1, fontSize: fontSize.xs + 1, color: colors.text, lineHeight: 18 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    minHeight: 54,
    justifyContent: 'center',
  },
  buttonText: { color: colors.white, fontSize: fontSize.md + 1, fontWeight: '700' },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  linkMuted: { color: colors.textMuted, fontSize: fontSize.sm + 1 },
  link: { color: colors.primary, fontSize: fontSize.sm + 1, fontWeight: '700' },
});