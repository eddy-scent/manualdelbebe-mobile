// ──────────────────────────────────────────────────────────
// Servicio de autenticación — Mock con AsyncStorage
// RF-01 (Registro) y RF-02 (Autenticación)
// ──────────────────────────────────────────────────────────
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';
import { supabase } from './supabaseClient';

const formatearFechaBD = (fechaStr) => {
  if (!fechaStr) return null;
  if (fechaStr.includes('-')) return fechaStr;
  const partes = fechaStr.split('/');
  if (partes.length === 3) {
    const [dia, mes, anio] = partes;
    return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  }
  return fechaStr;
};

/**
 * Registra una nueva usuaria.
 * Guarda el perfil en AsyncStorage y crea una sesión.
 * Retorna { success, message }.
 */
export const register = async ({ fullName, email, password, birthDate, furDate, babyDate }) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre_completo: fullName },
      },
    });
    if (error) return { success: false, message: error.message };

    const fecha_nac = formatearFechaBD(birthDate);
    const fecha_fur = formatearFechaBD(furDate);
    const fecha_nac_bebe = formatearFechaBD(babyDate);

    const { error: profileError } = await supabase.from('perfil_madre').insert({
      id_usuario: data.user.id,
      fecha_nac,
      fecha_fur,
      fecha_nac_bebe
    });

    if (profileError) return { success: false, message: profileError.message };

    return { success: true, message: 'Cuenta creada exitosamente.' };
  } catch (error) {
    return { success: false, message: 'Error al crear la cuenta. Inténtalo de nuevo.' };
  }
};

/**
 * Inicia sesión con email y contraseña.
 * Busca en los perfiles guardados en AsyncStorage.
 * Retorna { success, message, user? }.
 */
export const login = async ({ email, password }) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { success: false, message: error.message };

    return { success: true, message: 'Inicio de sesión exitoso.', user: data.user };
  } catch (error) {
    return { success: false, message: 'Error al iniciar sesión. Inténtalo de nuevo.' };
  }
};

/**
 * Obtiene la sesión activa.
 * Retorna el objeto de sesión o null si no hay sesión.
 */
export const getSession = async () => {
  try {
    const session = await AsyncStorage.getItem(STORAGE_KEYS.USER_SESSION);
    return session ? JSON.parse(session) : null;
  } catch {
    return null;
  }
};

/**
 * Cierra la sesión activa.
 */
export const logout = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_SESSION);
    return { success: true };
  } catch {
    return { success: false, message: 'Error al cerrar sesión.' };
  }
};

/**
 * Actualiza datos del perfil de la usuaria activa.
 */
export const updateProfile = async (updates) => {
  try {
    const session = await getSession();
    if (!session) return { success: false, message: 'No hay sesión activa.' };

    const stored = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    let profiles = stored ? JSON.parse(stored) : [];

    const index = profiles.findIndex(p => p.id === session.id);
    if (index === -1) return { success: false, message: 'Perfil no encontrado.' };

    profiles[index] = { ...profiles[index], ...updates };
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profiles));

    // Actualizar sesión también (solo campos de sesión)
    const sessionUpdates = {};
    if (updates.fullName !== undefined) sessionUpdates.fullName = updates.fullName;
    if (updates.email !== undefined) sessionUpdates.email = updates.email;
    if (updates.furDate !== undefined) sessionUpdates.furDate = updates.furDate;
    if (updates.avatarIcon !== undefined) sessionUpdates.avatarIcon = updates.avatarIcon;
    if (updates.avatarColor !== undefined) sessionUpdates.avatarColor = updates.avatarColor;
    const updatedSession = { ...session, ...sessionUpdates };
    await AsyncStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(updatedSession));

    return { success: true, message: 'Perfil actualizado.', user: updatedSession };
  } catch {
    return { success: false, message: 'Error al actualizar el perfil.' };
  }
};