// ──────────────────────────────────────────────────────────
// Servicio de Notificaciones — RF-12
// Maneja push notifications locales
// ──────────────────────────────────────────────────────────
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { storage, KEYS } from './dataService';

// ─── Configuración del handler ────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ─── Keys de almacenamiento ───────────────────────────
const REMINDERS_KEY = '@reminders_config';

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
  const config = await storage.get(REMINDERS_KEY);
  return { ...DEFAULT_CONFIG, ...config };
};

// ─── Guardar configuración de recordatorios ───────────
export const saveRemindersConfig = async (config) => {
  await storage.set(REMINDERS_KEY, config);
  // Reprogramar todas las notificaciones
  await scheduleAllReminders(config);
  return { success: true };
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
