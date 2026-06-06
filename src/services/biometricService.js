// ──────────────────────────────────────────────────────────
// Servicio de datos biométricos — Adaptado a Supabase
// RF-05 (Ingreso de Datos Biométricos)
// ──────────────────────────────────────────────────────────
import { supabase } from './supabaseClient';
import { getTodayString } from './dateService';

/**
 * Guarda los datos biométricos del día en Supabase.
 */
export const saveBiometricData = async (data) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('No hay sesión activa.');

    const fechaRegistro = data.date || getTodayString();
    const payload = {
      id_usuario: user.id,
      fecha_registro: fechaRegistro,
      peso: parseFloat(data.peso) || null,
      horas_suenio: parseInt(data.horasSueno, 10) || null,
      presion_sistolica: parseInt(data.presionSistolica, 10) || null,
      presion_diastolica: parseInt(data.presionDiastolica, 10) || null,
      fatiga: !!data.sintomas?.['fatiga'],
      dolor_cabeza: !!data.sintomas?.['dolor_cabeza'],
      hinchazon_pies: !!data.sintomas?.['hinchazon_pies'],
      nauseas: !!data.sintomas?.['nauseas'],
      ansiedad: !!data.sintomas?.['ansiedad'],
      tristeza: !!data.sintomas?.['tristeza'],
      irritabilidad: !!data.sintomas?.['irritabilidad'],
      culpa: !!data.sintomas?.['culpa'],
      fecha_actualizacion: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('biometria_madre')
      .upsert(payload, { onConflict: 'id_usuario, fecha_registro' });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error guardando datos biométricos en Supabase', error);
    return { success: false, message: 'No se pudieron guardar los datos.' };
  }
};

/**
 * Helper interno para parsear el row de Supabase de vuelta al formato del frontend.
 */
const parseBiometricRow = (row) => {
  const sintomas = {};
  if (row.fatiga) sintomas['fatiga'] = true;
  if (row.dolor_cabeza) sintomas['dolor_cabeza'] = true;
  if (row.hinchazon_pies) sintomas['hinchazon_pies'] = true;
  if (row.nauseas) sintomas['nauseas'] = true;
  if (row.ansiedad) sintomas['ansiedad'] = true;
  if (row.tristeza) sintomas['tristeza'] = true;
  if (row.irritabilidad) sintomas['irritabilidad'] = true;
  if (row.culpa) sintomas['culpa'] = true;

  return {
    date: row.fecha_registro,
    peso: row.peso ? String(row.peso) : '',
    horasSueno: row.horas_suenio ? String(row.horas_suenio) : '',
    presionSistolica: row.presion_sistolica ? String(row.presion_sistolica) : '',
    presionDiastolica: row.presion_diastolica ? String(row.presion_diastolica) : '',
    sintomas,
    updatedAt: row.fecha_actualizacion,
  };
};

/**
 * Obtiene los datos biométricos de una fecha específica.
 * Si no se especifica fecha, usa la de hoy.
 */
export const getBiometricData = async (date) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return null;

    const targetDate = date || getTodayString();
    
    const { data, error } = await supabase
      .from('biometria_madre')
      .select('*')
      .eq('id_usuario', user.id)
      .eq('fecha_registro', targetDate)
      .single();

    if (error || !data) return null;

    return parseBiometricRow(data);
  } catch (error) {
    console.error('Error cargando datos biométricos', error);
    return null;
  }
};

/**
 * Obtiene los datos biométricos más recientes (último registro).
 */
export const getLatestBiometricData = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return null;

    const { data, error } = await supabase
      .from('biometria_madre')
      .select('*')
      .eq('id_usuario', user.id)
      .order('fecha_registro', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;

    return parseBiometricRow(data);
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
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return [];

    const { data, error } = await supabase
      .from('biometria_madre')
      .select('*')
      .eq('id_usuario', user.id)
      .order('fecha_registro', { ascending: false });

    if (error || !data) return [];

    return data.map(parseBiometricRow);
  } catch {
    return [];
  }
};