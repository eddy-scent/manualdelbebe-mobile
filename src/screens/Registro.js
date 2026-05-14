import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { User, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { isValidEmail, isValidDate, formatDateInput } from '../utils/validators';
import { COLORS } from '../utils/constants';

export default function Registro({ navigation }) {
const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  const [furDate, setFurDate] = useState('');
  const [babyDate, setBabyDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDateBlur = (value, setter) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 8) {
      setter(`${digits.substring(0, 2)}/${digits.substring(2, 4)}/${digits.substring(4)}`);
    }
  };

  const handleRegister = async () => {
    setError('');

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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.pageContainer}>
          <View style={styles.header}>
            <Text style={styles.brandTitle}>Mi manual del bebé</Text>
            <Text style={styles.headerSubtitle}>Tu compañero en el viaje de la maternidad</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.heroImageContainer}>
              <Image
                source={{
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDH7LkwowGuEFY0evr3uUR6bM-2KI6OoueMHwuNDnQGe5DPEzeFUJOj6OGJ-9DL9oO10COHFa0x6ZLVRudJEH8G5lGFNH7xR3bMUqi6TEoE_0VjfAtpyCe0MRtBOSnSVAId30ZS6wDqT6U-C1uCGUHu3ucnF_LN7W6qxXcQt1622peFLFLEIty0na7HMQ1Rh1n8-5ysA_4_XQbLjxZwYiQS-QkGrYKJbUlWkGQY-8NwUbdNBZLVd2LveBHs6EDSszY9rHjisVDupBA',
                }}
                style={styles.heroImage}
                resizeMode="cover"
              />
              <View style={styles.heroOverlay} />
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Crea tu cuenta</Text>

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre completo *</Text>
                <View style={styles.inputRow}>
                  <View style={{ marginRight: 10 }}>
                    <User size={18} color="#807358" />
                  </View>
                  <TextInput
                    value={fullName}
                    onChangeText={(text) => { setFullName(text); setError(''); }}
                    placeholder="María Pérez"
                    placeholderTextColor="#8a7176"
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Correo electrónico *</Text>
                <View style={styles.inputRow}>
                  <View style={{ marginRight: 10 }}>
                    <Mail size={18} color="#807358" />
                  </View>
                  <TextInput
                    value={email}
                    onChangeText={(text) => { setEmail(text); setError(''); }}
                    placeholder="maria@ejemplo.com"
                    placeholderTextColor="#8a7176"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contraseña *</Text>
                <View style={styles.inputRow}>
                  <View style={{ marginRight: 10 }}>
                    <Lock size={18} color="#807358" />
                  </View>
                  <TextInput
                    value={password}
                    onChangeText={(text) => { setPassword(text); setError(''); }}
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor="#8a7176"
                    secureTextEntry={!showPassword}
                    style={styles.input}
                  />
                  <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)} style={styles.eyeButton}>
                    {showPassword ? <Eye size={18} color="#574146" /> : <EyeOff size={18} color="#574146" />}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.optionalCard}>
                <View style={styles.optionalHeader}>
                  <Sparkles size={22} color={COLORS.primary} />
                  <View style={styles.optionalTextGroup}>
                    <Text style={styles.optionalTitle}>Personaliza tu experiencia</Text>
                    <Text style={styles.optionalSubtitle}>Completa lo que aplique para ti (Opcional)</Text>
                  </View>
                </View>

                <View style={styles.optionalField}>
                  <Text style={styles.label}>Tu fecha de nacimiento</Text>
                  <TextInput
                    value={birthDate}
                    onChangeText={(text) => setBirthDate(formatDateInput(text))}
                    onBlur={() => handleDateBlur(birthDate, setBirthDate)}
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor="#8a7176"
                    style={[styles.dateInput, !isValidDate(birthDate) && birthDate.length === 10 && { borderColor: COLORS.danger }]}
                    keyboardType="number-pad"
                    maxLength={10}
                  />
                </View>

                <View style={styles.optionalField}>
                  <Text style={styles.label}>Fecha de última regla (FUR)</Text>
                  <TextInput
                    value={furDate}
                    onChangeText={(text) => setFurDate(formatDateInput(text))}
                    onBlur={() => handleDateBlur(furDate, setFurDate)}
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor="#8a7176"
                    style={[styles.dateInput, !isValidDate(furDate) && furDate.length === 10 && { borderColor: COLORS.danger }]}
                    keyboardType="number-pad"
                    maxLength={10}
                  />
                </View>

                <View style={styles.optionalField}>
                  <Text style={styles.label}>Fecha de nacimiento del bebé</Text>
                  <TextInput
                    value={babyDate}
                    onChangeText={(text) => setBabyDate(formatDateInput(text))}
                    onBlur={() => handleDateBlur(babyDate, setBabyDate)}
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor="#8a7176"
                    style={[styles.dateInput, !isValidDate(babyDate) && babyDate.length === 10 && { borderColor: COLORS.danger }]}
                    keyboardType="number-pad"
                    maxLength={10}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleRegister} activeOpacity={0.85} disabled={loading}>
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
                <Text style={styles.footerText}>¿Ya tienes cuenta?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('InicioSesion')}>
                  <Text style={styles.footerLink}>Inicia sesión</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              Al registrarte, aceptás nuestros{' '}
              <Text style={styles.termsLink}>Términos</Text> y{' '}
              <Text style={styles.termsLink}>Política de Privacidad</Text>.
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
    backgroundColor: '#fcf9f3',
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
    color: COLORS.primary,
    textAlign: 'center',
  },
  headerSubtitle: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 560,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 32,
    elevation: 8,
  },
  heroImageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#e5e2dc',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(252,249,243,0.8)',
  },
  cardContent: {
    padding: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 24,
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
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    marginBottom: 8,
    marginLeft: 4,
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fcf9f3',
    borderColor: COLORS.inputBorder,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    height: 48,
    color: COLORS.text,
    fontSize: 16,
  },
  eyeButton: {
    padding: 10,
    marginLeft: 6,
  },
  dateInput: {
    width: '100%',
    height: 48,
    backgroundColor: '#e5e2dc',
    borderColor: COLORS.inputBorderFocused,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    color: COLORS.text,
    fontSize: 16,
  },
  optionalCard: {
    marginTop: 12,
    backgroundColor: '#f0eee8',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
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
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },
  optionalSubtitle: {
    marginTop: 4,
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  optionalField: {
    marginTop: 16,
  },
  submitButton: {
    marginTop: 18,
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
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
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  footerLink: {
    marginTop: 6,
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  termsContainer: {
    marginTop: 16,
    paddingHorizontal: 8,
  },
  termsText: {
    color: 'rgba(87,65,70,0.75)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
});