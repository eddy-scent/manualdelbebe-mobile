import { useState, useEffect } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
import CalculadoraOvulacion from '../components/CalculadoraOvulacion';
import CalculadoraEmbarazo from '../components/CalculadoraEmbarazo';
import DraggableFab from '../components/DraggableFab';
import * as calendarService from '../services/calendarService';
import { getMonthName } from '../utils/dateUtils';
import { COLORS } from '../utils/constants';

const ICONO_MAMA = require('../../imagenes/icono.png');

const EventTypeIcon = ({ type, size = 14, color = '#574146' }) => {
  if (type === 'medical') return <Stethoscope size={size} color={color} />;
  if (type === 'milestone') return <Star size={size} color={color} />;
  return <ClipboardList size={size} color={color} />;
};

export default function Menu({ navigation }) {
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

  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Bar */}
        <View style={styles.topbar}>
          <Image source={ICONO_MAMA} style={styles.brandAvatar} />
          <Text style={styles.brandTitle}>Mi manual del bebé</Text>
          <View style={styles.topbarActions}>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Calendario')}>
              <Bell size={18} color="#574146" />
              {todayEventsCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{todayEventsCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => navigation.navigate('Configuracion')}
            >
              <Settings size={18} color="#574146" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Hola, Laura</Text>
          <Text style={styles.welcomeSubtitle}>Tu peque y tú están haciendo un trabajo increíble.</Text>
        </View>

        {/* Progress Card */}
        <View style={styles.progressCard}>
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
          <TouchableOpacity style={styles.calculatorButton} onPress={() => setShowOvulacion(true)}>
            <View style={styles.calculatorIcon}>
              <Calculator size={20} color="#EB5D8B" />
            </View>
            <Text style={styles.calculatorText}>Calculadora de Ovulación</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.calculatorButton} onPress={() => setShowEmbarazo(true)}>
            <View style={styles.calculatorIcon}>
              <Baby size={20} color="#EB5D8B" />
            </View>
            <Text style={styles.calculatorText}>Calculadora de Embarazo</Text>
          </TouchableOpacity>
        </View>

        {/* Health Summary Cards */}
        <View style={styles.healthCardsContainer}>
          <View style={styles.healthCard}>
            <View style={styles.healthCardHeader}>
              <View style={{ marginRight: 12 }}>
                <Ruler size={24} color="#1c1c18" />
              </View>
              <Text style={styles.healthCardTitle}>Mi Bebé</Text>
            </View>
            <View style={styles.healthCardStats}>
              <View style={styles.healthStatBox}>
                <Text style={styles.healthStatLabel}>Tamaño est.</Text>
                <Text style={styles.healthStatValue}>30 cm</Text>
                <Text style={styles.healthStatSubtext}>Como una mazorca</Text>
              </View>
              <View style={styles.healthStatBox}>
                <Text style={styles.healthStatLabel}>Peso est.</Text>
                <Text style={styles.healthStatValue}>600 g</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.healthCardButton}>
              <Text style={styles.healthCardButtonText}>Ver desarrollo detallado</Text>
              <ChevronRight size={16} color="#6EC1E4" />
            </TouchableOpacity>
          </View>

          <View style={styles.healthCard}>
            <View style={styles.healthCardHeader}>
              <View style={{ marginRight: 12 }}>
                <Scale size={24} color="#1c1c18" />
              </View>
              <Text style={styles.healthCardTitle}>Mi Salud</Text>
            </View>
            <View style={styles.healthCardStats}>
              <View style={styles.healthStatBox}>
                <Text style={styles.healthStatLabel}>Peso actual</Text>
                <Text style={styles.healthStatValue}>68.5 kg</Text>
                <Text style={styles.healthStatSubtextPositive}>+4.5 kg total</Text>
              </View>
              <View style={styles.healthStatBox}>
                <Text style={styles.healthStatLabel}>Presión arte.</Text>
                <Text style={styles.healthStatValue}>110/70</Text>
                <Text style={styles.healthStatSubtextNormal}>Normal</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.healthCardButton}>
              <Text style={styles.healthCardButtonText}>Actualizar métricas</Text>
              <ChevronRight size={16} color="#6EC1E4" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming Events — only shows future events */}
        {upcomingEvents.length > 0 && (
          <View style={styles.appointmentSection}>
            <Text style={styles.sectionTitle}>Próximos Eventos</Text>
            {upcomingEvents.map((event) => {
              const parts = event.date.split('-');
              const eventDate = new Date(+parts[0], +parts[1] - 1, +parts[2]);
              const monthShort = getMonthName(eventDate.getMonth()).substring(0, 3);
              const day = eventDate.getDate();
              return (
                <View key={event.id} style={styles.appointmentCard}>
                  <View style={[styles.appointmentDate, event.type === 'medical' && styles.appointmentDateMedical]}>
                    <Text style={styles.appointmentMonth}>{monthShort}</Text>
                    <Text style={styles.appointmentDay}>{day}</Text>
                  </View>
                  <View style={styles.appointmentDetails}>
                    <Text style={styles.appointmentTitle}>{event.title}</Text>
                    {event.time ? (
                      <View style={styles.appointmentTime}>
                        <View style={{ marginRight: 4 }}>
                          <Clock size={14} color="#574146" />
                        </View>
                        <Text style={styles.appointmentTimeText}>{event.time}{event.period ? ` ${event.period}` : ''}</Text>
                      </View>
                    ) : (
                      <View style={styles.appointmentTime}>
                        <View style={{ marginRight: 4 }}>
                          <EventTypeIcon type={event.type} size={14} color="#574146" />
                        </View>
                        <Text style={styles.appointmentTimeText}>{getEventBadge(event.type)}</Text>
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
    backgroundColor: '#f1eee8',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,115,88,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
    marginBottom: 20,
  },
  brandAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    resizeMode: 'cover',
    backgroundColor: '#EB5D8B',
  },
  brandTitle: {
    fontSize: 20,
    color: '#eb5d8b',
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
    backgroundColor: 'rgba(235,93,139,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
  },
  welcomeSection: {
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1c1c18',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#574146',
    lineHeight: 24,
  },
  progressCard: {
    backgroundColor: '#EB5D8B',
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
  progressIcon: {
    fontSize: 40,
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
    backgroundColor: '#f0eee8',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(221,191,197,0.3)',
  },
  calculatorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(235,93,139,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  calculatorIconText: {
    fontSize: 20,
  },
  calculatorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1c18',
    textAlign: 'center',
  },
  healthCardsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  healthCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderTopWidth: 3,
    borderTopColor: '#B4E4F5',
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
  healthCardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  healthCardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1c1c18',
  },
  healthCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  healthStatBox: {
    backgroundColor: '#f0eee8',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  healthStatLabel: {
    fontSize: 12,
    color: '#574146',
    marginBottom: 4,
  },
  healthStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1c1c18',
    marginBottom: 4,
  },
  healthStatSubtext: {
    fontSize: 10,
    color: '#574146',
  },
  healthStatSubtextPositive: {
    fontSize: 10,
    color: '#EB5D8B',
  },
  healthStatSubtextNormal: {
    fontSize: 10,
    color: '#675b41',
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
    color: '#6EC1E4',
  },
  
  appointmentSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1c1c18',
    marginBottom: 12,
  },
  appointmentCard: {
    backgroundColor: '#ffffff',
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
    backgroundColor: '#f2e1c0',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: 64,
    height: 64,
    marginRight: 16,
  },
  appointmentDateMedical: {
    backgroundColor: '#d4edf7',
  },
  appointmentMonth: {
    fontSize: 12,
    fontWeight: '600',
    color: '#231a07',
    textTransform: 'uppercase',
  },
  appointmentDay: {
    fontSize: 20,
    fontWeight: '700',
    color: '#231a07',
  },
  appointmentDetails: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1c18',
    marginBottom: 4,
  },
  appointmentTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  appointmentTimeText: {
    fontSize: 12,
    color: '#574146',
  },
  appointmentMenu: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0eee8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.danger,
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
