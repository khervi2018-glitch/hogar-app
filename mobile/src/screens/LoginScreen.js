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
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/FormInput';
import { useKeyboardHeight } from '../hooks/useKeyboardHeight';
import { colors, spacing, radius, fontSize } from '../theme/colors';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Esta pantalla dibuja su propia cabecera
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Faltan datos', 'Ingresa tu email y contraseña');
      return;
    }
    setSubmitting(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
      // Si funciona, la navegacion cambia sola (App.js)
    } catch (error) {
      const msg =
        error.response?.status === 401
          ? 'Email o contraseña incorrectos'
          : 'No se pudo conectar con el servidor';
      Alert.alert('Error', msg);
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
      {/* ---------- Marca ---------- */}
      <View style={[styles.hero, { paddingTop: insets.top + spacing.xl }]}>
        <View style={styles.logo}>
          <Ionicons name="hammer" size={36} color={colors.primary} />
        </View>
        <Text style={styles.brand}>CHAMBA</Text>
        <Text style={styles.tagline}>Encuentra quien lo haga por ti</Text>
      </View>

      {/* ---------- Formulario ---------- */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Inicia sesión</Text>

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
          label="Contraseña"
          icon="lock-closed-outline"
          placeholder="Tu contraseña"
          value={password}
          onChangeText={setPassword}
          secure
        />

        <TouchableOpacity
          style={[styles.button, submitting && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Ingresar</Text>
          )}
        </TouchableOpacity>

        <View style={styles.linkRow}>
          <Text style={styles.linkMuted}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>Regístrate</Text>
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
    alignItems: 'center',
    paddingBottom: spacing.xl + spacing.lg,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logo: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm + 4,
  },
  brand: { color: colors.white, fontSize: fontSize.xxl + 4, fontWeight: '800', letterSpacing: 1 },
  tagline: { color: colors.white, opacity: 0.9, fontSize: fontSize.md, marginTop: 4 },
  formCard: {
    backgroundColor: colors.background,
    marginHorizontal: spacing.md,
    marginTop: -spacing.xl,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md + 4,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
    minHeight: 54,
    justifyContent: 'center',
  },
  buttonText: { color: colors.white, fontSize: fontSize.md + 1, fontWeight: '700' },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  linkMuted: { color: colors.textMuted, fontSize: fontSize.sm + 1 },
  link: { color: colors.primary, fontSize: fontSize.sm + 1, fontWeight: '700' },
});