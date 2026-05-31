// ──────────────────────────────────────────────────────────
// Contexto de tema — Modo claro / oscuro
// Persiste la preferencia en AsyncStorage
// ──────────────────────────────────────────────────────────
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, DARK_COLORS } from '../utils/constants';

const THEME_STORAGE_KEY = '@manualdelbebe_theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);

  // Restaurar tema guardado al montar
  useEffect(() => {
    const restoreTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved === 'dark' || saved === 'light') {
          setTheme(saved);
        }
      } catch {
        // Si falla, queda en light
      } finally {
        setLoading(false);
      }
    };
    restoreTheme();
  }, []);

  const toggleTheme = useCallback(async () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Silenciar error de persistencia
    }
  }, [theme]);

  const setLightTheme = useCallback(async () => {
    setTheme('light');
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, 'light');
    } catch {}
  }, []);

  const setDarkTheme = useCallback(async () => {
    setTheme('dark');
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, 'dark');
    } catch {}
  }, []);

  const colors = theme === 'dark' ? DARK_COLORS : COLORS;

  const value = {
    theme,
    colors,
    isDark: theme === 'dark',
    loading,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de un ThemeProvider');
  }
  return context;
}

export default ThemeContext;
