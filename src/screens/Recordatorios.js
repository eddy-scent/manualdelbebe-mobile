// ──────────────────────────────────────────────────────────
// Pantalla de Recordatorios — RF-12
// Configuración de alertas y notificaciones
// ──────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ArrowLeft, Bell, Clock, Baby, Scale, CalendarDays, Check } from 'lucide-react-native';
import ScreenLayout from '../components/ScreenLayout';
import { useTheme } from '../context/ThemeContext';
import { getRemindersConfig, saveRemindersConfig, requestPermissions } from '../services/notificationService';

export default function Recordatorios({ navigation }) {
  const { colors, isDark } = useTheme();
  const [config, setConfig] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const c = await getRemindersConfig();
    setConfig(c);
  };

  const updateConfig = async (key, value) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
  };

  const handleSave = async () => {
    setSaving(true);

    // Solicitar permisos si se activa alguna notificación
    if (config.enabled && (config.biometricReminder || config.babyReminder || config.calendarReminder)) {
      const perm = await requestPermissions();
      if (!perm.success) {
        Alert.alert('Permiso requerido', perm.message);
        setSaving(false);
        return;
      }
    }

    const result = await saveRemindersConfig(config);
    setSaving(false);

    if (result.success) {
      Alert.alert('Guardado', 'Tus recordatorios se configuraron correctamente.');
    }
  };

  if (!config) {
    return (
      <ScreenLayout>
        <View style={[styles.loadingContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Cargando...</Text>
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
          <Text style={[styles.topbarTitle, { color: colors.primary }]}>Recordatorios</Text>
          <View style={styles.topbarSpacer} />
        </View>

        {/* Header */}
        <View style={styles.headerSection}>
          <View style={[styles.headerIconCircle, { backgroundColor: colors.primary }]}>
            <Bell size={32} color="#ffffff" />
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Configurar alertas</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Recibe notificaciones para no olvidar tus registros y citas.
          </Text>
        </View>

        {/* Master toggle */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Bell size={20} color={colors.primary} />
              <View style={styles.switchTextGroup}>
                <Text style={[styles.switchTitle, { color: colors.text }]}>Notificaciones</Text>
                <Text style={[styles.switchDesc, { color: colors.textSecondary }]}>Activar o desactivar todas las alertas</Text>
              </View>
            </View>
            <Switch
              value={config.enabled}
              onValueChange={(v) => updateConfig('enabled', v)}
              trackColor={{ false: isDark ? '#3a3a3a' : '#d1d1d1', true: colors.primaryLight }}
              thumbColor={config.enabled ? colors.primary : isDark ? '#666' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Recordatorios individuales */}
        {config.enabled && (
          <>
            {/* Biométrico diario */}
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Datos biométricos</Text>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.switchRow}>
                <View style={styles.switchInfo}>
                  <Scale size={20} color={colors.accent} />
                  <View style={styles.switchTextGroup}>
                    <Text style={[styles.switchTitle, { color: colors.text }]}>Registro diario</Text>
                    <Text style={[styles.switchDesc, { color: colors.textSecondary }]}>Recordar registrar peso, sueño y presión</Text>
                  </View>
                </View>
                <Switch
                  value={config.biometricReminder}
                  onValueChange={(v) => updateConfig('biometricReminder', v)}
                  trackColor={{ false: isDark ? '#3a3a3a' : '#d1d1d1', true: colors.primaryLight }}
                  thumbColor={config.biometricReminder ? colors.primary : isDark ? '#666' : '#f4f3f4'}
                />
              </View>
              {config.biometricReminder && (
                <View style={styles.timeRow}>
                  <Clock size={16} color={colors.textTertiary} />
                  <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Hora:</Text>
                  <TextInput
                    value={config.biometricTime}
                    onChangeText={(t) => updateConfig('biometricTime', t)}
                    placeholder="20:00"
                    placeholderTextColor={colors.textTertiary}
                    style={[styles.timeInput, { backgroundColor: colors.surfaceAlt, borderColor: colors.cardBorder, color: colors.text }]}
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                  />
                </View>
              )}
            </View>

            {/* Datos del bebé */}
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Datos del bebé</Text>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.switchRow}>
                <View style={styles.switchInfo}>
                  <Baby size={20} color={colors.primary} />
                  <View style={styles.switchTextGroup}>
                    <Text style={[styles.switchTitle, { color: colors.text }]}>Métricas del bebé</Text>
                    <Text style={[styles.switchDesc, { color: colors.textSecondary }]}>Recordar registrar datos del bebé</Text>
                  </View>
                </View>
                <Switch
                  value={config.babyReminder}
                  onValueChange={(v) => updateConfig('babyReminder', v)}
                  trackColor={{ false: isDark ? '#3a3a3a' : '#d1d1d1', true: colors.primaryLight }}
                  thumbColor={config.babyReminder ? colors.primary : isDark ? '#666' : '#f4f3f4'}
                />
              </View>
              {config.babyReminder && (
                <View style={styles.timeRow}>
                  <Clock size={16} color={colors.textTertiary} />
                  <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Hora:</Text>
                  <TextInput
                    value={config.babyTime}
                    onChangeText={(t) => updateConfig('babyTime', t)}
                    placeholder="21:00"
                    placeholderTextColor={colors.textTertiary}
                    style={[styles.timeInput, { backgroundColor: colors.surfaceAlt, borderColor: colors.cardBorder, color: colors.text }]}
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                  />
                </View>
              )}
            </View>

            {/* Citas médicas */}
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Citas médicas</Text>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.switchRow}>
                <View style={styles.switchInfo}>
                  <CalendarDays size={20} color="#A78BFA" />
                  <View style={styles.switchTextGroup}>
                    <Text style={[styles.switchTitle, { color: colors.text }]}>Aviso de citas</Text>
                    <Text style={[styles.switchDesc, { color: colors.textSecondary }]}>Notificación antes de cada cita médica</Text>
                  </View>
                </View>
                <Switch
                  value={config.calendarReminder}
                  onValueChange={(v) => updateConfig('calendarReminder', v)}
                  trackColor={{ false: isDark ? '#3a3a3a' : '#d1d1d1', true: colors.primaryLight }}
                  thumbColor={config.calendarReminder ? colors.primary : isDark ? '#666' : '#f4f3f4'}
                />
              </View>
              {config.calendarReminder && (
                <View style={styles.timeRow}>
                  <Clock size={16} color={colors.textTertiary} />
                  <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Horas antes:</Text>
                  <TextInput
                    value={String(config.calendarHoursBefore)}
                    onChangeText={(t) => updateConfig('calendarHoursBefore', parseInt(t) || 1)}
                    placeholder="2"
                    placeholderTextColor={colors.textTertiary}
                    style={[styles.timeInput, { backgroundColor: colors.surfaceAlt, borderColor: colors.cardBorder, color: colors.text }]}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>
              )}
            </View>
          </>
        )}

        {/* Info */}
        <View style={[styles.infoCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.cardBorder }]}>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Las notificaciones se envían a tu dispositivo. Puedes cambiar la configuración en cualquier momento.
          </Text>
        </View>

        {/* Botón guardar */}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          activeOpacity={0.85}
          disabled={saving}
        >
          <Check size={18} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={styles.saveButtonText}>{saving ? 'Guardando...' : 'Guardar recordatorios'}</Text>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
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
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  switchTextGroup: {
    flex: 1,
  },
  switchTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  switchDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,115,88,0.08)',
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  timeInput: {
    width: 70,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  saveButton: {
    borderRadius: 999,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
