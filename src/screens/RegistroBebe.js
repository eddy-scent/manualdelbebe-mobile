// ──────────────────────────────────────────────────────────
// Pantalla de Registro del Bebé — RF-06
// Datos iniciales: nombre, sexo, fecha nacimiento, peso, talla
// Se muestra cuando no existe un perfil de bebé guardado
// ──────────────────────────────────────────────────────────
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { ArrowLeft, Baby, Check, Calendar } from 'lucide-react-native';
import ScreenLayout from '../components/ScreenLayout';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { saveBabyProfile } from '../services/babyService';
import { formatDateInput, isValidDate } from '../utils/validators';

const SEX_OPTIONS = [
  { key: 'masculino', label: 'Masculino' },
  { key: 'femenino', label: 'Femenino' },
];

export default function RegistroBebe({ navigation }) {
  const { colors, isDark } = useTheme();
  const { updateProfile } = useAuth();

  const [nombre, setNombre] = useState('');
  const [sexo, setSexo] = useState('');
  const [fechaNac, setFechaNac] = useState('');
  const [pesoNac, setPesoNac] = useState('');
  const [tallaNac, setTallaNac] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDateBlur = () => {
    const digits = fechaNac.replace(/\D/g, '');
    if (digits.length === 8) {
      setFechaNac(`${digits.substring(0, 2)}/${digits.substring(2, 4)}/${digits.substring(4)}`);
    }
  };

  const handleSave = async () => {
    setError('');

    if (!nombre.trim()) {
      setError('Ingresá el nombre del bebé.');
      return;
    }
    if (!sexo) {
      setError('Seleccioná el sexo del bebé.');
      return;
    }
    if (fechaNac && !isValidDate(fechaNac)) {
      setError('La fecha de nacimiento no es válida.');
      return;
    }

    setLoading(true);

    const profile = {
      nombre: nombre.trim(),
      sexo,
      fechaNac: fechaNac || null,
      pesoNac: pesoNac || null,
      tallaNac: tallaNac || null,
    };

    const result = await saveBabyProfile(profile);

    // Actualizar también la fecha de nacimiento del bebé en el perfil de la madre
    if (fechaNac) {
      await updateProfile({ babyDate: fechaNac });
    }

    setLoading(false);

    if (result.success) {
      Alert.alert('Guardado', 'Los datos del bebé se registraron correctamente.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      setError(result.message);
    }
  };

  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Bar */}
        <View style={[styles.topbar, { backgroundColor: colors.surfaceAlt, borderBottomColor: colors.cardBorder }]}>
          <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.primaryBg }]} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <ArrowLeft size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={[styles.topbarTitle, { color: colors.primary }]}>Registrar Bebé</Text>
          <View style={styles.topbarSpacer} />
        </View>

        {/* Header */}
        <View style={styles.headerSection}>
          <View style={[styles.headerIconCircle, { backgroundColor: colors.primary }]}>
            <Baby size={32} color="#ffffff" />
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Datos del bebé</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Completá la información inicial de tu bebé
          </Text>
        </View>

        {/* Error */}
        {error ? (
          <View style={[styles.errorBox, { backgroundColor: colors.dangerBg, borderColor: colors.danger }]}>
            <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
          </View>
        ) : null}

        {/* Nombre */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Nombre del bebé *</Text>
          <TextInput
            value={nombre}
            onChangeText={(t) => { setNombre(t); setError(''); }}
            placeholder="Ej: Sofía"
            placeholderTextColor={colors.textTertiary}
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.cardBorder, color: colors.text }]}
          />
        </View>

        {/* Sexo */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Sexo *</Text>
          <View style={styles.sexRow}>
            {SEX_OPTIONS.map((opt) => {
              const isSelected = sexo === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.sexButton,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.card,
                      borderColor: isSelected ? colors.primary : colors.cardBorder,
                    },
                  ]}
                  onPress={() => { setSexo(opt.key); setError(''); }}
                  activeOpacity={0.7}
                >
                  {isSelected && <Check size={16} color="#ffffff" style={{ marginRight: 6 }} />}
                  <Text style={[styles.sexButtonText, { color: isSelected ? '#ffffff' : colors.text }]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Fecha de nacimiento */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Fecha de nacimiento</Text>
          <View style={[styles.inputWithIcon, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Calendar size={18} color={colors.textTertiary} style={{ marginRight: 10 }} />
            <TextInput
              value={fechaNac}
              onChangeText={(t) => setFechaNac(formatDateInput(t))}
              onBlur={handleDateBlur}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={colors.textTertiary}
              style={[styles.inputInner, { color: colors.text }]}
              keyboardType="number-pad"
              maxLength={10}
            />
          </View>
        </View>

        {/* Peso al nacer */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Peso al nacer (kg)</Text>
          <TextInput
            value={pesoNac}
            onChangeText={setPesoNac}
            placeholder="Ej: 3.2"
            placeholderTextColor={colors.textTertiary}
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.cardBorder, color: colors.text }]}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Talla al nacer */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Talla al nacer (cm)</Text>
          <TextInput
            value={tallaNac}
            onChangeText={setTallaNac}
            placeholder="Ej: 50"
            placeholderTextColor={colors.textTertiary}
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.cardBorder, color: colors.text }]}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Botón guardar */}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>Registrar bebé</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topbarTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  topbarSpacer: {
    width: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
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
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
  },
  inputInner: {
    flex: 1,
    fontSize: 16,
    height: 48,
  },
  sexRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sexButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
  },
  sexButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#EB5D8B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
