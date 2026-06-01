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
import { useTheme } from '../context/ThemeContext';

export default function InicioSesion({ navigation }) {
  const { login } = useAuth();
  const { colors, isDark } = useTheme();
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.surface }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.surface} />
      <View style={[styles.backgroundGlowOne, { backgroundColor: isDark ? 'rgba(235,93,139,0.15)' : 'rgba(242,160,190,0.35)' }]} />
      <View style={[styles.backgroundGlowTwo, { backgroundColor: isDark ? 'rgba(110,193,228,0.1)' : 'rgba(180,228,245,0.28)' }]} />
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, { backgroundColor: isDark ? colors.card : 'rgba(252,249,243,0.95)', borderColor: isDark ? colors.cardBorder : 'rgba(255,255,255,0.6)', shadowColor: colors.primary }]}>
          <View style={styles.header}>
            <View style={[styles.logoCircle, { backgroundColor: colors.primaryLight }]}>
              <Heart size={32} color={colors.primary} />
            </View>
            <View style={styles.titleGroup}>
              <Text style={[styles.title, { color: colors.text }]}>MomsAI</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Bienvenida a tu espacio seguro</Text>
            </View>
          </View>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.dangerBg, borderColor: colors.danger }]}>
              <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Correo electrónico</Text>
            <View style={[styles.inputContainer, { backgroundColor: isDark ? colors.surfaceAlt : '#ffffff', borderColor: isDark ? colors.inputBorder : '#e5e2dc' }]}>
              <View style={{ marginRight: 12 }}>
                <Mail size={18} color={colors.textSecondary} />
              </View>
              <TextInput
                value={email}
                onChangeText={(text) => { setEmail(text); setError(''); }}
                placeholder="tu@email.com"
                placeholderTextColor={colors.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.input, { color: colors.text }]}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Contraseña</Text>
            <View style={[styles.inputContainer, { backgroundColor: isDark ? colors.surfaceAlt : '#ffffff', borderColor: isDark ? colors.inputBorder : '#e5e2dc' }]}>
              <View style={{ marginRight: 12 }}>
                <Lock size={18} color={colors.textSecondary} />
              </View>
              <TextInput
                value={password}
                onChangeText={(text) => { setPassword(text); setError(''); }}
                placeholder="••••••••"
                placeholderTextColor={colors.textTertiary}
                secureTextEntry={!showPassword}
                style={[styles.input, { color: colors.text }]}
              />
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <Eye size={18} color={colors.textSecondary} /> : <EyeOff size={18} color={colors.textSecondary} />}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
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

          <View style={[styles.footer, { borderTopColor: isDark ? colors.cardBorder : 'rgba(229,226,220,0.5)' }]}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>¿No tienes una cuenta?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Registro')}>
              <Text style={[styles.createAccount, { color: colors.accent }]}>Crear cuenta</Text>
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
  },
  backgroundGlowTwo: {
    position: 'absolute',
    width: '80%',
    height: '80%',
    right: '-10%',
    bottom: '-20%',
    borderRadius: 999,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 28,
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
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  errorBox: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
  },
  toggleButton: {
    padding: 8,
  },
  primaryButton: {
    marginTop: 4,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
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
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  footerText: {
    fontSize: 16,
  },
  createAccount: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
});
