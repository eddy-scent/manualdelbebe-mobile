// ──────────────────────────────────────────────────────────
// Servicio de autenticación — Adaptador Supabase
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

const formatearFechaFront = (fechaBD) => {
  if (!fechaBD) return null;
  if (fechaBD.includes('/')) return fechaBD;
  const partes = fechaBD.split('-');
  if (partes.length === 3) {
    const [anio, mes, dia] = partes;
    return `${dia}/${mes}/${anio}`;
  }
  return fechaBD;
};

/**
 * Función Helper (Adaptador): Construye el objeto de sesión que el frontend espera
 * combinando el usuario de Supabase Auth y los datos de perfil_madre.
 */
const buildFrontendUser = (authUser, perfilMadre) => {
  return {
    id: authUser.id,
    email: authUser.email,
    fullName: authUser.user_metadata?.nombre_completo || '',
    avatarIcon: authUser.user_metadata?.avatar_icon || 'heart',
    avatarColor: authUser.user_metadata?.avatar_color || '#EB5D8B',
    furDate: perfilMadre ? formatearFechaFront(perfilMadre.fecha_fur) : null,
    babyDate: perfilMadre ? formatearFechaFront(perfilMadre.fecha_nac_bebe) : null,
  };
};

/**
 * Registra una nueva usuaria en Supabase y crea su perfil_madre.
 */
export const register = async ({ fullName, email, password, birthDate, furDate, babyDate }) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          nombre_completo: fullName,
          avatar_icon: 'heart',
          avatar_color: '#EB5D8B'
        },
      },
    });
    if (error) return { success: false, message: error.message };

    const fecha_nac = formatearFechaBD(birthDate);
    const fecha_fur = formatearFechaBD(furDate);
    const fecha_nac_bebe = formatearFechaBD(babyDate);

    const { data: perfilData, error: profileError } = await supabase.from('perfil_madre').insert({
      id_usuario: data.user.id,
      fecha_nac,
      fecha_fur,
      fecha_nac_bebe
    }).select().single();

    if (profileError) return { success: false, message: profileError.message };

    const frontendUser = buildFrontendUser(data.user, perfilData);

    return { success: true, message: 'Cuenta creada exitosamente.', user: frontendUser };
  } catch (error) {
    return { success: false, message: 'Error al crear la cuenta. Inténtalo de nuevo.' };
  }
};

/**
 * Inicia sesión con email y contraseña, y recupera el perfil adaptado.
 */
export const login = async ({ email, password }) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { success: false, message: error.message };

    const { data: perfil } = await supabase
      .from('perfil_madre')
      .select('*')
      .eq('id_usuario', data.user.id)
      .single();

    const frontendUser = buildFrontendUser(data.user, perfil);

    return { success: true, message: 'Inicio de sesión exitoso.', user: frontendUser };
  } catch (error) {
    return { success: false, message: 'Error al iniciar sesión. Inténtalo de nuevo.' };
  }
};

/**
 * Obtiene la sesión activa desde Supabase (reemplaza a AsyncStorage).
 */
export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session || !session.user) return null;

    const { data: perfil } = await supabase
      .from('perfil_madre')
      .select('*')
      .eq('id_usuario', session.user.id)
      .single();

    return buildFrontendUser(session.user, perfil);
  } catch {
    return null;
  }
};

/**
 * Cierra la sesión activa en Supabase.
 */
export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    // Limpiamos AsyncStorage por si quedaron restos del sistema viejo
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_SESSION);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    return { success: true };
  } catch {
    return { success: false, message: 'Error al cerrar sesión.' };
  }
};

/**
 * Actualiza datos del perfil de la usuaria activa (Metadatos Auth + Perfil Madre).
 */
export const updateProfile = async (updates) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return { success: false, message: 'No hay sesión activa.' };

    // 1. Actualizar Metadatos (Auth)
    const authUpdates = {};
    if (updates.fullName !== undefined) authUpdates.nombre_completo = updates.fullName;
    if (updates.avatarIcon !== undefined) authUpdates.avatar_icon = updates.avatarIcon;
    if (updates.avatarColor !== undefined) authUpdates.avatar_color = updates.avatarColor;

    let updatedUser = user;
    if (Object.keys(authUpdates).length > 0) {
      const { data, error: updateError } = await supabase.auth.updateUser({ data: authUpdates });
      if (updateError) return { success: false, message: updateError.message };
      updatedUser = data.user;
    }

    // 2. Actualizar Tabla perfil_madre
    const profileUpdates = {};
    if (updates.furDate !== undefined) profileUpdates.fecha_fur = formatearFechaBD(updates.furDate);
    if (updates.babyDate !== undefined) profileUpdates.fecha_nac_bebe = formatearFechaBD(updates.babyDate);

    let perfilData = null;
    if (Object.keys(profileUpdates).length > 0) {
      const { data, error: profileError } = await supabase
        .from('perfil_madre')
        .upsert({ id_usuario: user.id, ...profileUpdates })
        .select()
        .single();
      
      if (profileError) return { success: false, message: profileError.message };
      perfilData = data;
    } else {
      const { data } = await supabase
        .from('perfil_madre')
        .select('*')
        .eq('id_usuario', user.id)
        .single();
      perfilData = data;
    }

    // Retornamos el objeto unificado
    const sessionUser = buildFrontendUser(updatedUser, perfilData);

    return { success: true, message: 'Perfil actualizado.', user: sessionUser };
  } catch (error) {
    return { success: false, message: 'Error al actualizar el perfil.' };
  }
};

/**
 * Actualiza la contraseña de la usuaria activa.
 */
export const updatePassword = async (currentPassword, newPassword) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'No hay sesión activa.' };

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (signInError) return { success: false, message: 'La contraseña actual es incorrecta.' };

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Contraseña actualizada.' };
  } catch (error) {
    return { success: false, message: 'Error al actualizar la contraseña.' };
  }
};