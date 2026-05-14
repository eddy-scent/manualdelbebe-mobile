import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { Heart, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../utils/constants';

export default function InicioSesion({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');

    if (!email.trim()) {
      setError('Por favor ingresá tu correo electrónico.');
      return;
    }
    if (!password) {
      setError('Por favor ingresá tu contraseña.');
      return;
    }

    setLoading(true);
    const result = await login({ email, password });
    setLoading(false);

    if (!result.success) {
      setError(result.message);
    } else {
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor="#fcf9f3" />
      <View style={styles.backgroundGlowOne} />
      <View style={styles.backgroundGlowTwo} />
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Heart size={32} color={COLORS.primary} />
            </View>
            <View style={styles.titleGroup}>
              <Text style={styles.title}>Mi manual del bebé</Text>
              <Text style={styles.subtitle}>Bienvenida a tu espacio seguro</Text>
            </View>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Correo electrónico</Text>
            <View style={styles.inputContainer}>
              <View style={{ marginRight: 12 }}>
                <Mail size={18} color="#574146" />
              </View>
              <TextInput
                value={email}
                onChangeText={(text) => { setEmail(text); setError(''); }}
                placeholder="tu@email.com"
                placeholderTextColor="#8a7176"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.inputContainer}>
              <View style={{ marginRight: 12 }}>
                <Lock size={18} color="#574146" />
              </View>
              <TextInput
                value={password}
                onChangeText={(text) => { setPassword(text); setError(''); }}
                placeholder="••••••••"
                placeholderTextColor="#8a7176"
                secureTextEntry={!showPassword}
                style={styles.input}
              />
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <Eye size={18} color="#574146" /> : <EyeOff size={18} color="#574146" />}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
                <ArrowRight size={18} color="#ffffff" />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿No tienes una cuenta?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Registro')}>
              <Text style={styles.createAccount}>Crear cuenta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fcf9f3',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  backgroundGlowOne: {
    position: 'absolute',
    width: '70%',
    height: '70%',
    left: '-10%',
    top: '-15%',
    borderRadius: 999,
    backgroundColor: 'rgba(242,160,190,0.35)',
  },
  backgroundGlowTwo: {
    position: 'absolute',
    width: '80%',
    height: '80%',
    right: '-10%',
    bottom: '-20%',
    borderRadius: 999,
    backgroundColor: 'rgba(180,228,245,0.28)',
  },
  card: {
    backgroundColor: 'rgba(252,249,243,0.95)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    padding: 28,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#F2A0BE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 4,
  },
  titleGroup: {
    alignItems: 'center',
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: COLORS.dangerBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 14,
    textAlign: 'center',
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e2dc',
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    height: 52,
    color: COLORS.text,
    fontSize: 16,
  },
  toggleButton: {
    padding: 8,
  },
  primaryButton: {
    marginTop: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    marginTop: 22,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(229,226,220,0.5)',
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  createAccount: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
});