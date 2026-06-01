import { useState, useEffect } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ArrowLeft, Check } from 'lucide-react-native';
import ScreenLayout from '../components/ScreenLayout';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getTodayString, formatDDMMYYYY, getMonthName } from '../services/dateService';
import { saveBiometricData, getBiometricData } from '../services/biometricService';
import { analyzeBiometricData } from '../services/alertService';
import { SINTOMAS_MATERNO } from '../utils/constants';

export default function PerfilMama({ navigation }) {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const [peso, setPeso] = useState('');
  const [horasSueno, setHorasSueno] = useState('');
  const [presionSistolica, setPresionSistolica] = useState('');
  const [presionDiastolica, setPresionDiastolica] = useState('');
  const [sintomas, setSintomas] = useState({});

  const today = new Date();
  const dateDisplay = `${today.getDate()} de ${getMonthName(today.getMonth())} de ${today.getFullYear()}`;

  useEffect(() => {
    const loadToday = async () => {
      try {
        const data = await getBiometricData();
        if (data) {
          setPeso(data.peso ?? '');
          setHorasSueno(data.horasSueno ?? '');
          setPresionSistolica(data.presionSistolica ?? '');
          setPresionDiastolica(data.presionDiastolica ?? '');
          setSintomas(data.sintomas ?? {});
        }
      } catch (e) {
        console.error('Error loading biometric data', e);
      }
    };
    loadToday();
  }, []);

  const toggleSintoma = (nombre) => {
    setSintomas((prev) => ({ ...prev, [nombre]: !prev[nombre] }));
  };

  const handleSave = async () => {
    if (!peso.trim() || !horasSueno.trim() || !presionSistolica.trim() || !presionDiastolica.trim()) {
      Alert.alert('Campos obligatorios', 'Por favor completa todos los campos obligatorios.');
      return;
    }

    const data = {
      date: getTodayString(),
      peso,
      horasSueno,
      presionSistolica,
      presionDiastolica,
      sintomas,
      savedAt: new Date().toISOString(),
    };

    const result = await saveBiometricData(data);

    const alerts = analyzeBiometricData(data);
    if (alerts.length > 0) {
      const dangerAlerts = alerts.filter(a => a.severity === 'danger');
      if (dangerAlerts.length > 0) {
        Alert.alert(
          'Atención importante',
          dangerAlerts.map(a => a.message).join('\n\n'),
          [{ text: 'Entendido' }]
        );
      } else {
        const warningMessages = alerts.map(a => `• ${a.title}`).join('\n');
        Alert.alert(
          'Recomendaciones',
          `Se detectaron las siguientes observaciones:\n\n${warningMessages}`,
          [{ text: 'Entendido' }]
        );
      }
    } else if (result.success) {
      Alert.alert('Guardado', 'Tus datos biométricos se guardaron correctamente.');
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
          <Text style={[styles.topbarTitle, { color: colors.primary }]}>Mis Estadísticas</Text>
          <View style={styles.topbarSpacer} />
        </View>

        <Text style={[styles.dateDisplay, { color: colors.textSecondary }]}>Hoy, {dateDisplay}</Text>

        {/* Peso */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Peso materno (kg) *</Text>
          <TextInput
            value={peso}
            onChangeText={setPeso}
            placeholder="Ej: 68.5"
            placeholderTextColor={colors.textTertiary}
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.cardBorder, color: colors.text }]}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Horas de sueño */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Horas de sueño *</Text>
          <TextInput
            value={horasSueno}
            onChangeText={setHorasSueno}
            placeholder="Ej: 7"
            placeholderTextColor={colors.textTertiary}
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.cardBorder, color: colors.text }]}
            keyboardType="number-pad"
          />
        </View>

        {/* Presión arterial */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Presión arterial (mmHg) *</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={presionSistolica}
              onChangeText={setPresionSistolica}
              placeholder="Sistólica"
              placeholderTextColor={colors.textTertiary}
              style={[styles.input, styles.halfInput, { backgroundColor: colors.card, borderColor: colors.cardBorder, color: colors.text }]}
              keyboardType="number-pad"
            />
            <Text style={[styles.separator, { color: colors.textSecondary }]}>/</Text>
            <TextInput
              value={presionDiastolica}
              onChangeText={setPresionDiastolica}
              placeholder="Diastólica"
              placeholderTextColor={colors.textTertiary}
              style={[styles.input, styles.halfInput, { backgroundColor: colors.card, borderColor: colors.cardBorder, color: colors.text }]}
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* Síntomas */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Síntomas</Text>
          <View style={[styles.checkboxContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            {SINTOMAS_MATERNO.map((nombre, index) => {
              const isChecked = !!sintomas[nombre];
              const isLast = index === SINTOMAS_MATERNO.length - 1;
              return (
                <TouchableOpacity
                  key={nombre}
                  style={[styles.checkboxRow, !isLast && { borderBottomWidth: 1, borderBottomColor: isDark ? colors.cardBorder : 'rgba(128,115,88,0.08)' }]}
                  onPress={() => toggleSintoma(nombre)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.checkboxLabel, { color: colors.text }]}>{nombre}</Text>
                  <View style={[styles.checkboxBox, { borderColor: colors.primary }, isChecked && { backgroundColor: colors.primary }]}>
                    {isChecked && <Check size={14} color="#ffffff" strokeWidth={3} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSave} activeOpacity={0.85}>
          <Text style={styles.saveButtonText}>Guardar</Text>
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
    marginBottom: 20,
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
  dateDisplay: {
    fontSize: 14,
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
    marginLeft: 4,
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  separator: {
    fontSize: 18,
    fontWeight: '700',
  },
  checkboxContainer: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  checkboxLabel: {
    fontSize: 14,
    flex: 1,
    paddingRight: 12,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
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
