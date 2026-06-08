import { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react-native';
import ScreenLayout from '../components/ScreenLayout';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getTodayString, getMonthName } from '../services/dateService';
import { saveBiometricData, getBiometricData } from '../services/biometricService';
import { analyzeBiometricData } from '../services/alertService';
import { SINTOMAS_MATERNO, SINTOMAS_MATERNO_LABELS } from '../utils/constants';

// ─── Constantes de validación biométrica (RNF + Reglas de Negocio) ───
const BIOMETRIC_RANGES = {
  peso: { min: 0.1, max: 300, label: 'Peso materno', unit: 'kg' },
  horasSueno: { min: 0, max: 24, label: 'Horas de sueño', unit: 'h', allowDecimal: true },
  presionSistolica: { min: 50, max: 250, label: 'Presión sistólica', unit: 'mmHg' },
  presionDiastolica: { min: 30, max: 150, label: 'Presión diastólica', unit: 'mmHg' },
};

export default function PerfilMama({ navigation }) {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();

  // ─── Estado de campos ───
  const [peso, setPeso] = useState('');
  const [horasSueno, setHorasSueno] = useState('');
  const [presionSistolica, setPresionSistolica] = useState('');
  const [presionDiastolica, setPresionDiastolica] = useState('');
  const [sintomas, setSintomas] = useState({});
  const [activeAlerts, setActiveAlerts] = useState([]);

  // ─── Estado de UI / UX ───
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');

  const today = new Date();
  const dateDisplay = `${today.getDate()} de ${getMonthName(today.getMonth())} de ${today.getFullYear()}`;

  // ─── Carga inicial de datos del día ───
  useEffect(() => {
    const loadToday = async () => {
      setLoadingData(true);
      setLoadError('');
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
        setLoadError(
          'No se pudieron cargar tus datos de hoy. Verificá tu conexión a internet y probá de nuevo.'
        );
      } finally {
        setLoadingData(false);
      }
    };
    loadToday();
  }, []);

  const evaluateData = () => {
    const alerts = analyzeBiometricData({ peso, horasSueno, presionSistolica, presionDiastolica, sintomas });
    setActiveAlerts(alerts);
  };

  useEffect(() => {
    evaluateData();
  }, [sintomas]);

  const toggleSintoma = (nombre) => {
    setSintomas((prev) => ({ ...prev, [nombre]: !prev[nombre] }));
  };

  const getAlertForField = (fieldId, symptomName = null) => {
    if (symptomName) {
      return activeAlerts.find(a => a.fieldId === fieldId && a.symptomName === symptomName);
    }
    return activeAlerts.find(a => a.fieldId === fieldId);
  };

  const renderAlertIcon = (alert) => {
    if (!alert) return null;
    const isDanger = alert.severity === 'danger';
    const chipColors = isDanger
      ? { bg: '#FFF0F2', border: '#E8697A', icon: '#E8697A', text: '#C0445A' }
      : { bg: '#FFF4E8', border: '#E8913A', icon: '#E8913A', text: '#C97A2A' };
    return (
      <TouchableOpacity
        onPress={() => Alert.alert(alert.title, `${alert.message}\n\n${alert.action}`)}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        style={[
          styles.alertChip,
          { backgroundColor: chipColors.bg, borderColor: chipColors.border },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${isDanger ? 'Alerta' : 'Aviso'}: ${alert.title}`}
      >
        <AlertCircle size={13} color={chipColors.icon} />
        <Text style={[styles.alertChipText, { color: chipColors.text }]}>
          {isDanger ? 'Ver alerta' : 'Ver aviso'}
        </Text>
      </TouchableOpacity>
    );
  };

  // ─── Validación robusta de rangos biométricos ───
  const validateBiometricRanges = () => {
    const pesoNum = parseFloat(peso);
    const horasNum = parseFloat(horasSueno);
    const sysNum = parseInt(presionSistolica, 10);
    const diaNum = parseInt(presionDiastolica, 10);

    if (Number.isNaN(pesoNum) || pesoNum < BIOMETRIC_RANGES.peso.min || pesoNum > BIOMETRIC_RANGES.peso.max) {
      return {
        valid: false,
        message: `El peso ingresado no es válido. Debe estar entre ${BIOMETRIC_RANGES.peso.min} y ${BIOMETRIC_RANGES.peso.max} ${BIOMETRIC_RANGES.peso.unit}.`,
      };
    }

    if (Number.isNaN(horasNum) || horasNum < BIOMETRIC_RANGES.horasSueno.min || horasNum > BIOMETRIC_RANGES.horasSueno.max) {
      return {
        valid: false,
        message: `Las horas de sueño ingresadas no son válidas. Deben estar entre ${BIOMETRIC_RANGES.horasSueno.min} y ${BIOMETRIC_RANGES.horasSueno.max} ${BIOMETRIC_RANGES.horasSueno.unit}.`,
      };
    }

    if (Number.isNaN(sysNum) || sysNum < BIOMETRIC_RANGES.presionSistolica.min || sysNum > BIOMETRIC_RANGES.presionSistolica.max) {
      return {
        valid: false,
        message: `La presión sistólica no es válida. Debe estar entre ${BIOMETRIC_RANGES.presionSistolica.min} y ${BIOMETRIC_RANGES.presionSistolica.max} ${BIOMETRIC_RANGES.presionSistolica.unit}.`,
      };
    }

    if (Number.isNaN(diaNum) || diaNum < BIOMETRIC_RANGES.presionDiastolica.min || diaNum > BIOMETRIC_RANGES.presionDiastolica.max) {
      return {
        valid: false,
        message: `La presión diastólica no es válida. Debe estar entre ${BIOMETRIC_RANGES.presionDiastolica.min} y ${BIOMETRIC_RANGES.presionDiastolica.max} ${BIOMETRIC_RANGES.presionDiastolica.unit}.`,
      };
    }

    if (sysNum <= diaNum) {
      return {
        valid: false,
        message: 'La presión sistólica debe ser mayor que la presión diastólica.',
      };
    }

    return { valid: true };
  };

  const handleSave = async () => {
    // ─── Validación de campos obligatorios ───
    if (!peso.trim() || !horasSueno.trim() || !presionSistolica.trim() || !presionDiastolica.trim()) {
      Alert.alert('Campos obligatorios', 'Por favor completa todos los campos obligatorios.');
      return;
    }

    // ─── Validación de rangos biométricos ───
    const validation = validateBiometricRanges();
    if (!validation.valid) {
      Alert.alert('Valor fuera de rango', validation.message);
      return;
    }

    setSaving(true);

    const data = {
      date: getTodayString(),
      peso,
      horasSueno,
      presionSistolica,
      presionDiastolica,
      sintomas,
      savedAt: new Date().toISOString(),
    };

    try {
      const result = await saveBiometricData(data);
      evaluateData(); // re-evaluamos por si acaso

      if (result.success) {
        Alert.alert('Guardado', 'Tus datos se han registrado correctamente.');
      } else {
        Alert.alert('Error', result.message || 'No se pudieron guardar los datos.');
      }
    } catch (error) {
      console.error('Network or unexpected error saving biometric data', error);
      Alert.alert(
        'Sin conexión',
        'Parece que no tenés conexión a internet. Tus datos no se pudieron guardar. Por favor, intentá de nuevo cuando tengas conexión.'
      );
    } finally {
      setSaving(false);
    }
  };

  // ─── Renderizar spinner de carga inicial ───
  if (loadingData) {
    return (
      <ScreenLayout>
        <View style={[styles.loaderContainer, { backgroundColor: colors.surface }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.textSecondary, marginTop: 16 }}>
            Cargando tus estadísticas...
          </Text>
        </View>
      </ScreenLayout>
    );
  }

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

        {/* Error de carga */}
        {loadError ? (
          <View style={[styles.errorBanner, { backgroundColor: colors.dangerBg, borderColor: colors.danger }]}>
            <Text style={[styles.errorBannerText, { color: colors.danger }]}>{loadError}</Text>
          </View>
        ) : null}

        <Text style={[styles.dateDisplay, { color: colors.textSecondary }]}>Hoy, {dateDisplay}</Text>

        {/* Peso */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Peso materno (kg) *</Text>
            {renderAlertIcon(getAlertForField('weight'))}
          </View>
          <TextInput
            value={peso}
            onChangeText={setPeso}
            onBlur={evaluateData}
            placeholder="Ej: 68.5"
            placeholderTextColor={colors.textTertiary}
            style={[
              styles.input,
              { backgroundColor: colors.card, borderColor: colors.cardBorder, color: colors.text }
            ]}
            keyboardType="decimal-pad"
            editable={!saving}
          />
        </View>

        {/* Horas de sueño */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Horas de sueño *</Text>
            {renderAlertIcon(getAlertForField('sleep'))}
          </View>
          <TextInput
            value={horasSueno}
            onChangeText={setHorasSueno}
            onBlur={evaluateData}
            placeholder="Ej: 7"
            placeholderTextColor={colors.textTertiary}
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: getAlertForField('sleep') ? (getAlertForField('sleep').severity === 'danger' ? colors.danger : '#f5a623') : colors.cardBorder,
                color: colors.text
              }
            ]}
            keyboardType="number-pad"
            editable={!saving}
          />
        </View>

        {/* Presión arterial */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Presión arterial (mmHg) *</Text>
            {renderAlertIcon(getAlertForField('pressure'))}
          </View>
          <View style={styles.inputRow}>
            <TextInput
              value={presionSistolica}
              onChangeText={setPresionSistolica}
              onBlur={evaluateData}
              placeholder="Sistólica"
              placeholderTextColor={colors.textTertiary}
              style={[
                styles.input,
                styles.halfInput,
                {
                  backgroundColor: colors.card,
                  borderColor: getAlertForField('pressure') ? (getAlertForField('pressure').severity === 'danger' ? colors.danger : '#f5a623') : colors.cardBorder,
                  color: colors.text
                }
              ]}
              keyboardType="number-pad"
              editable={!saving}
            />
            <Text style={[styles.separator, { color: colors.textSecondary }]}>/</Text>
            <TextInput
              value={presionDiastolica}
              onChangeText={setPresionDiastolica}
              onBlur={evaluateData}
              placeholder="Diastólica"
              placeholderTextColor={colors.textTertiary}
              style={[
                styles.input,
                styles.halfInput,
                {
                  backgroundColor: colors.card,
                  borderColor: getAlertForField('pressure') ? (getAlertForField('pressure').severity === 'danger' ? colors.danger : '#f5a623') : colors.cardBorder,
                  color: colors.text
                }
              ]}
              keyboardType="number-pad"
              editable={!saving}
            />
          </View>
        </View>

        {/* Síntomas */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Síntomas</Text>
            {renderAlertIcon(getAlertForField('mental_health'))}
          </View>
          <View style={[
            styles.checkboxContainer,
            {
              backgroundColor: colors.card,
              borderColor: getAlertForField('mental_health') ? '#f5a623' : colors.cardBorder
            }
          ]}>
            {SINTOMAS_MATERNO.map((key, index) => {
              const isChecked = !!sintomas[key];
              const isLast = index === SINTOMAS_MATERNO.length - 1;
              const alertSymptom = getAlertForField('symptom', key);
              const label = SINTOMAS_MATERNO_LABELS[key] || key;

              return (
                <View key={key}>
                  <TouchableOpacity
                    style={[
                      styles.checkboxRow,
                      !isLast && { borderBottomWidth: 1, borderBottomColor: isDark ? colors.cardBorder : 'rgba(128,115,88,0.08)' }
                    ]}
                    onPress={() => !saving && toggleSintoma(key)}
                    activeOpacity={saving ? 1 : 0.7}
                  >
                    <View style={styles.checkboxLabelRow}>
                      <Text style={[styles.checkboxLabel, { color: colors.text }, alertSymptom && { color: alertSymptom.severity === 'danger' ? '#C0445A' : '#C97A2A', fontWeight: '600' }]}>{label}</Text>
                      {renderAlertIcon(alertSymptom)}
                    </View>
                    <View style={[
                      styles.checkboxBox,
                      { borderColor: alertSymptom ? (alertSymptom.severity === 'danger' ? '#E8697A' : '#E8913A') : colors.primary },
                      isChecked && { backgroundColor: alertSymptom ? (alertSymptom.severity === 'danger' ? '#E8697A' : '#E8913A') : colors.primary }
                    ]}>
                      {isChecked && <Check size={14} color="#ffffff" strokeWidth={3} />}
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }]}
          onPress={handleSave}
          activeOpacity={0.85}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar</Text>
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
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  errorBanner: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  errorBannerText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  section: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginLeft: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  alertChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 8,
    gap: 4,
    minHeight: 28,
  },
  alertChipText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
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
  checkboxLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkboxLabel: {
    fontSize: 14,
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
