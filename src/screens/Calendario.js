import { useState, useEffect } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Bell, Settings, Trash2, Clock, Stethoscope, Star, ClipboardList, Cake, ChevronLeft, ChevronRight, Plus, Edit3 } from 'lucide-react-native';
import ScreenLayout from '../components/ScreenLayout';
import EventForm from '../components/EventForm';
import * as calendarService from '../services/calendarService';
import { getMonthName, formatYYYYMMDD } from '../services/dateService';
import { COLORS } from '../utils/constants';

const ICONO_MAMA = require('../../imagenes/icono.png');

const EventTypeIcon = ({ type, size = 14, color = '#1c1c18' }) => {
  if (type === 'medical') return <Stethoscope size={size} color={color} />;
  if (type === 'birthday') return <Cake size={size} color={color} />;
  if (type === 'milestone') return <Star size={size} color={color} />;
  return <ClipboardList size={size} color={color} />;
};

const TYPE_COLORS = {
  medical: COLORS.accent,
  birthday: COLORS.primary,
  milestone: '#675b41',
  task: '#807358',
};

const TYPE_LABELS = {
  medical: 'Cita médica',
  birthday: 'Cumpleaños',
  milestone: 'Hito importante',
  task: 'Tarea',
};

export default function Calendario({ navigation }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [todayEvents, setTodayEvents] = useState([]);

  const today = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonthIndex = currentDate.getMonth();
  const currentMonth = getMonthName(currentMonthIndex);
  const todayDay = today.getDate();
  const todayMonthIndex = today.getMonth();
  const todayYear = today.getFullYear();

  const loadEvents = async () => {
    const data = await calendarService.getEvents();
    setEvents(data);

    const todayStr = formatYYYYMMDD(today);
    const todayEvts = data.filter((e) => e.date === todayStr);
    setTodayEvents(todayEvts);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleDeleteEvent = (eventId) => {
    Alert.alert(
      'Eliminar evento',
      '¿Estás segura de que querés eliminar este evento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await calendarService.deleteEvent(eventId);
            loadEvents();
          },
        },
      ]
    );
  };

  const handleSaveEvent = async (eventData, editingId) => {
    if (editingId) {
      await calendarService.updateEvent(editingId, eventData);
    } else {
      await calendarService.addEvent(eventData);
    }
    setEditingEvent(null);
    loadEvents();
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const daysInMonth = () => {
    const firstDay = new Date(currentYear, currentMonthIndex, 1).getDay();
    const totalDays = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonthIndex, 0).getDate();

    const days = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, isCurrentMonth: false });
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, isCurrentMonth: false });
    }
    return days;
  };

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonthIndex - 1, 1));
    setSelectedDate(1);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonthIndex + 1, 1));
    setSelectedDate(1);
  };

  const dayHasEvent = (day) => {
    if (!day.isCurrentMonth) return false;
    const dateStr = formatYYYYMMDD(new Date(currentYear, currentMonthIndex, day.day));
    return events.some((e) => e.date === dateStr);
  };

  const isToday = (day) => {
    return day.isCurrentMonth && day.day === todayDay && currentMonthIndex === todayMonthIndex && currentYear === todayYear;
  };

  const selectedDateStr = formatYYYYMMDD(new Date(currentYear, currentMonthIndex, selectedDate));
  const selectedEvents = events.filter((e) => e.date === selectedDateStr);

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
              {todayEvents.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{todayEvents.length}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Configuracion')}>
              <Settings size={18} color="#574146" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's alerts */}
        {todayEvents.length > 0 && (
          <View style={styles.alertSection}>
            <View style={styles.alertHeader}>
              <Bell size={16} color="#ffffff" />
              <Text style={styles.alertTitle}>Hoy tenés {todayEvents.length} {todayEvents.length === 1 ? 'evento' : 'eventos'}</Text>
            </View>
            {todayEvents.map((event) => {
              const typeColor = TYPE_COLORS[event.type] || TYPE_COLORS.task;
              return (
                <View key={event.id} style={[styles.alertItem, { borderLeftColor: typeColor }]}>
                  <View style={styles.alertContent}>
                    <View style={styles.alertBadge}>
                      <EventTypeIcon type={event.type} size={12} color="#ffffff" />
                      <Text style={styles.alertBadgeText}>{TYPE_LABELS[event.type] || 'Tarea'}</Text>
                    </View>
                    <Text style={styles.alertItemTitle}>{event.title}</Text>
                    {event.time && (
                      <View style={styles.alertTimeRow}>
                        <Clock size={12} color="#574146" />
                        <Text style={styles.alertTimeText}>{event.time}{event.period ? ` ${event.period}` : ''}</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Calendar Header */}
        <View style={styles.calendarHeader}>
          <View>
            <Text style={styles.monthTitle}>{currentMonth}</Text>
            <Text style={styles.yearText}>{currentYear}</Text>
          </View>
          <View style={styles.navButtons}>
            <TouchableOpacity style={styles.navButton} onPress={goToPrevMonth}>
              <ChevronLeft size={18} color="#807358" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navButton} onPress={goToNextMonth}>
              <ChevronRight size={18} color="#807358" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarContainer}>
          <View style={styles.weekDaysRow}>
            {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((day, index) => (
              <Text key={index} style={styles.weekDayText}>{day}</Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {daysInMonth().map((item, index) => {
              const hasEvent = dayHasEvent(item);
              const today = isToday(item);
              const isSelected = selectedDate === item.day && item.isCurrentMonth;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCell,
                    isSelected && styles.selectedDay,
                    today && styles.todayDay,
                  ]}
                  onPress={() => item.isCurrentMonth && setSelectedDate(item.day)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      !item.isCurrentMonth && styles.dayTextInactive,
                      isSelected && styles.selectedDayText,
                      today && !isSelected && styles.todayDayText,
                    ]}
                  >
                    {item.day}
                  </Text>
                  {hasEvent && <View style={[styles.indicator, today && styles.indicatorToday]} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Selected Day Events */}
        <View style={styles.eventsSection}>
          <View style={styles.eventsHeader}>
            <Text style={styles.eventsTitle}>
              {selectedDate} de {currentMonth}
            </Text>
            <TouchableOpacity style={styles.addButton} onPress={() => { setEditingEvent(null); setShowForm(true); }}>
              <Plus size={18} color="#ffffff" />
              <Text style={styles.addButtonText}>Evento</Text>
            </TouchableOpacity>
          </View>

          {selectedEvents.length === 0 && (
            <Text style={styles.noEventsText}>No hay eventos para este día.</Text>
          )}

          {selectedEvents.map((event) => {
            const typeColor = TYPE_COLORS[event.type] || TYPE_COLORS.task;
            return (
              <View key={event.id} style={[styles.eventItem, { borderLeftColor: typeColor }]}>
                <View style={styles.eventContent}>
                  <View style={[styles.eventBadge, { backgroundColor: `${typeColor}26` }]}>
                    <EventTypeIcon type={event.type} size={14} color={typeColor} />
                    <Text style={[styles.badgeText, { color: typeColor }]}>{TYPE_LABELS[event.type] || 'Tarea'}</Text>
                  </View>
                  <Text style={styles.eventItemTitle}>{event.title}</Text>
                  {event.time && (
                    <View style={styles.eventTimeRow}>
                      <Clock size={13} color="#574146" />
                      <Text style={styles.eventTimeText}>{event.time}{event.period ? ` ${event.period}` : ''}</Text>
                    </View>
                  )}
                  {event.description ? <Text style={styles.eventDesc}>{event.description}</Text> : null}
                </View>
                <View style={styles.eventActions}>
                  <TouchableOpacity style={styles.editButton} onPress={() => handleEditEvent(event)}>
                    <Edit3 size={16} color={COLORS.accent} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteEvent(event.id)}>
                    <Trash2 size={16} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <EventForm
        visible={showForm}
        onClose={() => { setShowForm(false); setEditingEvent(null); }}
        onSave={handleSaveEvent}
        editingEvent={editingEvent}
      />
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
    borderBottomColor: 'rgba(128,115,88,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
    marginBottom: 20,
  },
  brandAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    resizeMode: 'cover',
  },
  brandTitle: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '700',
    flex: 1,
    marginLeft: 12,
  },
  topbarActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 16,
    backgroundColor: COLORS.primaryBg,
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
  // Alert section for today
  alertSection: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  alertItem: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  alertContent: {
    flex: 1,
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  alertBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  alertItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  alertTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  alertTimeText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  // Calendar
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1c1c18',
  },
  yearText: {
    fontSize: 14,
    color: '#807358',
    marginTop: 4,
  },
  navButtons: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(128,115,88,0.12)',
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(138,113,118,0.12)',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(128,115,88,0.5)',
    width: '14.28%',
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderRadius: 14,
  },
  dayText: {
    fontSize: 16,
    color: '#1c1c18',
  },
  dayTextInactive: {
    color: 'rgba(28,28,24,0.3)',
  },
  selectedDay: {
    backgroundColor: COLORS.primary,
  },
  selectedDayText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  todayDay: {
    backgroundColor: '#f0eee8',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  todayDayText: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  indicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginTop: 2,
  },
  indicatorToday: {
    backgroundColor: '#ffffff',
  },
  // Events section
  eventsSection: {
    marginBottom: 20,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1c18',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  noEventsText: {
    fontSize: 14,
    color: '#574146',
    textAlign: 'center',
    marginVertical: 12,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(138,113,118,0.12)',
    borderLeftWidth: 3,
  },
  eventContent: {
    flex: 1,
  },
  eventBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 6,
  },
  eventItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1c1c18',
  },
  eventTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  eventTimeText: {
    fontSize: 13,
    color: '#574146',
  },
  eventDesc: {
    fontSize: 13,
    color: '#807358',
    marginTop: 4,
  },
  eventActions: {
    flexDirection: 'row',
    gap: 4,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(110,193,228,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,107,107,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});