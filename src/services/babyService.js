// ──────────────────────────────────────────────────────────
// Servicio de datos del bebé — Adaptado a Supabase
// RF-06 (Métricas Infantiles)
// ──────────────────────────────────────────────────────────
import { supabase } from './supabaseClient';
import { getTodayString } from './dateService';

// ─── Perfil del bebé (registro inicial) ──────────────

export const saveBabyProfile = async (profile) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('No hay sesión activa.');

    const payload = {
      id_usuario: user.id,
      nombre: profile.nombre || null,
      sexo: profile.sexo || null,
      fecha_nac: profile.fechaNac || null,
      peso_nac: profile.pesoNac ? parseFloat(profile.pesoNac) : null,
      talla_nac: profile.tallaNac ? parseFloat(profile.tallaNac) : null,
    };

    const { error } = await supabase
      .from('perfil_bebe')
      .upsert(payload, { onConflict: 'id_usuario' });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error guardando perfil del bebé en Supabase', error);
    return { success: false, message: 'No se pudo guardar el perfil del bebé.' };
  }
};

export const getBabyProfile = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return null;

    const { data, error } = await supabase
      .from('perfil_bebe')
      .select('*')
      .eq('id_usuario', user.id)
      .single();

    if (error || !data) return null;

    return {
      nombre: data.nombre,
      sexo: data.sexo,
      fechaNac: data.fecha_nac,
      pesoNac: data.peso_nac ? String(data.peso_nac) : '',
      tallaNac: data.talla_nac ? String(data.talla_nac) : '',
    };
  } catch {
    return null;
  }
};

export const updateBabyProfile = async (updates) => {
  try {
    const existing = await getBabyProfile() || {};
    const merged = { ...existing, ...updates };
    return await saveBabyProfile(merged);
  } catch {
    return { success: false, message: 'No se pudo actualizar el perfil.' };
  }
};

// ─── Datos diarios del bebé ──────────────────────────

const parseMetricasRow = (row) => {
  const movimientos = {};
  if (row.movimiento_fetal) movimientos['movimiento_fetal'] = true;
  if (row.cambio_intensidad) movimientos['cambio_intensidad'] = true;

  const sintomas = {};
  if (row.llanto_prolongado) sintomas['llanto_prolongado'] = true;
  if (row.rechazo_alimento) sintomas['rechazo_alimento'] = true;
  if (row.problemas_suenio) sintomas['problemas_suenio'] = true;
  if (row.fiebre) sintomas['fiebre'] = true;
  if (row.alteraciones_piel) sintomas['alteraciones_piel'] = true;

  return {
    date: row.fecha_registro,
    movimientos,
    sintomas,
    updatedAt: row.fecha_actualizacion,
    // Nota: peso, longitud y tomas no están en la BD actualmente.
    // Los dejamos en blanco para que la app no falle.
    peso: '',
    longitud: '',
    tomas: '',
  };
};

export const saveBabyData = async (data) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('No hay sesión activa.');

    const fechaRegistro = data.date || getTodayString();
    const payload = {
      id_usuario: user.id,
      fecha_registro: fechaRegistro,
      movimiento_fetal: !!data.movimientos?.['movimiento_fetal'],
      cambio_intensidad: !!data.movimientos?.['cambio_intensidad'],
      llanto_prolongado: !!data.sintomas?.['llanto_prolongado'],
      rechazo_alimento: !!data.sintomas?.['rechazo_alimento'],
      problemas_suenio: !!data.sintomas?.['problemas_suenio'],
      fiebre: !!data.sintomas?.['fiebre'],
      alteraciones_piel: !!data.sintomas?.['alteraciones_piel'],
      fecha_actualizacion: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('metricas_bebe')
      .upsert(payload, { onConflict: 'id_usuario, fecha_registro' });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error guardando métricas del bebé en Supabase', error);
    return { success: false, message: 'No se pudieron guardar los datos.' };
  }
};

export const getBabyData = async (date) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return null;

    const targetDate = date || getTodayString();
    
    const { data, error } = await supabase
      .from('metricas_bebe')
      .select('*')
      .eq('id_usuario', user.id)
      .eq('fecha_registro', targetDate)
      .single();

    if (error || !data) return null;

    return parseMetricasRow(data);
  } catch (error) {
    console.error('Error cargando métricas del bebé', error);
    return null;
  }
};

export const getAllBabyData = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return [];

    const { data, error } = await supabase
      .from('metricas_bebe')
      .select('*')
      .eq('id_usuario', user.id)
      .order('fecha_registro', { ascending: false });

    if (error || !data) return [];

    return data.map(parseMetricasRow);
  } catch {
    return [];
  }
};
