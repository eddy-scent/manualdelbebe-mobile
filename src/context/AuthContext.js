// ──────────────────────────────────────────────────────────
// Contexto de autenticación — RF-02
// Provee estado de sesión a toda la app
// ──────────────────────────────────────────────────────────
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';
import { STORAGE_KEYS } from '../utils/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaurar sesión al montar
  useEffect(() => {
    const restoreSession = async () => {
      const session = await authService.getSession();
      setUser(session);
      setLoading(false);
    };
    restoreSession();
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const result = await authService.login({ email, password });
    if (result.success) {
      setUser(result.user);
    }
    return result;
  }, []);

  const register = useCallback(async (data) => {
    const result = await authService.register(data);
    if (result.success) {
      const session = await authService.getSession();
      setUser(session);
    }
    return result;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates) => {
    const result = await authService.updateProfile(updates);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}

export default AuthContext;