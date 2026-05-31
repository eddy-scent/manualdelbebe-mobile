import { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  Baby,
  Calculator,
  Ruler,
  Scale,
  Clock,
  Stethoscope,
  Star,
  ClipboardList,
  Bell,
  Settings,
  ChevronRight,
} from 'lucide-react-native';
import ScreenLayout from '../components/ScreenLayout';
import Avatar from '../components/Avatar';
import CalculadoraOvulacion from '../components/CalculadoraOvulacion';
import CalculadoraEmbarazo from '../components/CalculadoraEmbarazo';
import DraggableFab from '../components/DraggableFab';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import * as calendarService from '../services/calendarService';
import { getMonthName } from '../utils/dateUtils';

const EventTypeIcon = ({ type, size = 14, color = '#574146' }) => {
  if (type === 'medical') return <Stethoscope size={size} color={color} />;
  if (type === 'milestone') return <Star size={size} color={color} />;
  return <ClipboardList size={size} color={color} />;
};

export default function Menu({ navigation }) {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const [showOvulacion, setShowOvulacion] = useState(false);
  const [showEmbarazo, setShowEmbarazo] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [todayEventsCount, setTodayEventsCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const today = await calendarService.getTodayEvents();
      setTodayEventsCount(today.length);

      const allEvents = await calendarService.getEvents();
      const now = new Date();
      now.setHours(0, 0, 0, 0);
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

  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Bar */}
        <View style={[styles.topbar, { backgroundColor: colors.surfaceAlt, borderBottomColor: colors.cardBorder }]}>
          <Avatar size={32} />
          <Text style={[styles.brandTitle, { color: colors.primary }]}>Mi manual del bebé</Text>
          <View style={styles.topbarActions}>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.primaryBg }]} onPress={() => navigation.navigate('Calendario')}>
              <Bell size={18} color={colors.textSecondary} />
              {todayEventsCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.danger }]}>
                  <Text style={styles.badgeText}>{todayEventsCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.primaryBg }]}
              onPress={() => navigation.navigate('Configuracion')}
            >
              <Settings size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>Hola, {fullName}</Text>
          <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>Tu peque y tú están haciendo un trabajo increíble.</Text>
        </View>

        {/* Progress Card */}
        <View style={[styles.progressCard, { backgroundColor: colors.primary }]}>
          <View style={styles.progressCardHeader}>
            <View>
              <Text style={styles.progressLabel}>Progreso Actual</Text>
              <Text style={styles.progressWeek}>Semana 24</Text>
              <Text style={styles.progressText}>Segundo Trimestre - Faltan 112 días</Text>
            </View>
            <View style={styles.progressIconCircle}>
              <Baby size={40} color="#ffffff" />
            </View>
          </View>
          <View style={styles.progressBarBackground}>
            <View style={styles.progressBarFill} />
          </View>
          <View style={styles.progressRangeRow}>
            <Text style={styles.progressRangeText}>Semana 1</Text>
            <Text style={styles.progressRangeText}>Semana 40</Text>
          </View>
        </View>

        {/* Calculator Buttons */}
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

        {/* Health Summary Cards */}
        <View style={styles.healthCardsContainer}>
          <View style={[styles.healthCard, { backgroundColor: colors.card, borderTopColor: colors.accent }]}>
            <View style={styles.healthCardHeader}>
              <View style={{ marginRight: 12 }}>
                <Ruler size={24} color={colors.text} />
              </View>
              <Text style={[styles.healthCardTitle, { color: colors.text }]}>Mi Bebé</Text>
            </View>
            <View style={styles.healthCardStats}>
              <View style={[styles.healthStatBox, { backgroundColor: colors.surfaceAlt }]}>
                <Text style={[styles.healthStatLabel, { color: colors.textSecondary }]}>Tamaño est.</Text>
                <Text style={[styles.healthStatValue, { color: colors.text }]}>30 cm</Text>
                <Text style={[styles.healthStatSubtext, { color: colors.textSecondary }]}>Como una mazorca</Text>
              </View>
              <View style={[styles.healthStatBox, { backgroundColor: colors.surfaceAlt }]}>
                <Text style={[styles.healthStatLabel, { color: colors.textSecondary }]}>Peso est.</Text>
                <Text style={[styles.healthStatValue, { color: colors.text }]}>600 g</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.healthCardButton}>
              <Text style={[styles.healthCardButtonText, { color: colors.accent }]}>Ver desarrollo detallado</Text>
              <ChevronRight size={16} color={colors.accent} />
            </TouchableOpacity>
          </View>

          <View style={[styles.healthCard, { backgroundColor: colors.card, borderTopColor: colors.accent }]}>
            <View style={styles.healthCardHeader}>
              <View style={{ marginRight: 12 }}>
                <Scale size={24} color={colors.text} />
              </View>
              <Text style={[styles.healthCardTitle, { color: colors.text }]}>Mi Salud</Text>
            </View>
            <View style={styles.healthCardStats}>
              <View style={[styles.healthStatBox, { backgroundColor: colors.surfaceAlt }]}>
                <Text style={[styles.healthStatLabel, { color: colors.textSecondary }]}>Peso actual</Text>
                <Text style={[styles.healthStatValue, { color: colors.text }]}>68.5 kg</Text>
                <Text style={[styles.healthStatSubtextPositive, { color: colors.primary }]}>+4.5 kg total</Text>
              </View>
              <View style={[styles.healthStatBox, { backgroundColor: colors.surfaceAlt }]}>
                <Text style={[styles.healthStatLabel, { color: colors.textSecondary }]}>Presión arte.</Text>
                <Text style={[styles.healthStatValue, { color: colors.text }]}>110/70</Text>
                <Text style={[styles.healthStatSubtextNormal, { color: colors.textTertiary }]}>Normal</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.healthCardButton}>
              <Text style={[styles.healthCardButtonText, { color: colors.accent }]}>Actualizar métricas</Text>
              <ChevronRight size={16} color={colors.accent} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming Events */}
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
                        <View style={{ marginRight: 4 }}>
                          <Clock size={14} color={colors.textSecondary} />
                        </View>
                        <Text style={[styles.appointmentTimeText, { color: colors.textSecondary }]}>{event.time}{event.period ? ` ${event.period}` : ''}</Text>
                      </View>
                    ) : (
                      <View style={styles.appointmentTime}>
                        <View style={{ marginRight: 4 }}>
                          <EventTypeIcon type={event.type} size={14} color={colors.textSecondary} />
                        </View>
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

      {/* Floating Action Button */}
      <DraggableFab
        onPress={() => navigation.navigate('DrManuel')}
        defaultRight={20}
        defaultBottom={90}
      />

      <CalculadoraOvulacion visible={showOvulacion} onClose={() => setShowOvulacion(false)} />
      <CalculadoraEmbarazo visible={showEmbarazo} onClose={() => setShowEmbarazo(false)} />

    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
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
  brandTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    marginLeft: 12,
  },
  topbarActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeSection: {
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  progressCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#EB5D8B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  progressCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  progressWeek: {
    fontSize: 40,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  progressIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    width: '60%',
    backgroundColor: '#ffffff',
    borderRadius: 6,
  },
  progressRangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressRangeText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  calculatorGrid: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  calculatorButton: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  calculatorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  calculatorText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  healthCardsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  healthCard: {
    borderRadius: 16,
    padding: 16,
    borderTopWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  healthCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  healthCardTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  healthCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  healthStatBox: {
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  healthStatLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  healthStatValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  healthStatSubtext: {
    fontSize: 10,
  },
  healthStatSubtextPositive: {
    fontSize: 10,
  },
  healthStatSubtextNormal: {
    fontSize: 10,
  },
  healthCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  healthCardButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  appointmentSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  appointmentCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  appointmentDate: {
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: 64,
    height: 64,
    marginRight: 16,
  },
  appointmentMonth: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  appointmentDay: {
    fontSize: 20,
    fontWeight: '700',
  },
  appointmentDetails: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  appointmentTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentTimeText: {
    fontSize: 12,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
});
