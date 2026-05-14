// ──────────────────────────────────────────────────────────
// Servicio de Calendario — CRUD de eventos con AsyncStorage
// RF-10, RF-11, RF-12 (parcial), RF-14
// ──────────────────────────────────────────────────────────
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatDateYYYYMMDD } from './dateService';

const CALENDAR_EVENTS_KEY = '@manualdelbebe_calendar_events';

/**
 * Obtiene todos los eventos guardados.
 */
export const getEvents = async () => {
  try {
    const data = await AsyncStorage.getItem(CALENDAR_EVENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error loading calendar events', e);
    return [];
  }
};

/**
 * Obtiene los eventos de una fecha específica (YYYY-MM-DD).
 */
export const getEventsForDate = async (dateStr) => {
  const events = await getEvents();
  return events.filter((e) => e.date === dateStr);
};

/**
 * Obtiene los eventos del día de hoy.
 */
export const getTodayEvents = async () => {
  const today = formatDateYYYYMMDD(new Date());
  return getEventsForDate(today);
};

/**
 * Agrega un nuevo evento.
 * Campos: { title, description, date, time, period, type }
 * type: 'medical' | 'birthday' | 'milestone' | 'task'
 */
export const addEvent = async (event) => {
  try {
    const events = await getEvents();
    const newEvent = {
      ...event,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };
    events.push(newEvent);
    await AsyncStorage.setItem(CALENDAR_EVENTS_KEY, JSON.stringify(events));
    return newEvent;
  } catch (e) {
    console.error('Error saving calendar event', e);
    return null;
  }
};

/**
 * Actualiza un evento existente por su id.
 */
export const updateEvent = async (eventId, updates) => {
  try {
    const events = await getEvents();
    const index = events.findIndex((e) => e.id === eventId);
    if (index === -1) return null;

    events[index] = { ...events[index], ...updates, updatedAt: new Date().toISOString() };
    await AsyncStorage.setItem(CALENDAR_EVENTS_KEY, JSON.stringify(events));
    return events[index];
  } catch (e) {
    console.error('Error updating calendar event', e);
    return null;
  }
};

/**
 * Elimina un evento por su id.
 */
export const deleteEvent = async (eventId) => {
  try {
    const events = await getEvents();
    const filtered = events.filter((e) => e.id !== eventId);
    await AsyncStorage.setItem(CALENDAR_EVENTS_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (e) {
    console.error('Error deleting calendar event', e);
    return null;
  }
};

/**
 * Limpia todos los eventos.
 */
export const clearEvents = async () => {
  try {
    await AsyncStorage.removeItem(CALENDAR_EVENTS_KEY);
  } catch (e) {
    console.error('Error clearing calendar events', e);
  }
};