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
      fatiga: !!data.sintomas?.['Fatiga extrema'],
      dolor_cabeza: !!data.sintomas?.['Dolor de cabeza'],
      hinchazon_pies: !!data.sintomas?.['Hinchazón de pies'],
      nauseas: !!data.sintomas?.['Náuseas/Problemas estomacales'],
      ansiedad: !!data.sintomas?.['Ansiedad/Nerviosismo'],
      tristeza: !!data.sintomas?.['Tristeza persistente/Llanto'],
      irritabilidad: !!data.sintomas?.['Irritabilidad'],
      culpa: !!data.sintomas?.['Sentimiento de culpa'],
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
  if (row.fatiga) sintomas['Fatiga extrema'] = true;
  if (row.dolor_cabeza) sintomas['Dolor de cabeza'] = true;
  if (row.hinchazon_pies) sintomas['Hinchazón de pies'] = true;
  if (row.nauseas) sintomas['Náuseas/Problemas estomacales'] = true;
  if (row.ansiedad) sintomas['Ansiedad/Nerviosismo'] = true;
  if (row.tristeza) sintomas['Tristeza persistente/Llanto'] = true;
  if (row.irritabilidad) sintomas['Irritabilidad'] = true;
  if (row.culpa) sintomas['Sentimiento de culpa'] = true;

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