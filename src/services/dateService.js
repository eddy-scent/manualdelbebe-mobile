// ──────────────────────────────────────────────────────────
// Servicio de fecha — centraliza utilidades de fecha
// ──────────────────────────────────────────────────────────

export function getTodayString() {
  return formatYYYYMMDD(new Date());
}

export function formatYYYYMMDD(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) return '';
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${y}-${m}-${d}`;
}

export function formatDDMMYYYY(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) return '';
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

export function formatDateInput(text) {
  const digits = text.replace(/\D/g, '').substring(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.substring(0, 2)}/${digits.substring(2)}`;
  return `${digits.substring(0, 2)}/${digits.substring(2, 4)}/${digits.substring(4)}`;
}

export function parseDDMMYYYY(dateString) {
  if (!dateString || dateString.length !== 10) return null;
  const parts = dateString.split('/');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > new Date().getFullYear() + 10) return null;

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day > daysInMonth) return null;

  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

export function parseYYYYMMDD(dateString) {
  if (!dateString || dateString.length !== 10) return null;
  const parts = dateString.split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) return null;
  return new Date(year, month - 1, day);
}

export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function getMonthName(monthIndex) {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  return meses[monthIndex] || '';
}

export function getWeekdayName(date) {
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return dias[date.getDay()] || '';
}

// ─── Cálculos obstétricos (RF-08) ─────────────

export function calcularFPP(fur) {
  if (!(fur instanceof Date) || isNaN(fur.getTime())) return null;
  return addDays(fur, 280);
}

export function calcularSemanasGestacion(fur) {
  if (!(fur instanceof Date) || isNaN(fur.getTime())) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const furDate = new Date(fur);
  furDate.setHours(0, 0, 0, 0);
  const diffMs = hoy.getTime() - furDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 0;
  return Math.floor(diffDays / 7);
}

export function calcularDiasRestantes(fur) {
  if (!(fur instanceof Date) || isNaN(fur.getTime())) return null;
  const fpp = calcularFPP(fur);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((fpp.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)));
}

export function calcularTrimestre(semanas) {
  if (semanas === null || semanas === undefined) return null;
  if (semanas <= 12) return 1;
  if (semanas <= 24) return 2;
  return 3;
}

export function determinarEtapa(furDate, babyDate) {
  if (babyDate) return 'post_parto';
  if (furDate) return 'pre_parto';
  return 'desconocida';
}