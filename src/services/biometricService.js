// ──────────────────────────────────────────────────────────
// Servicio de datos biométricos — CRUD con AsyncStorage
// RF-05 (Ingreso de Datos Biométricos)
// ──────────────────────────────────────────────────────────
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';
import { getTodayString } from './dateService';

/**
 * Guarda los datos biométricos del día.
 * key: @biometric_data_YYYY-MM-DD
 */
export const saveBiometricData = async (data) => {
  try {
    const key = `${STORAGE_KEYS.BIOMETRIC_DATA_PREFIX}${data.date || getTodayString()}`;
    await AsyncStorage.setItem(key, JSON.stringify({
      ...data,
      updatedAt: new Date().toISOString(),
    }));
    return { success: true };
  } catch (error) {
    console.error('Error guardando datos biométricos', error);
    return { success: false, message: 'No se pudieron guardar los datos.' };
  }
};

/**
 * Obtiene los datos biométricos de una fecha específica.
 * Si no se especifica fecha, usa la de hoy.
 */
export const getBiometricData = async (date) => {
  try {
    const key = `${STORAGE_KEYS.BIOMETRIC_DATA_PREFIX}${date || getTodayString()}`;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error cargando datos biométricos', error);
    return null;
  }
};

/**
 * Obtiene los datos biométricos más recientes (último registro).
 * Busca hacia atrás desde hoy hasta 30 días.
 */
export const getLatestBiometricData = async () => {
  try {
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = `${STORAGE_KEYS.BIOMETRIC_DATA_PREFIX}${formatDateKey(d)}`;
      const data = await AsyncStorage.getItem(key);
      if (data) return JSON.parse(data);
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Obtiene todos los registros biométricos (para historial).
 * Retorna array ordenado por fecha descendente.
 */
export const getAllBiometricData = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const bioKeys = keys.filter(k => k.startsWith(STORAGE_KEYS.BIOMETRIC_DATA_PREFIX));
    const entries = await AsyncStorage.multiGet(bioKeys);
    return entries
      .map(([key, value]) => JSON.parse(value))
      .sort((a, b) => b.date.localeCompare(a.date));
  } catch {
    return [];
  }
};

// ─── Helpers ────────────────────────────────────

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}