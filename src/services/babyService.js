// ──────────────────────────────────────────────────────────
// Servicio de datos del bebé — CRUD con AsyncStorage
// RF-06 (Métricas Infantiles)
// ──────────────────────────────────────────────────────────
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';
import { getTodayString } from './dateService';

const BABY_DATA_PREFIX = '@baby_data_';
const BABY_PROFILE_KEY = '@baby_profile';

// ─── Perfil del bebé (registro inicial) ──────────────

/**
 * Guarda el perfil del bebé (datos de registro inicial).
 * Incluye: nombre, fecha de nacimiento, sexo, peso al nacer, etc.
 */
export const saveBabyProfile = async (profile) => {
  try {
    await AsyncStorage.setItem(BABY_PROFILE_KEY, JSON.stringify({
      ...profile,
      createdAt: new Date().toISOString(),
    }));
    return { success: true };
  } catch (error) {
    console.error('Error guardando perfil del bebé', error);
    return { success: false, message: 'No se pudo guardar el perfil del bebé.' };
  }
};

/**
 * Obtiene el perfil del bebé.
 * Retorna null si no se ha registrado.
 */
export const getBabyProfile = async () => {
  try {
    const data = await AsyncStorage.getItem(BABY_PROFILE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

/**
 * Actualiza el perfil del bebé (merge con datos existentes).
 */
export const updateBabyProfile = async (updates) => {
  try {
    const existing = await getBabyProfile();
    const merged = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await AsyncStorage.setItem(BABY_PROFILE_KEY, JSON.stringify(merged));
    return { success: true };
  } catch {
    return { success: false, message: 'No se pudo actualizar el perfil.' };
  }
};

// ─── Datos diarios del bebé ──────────────────────────

/**
 * Guarda los datos del bebé del día.
 * key: @baby_data_YYYY-MM-DD
 */
export const saveBabyData = async (data) => {
  try {
    const key = `${BABY_DATA_PREFIX}${data.date || getTodayString()}`;
    await AsyncStorage.setItem(key, JSON.stringify({
      ...data,
      updatedAt: new Date().toISOString(),
    }));
    return { success: true };
  } catch (error) {
    console.error('Error guardando datos del bebé', error);
    return { success: false, message: 'No se pudieron guardar los datos.' };
  }
};

/**
 * Obtiene los datos del bebé de una fecha específica.
 * Si no se especifica fecha, usa la de hoy.
 */
export const getBabyData = async (date) => {
  try {
    const key = `${BABY_DATA_PREFIX}${date || getTodayString()}`;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error cargando datos del bebé', error);
    return null;
  }
};

/**
 * Obtiene todos los registros del bebé (para historial/gráficos).
 * Retorna array ordenado por fecha descendente.
 */
export const getAllBabyData = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const babyKeys = keys.filter(k => k.startsWith(BABY_DATA_PREFIX));
    const entries = await AsyncStorage.multiGet(babyKeys);
    return entries
      .map(([key, value]) => JSON.parse(value))
      .sort((a, b) => b.date.localeCompare(a.date));
  } catch {
    return [];
  }
};
