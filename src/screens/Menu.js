import { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import {
  Baby,
  Calculator,
  Ruler,
  Scale,
  Clock,
  Stethoscope,
  Star,
  ClipboardList,
  ChevronRight,
  Heart,
  Calendar,
  Check,
} from 'lucide-react-native';
import ScreenLayout from '../components/ScreenLayout';
import EvolutionChart from '../components/EvolutionChart';
import CalculadoraOvulacion from '../components/CalculadoraOvulacion';
import CalculadoraEmbarazo from '../components/CalculadoraEmbarazo';
import DraggableFab from '../components/DraggableFab';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useEtapa } from '../context/EtapaContext';
import * as calendarService from '../services/calendarService';
import { getMonthName } from '../utils/dateUtils';
import { formatDateInput, isValidDate } from '../utils/validators';

const EventTypeIcon = ({ type, size = 14, color = '#574146' }) => {
  if (type === 'medical') return <Stethoscope size={size} color={color} />;
  if (type === 'milestone') return <Star size={size} color={color} />;
  return <ClipboardList size={size} color={color} />;
};

export default function Menu({ navigation }) {
  const { user, updateProfile } = useAuth();
  const { colors, isDark } = useTheme();
  const { embarazoData, bebeData, ultimaBiometria, progreso, isSinDatos, isPreParto, isPostParto, refresh } = useEtapa();
  const [showOvulacion, setShowOvulacion] = useState(false);
  const [showEmbarazo, setShowEmbarazo] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [setupStep, setSetupStep] = useState(null);
  const [setupDate, setSetupDate] = useState('');
  const [setupError, setSetupError] = useState('');
  const [setupSaving, setSetupSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const allEvents = await calendarService.getEvents();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const futureEvents = allEvents
        .filter((e) => {
          const parts = e.date ? e.date.split('-') : [];
          if (parts.length === 3) {
            const eventDate = new Date(+parts[0], +parts[1] - 1, +parts[2]);
            return eventDate >= today;
          }
          return false;
        })
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5);
      setUpcomingEvents(futureEvents);
    };
    loadData();
  }, []);

  const getEventBadge = (type) => {
    if (type === 'medical') return 'Cita médica';
    if (type === 'milestone') return 'Hito importante';
    return 'Tarea';
  };

  const fullName = user?.fullName || 'Usuaria';

  const getTrimestreText = (t) => {
    if (t === 1) return 'Primer Trimestre';
    if (t === 2) return 'Segundo Trimestre';
    if (t === 3) return 'Tercer Trimestre';
    return '';
  };

  const handleSetupDateBlur = () => {
    const digits = setupDate.replace(/\D/g, '');
    if (digits.length === 8) {
      setSetupDate(digits.substring(0, 2) + '/' + digits.substring(2, 4) + '/' + digits.substring(4));
    }
  };

  const handleSetupSave = async () => {
    setSetupError('');
    if (!setupDate.trim()) {
      setSetupError('Ingresa la fecha.');
      return;
    }
    if (!isValidDate(setupDate)) {
      setSetupError('La fecha no es válida. Usa el formato DD/MM/AAAA.');
      return;
    }
    setSetupSaving(true);
    const updates = {};
    if (setupStep === 'embarazada') {
      updates.furDate = setupDate;
    } else {
      updates.babyDate = setupDate;
    }
    const result = await updateProfile(updates);
    setSetupSaving(false);
    if (result.success) {
      setSetupStep(null);
      setSetupDate('');
      await refresh();
    } else {
      setSetupError(result.message || 'No se pudo guardar.');
    }
  };

  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>Hola, {fullName}</Text>
          <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
            {isSinDatos ? 'Configura tu perfil para empezar a usar MomsAI.' : isPreParto ? 'Tu peque y tú están haciendo un trabajo increíble.' : 'Tu bebé crece cada día. ¡Sigue registrando!'}
          </Text>
        </View>

        {isSinDatos && !setupStep && (
          <View style={[styles.progressCard, { backgroundColor: colors.primary }]}>
            <View style={styles.progressCardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.progressLabel}>Bienvenida a MomsAI</Text>
                <Text style={styles.progressWeek}>Empieza</Text>
                <Text style={styles.progressText}>Cuéntanos tu situación para personalizar tu experiencia.</Text>
              </View>
              <View style={styles.progressIconCircle}>
                <Heart size={40} color="#ffffff" />
              </View>
            </View>
            <TouchableOpacity style={[styles.setupOption, { backgroundColor: 'rgba(255,255,255,0.2)' }]} onPress={() => setSetupStep('embarazada')} activeOpacity={0.8}>
              <Baby size={20} color="#ffffff" />
              <Text style={styles.setupOptionText}>Estoy embarazada</Text>
              <ChevronRight size={16} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.setupOption, { backgroundColor: 'rgba(255,255,255,0.2)' }]} onPress={() => setSetupStep('bebe')} activeOpacity={0.8}>
              <Heart size={20} color="#ffffff" />
              <Text style={styles.setupOptionText}>Ya tengo un bebé</Text>
              <ChevronRight size={16} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.setupOption, { backgroundColor: 'rgba(255,255,255,0.1)' }]} onPress={() => navigation.navigate('Configuracion')} activeOpacity={0.8}>
              <Text style={[styles.setupOptionText, { opacity: 0.7 }]}>Ninguna por ahora</Text>
              <ChevronRight size={16} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>
          </View>
        )}

        {isSinDatos && setupStep && (
          <View style={[styles.progressCard, { backgroundColor: colors.primary }]}>
            <View style={styles.setupFormHeader}>
              <Text style={styles.setupFormTitle}>
                {setupStep === 'embarazada' ? '¿Cuál fue tu última menstruación?' : '¿Cuándo nació tu bebé?'}
              </Text>
              <Text style={styles.setupFormSubtitle}>
                {setupStep === 'embarazada' ? 'Con tu Fecha de Última Regla (FUR) podemos calcular tu progreso.' : 'Con la fecha de nacimiento podemos hacer seguimiento.'}
              </Text>
            </View>
            {setupError ? (
              <View style={[styles.setupErrorBox, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                <Text style={styles.setupErrorText}>{setupError}</Text>
              </View>
            ) : null}
            <View style={[styles.setupDateInput, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <Calendar size={18} color="rgba(255,255,255,0.7)" style={{ marginRight: 10 }} />
              <TextInput
                value={setupDate}
                onChangeText={(t) => { setSetupDate(formatDateInput(t)); setSetupError(''); }}
                onBlur={handleSetupDateBlur}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="rgba(255,255,255,0.5)"
                style={styles.setupDateText}
                keyboardType="number-pad"
                maxLength={10}
                autoFocus
              />
            </View>
            <View style={styles.setupButtonsRow}>
              <TouchableOpacity style={[styles.setupBackButton, { backgroundColor: 'rgba(255,255,255,0.15)' }]} onPress={() => { setSetupStep(null); setSetupDate(''); setSetupError(''); }} activeOpacity={0.8}>
                <Text style={styles.setupBackText}>Volver</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.setupSaveButton, { backgroundColor: '#ffffff' }]} onPress={handleSetupSave} activeOpacity={0.85} disabled={setupSaving}>
                {setupSaving ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <Check size={16} color={colors.primary} />
                    <Text style={[styles.setupSaveText, { color: colors.primary }]}>Guardar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isPreParto && embarazoData && (
          <View style={[styles.progressCard, { backgroundColor: colors.primary }]}>
            <View style={styles.progressCardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.progressLabel}>Progreso Actual</Text>
                <Text style={styles.progressWeek}>Semana {embarazoData.semanas || '--'}</Text>
                <Text style={styles.progressText}>{getTrimestreText(embarazoData.trimestre)} - Faltan {embarazoData.diasRestantes || '--'} días</Text>
              </View>
              <View style={styles.progressIconCircle}>
                <Baby size={40} color="#ffffff" />
              </View>
            </View>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: progreso + '%' }]} />
            </View>
            <View style={styles.progressRangeRow}>
              <Text style={styles.progressRangeText}>Semana 1</Text>
              <Text style={styles.progressRangeText}>Semana 40</Text>
            </View>
          </View>
        )}

        {isPostParto && bebeData && (
          <View style={[styles.progressCard, { backgroundColor: colors.primary }]}>
            <View style={styles.progressCardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.progressLabel}>Tu bebé</Text>
                <Text style={styles.progressWeek}>{bebeData.nombre || 'Bebé'}</Text>
                <Text style={styles.progressText}>{bebeData.edad ? bebeData.edad.dias + ' días (' + bebeData.edad.semanas + ' semanas)' : 'Edad no disponible'}</Text>
              </View>
              <View style={styles.progressIconCircle}>
                <Baby size={40} color="#ffffff" />
              </View>
            </View>
            {bebeData.hito && (
              <View style={[styles.hitoCard, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                <Text style={styles.hitoTitle}>{bebeData.hito.titulo}</Text>
                <Text style={styles.hitoDetalle}>{bebeData.hito.detalle}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.calculatorGrid}>
          <TouchableOpacity style={[styles.calculatorButton, { backgroundColor: colors.surfaceAlt, borderColor: colors.cardBorder }]} onPress={() => setShowOvulacion(true)}>
            <View style={[styles.calculatorIcon, { backgroundColor: colors.primaryBg }]}>
              <Calculator size={20} color={colors.primary} />
            </View>
            <Text style={[styles.calculatorText, { color: colors.text }]}>Calculadora de Ovulación</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.calculatorButton, { backgroundColor: colors.surfaceAlt, borderColor: colors.cardBorder }]} onPress={() => setShowEmbarazo(true)}>
            <View style={[styles.calculatorIcon, { backgroundColor: colors.primaryBg }]}>
              <Baby size={20} color={colors.primary} />
            </View>
            <Text style={[styles.calculatorText, { color: colors.text }]}>Calculadora de Embarazo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.healthCardsContainer}>
          <View style={[styles.healthCard, { backgroundColor: colors.card, borderTopColor: colors.accent }]}>
            <View style={styles.healthCardHeader}>
              <View style={{ marginRight: 12 }}><Ruler size={24} color={colors.text} /></View>
              <Text style={[styles.healthCardTitle, { color: colors.text }]}>Mi Bebé</Text>
            </View>
            {isSinDatos && (
              <View style={styles.healthCardEmpty}>
                <Text style={[styles.healthCardEmptyText, { color: colors.textSecondary }]}>Configura tu perfil para ver el desarrollo de tu bebé.</Text>
              </View>
            )}
            {isPreParto && embarazoData && embarazoData.desarrollo && (
              <View style={styles.healthCardStats}>
                <View style={[styles.healthStatBox, { backgroundColor: colors.surfaceAlt }]}>
                  <Text style={[styles.healthStatLabel, { color: colors.textSecondary }]}>Tamaño est.</Text>
                  <Text style={[styles.healthStatValue, { color: colors.text }]}>{embarazoData.desarrollo.tamano}</Text>
                  <Text style={[styles.healthStatSubtext, { color: colors.textSecondary }]}>Semana {embarazoData.semanas}</Text>
                </View>
                <View style={[styles.healthStatBox, { backgroundColor: colors.surfaceAlt }]}>
                  <Text style={[styles.healthStatLabel, { color: colors.textSecondary }]}>Peso est.</Text>
                  <Text style={[styles.healthStatValue, { color: colors.text }]}>{embarazoData.desarrollo.peso}</Text>
                </View>
              </View>
            )}
            {isPostParto && bebeData && (
              <View style={styles.healthCardStats}>
                <View style={[styles.healthStatBox, { backgroundColor: colors.surfaceAlt }]}>
                  <Text style={[styles.healthStatLabel, { color: colors.textSecondary }]}>Edad</Text>
                  <Text style={[styles.healthStatValue, { color: colors.text }]}>{bebeData.edad ? bebeData.edad.semanas : '--'} sem</Text>
                </View>
                <View style={[styles.healthStatBox, { backgroundColor: colors.surfaceAlt }]}>
                  <Text style={[styles.healthStatLabel, { color: colors.textSecondary }]}>Peso</Text>
                  <Text style={[styles.healthStatValue, { color: colors.text }]}>{bebeData.pesoNac || '--'} kg</Text>
                </View>
              </View>
            )}
            <TouchableOpacity style={styles.healthCardButton} onPress={() => navigation.navigate('PerfilHijo')}>
              <Text style={[styles.healthCardButtonText, { color: colors.accent }]}>{isSinDatos ? 'Registrar bebé' : 'Ver desarrollo detallado'}</Text>
              <ChevronRight size={16} color={colors.accent} />
            </TouchableOpacity>
          </View>

          <View style={[styles.healthCard, { backgroundColor: colors.card, borderTopColor: colors.accent }]}>
            <View style={styles.healthCardHeader}>
              <View style={{ marginRight: 12 }}><Scale size={24} color={colors.text} /></View>
              <Text style={[styles.healthCardTitle, { color: colors.text }]}>Mi Salud</Text>
            </View>
            {isSinDatos && (
              <View style={styles.healthCardEmpty}>
                <Text style={[styles.healthCardEmptyText, { color: colors.textSecondary }]}>Registra tus primeros datos biométricos.</Text>
              </View>
            )}
            {!isSinDatos && ultimaBiometria && (
              <View style={styles.healthCardStats}>
                <View style={[styles.healthStatBox, { backgroundColor: colors.surfaceAlt }]}>
                  <Text style={[styles.healthStatLabel, { color: colors.textSecondary }]}>Peso actual</Text>
                  <Text style={[styles.healthStatValue, { color: colors.text }]}>{ultimaBiometria.peso || '--'} kg</Text>
                </View>
                <View style={[styles.healthStatBox, { backgroundColor: colors.surfaceAlt }]}>
                  <Text style={[styles.healthStatLabel, { color: colors.textSecondary }]}>Presión arte.</Text>
                  <Text style={[styles.healthStatValue, { color: colors.text }]}>{ultimaBiometria.presionSistolica || '--'}/{ultimaBiometria.presionDiastolica || '--'}</Text>
                </View>
              </View>
            )}
            {!isSinDatos && !ultimaBiometria && (
              <View style={styles.healthCardEmpty}>
                <Text style={[styles.healthCardEmptyText, { color: colors.textSecondary }]}>Todavía no registraste datos. ¡Empieza hoy!</Text>
              </View>
            )}
            <TouchableOpacity style={styles.healthCardButton} onPress={() => navigation.navigate('PerfilMama')}>
              <Text style={[styles.healthCardButtonText, { color: colors.accent }]}>{isSinDatos ? 'Empezar registro' : 'Actualizar métricas'}</Text>
              <ChevronRight size={16} color={colors.accent} />
            </TouchableOpacity>
          </View>
        </View>

        {!isSinDatos && <EvolutionChart />}

        {upcomingEvents.length > 0 && (
          <View style={styles.appointmentSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Próximos Eventos</Text>
            {upcomingEvents.map((event) => {
              const parts = event.date.split('-');
              const eventDate = new Date(+parts[0], +parts[1] - 1, +parts[2]);
              const monthShort = getMonthName(eventDate.getMonth()).substring(0, 3);
              const day = eventDate.getDate();
              return (
                <View key={event.id} style={[styles.appointmentCard, { backgroundColor: colors.card }]}>
                  <View style={[styles.appointmentDate, { backgroundColor: isDark ? colors.surfaceAlt : '#f2e1c0' }, event.type === 'medical' && { backgroundColor: isDark ? colors.accentBg : '#d4edf7' }]}>
                    <Text style={[styles.appointmentMonth, { color: colors.text }]}>{monthShort}</Text>
                    <Text style={[styles.appointmentDay, { color: colors.text }]}>{day}</Text>
                  </View>
                  <View style={styles.appointmentDetails}>
                    <Text style={[styles.appointmentTitle, { color: colors.text }]}>{event.title}</Text>
                    {event.time ? (
                      <View style={styles.appointmentTime}>
                        <View style={{ marginRight: 4 }}><Clock size={14} color={colors.textSecondary} /></View>
                        <Text style={[styles.appointmentTimeText, { color: colors.textSecondary }]}>{event.time}{event.period ? ' ' + event.period : ''}</Text>
                      </View>
                    ) : (
                      <View style={styles.appointmentTime}>
                        <View style={{ marginRight: 4 }}><EventTypeIcon type={event.type} size={14} color={colors.textSecondary} /></View>
                        <Text style={[styles.appointmentTimeText, { color: colors.textSecondary }]}>{getEventBadge(event.type)}</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <DraggableFab onPress={() => navigation.navigate('DrManuel')} defaultRight={20} defaultBottom={60} />
      <CalculadoraOvulacion visible={showOvulacion} onClose={() => setShowOvulacion(false)} />
      <CalculadoraEmbarazo visible={showEmbarazo} onClose={() => setShowEmbarazo(false)} />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  welcomeSection: { marginBottom: 20 },
  welcomeTitle: { fontSize: 32, fontWeight: '600', marginBottom: 8 },
  welcomeSubtitle: { fontSize: 16, lineHeight: 24 },
  progressCard: { borderRadius: 24, padding: 20, marginBottom: 20, shadowColor: '#EB5D8B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 8 },
  progressCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  progressLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  progressWeek: { fontSize: 40, fontWeight: '700', color: '#ffffff', marginBottom: 4 },
  progressText: { fontSize: 16, color: 'rgba(255,255,255,0.9)' },
  progressIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  progressBarBackground: { height: 12, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 6, marginBottom: 12, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#ffffff', borderRadius: 6 },
  progressRangeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressRangeText: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  setupOption: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16, marginTop: 8 },
  setupOptionText: { color: '#ffffff', fontSize: 15, fontWeight: '600', flex: 1 },
  setupFormHeader: { marginBottom: 16 },
  setupFormTitle: { color: '#ffffff', fontSize: 20, fontWeight: '700', marginBottom: 6 },
  setupFormSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 20 },
  setupErrorBox: { borderRadius: 12, padding: 10, marginBottom: 12 },
  setupErrorText: { color: '#ffffff', fontSize: 13, textAlign: 'center' },
  setupDateInput: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, paddingHorizontal: 14, marginBottom: 16 },
  setupDateText: { flex: 1, height: 48, color: '#ffffff', fontSize: 16 },
  setupButtonsRow: { flexDirection: 'row', gap: 10 },
  setupBackButton: { flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  setupBackText: { color: 'rgba(255,255,255,0.8)', fontSize: 15, fontWeight: '600' },
  setupSaveButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 16 },
  setupSaveText: { fontSize: 15, fontWeight: '700' },
  hitoCard: { borderRadius: 12, padding: 12, marginTop: 4 },
  hitoTitle: { color: '#ffffff', fontSize: 14, fontWeight: '700', marginBottom: 2 },
  hitoDetalle: { color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 18 },
  calculatorGrid: { flexDirection: 'row', gap: 20, marginBottom: 20 },
  calculatorButton: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1 },
  calculatorIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  calculatorText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  healthCardsContainer: { gap: 12, marginBottom: 20 },
  healthCard: { borderRadius: 16, padding: 16, borderTopWidth: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 2 },
  healthCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  healthCardTitle: { fontSize: 20, fontWeight: '600' },
  healthCardStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  healthCardEmpty: { marginBottom: 12, paddingVertical: 8 },
  healthCardEmptyText: { fontSize: 14, lineHeight: 20 },
  healthStatBox: { borderRadius: 8, padding: 12, flex: 1, marginHorizontal: 4 },
  healthStatLabel: { fontSize: 12, marginBottom: 4 },
  healthStatValue: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  healthStatSubtext: { fontSize: 10 },
  healthCardButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12 },
  healthCardButtonText: { fontSize: 14, fontWeight: '600' },
  appointmentSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  appointmentCard: { borderRadius: 16, padding: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 2 },
  appointmentDate: { borderRadius: 12, padding: 12, alignItems: 'center', width: 64, height: 64, marginRight: 16 },
  appointmentMonth: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  appointmentDay: { fontSize: 20, fontWeight: '700' },
  appointmentDetails: { flex: 1 },
  appointmentTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  appointmentTime: { flexDirection: 'row', alignItems: 'center' },
  appointmentTimeText: { fontSize: 12 },
});
