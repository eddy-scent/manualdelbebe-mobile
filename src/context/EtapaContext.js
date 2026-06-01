// ──────────────────────────────────────────────────────────
// Contexto de etapa — Maneja las 3 etapas de la usuaria
// sin_datos | pre_parto | post_parto
// ──────────────────────────────────────────────────────────
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { storage, KEYS, determinarEtapa, calcularSemanasGestacion, calcularDiasRestantes, calcularFPP, calcularTrimestre, calcularEdadBebe, getDesarrolloSemanal, getHitoDesarrollo, formatDateKey } from '../services/dataService';

const EtapaContext = createContext(null);

export function EtapaProvider({ children }) {
  const { user } = useAuth();
  const [etapa, setEtapa] = useState('sin_datos');
  const [babyProfile, setBabyProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Datos derivados
  const [embarazoData, setEmbarazoData] = useState(null);
  const [bebeData, setBebeData] = useState(null);
  const [ultimaBiometria, setUltimaBiometria] = useState(null);
  const [todayEventsCount, setTodayEventsCount] = useState(0);

  // ─── Cargar datos al montar o cuando cambia el usuario ───
  const loadData = useCallback(async () => {
    if (!user) {
      setEtapa('sin_datos');
      setLoading(false);
      return;
    }

    try {
      // Cargar perfil del bebé
      const baby = await storage.get(KEYS.BABY_PROFILE);
      setBabyProfile(baby);

      // Determinar etapa
      const currentEtapa = determinarEtapa(user, baby);
      setEtapa(currentEtapa);

      // Cargar datos según etapa
      if (currentEtapa === 'pre_parto' && user.furDate) {
        // Parsear fecha FUR (formato DD/MM/AAAA)
        const parts = user.furDate.split('/');
        const fur = new Date(+parts[2], +parts[1] - 1, +parts[0]);
        const semanas = calcularSemanasGestacion(fur);
        const diasRestantes = calcularDiasRestantes(fur);
        const fpp = calcularFPP(fur);
        const trimestre = calcularTrimestre(semanas);
        const desarrollo = getDesarrolloSemanal(semanas);

        setEmbarazoData({
          semanas,
          diasRestantes,
          fpp,
          trimestre,
          desarrollo,
          furDate: user.furDate,
        });
      }

      if (currentEtapa === 'post_parto') {
        const fechaNac = baby?.fechaNac || user?.babyDate;
        if (fechaNac) {
          const parts = fechaNac.split('/');
          const nacDate = new Date(+parts[2], +parts[1] - 1, +parts[0]);
          const edad = calcularEdadBebe(nacDate);
          const hito = getHitoDesarrollo(edad?.dias);

          setBebeData({
            ...baby,
            edad,
            hito,
            fechaNac,
          });
        }
      }

      // Cargar última biometría
      const allBio = await storage.getAll(KEYS.BIOMETRIC_PREFIX);
      if (allBio.length > 0) {
        const sorted = allBio.sort((a, b) => b.date.localeCompare(a.date));
        setUltimaBiometria(sorted[0]);
      }

      // Contar eventos de hoy
      const todayKey = formatDateKey(new Date());
      const allEvents = await storage.getAll('@calendar_events');
      const todayEvents = allEvents.filter(e => {
        const parts = e.date ? e.date.split('-') : [];
        const evDate = `${parts[0]}-${parts[1]}-${parts[2]}`;
        return evDate === todayKey;
      });
      setTodayEventsCount(todayEvents.length);

    } catch (error) {
      console.error('[EtapaContext] Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Refrescar datos (llamar después de guardar) ───
  const refresh = useCallback(async () => {
    setLoading(true);
    await loadData();
  }, [loadData]);

  // ─── Calcular progreso (0-100%) ───
  const getProgreso = () => {
    if (etapa === 'pre_parto' && embarazoData?.semanas) {
      return Math.min(100, Math.round((embarazoData.semanas / 40) * 100));
    }
    if (etapa === 'post_parto' && bebeData?.edad?.dias) {
      return 100;
    }
    return 0;
  };

  const value = {
    etapa,
    loading,
    babyProfile,
    embarazoData,
    bebeData,
    ultimaBiometria,
    todayEventsCount,
    progreso: getProgreso(),
    refresh,
    isSinDatos: etapa === 'sin_datos',
    isPreParto: etapa === 'pre_parto',
    isPostParto: etapa === 'post_parto',
  };

  return (
    <EtapaContext.Provider value={value}>
      {children}
    </EtapaContext.Provider>
  );
}

export function useEtapa() {
  const context = useContext(EtapaContext);
  if (!context) {
    throw new Error('useEtapa debe usarse dentro de un EtapaProvider');
  }
  return context;
}

export default EtapaContext;
