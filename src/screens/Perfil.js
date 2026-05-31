import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Bell, Settings, BarChart3, CalendarDays, FileText, BellRing, ChevronRight } from 'lucide-react-native';
import ScreenLayout from '../components/ScreenLayout';
import Avatar from '../components/Avatar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { calcularSemanasGestacion, calcularDiasRestantes, calcularFPP, parseDDMMYYYY, formatDDMMYYYY } from '../services/dateService';
import * as calendarService from '../services/calendarService';

export default function Perfil({ navigation }) {
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const [gestacion, setGestacion] = useState({ semanas: '--', diasRestantes: '--', fpp: '--' });
  const [todayEventsCount, setTodayEventsCount] = useState(0);

  useEffect(() => {
    if (user?.furDate) {
      const fur = parseDDMMYYYY(user.furDate);
      if (fur) {
        const semanas = calcularSemanasGestacion(fur);
        const dias = calcularDiasRestantes(fur);
        const fpp = calcularFPP(fur);
        setGestacion({
          semanas: semanas !== null ? semanas : '--',
          diasRestantes: dias !== null ? dias : '--',
          fpp: fpp ? formatDDMMYYYY(fpp) : '--',
        });
      }
    }
    const loadToday = async () => {
      const today = await calendarService.getTodayEvents();
      setTodayEventsCount(today.length);
    };
    loadToday();
  }, [user]);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás segura de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.reset({ index: 0, routes: [{ name: 'InicioSesion' }] });
          },
        },
      ]
    );
  };

  const fullName = user?.fullName || 'Usuaria';
  const email = user?.email || '';

  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Bar */}
        <View style={[styles.topbar, { backgroundColor: colors.surfaceAlt, borderBottomColor: colors.cardBorder }]}>
          <Avatar size={36} />
          <Text style={[styles.brandTitle, { color: colors.primary }]}>Mi manual del bebé</Text>
          <View style={styles.topbarActions}>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.primaryBg }]} onPress={() => navigation.navigate('Calendario')}>
              <Bell size={18} color={colors.textSecondary} />
              {todayEventsCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.danger }]}>
                  <Text style={styles.badgeText}>{todayEventsCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.primaryBg }]} onPress={() => navigation.navigate('Configuracion')}>
              <Settings size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Avatar size={80} />
          <Text style={[styles.profileName, { color: colors.text }]}>{fullName}</Text>
          <Text style={[styles.profileEmail, { color: colors.textTertiary }]}>{email}</Text>
          <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('Configuracion')}>
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
        </View>

        {/* Pregnancy Info */}
        {user?.furDate && (
          <View style={[styles.pregnancyCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Mi Embarazo</Text>
            <View style={styles.pregnancyStats}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>{gestacion.semanas}</Text>
                <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Semanas</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>{gestacion.diasRestantes}</Text>
                <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Días restantes</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>{gestacion.fpp}</Text>
                <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Fecha probable</Text>
              </View>
            </View>
          </View>
        )}

        {/* Menu Options */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]} onPress={() => navigation.navigate('PerfilMama')}>
            <View style={[styles.menuIconWrapper, { backgroundColor: colors.primaryBg }]}>
              <BarChart3 size={24} color={colors.textSecondary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: colors.text }]}>Mis Estadísticas</Text>
              <Text style={[styles.menuDesc, { color: colors.textTertiary }]}>Registro de peso, presión y síntomas</Text>
            </View>
            <ChevronRight size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]} onPress={() => navigation.navigate('Calendario')}>
            <View style={[styles.menuIconWrapper, { backgroundColor: colors.primaryBg }]}>
              <CalendarDays size={24} color={colors.textSecondary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: colors.text }]}>Mis Citas</Text>
              <Text style={[styles.menuDesc, { color: colors.textTertiary }]}>Historial de consultas médicas</Text>
            </View>
            <ChevronRight size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[styles.menuIconWrapper, { backgroundColor: colors.primaryBg }]}>
              <FileText size={24} color={colors.textSecondary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: colors.text }]}>Mis Notas</Text>
              <Text style={[styles.menuDesc, { color: colors.textTertiary }]}>Registro personal del embarazo</Text>
            </View>
            <ChevronRight size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[styles.menuIconWrapper, { backgroundColor: colors.primaryBg }]}>
              <BellRing size={24} color={colors.textSecondary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: colors.text }]}>Recordatorios</Text>
              <Text style={[styles.menuDesc, { color: colors.textTertiary }]}>Configurar alertas y notificaciones</Text>
            </View>
            <ChevronRight size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]} onPress={() => navigation.navigate('Configuracion')}>
            <View style={[styles.menuIconWrapper, { backgroundColor: colors.primaryBg }]}>
              <Settings size={24} color={colors.textSecondary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: colors.text }]}>Configuración</Text>
              <Text style={[styles.menuDesc, { color: colors.textTertiary }]}>Preferencias de la aplicación</Text>
            </View>
            <ChevronRight size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={[styles.logoutButton, { borderColor: colors.danger }]} onPress={handleLogout}>
          <Text style={[styles.logoutText, { color: colors.danger }]}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
    marginBottom: 32,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginLeft: 12,
  },
  topbarActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 16,
  },
  editButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  pregnancyCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  pregnancyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  menuContainer: {
    marginBottom: 24,
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  menuIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuDesc: {
    fontSize: 14,
  },
  logoutButton: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 40,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
