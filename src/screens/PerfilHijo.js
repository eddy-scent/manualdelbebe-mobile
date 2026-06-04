// ──────────────────────────────────────────────────────────
// Pantalla del Perfil del Hijo — RF-06
// Registro de métricas y síntomas infantiles
// Pre-parto: movimiento fetal
// Post-parto: peso, longitud, alimentación, síntomas
// ──────────────────────────────────────────────────────────
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
import { ArrowLeft, Check, Baby, Activity, Calendar } from 'lucide-react-native';
import ScreenLayout from '../components/ScreenLayout';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { parseDDMMYYYY, getTodayString, getMonthName } from '../services/dateService';
import { saveBabyData, getBabyData, getBabyProfile } from '../services/babyService';
import { formatDateInput, isValidDate } from '../utils/validators';
import { MOVIMIENTOS_FETALES, SINTOMAS_INFANTIL_POSTPARTO } from '../utils/constants';

export default function PerfilHijo({ navigation }) {
  const { user, updateProfile } = useAuth();
  const { colors, isDark } = useTheme();

  // Determinar etapa
  const etapa = user?.babyDate ? 'post_parto' : user?.furDate ? 'pre_parto' : 'desconocida';

  // ─── Estado del perfil del bebé ───
  const [babyProfile, setBabyProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // ─── Estado para registrar fecha de nacimiento ───
  const [babyDateInput, setBabyDateInput] = useState('');
  const [babyDateError, setBabyDateError] = useState('');
  const [savingDate, setSavingDate] = useState(false);

  // ─── Estado pre-parto ───
  const [movimientos, setMovimientos] = useState({});

  // ─── Estado post-parto ───
  const [sintomas, setSintomas] = useState({});

  const today = new Date();
  const dateDisplay = `${today.getDate()} de ${getMonthName(today.getMonth())} de ${today.getFullYear()}`;

  useEffect(() => {
    const loadData = async () => {
      try {
        // Verificar si existe perfil del bebé
        const profile = await getBabyProfile();
        setBabyProfile(profile);

        // Cargar datos diarios
        const data = await getBabyData();
        if (data) {
          if (etapa === 'pre_parto') {
            setMovimientos(data.movimientos || {});
          } else {
            setSintomas(data.sintomas || {});
          }
        }
      } catch (e) {
        console.error('Error loading baby data', e);
      } finally {
        setLoadingProfile(false);
      }
    };
    loadData();
  }, [etapa]);

  const toggleMovimiento = (nombre) => {
    setMovimientos((prev) => ({ ...prev, [nombre]: !prev[nombre] }));
  };

  const toggleSintoma = (nombre) => {
    setSintomas((prev) => ({ ...prev, [nombre]: !prev[nombre] }));
  };

  const handleDateBlur = () => {
    const digits = babyDateInput.replace(/\D/g, '');
    if (digits.length === 8) {
      setBabyDateInput(`${digits.substring(0, 2)}/${digits.substring(2, 4)}/${digits.substring(4)}`);
    }
  };

  const handleSaveBabyDate = async () => {
    setBabyDateError('');

    if (!babyDateInput.trim()) {
      setBabyDateError('Ingresa la fecha de nacimiento del bebé.');
      return;
    }
    if (!isValidDate(babyDateInput)) {
      setBabyDateError('La fecha no es válida. Usa el formato DD/MM/AAAA.');
      return;
    }

    setSavingDate(true);
    const result = await updateProfile({ babyDate: babyDateInput });
    setSavingDate(false);

    if (!result.success) {
      setBabyDateError(result.message || 'No se pudo guardar la fecha.');
    }
    // Si tiene éxito, el componente se re-renderiza con etapa = 'post_parto'
  };

  const handleSave = async () => {
    const data = {
      date: getTodayString(),
      etapa,
      savedAt: new Date().toISOString(),
    };

    if (etapa === 'pre_parto') {
      data.movimientos = movimientos;
    } else {
      data.sintomas = sintomas;
    }

    const result = await saveBabyData(data);
    if (result.success) {
      Alert.alert('Guardado', 'Los datos del bebé se guardaron correctamente.');
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const renderCheckbox = (nombre, isChecked, onToggle) => (
    <TouchableOpacity
      key={nombre}
      style={[styles.checkboxRow, { borderBottomColor: isDark ? colors.cardBorder : 'rgba(128,115,88,0.08)' }]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <Text style={[styles.checkboxLabel, { color: colors.text }]}>{nombre}</Text>
      <View style={[styles.checkboxBox, { borderColor: colors.primary }, isChecked && { backgroundColor: colors.primary }]}>
        {isChecked && <Check size={14} color="#ffffff" strokeWidth={3} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Bar */}
        <View style={[styles.topbar, { backgroundColor: colors.surfaceAlt, borderBottomColor: colors.cardBorder }]}>
          <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.primaryBg }]} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <ArrowLeft size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={[styles.topbarTitle, { color: colors.primary }]}>Mi Bebé</Text>
          <View style={styles.topbarSpacer} />
        </View>

        {/* Header con estilo de tarjeta */}
        <View style={[styles.heroCard, { backgroundColor: colors.primary }]}>
          <View style={styles.heroIconCircle}>
            <Baby size={40} color="#ffffff" />
          </View>
          <Text style={styles.heroTitle}>
            {babyProfile?.nombre || 'Mi Bebé'}
          </Text>
          <Text style={styles.heroSubtitle}>Hoy, {dateDisplay}</Text>

          {/* Etapa badge */}
          <View style={[styles.etapaBadge, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
            <Text style={styles.etapaTextWhite}>
              {etapa === 'pre_parto' ? 'Embarazo (Pre-parto)' : etapa === 'post_parto' ? 'Bebe nacido (Post-parto)' : 'Sin datos de etapa'}
            </Text>
          </View>
        </View>

        {/* Info del perfil del bebé (si existe) */}
        {babyProfile && (
          <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.profileCardTitle, { color: colors.text }]}>Datos del bebé</Text>
            <View style={styles.profileGrid}>
              {babyProfile.sexo && (
                <View style={[styles.profileStatBox, { backgroundColor: colors.surfaceAlt }]}>
                  <Text style={[styles.profileStatLabel, { color: colors.textSecondary }]}>Sexo</Text>
                  <Text style={[styles.profileStatValue, { color: colors.text }]}>
                    {babyProfile.sexo === 'masculino' ? 'Masculino' : 'Femenino'}
                  </Text>
                </View>
              )}
              {babyProfile.fechaNac && (
                <View style={[styles.profileStatBox, { backgroundColor: colors.surfaceAlt }]}>
                  <Text style={[styles.profileStatLabel, { color: colors.textSecondary }]}>Nacimiento</Text>
                  <Text style={[styles.profileStatValue, { color: colors.text }]}>{babyProfile.fechaNac}</Text>
                </View>
              )}
              {babyProfile.pesoNac && (
                <View style={[styles.profileStatBox, { backgroundColor: colors.surfaceAlt }]}>
                  <Text style={[styles.profileStatLabel, { color: colors.textSecondary }]}>Peso</Text>
                  <Text style={[styles.profileStatValue, { color: colors.text }]}>{babyProfile.pesoNac} kg</Text>
                </View>
              )}
              {babyProfile.tallaNac && (
                <View style={[styles.profileStatBox, { backgroundColor: colors.surfaceAlt }]}>
                  <Text style={[styles.profileStatLabel, { color: colors.textSecondary }]}>Talla</Text>
                  <Text style={[styles.profileStatValue, { color: colors.text }]}>{babyProfile.tallaNac} cm</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={[styles.editProfileButton, { borderColor: colors.primary }]}
              onPress={() => navigation.navigate('RegistroBebe')}
              activeOpacity={0.7}
            >
              <Text style={[styles.editProfileText, { color: colors.primary }]}>Editar datos</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Sin perfil de bebé registrado */}
        {!loadingProfile && !babyProfile && etapa !== 'desconocida' && (
          <View style={[styles.warningCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.cardBorder }]}>
            <Text style={[styles.warningText, { color: colors.textSecondary }]}>
              Todavía no registraste los datos de tu bebé. Completa la información inicial para hacer un mejor seguimiento.
            </Text>
            <TouchableOpacity
              style={[styles.warningButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('RegistroBebe')}
              activeOpacity={0.85}
            >
              <Text style={styles.warningButtonText}>Registrar datos del bebé</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Sin etapa definida — registrar fecha de nacimiento */}
        {etapa === 'desconocida' && (
          <View style={[styles.warningCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.cardBorder }]}>
            <Text style={[styles.warningTitle, { color: colors.text }]}>
              Fecha de nacimiento del bebé
            </Text>
            <Text style={[styles.warningText, { color: colors.textSecondary }]}>
              Ingresa la fecha de nacimiento de tu bebé para acceder al seguimiento.
            </Text>

            {babyDateError ? (
              <View style={[styles.errorBox, { backgroundColor: colors.dangerBg, borderColor: colors.danger }]}>
                <Text style={[styles.errorText, { color: colors.danger }]}>{babyDateError}</Text>
              </View>
            ) : null}

            <View style={[styles.dateInputRow, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Calendar size={18} color={colors.textTertiary} style={{ marginRight: 10 }} />
              <TextInput
                value={babyDateInput}
                onChangeText={(t) => { setBabyDateInput(formatDateInput(t)); setBabyDateError(''); }}
                onBlur={handleDateBlur}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={colors.textTertiary}
                style={[styles.dateInput, { color: colors.text }]}
                keyboardType="number-pad"
                maxLength={10}
              />
            </View>

            <TouchableOpacity
              style={[styles.warningButton, { backgroundColor: colors.primary }]}
              onPress={handleSaveBabyDate}
              activeOpacity={0.85}
              disabled={savingDate}
            >
              {savingDate ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.warningButtonText}>Guardar fecha</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ═══════════════════════════════════════════
            PRE-PARTO: Movimiento fetal
            ═══════════════════════════════════════════ */}
        {etapa === 'pre_parto' && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Movimiento fetal</Text>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.cardHeader}>
                <Activity size={20} color={colors.primary} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>Registro de hoy</Text>
              </View>
              <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
                Selecciona las opciones que apliquen al movimiento fetal de hoy.
              </Text>
              <View style={styles.checkboxContainer}>
                {MOVIMIENTOS_FETALES.map((nombre, index) =>
                  renderCheckbox(nombre, !!movimientos[nombre], () => toggleMovimiento(nombre))
                )}
              </View>
            </View>
          </>
        )}

        {/* ═══════════════════════════════════════════
            POST-PARTO: Métricas + Síntomas
            ═══════════════════════════════════════════ */}
        {etapa === 'post_parto' && (
          <>
            {/* Síntomas */}
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Síntomas</Text>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.cardHeader}>
                <Activity size={20} color={colors.primary} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>Síntomas de hoy</Text>
              </View>
              <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
                Selecciona los síntomas que presente el bebé hoy.
              </Text>
              <View style={styles.checkboxContainer}>
                {SINTOMAS_INFANTIL_POSTPARTO.map((nombre, index) =>
                  renderCheckbox(nombre, !!sintomas[nombre], () => toggleSintoma(nombre))
                )}
              </View>
            </View>
          </>
        )}

        {/* Botón guardar */}
        {etapa !== 'desconocida' && (
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Text style={styles.saveButtonText}>Guardar</Text>
          </TouchableOpacity>
        )}
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
  heroCard: {
    alignItems: 'center',
    borderRadius: 24,
    padding: 28,
    marginBottom: 20,
    shadowColor: '#EB5D8B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  heroIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  etapaBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  etapaTextWhite: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  profileCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  profileCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  profileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  profileStatBox: {
    width: '47%',
    borderRadius: 12,
    padding: 12,
  },
  profileStatLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  profileStatValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  editProfileButton: {
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '600',
  },
  warningCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 24,
  },
  warningText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  warningButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  warningButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  dateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 16,
    width: '100%',
  },
  dateInput: {
    flex: 1,
    fontSize: 16,
    height: 48,
  },
  errorBox: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    width: '100%',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  checkboxContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
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
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
