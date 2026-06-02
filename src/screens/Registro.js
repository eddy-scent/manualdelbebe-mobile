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
import { User, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, CheckSquare, Square } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { isValidEmail, isValidDate, formatDateInput } from '../utils/validators';

export default function Registro({ navigation }) {
  const { register } = useAuth();
  const { colors, isDark } = useTheme();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  const [furDate, setFurDate] = useState('');
  const [babyDate, setBabyDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleDateBlur = (value, setter) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 8) {
      setter(`${digits.substring(0, 2)}/${digits.substring(2, 4)}/${digits.substring(4)}`);
    }
  };

  const handleRegister = async () => {
    setError('');

    if (!acceptedTerms) {
      import('react-native').then(({ Alert }) => {
        Alert.alert('Exención de responsabilidad', 'Debe aceptar la exención de responsabilidad para continuar.');
      });
      return;
    }

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError('Por favor ingresá tu nombre completo.');
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setError('Por favor ingresá un correo electrónico válido.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (birthDate && !isValidDate(birthDate)) {
      setError('La fecha de nacimiento no es válida.');
      return;
    }
    if (furDate && !isValidDate(furDate)) {
      setError('La fecha de última regla no es válida.');
      return;
    }
    if (babyDate && !isValidDate(babyDate)) {
      setError('La fecha de nacimiento del bebé no es válida.');
      return;
    }

    setLoading(true);
    const result = await register({
      fullName: trimmedName,
      email: trimmedEmail,
      password,
      birthDate: birthDate || null,
      furDate: furDate || null,
      babyDate: babyDate || null,
    });
    setLoading(false);

    if (!result.success) {
      setError(result.message);
    } else {
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.surface }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.pageContainer}>
          <View style={styles.header}>
            <Text style={[styles.brandTitle, { color: colors.primary }]}>MomsAI</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Tu compañero en el viaje de la maternidad</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.primary }]}>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Crea tu cuenta</Text>

              {error ? (
                <View style={[styles.errorBox, { backgroundColor: colors.dangerBg, borderColor: colors.danger }]}>
                  <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Nombre completo *</Text>
                <View style={[styles.inputRow, { backgroundColor: isDark ? colors.surfaceAlt : '#fcf9f3', borderColor: isDark ? colors.inputBorder : 'rgba(128,115,88,0.1)' }]}>
                  <View style={{ marginRight: 10 }}>
                    <User size={18} color={colors.textTertiary} />
                  </View>
                  <TextInput
                    value={fullName}
                    onChangeText={(text) => { setFullName(text); setError(''); }}
                    placeholder="María Pérez"
                    placeholderTextColor={colors.textTertiary}
                    style={[styles.input, { color: colors.text }]}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Correo electrónico *</Text>
                <View style={[styles.inputRow, { backgroundColor: isDark ? colors.surfaceAlt : '#fcf9f3', borderColor: isDark ? colors.inputBorder : 'rgba(128,115,88,0.1)' }]}>
                  <View style={{ marginRight: 10 }}>
                    <Mail size={18} color={colors.textTertiary} />
                  </View>
                  <TextInput
                    value={email}
                    onChangeText={(text) => { setEmail(text); setError(''); }}
                    placeholder="maria@ejemplo.com"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={[styles.input, { color: colors.text }]}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Contraseña *</Text>
                <View style={[styles.inputRow, { backgroundColor: isDark ? colors.surfaceAlt : '#fcf9f3', borderColor: isDark ? colors.inputBorder : 'rgba(128,115,88,0.1)' }]}>
                  <View style={{ marginRight: 10 }}>
                    <Lock size={18} color={colors.textTertiary} />
                  </View>
                  <TextInput
                    value={password}
                    onChangeText={(text) => { setPassword(text); setError(''); }}
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor={colors.textTertiary}
                    secureTextEntry={!showPassword}
                    style={[styles.input, { color: colors.text }]}
                  />
                  <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)} style={styles.eyeButton}>
                    {showPassword ? <Eye size={18} color={colors.textSecondary} /> : <EyeOff size={18} color={colors.textSecondary} />}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.optionalCard, { backgroundColor: isDark ? colors.surfaceAlt : '#f0eee8', borderColor: isDark ? colors.cardBorder : 'rgba(128,115,88,0.1)' }]}>
                <View style={styles.optionalHeader}>
                  <Sparkles size={22} color={colors.primary} />
                  <View style={styles.optionalTextGroup}>
                    <Text style={[styles.optionalTitle, { color: colors.text }]}>Personaliza tu experiencia</Text>
                    <Text style={[styles.optionalSubtitle, { color: colors.textSecondary }]}>Completa lo que aplique para ti (Opcional)</Text>
                  </View>
                </View>

                <View style={styles.optionalField}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Tu fecha de nacimiento</Text>
                  <TextInput
                    value={birthDate}
                    onChangeText={(text) => setBirthDate(formatDateInput(text))}
                    onBlur={() => handleDateBlur(birthDate, setBirthDate)}
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor={colors.textTertiary}
                    style={[styles.dateInput, { backgroundColor: isDark ? colors.card : '#e5e2dc', borderColor: isDark ? colors.inputBorder : 'rgba(128,115,88,0.2)', color: colors.text }, !isValidDate(birthDate) && birthDate.length === 10 && { borderColor: colors.danger }]}
                    keyboardType="number-pad"
                    maxLength={10}
                  />
                </View>

                <View style={styles.optionalField}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Fecha de última regla (FUR)</Text>
                  <TextInput
                    value={furDate}
                    onChangeText={(text) => setFurDate(formatDateInput(text))}
                    onBlur={() => handleDateBlur(furDate, setFurDate)}
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor={colors.textTertiary}
                    style={[styles.dateInput, { backgroundColor: isDark ? colors.card : '#e5e2dc', borderColor: isDark ? colors.inputBorder : 'rgba(128,115,88,0.2)', color: colors.text }, !isValidDate(furDate) && furDate.length === 10 && { borderColor: colors.danger }]}
                    keyboardType="number-pad"
                    maxLength={10}
                  />
                </View>

                <View style={styles.optionalField}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Fecha de nacimiento del bebé</Text>
                  <TextInput
                    value={babyDate}
                    onChangeText={(text) => setBabyDate(formatDateInput(text))}
                    onBlur={() => handleDateBlur(babyDate, setBabyDate)}
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor={colors.textTertiary}
                    style={[styles.dateInput, { backgroundColor: isDark ? colors.card : '#e5e2dc', borderColor: isDark ? colors.inputBorder : 'rgba(128,115,88,0.2)', color: colors.text }, !isValidDate(babyDate) && babyDate.length === 10 && { borderColor: colors.danger }]}
                    keyboardType="number-pad"
                    maxLength={10}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 16, marginBottom: 8 }}
                onPress={() => setAcceptedTerms(!acceptedTerms)}
                activeOpacity={0.8}
              >
                <View style={{ marginRight: 10, marginTop: 2 }}>
                  {acceptedTerms ? (
                    <CheckSquare size={20} color={colors.primary} />
                  ) : (
                    <Square size={20} color={colors.textTertiary} />
                  )}
                </View>
                <Text style={{ flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 18 }}>
                  Comprendo que esta aplicación es una herramienta de apoyo y registro, y en ningún caso reemplaza el diagnóstico, consejo o tratamiento de un profesional médico.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.primary, opacity: acceptedTerms ? 1 : 0.5 }]} onPress={handleRegister} activeOpacity={0.85} disabled={loading || !acceptedTerms}>
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>Registrarse</Text>
                    <ArrowRight size={18} color="#ffffff" style={{ marginLeft: 8 }} />
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.footerTextContainer}>
                <Text style={[styles.footerText, { color: colors.textSecondary }]}>¿Ya tienes cuenta?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('InicioSesion')}>
                  <Text style={[styles.footerLink, { color: colors.primary }]}>Inicia sesión</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.termsContainer}>
            <Text style={[styles.termsText, { color: isDark ? colors.textTertiary : 'rgba(87,65,70,0.75)' }]}>
              Al registrarte, aceptás nuestros{' '}
              <Text style={[styles.termsLink, { color: colors.primary }]}>Términos</Text> y{' '}
              <Text style={[styles.termsLink, { color: colors.primary }]}>Política de Privacidad</Text>.
            </Text>
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
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  pageContainer: {
    flex: 1,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    maxWidth: 560,
    marginBottom: 20,
    alignItems: 'center',
    paddingTop: 40,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSubtitle: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 560,
    borderRadius: 28,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 32,
    elevation: 8,
  },
  cardContent: {
    padding: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
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
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    marginBottom: 8,
    marginLeft: 4,
    fontSize: 13,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  eyeButton: {
    padding: 10,
    marginLeft: 6,
  },
  dateInput: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  optionalCard: {
    marginTop: 12,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  optionalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  optionalTextGroup: {
    flex: 1,
  },
  optionalTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  optionalSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
  },
  optionalField: {
    marginTop: 16,
  },
  submitButton: {
    marginTop: 18,
    width: '100%',
    borderRadius: 999,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  footerTextContainer: {
    marginTop: 18,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '700',
  },
  termsContainer: {
    marginTop: 16,
    paddingHorizontal: 8,
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    textDecorationLine: 'underline',
  },
});
