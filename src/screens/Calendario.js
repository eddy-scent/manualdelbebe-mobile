import { useState, useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Bell, Trash2, Clock, Stethoscope, Star, ClipboardList, Cake, ChevronLeft, ChevronRight, Plus, Edit3 } from 'lucide-react-native';
import ScreenLayout from '../components/ScreenLayout';
import EventForm from '../components/EventForm';
import { useTheme } from '../context/ThemeContext';
import * as calendarService from '../services/calendarService';
import { getMonthName, formatYYYYMMDD } from '../services/dateService';

const EventTypeIcon = ({ type, size = 14, color = '#1c1c18' }) => {
  if (type === 'medical') return <Stethoscope size={size} color={color} />;
  if (type === 'birthday') return <Cake size={size} color={color} />;
  if (type === 'milestone') return <Star size={size} color={color} />;
  return <ClipboardList size={size} color={color} />;
};

export default function Calendario({ navigation }) {
  const { colors, isDark } = useTheme();
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
      '¿Estás segura de que quieres eliminar este evento?',
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

  const TYPE_COLORS = {
    medical: colors.accent,
    birthday: colors.primary,
    milestone: colors.textTertiary,
    task: colors.textTertiary,
  };

  const TYPE_LABELS = {
    medical: 'Cita médica',
    birthday: 'Cumpleaños',
    milestone: 'Hito importante',
    task: 'Tarea',
  };

  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Today's alerts */}
        {todayEvents.length > 0 && (
          <View style={[styles.alertSection, { backgroundColor: colors.primary }]}>
            <View style={styles.alertHeader}>
              <Bell size={16} color="#ffffff" />
              <Text style={styles.alertTitle}>Hoy tienes {todayEvents.length} {todayEvents.length === 1 ? 'evento' : 'eventos'}</Text>
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
                        <Clock size={12} color="rgba(255,255,255,0.7)" />
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
            <Text style={[styles.monthTitle, { color: colors.text }]}>{currentMonth}</Text>
            <Text style={[styles.yearText, { color: colors.textTertiary }]}>{currentYear}</Text>
          </View>
          <View style={[styles.navButtons, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <TouchableOpacity style={styles.navButton} onPress={goToPrevMonth}>
              <ChevronLeft size={18} color={colors.textTertiary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navButton} onPress={goToNextMonth}>
              <ChevronRight size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Calendar Grid */}
        <View style={[styles.calendarContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.weekDaysRow}>
            {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((day, index) => (
              <Text key={index} style={[styles.weekDayText, { color: isDark ? colors.textTertiary : 'rgba(128,115,88,0.5)' }]}>{day}</Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {daysInMonth().map((item, index) => {
              const hasEvent = dayHasEvent(item);
              const todayCheck = isToday(item);
              const isSelected = selectedDate === item.day && item.isCurrentMonth;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCell,
                    isSelected && { backgroundColor: colors.primary },
                    todayCheck && !isSelected && { backgroundColor: colors.surfaceAlt, borderWidth: 2, borderColor: colors.primary },
                  ]}
                  onPress={() => item.isCurrentMonth && setSelectedDate(item.day)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      { color: colors.text },
                      !item.isCurrentMonth && { color: isDark ? 'rgba(240,238,232,0.2)' : 'rgba(28,28,24,0.3)' },
                      isSelected && { color: '#ffffff', fontWeight: '700' },
                      todayCheck && !isSelected && { fontWeight: '700', color: colors.primary },
                    ]}
                  >
                    {item.day}
                  </Text>
                  {hasEvent && <View style={[styles.indicator, { backgroundColor: isSelected ? '#ffffff' : colors.primary }]} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Selected Day Events */}
        <View style={styles.eventsSection}>
          <View style={styles.eventsHeader}>
            <Text style={[styles.eventsTitle, { color: colors.text }]}>
              {selectedDate} de {currentMonth}
            </Text>
            <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]} onPress={() => { setEditingEvent(null); setShowForm(true); }}>
              <Plus size={18} color="#ffffff" />
              <Text style={styles.addButtonText}>Evento</Text>
            </TouchableOpacity>
          </View>

          {selectedEvents.length === 0 && (
            <Text style={[styles.noEventsText, { color: colors.textSecondary }]}>No hay eventos para este día.</Text>
          )}

          {selectedEvents.map((event) => {
            const typeColor = TYPE_COLORS[event.type] || TYPE_COLORS.task;
            return (
              <View key={event.id} style={[styles.eventItem, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderLeftColor: typeColor }]}>
                <View style={styles.eventContent}>
                  <View style={[styles.eventBadge, { backgroundColor: `${typeColor}26` }]}>
                    <EventTypeIcon type={event.type} size={14} color={typeColor} />
                    <Text style={[styles.eventBadgeText, { color: typeColor }]}>{TYPE_LABELS[event.type] || 'Tarea'}</Text>
                  </View>
                  <Text style={[styles.eventItemTitle, { color: colors.text }]}>{event.title}</Text>
                  {event.time && (
                    <View style={styles.eventTimeRow}>
                      <Clock size={13} color={colors.textSecondary} />
                      <Text style={[styles.eventTimeText, { color: colors.textSecondary }]}>{event.time}{event.period ? ` ${event.period}` : ''}</Text>
                    </View>
                  )}
                  {event.description ? <Text style={[styles.eventDesc, { color: colors.textTertiary }]}>{event.description}</Text> : null}
                </View>
                <View style={styles.eventActions}>
                  <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.accentBg }]} onPress={() => handleEditEvent(event)}>
                    <Edit3 size={16} color={colors.accent} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.deleteButton, { backgroundColor: colors.dangerBg }]} onPress={() => handleDeleteEvent(event.id)}>
                    <Trash2 size={16} color={colors.danger} />
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
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 18,
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
    alignItems: 'center',
    justifyContent: 'center',
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
  alertSection: {
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
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthTitle: {
    fontSize: 32,
    fontWeight: '700',
  },
  yearText: {
    fontSize: 14,
    marginTop: 4,
  },
  navButtons: {
    flexDirection: 'row',
    gap: 8,
    borderRadius: 20,
    padding: 4,
    borderWidth: 1,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarContainer: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '500',
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
  },
  indicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
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
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#EB5D8B',
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
    textAlign: 'center',
    marginVertical: 12,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
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
  eventBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  eventItemTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  eventTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  eventTimeText: {
    fontSize: 13,
  },
  eventDesc: {
    fontSize: 13,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
