// ──────────────────────────────────────────────────────────
// Servicio de datos mock — Inicialización para desarrollo
// Crea datos de ejemplo para poder navegar entre secciones
// ──────────────────────────────────────────────────────────
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTodayString } from './dateService';

const MOCK_INITIALIZED_KEY = '@mock_initialized';

/**
 * Inicializa datos mock si no existen datos reales.
 * Llamar una sola vez al inicio de la app.
 */
export const initializeMockData = async () => {
  try {
    // Verificar si ya se inicializó
    const initialized = await AsyncStorage.getItem(MOCK_INITIALIZED_KEY);
    if (initialized) return;

    // ─── Mock: Perfil de la madre ───
    const existingProfile = await AsyncStorage.getItem('@manualdelbebe_profile');
    if (!existingProfile) {
      const mockProfile = [{
        id: 'mock-user-001',
        fullName: 'Laura Martínez',
        email: 'laura@ejemplo.com',
        password: '123456',
        birthDate: '15/03/1995',
        furDate: '10/11/2025',
        babyDate: null,
        avatarIcon: 'heart',
        avatarColor: '#EB5D8B',
        createdAt: new Date().toISOString(),
      }];
      await AsyncStorage.setItem('@manualdelbebe_profile', JSON.stringify(mockProfile));

      // Crear sesión activa
      await AsyncStorage.setItem('@manualdelbebe_session', JSON.stringify({
        id: mockProfile[0].id,
        email: mockProfile[0].email,
        fullName: mockProfile[0].fullName,
        furDate: mockProfile[0].furDate,
        babyDate: mockProfile[0].babyDate,
        avatarIcon: mockProfile[0].avatarIcon,
        avatarColor: mockProfile[0].avatarColor,
        loggedInAt: new Date().toISOString(),
      }));
    }

    // ─── Mock: Datos biométricos (últimos 7 días) ───
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = formatDateKey(d);
      const key = `@biometric_data_${dateStr}`;

      const existing = await AsyncStorage.getItem(key);
      if (!existing) {
        await AsyncStorage.setItem(key, JSON.stringify({
          date: dateStr,
          peso: (65 + Math.random() * 3).toFixed(1),
          horasSueno: Math.floor(6 + Math.random() * 3),
          presionSistolica: Math.floor(110 + Math.random() * 15),
          presionDiastolica: Math.floor(65 + Math.random() * 15),
          sintomas: {
            'Fatiga extrema': i < 3,
            'Dolor de cabeza': i === 1,
            'Hinchazón de pies': i < 2,
            'Náuseas/Problemas estomacales': false,
            'Ansiedad/Nerviosismo': false,
            'Tristeza persistente/Llanto': false,
            'Irritabilidad': i === 0,
            'Sentimiento de culpa': false,
          },
          savedAt: new Date().toISOString(),
        }));
      }
    }

    // ─── Mock: Perfil del bebé ───
    const existingBaby = await AsyncStorage.getItem('@baby_profile');
    if (!existingBaby) {
      await AsyncStorage.setItem('@baby_profile', JSON.stringify({
        nombre: 'Sofía',
        sexo: 'femenino',
        fechaNac: null,
        pesoNac: '3.2',
        tallaNac: '49',
        createdAt: new Date().toISOString(),
      }));
    }

    // ─── Mock: Datos diarios del bebé (últimos 5 días) ───
    for (let i = 0; i < 5; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = formatDateKey(d);
      const key = `@baby_data_${dateStr}`;

      const existing = await AsyncStorage.getItem(key);
      if (!existing) {
        await AsyncStorage.setItem(key, JSON.stringify({
          date: dateStr,
          etapa: 'pre_parto',
          movimientos: {
            'Movimiento fetal activo': i < 3,
            'Disminución de movimiento fetal': false,
            'Cambio de intensidad': i === 1,
            'Sin movimiento fetal': false,
          },
          savedAt: new Date().toISOString(),
        }));
      }
    }

    // Marcar como inicializado
    await AsyncStorage.setItem(MOCK_INITIALIZED_KEY, 'true');
    console.log('[Mock] Datos de ejemplo inicializados correctamente');
  } catch (error) {
    console.error('[Mock] Error inicializando datos mock:', error);
  }
};

/**
 * Limpia todos los datos mock y permite volver a inicializar.
 * Útil para resetear el estado de desarrollo.
 */
export const clearMockData = async () => {
  try {
    await AsyncStorage.removeItem(MOCK_INITIALIZED_KEY);
    console.log('[Mock] Datos mock limpiados');
  } catch (error) {
    console.error('[Mock] Error limpiando datos mock:', error);
  }
};

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
