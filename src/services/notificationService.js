// ──────────────────────────────────────────────────────────
// Servicio de Notificaciones — RF-12
// Maneja push notifications locales
// ──────────────────────────────────────────────────────────
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabaseClient';

// ─── Configuración del handler ────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ─── Configuración por defecto ────────────────────────
const DEFAULT_CONFIG = {
  biometricReminder: true,
  biometricTime: '20:00',
  babyReminder: true,
  babyTime: '21:00',
  calendarReminder: true,
  calendarHoursBefore: 2,
  enabled: true,
};

// Helper para mapear fila de la base de datos a objeto de configuración del frontend
const mapDbToConfig = (dbRow) => {
  if (!dbRow) return null;
  
  const formatTime = (timeStr) => {
    if (!timeStr) return null;
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }
    return timeStr;
  };

  return {
    enabled: dbRow.notificaciones_activadas ?? true,
    biometricReminder: dbRow.recordatorio_biometria ?? true,
    biometricTime: formatTime(dbRow.hora_biometria) ?? '20:00',
    babyReminder: dbRow.recordatorio_bebe ?? true,
    babyTime: formatTime(dbRow.hora_bebe) ?? '21:00',
    calendarReminder: dbRow.recordatorio_calendario ?? true,
    calendarHoursBefore: dbRow.horas_anticipacion_calendario ?? 2,
  };
};

// Helper para mapear configuración del frontend a objeto de la base de datos
const mapConfigToDb = (userId, config) => {
  return {
    id_usuario: userId,
    notificaciones_activadas: config.enabled,
    recordatorio_biometria: config.biometricReminder,
    hora_biometria: config.biometricTime,
    recordatorio_bebe: config.babyReminder,
    hora_bebe: config.babyTime,
    recordatorio_calendario: config.calendarReminder,
    horas_anticipacion_calendario: config.calendarHoursBefore,
  };
};

// ─── Solicitar permisos ───────────────────────────────
export const requestPermissions = async () => {
  if (!Device.isDevice) {
    return { success: false, message: 'Las notificaciones requieren un dispositivo físico.' };
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return { success: false, message: 'Permiso de notificaciones denegado.' };
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'MomsAI',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#EB5D8B',
    });
  }

  return { success: true };
};

// ─── Cargar configuración de recordatorios ────────────
export const getRemindersConfig = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return DEFAULT_CONFIG;
    }

    const { data, error } = await supabase
      .from('configuracion_recordatorios')
      .select('*')
      .eq('id_usuario', user.id)
      .single();

    if (error || !data) {
      // Si no existe, insertar registro por defecto
      const dbPayload = mapConfigToDb(user.id, DEFAULT_CONFIG);
      const { data: insertedData, error: insertError } = await supabase
        .from('configuracion_recordatorios')
        .insert(dbPayload)
        .select()
        .single();
      
      if (insertError) {
        console.error('Error insertando configuración por defecto:', insertError);
        return DEFAULT_CONFIG;
      }
      return { ...DEFAULT_CONFIG, ...mapDbToConfig(insertedData) };
    }

    return { ...DEFAULT_CONFIG, ...mapDbToConfig(data) };
  } catch (error) {
    console.error('Error cargando configuración de recordatorios:', error);
    return DEFAULT_CONFIG;
  }
};

// ─── Guardar configuración de recordatorios ───────────
export const saveRemindersConfig = async (config) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('No hay usuario autenticado');
    }

    const dbPayload = mapConfigToDb(user.id, config);
    const { error } = await supabase
      .from('configuracion_recordatorios')
      .upsert(dbPayload, { onConflict: 'id_usuario' });

    if (error) throw error;

    // Reprogramar todas las notificaciones
    await scheduleAllReminders(config);
    return { success: true };
  } catch (error) {
    console.error('Error guardando configuración de recordatorios:', error);
    return { success: false, message: 'No se pudo guardar la configuración.' };
  }
};

// ─── Programar recordatorio biométrico diario ─────────
export const scheduleBiometricReminder = async (time = '20:00') => {
  await cancelNotificationByIdentifier('biometric-daily');

  const [hours, minutes] = time.split(':').map(Number);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Registro diario',
      body: '¿Ya registraste tus datos de hoy? Peso, sueño y presión.',
      data: { type: 'biometric', identifier: 'biometric-daily' },
      sound: true,
    },
    trigger: {
      hour: hours,
      minute: minutes,
      repeats: true,
      channelId: 'default',
    },
  });

  return id;
};

// ─── Programar recordatorio del bebé diario ───────────
export const scheduleBabyReminder = async (time = '21:00') => {
  await cancelNotificationByIdentifier('baby-daily');

  const [hours, minutes] = time.split(':').map(Number);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Datos de tu bebé',
      body: '¿Registraste las métricas de tu bebé hoy?',
      data: { type: 'baby', identifier: 'baby-daily' },
      sound: true,
    },
    trigger: {
      hour: hours,
      minute: minutes,
      repeats: true,
      channelId: 'default',
    },
  });

  return id;
};

// ─── Programar recordatorio de cita médica ────────────
export const scheduleCalendarReminder = async (eventTitle, eventDate, hoursBefore = 2) => {
  const eventTime = new Date(eventDate);
  const reminderTime = new Date(eventTime.getTime() - hoursBefore * 60 * 60 * 1000);

  // No programar si ya pasó
  if (reminderTime <= new Date()) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Cita proxima',
      body: `${eventTitle} en ${hoursBefore} hora${hoursBefore > 1 ? 's' : ''}.`,
      data: { type: 'calendar', eventTitle },
      sound: true,
    },
    trigger: {
      date: reminderTime,
      channelId: 'default',
    },
  });

  return id;
};

// ─── Programar todos los recordatorios según config ───
export const scheduleAllReminders = async (config) => {
  // Cancelar todos los programados
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!config.enabled) return;

  // Reprogramar según configuración
  if (config.biometricReminder) {
    await scheduleBiometricReminder(config.biometricTime);
  }

  if (config.babyReminder) {
    await scheduleBabyReminder(config.babyTime);
  }
};

// ─── Cancelar notificación por identifier ─────────────
const cancelNotificationByIdentifier = async (identifier) => {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of all) {
    if (notif.content.data?.identifier === identifier) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }
};

// ─── Listar notificaciones programadas ─────────────────
export const getScheduledNotifications = async () => {
  return await Notifications.getAllScheduledNotificationsAsync();
};

// ─── Inicializar notificaciones al abrir la app ───────
export const initializeNotifications = async () => {
  const permResult = await requestPermissions();
  if (!permResult.success) return permResult;

  const config = await getRemindersConfig();
  await scheduleAllReminders(config);

  return { success: true };
};
