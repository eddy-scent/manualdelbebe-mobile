// ──────────────────────────────────────────────────────────
// Validadores de entrada
// ──────────────────────────────────────────────────────────

export const isValidEmail = (value) => {
  const email = (value || '').trim();
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
};

export const isValidPassword = (value) => {
  return (value || '').length >= 6;
};

export const isValidName = (value) => {
  return (value || '').trim().length >= 2;
};

export const isValidDate = (dateString) => {
  if (!dateString || dateString.length !== 10) return false;
  const parts = dateString.split('/');
  if (parts.length !== 3) return false;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > new Date().getFullYear() + 10) return false;

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day > daysInMonth) return false;

  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year &&
         date.getMonth() === month - 1 &&
         date.getDate() === day;
};

export const isValidWeight = (value) => {
  const num = parseFloat(value);
  return !Number.isNaN(num) && num > 0 && num < 300;
};

export const isValidSleepHours = (value) => {
  const num = parseFloat(value);
  return !Number.isNaN(num) && num >= 0 && num <= 24;
};

export const isValidBloodPressure = (systolic, diastolic) => {
  const sys = parseInt(systolic, 10);
  const dia = parseInt(diastolic, 10);
  return !Number.isNaN(sys) && !Number.isNaN(dia) && sys > 0 && dia > 0 && sys > dia;
};

export const formatDateInput = (text) => {
  const digits = text.replace(/\D/g, '').substring(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.substring(0, 2)}/${digits.substring(2)}`;
  return `${digits.substring(0, 2)}/${digits.substring(2, 4)}/${digits.substring(4)}`;
};

export const formatTimeInput = (text) => {
  const digits = text.replace(/\D/g, '').substring(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.substring(0, 2)}:${digits.substring(2)}`;
};

export const formatDateOnBlur = (value) => {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 8) {
    return `${digits.substring(0, 2)}/${digits.substring(2, 4)}/${digits.substring(4)}`;
  }
  return value;
};

export const isValidTime = (timeString) => {
  if (!timeString) return true; // Si es opcional y está vacío, es válido
  const parts = timeString.split(':');
  if (parts.length !== 2) return false;

  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return false;
  if (hours < 0 || hours > 23) return false;
  if (minutes < 0 || minutes > 59) return false;

  return true;
};