// ──────────────────────────────────────────────────────────
// Servicio de Calendario — CRUD de eventos con Supabase
// RF-10, RF-11, RF-12 (parcial), RF-14
// ──────────────────────────────────────────────────────────
import { supabase } from './supabaseClient';
import { formatYYYYMMDD } from './dateService';
import { scheduleCalendarReminder, getRemindersConfig } from './notificationService';

// Helper para transformar el registro de la BD al formato que usa la App (fecha en YYYY-MM-DD y hora en HH:MM)
const mapDbToEvent = (dbRow) => {
  if (!dbRow) return null;
  
  let dateStr = '';
  let timeStr = '00:00';
  
  if (dbRow.fecha_hora) {
    const dateObj = new Date(dbRow.fecha_hora);
    dateStr = formatYYYYMMDD(dateObj); // YYYY-MM-DD
    timeStr = dbRow.fecha_hora.includes('T') 
      ? dbRow.fecha_hora.split('T')[1].substring(0, 5) 
      : '00:00';
  }

  return {
    id: dbRow.id,
    title: dbRow.titulo,
    description: dbRow.descripcion,
    date: dateStr,
    time: timeStr,
    type: dbRow.tipo || 'task',
    completed: dbRow.finalizada,
    createdAt: dbRow.fecha_hora,
  };
};

// Helper para parsear la fecha de DD/MM/YYYY a YYYY-MM-DD
const parseDateToYYYYMMDD = (dateStr) => {
  if (!dateStr) return '';
  if (dateStr.includes('-')) {
    return dateStr; // Ya está en formato YYYY-MM-DD
  }
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
  }
  return dateStr;
};

// Helper para parsear y normalizar la hora a formato de 24h (HH:MM)
const parseTime = (timeStr, period) => {
  if (!timeStr) return '00:00';
  if (timeStr.toLowerCase() === 'all day') return '00:00';
  
  // Limpiar caracteres no numéricos (ej. "10:00" -> "1000", "9" -> "9")
  let digits = timeStr.replace(/\D/g, '');
  if (digits.length === 0) return '00:00';
  
  let hours = 0;
  let minutes = 0;
  
  if (digits.length <= 2) {
    hours = parseInt(digits, 10);
    minutes = 0;
  } else if (digits.length === 3) {
    hours = parseInt(digits.substring(0, 1), 10);
    minutes = parseInt(digits.substring(1), 10);
  } else {
    // 4 dígitos o más
    hours = parseInt(digits.substring(0, 2), 10);
    minutes = parseInt(digits.substring(2, 4), 10);
  }
  
  // Aplicar formato AM/PM si corresponde
  if (period) {
    const upperPeriod = period.toUpperCase();
    if (upperPeriod === 'PM' && hours < 12) {
      hours += 12;
    } else if (upperPeriod === 'AM' && hours === 12) {
      hours = 0;
    }
  }
  
  // Limitar a rangos válidos
  hours = Math.min(Math.max(hours, 0), 23);
  minutes = Math.min(Math.max(minutes, 0), 59);
  
  const hStr = String(hours).padStart(2, '0');
  const mStr = String(minutes).padStart(2, '0');
  return `${hStr}:${mStr}`;
};

/**
 * Obtiene todos los eventos guardados del usuario actual.
 */
export const getEvents = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('registro_tarea')
      .select('*')
      .eq('id_usuario', user.id)
      .order('fecha_hora', { ascending: true });

    if (error) throw error;
    return data ? data.map(mapDbToEvent) : [];
  } catch (e) {
    console.error('Error loading calendar events from Supabase', e);
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
  const today = formatYYYYMMDD(new Date());
  return getEventsForDate(today);
};

/**
 * Agrega un nuevo evento.
 * Campos esperados: { title, description, date, time, period, type }
 */
export const addEvent = async (event) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    // Normalizar fecha y hora
    const formattedDate = parseDateToYYYYMMDD(event.date);
    const formattedTime = parseTime(event.time, event.period);
    const fechaHora = `${formattedDate}T${formattedTime}:00`;

    const newRow = {
      id_usuario: user.id,
      titulo: event.title,
      descripcion: event.description || '',
      fecha_hora: fechaHora,
      tipo: event.type || 'task',
      finalizada: false
    };

    const { data, error } = await supabase
      .from('registro_tarea')
      .insert(newRow)
      .select()
      .single();

    if (error) throw error;

    const savedEvent = mapDbToEvent(data);

    // Programar notificación si es cita médica
    if (savedEvent.type === 'medical' && savedEvent.date) {
      try {
        const config = await getRemindersConfig();
        if (config.enabled && config.calendarReminder) {
          const eventDate = new Date(savedEvent.date + 'T' + savedEvent.time + ':00');
          await scheduleCalendarReminder(savedEvent.title, eventDate, config.calendarHoursBefore);
        }
      } catch (notifError) {
        console.warn('No se pudo programar notificación:', notifError);
      }
    }

    return savedEvent;
  } catch (e) {
    console.error('Error saving calendar event to Supabase', e);
    return null;
  }
};

/**
 * Actualiza un evento existente por su id.
 */
export const updateEvent = async (eventId, updates) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const updateData = {};
    if (updates.title !== undefined) updateData.titulo = updates.title;
    if (updates.description !== undefined) updateData.descripcion = updates.description;
    if (updates.type !== undefined) updateData.tipo = updates.type;
    if (updates.completed !== undefined) updateData.finalizada = updates.completed;
    
    // Manejar actualización de fecha/hora si aplica
    if (updates.date || updates.time) {
      const formattedDate = parseDateToYYYYMMDD(updates.date) || new Date().toISOString().split('T')[0];
      const formattedTime = parseTime(updates.time, updates.period);
      updateData.fecha_hora = `${formattedDate}T${formattedTime}:00`;
    }

    const { data, error } = await supabase
      .from('registro_tarea')
      .update(updateData)
      .eq('id', eventId)
      .eq('id_usuario', user.id)
      .select()
      .single();

    if (error) throw error;
    return mapDbToEvent(data);
  } catch (e) {
    console.error('Error updating calendar event in Supabase', e);
    return null;
  }
};

/**
 * Elimina un evento por su id.
 */
export const deleteEvent = async (eventId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('registro_tarea')
      .delete()
      .eq('id', eventId)
      .eq('id_usuario', user.id);

    if (error) throw error;
    return true; // Éxito
  } catch (e) {
    console.error('Error deleting calendar event in Supabase', e);
    return false;
  }
};

/**
 * Limpia todos los eventos del usuario actual.
 */
export const clearEvents = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('registro_tarea')
      .delete()
      .eq('id_usuario', user.id);

    if (error) throw error;
  } catch (e) {
    console.error('Error clearing calendar events in Supabase', e);
  }
};