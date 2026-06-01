// ──────────────────────────────────────────────────────────
// Servicio de autenticación — Mock con AsyncStorage
// RF-01 (Registro) y RF-02 (Autenticación)
// ──────────────────────────────────────────────────────────
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * Registra una nueva usuaria.
 * Guarda el perfil en AsyncStorage y crea una sesión.
 * Retorna { success, message }.
 */
export const register = async ({ fullName, email, password, birthDate, furDate, babyDate }) => {
  try {
    // Verificar si el correo ya está registrado
    const existing = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (existing) {
      const profiles = JSON.parse(existing);
      if (Array.isArray(profiles) && profiles.some(p => p.email === email.trim().toLowerCase())) {
        return { success: false, message: 'Ya existe una cuenta con este correo electrónico.' };
      }
    }

    const newProfile = {
      id: Date.now().toString(),
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password, // En producción esto iría hasheado
      birthDate: birthDate || null,
      furDate: furDate || null,
      babyDate: babyDate || null,
      avatarIcon: 'heart',
      avatarColor: '#EB5D8B',
      createdAt: new Date().toISOString(),
    };

    // Guardar perfil
    let profiles = [];
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (stored) profiles = JSON.parse(stored);
    profiles.push(newProfile);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profiles));

    // Crear sesión automáticamente
    await AsyncStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify({
      id: newProfile.id,
      email: newProfile.email,
      fullName: newProfile.fullName,
      furDate: newProfile.furDate,
      avatarIcon: newProfile.avatarIcon,
      avatarColor: newProfile.avatarColor,
      loggedInAt: new Date().toISOString(),
    }));

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
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!stored) {
      return { success: false, message: 'No hay cuentas registradas. Crea una cuenta primero.' };
    }

    const profiles = JSON.parse(stored);
    const normalizedEmail = email.trim().toLowerCase();
    const user = profiles.find(p => p.email === normalizedEmail);

    if (!user) {
      return { success: false, message: 'No existe una cuenta con este correo electrónico.' };
    }

    if (user.password !== password) {
      return { success: false, message: 'Contraseña incorrecta.' };
    }

    // Crear sesión
    const session = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      furDate: user.furDate,
      avatarIcon: user.avatarIcon || 'heart',
      avatarColor: user.avatarColor || '#EB5D8B',
      loggedInAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(session));

    return { success: true, message: 'Inicio de sesión exitoso.', user: session };
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