// ──────────────────────────────────────────────────────────
// Re-exports desde dateService para compatibilidad.
// Los componentes existentes siguen importando desde aquí.
// ──────────────────────────────────────────────────────────
export {
  formatDateInput,
  parseDDMMYYYY,
  addDays,
  formatDDMMYYYY,
  formatYYYYMMDD,
  getTodayString,
  getMonthName,
  getWeekdayName,
  calcularFPP,
  calcularSemanasGestacion,
  calcularDiasRestantes,
  calcularTrimestre,
  determinarEtapa,
} from '../services/dateService';