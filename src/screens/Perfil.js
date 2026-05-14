import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Bell, Settings, BarChart3, CalendarDays, FileText, BellRing, ChevronRight } from 'lucide-react-native';
import ScreenLayout from '../components/ScreenLayout';
import { useAuth } from '../context/AuthContext';
import { calcularSemanasGestacion, calcularDiasRestantes, calcularFPP, parseDDMMYYYY, formatDDMMYYYY } from '../services/dateService';
import * as calendarService from '../services/calendarService';
import { COLORS } from '../utils/constants';

const ICONO_MAMA = require('../../imagenes/icono.png');

export default function Perfil({ navigation }) {
  const { user, logout } = useAuth();
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
        <View style={styles.topbar}>
          <Image source={ICONO_MAMA} style={styles.brandAvatar} />
          <Text style={styles.brandTitle}>Mi manual del bebé</Text>
          <View style={styles.topbarActions}>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Calendario')}>
              <Bell size={18} color="#574146" />
              {todayEventsCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{todayEventsCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Settings size={18} color="#574146" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatar}>
            <Image source={ICONO_MAMA} style={styles.profileAvatarImage} />
          </View>
          <Text style={styles.profileName}>{fullName}</Text>
          <Text style={styles.profileEmail}>{email}</Text>
          <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('Configuracion')}>
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
        </View>

        {/* Pregnancy Info */}
        {user?.furDate && (
          <View style={styles.pregnancyCard}>
            <Text style={styles.cardTitle}>Mi Embarazo</Text>
            <View style={styles.pregnancyStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{gestacion.semanas}</Text>
                <Text style={styles.statLabel}>Semanas</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{gestacion.diasRestantes}</Text>
                <Text style={styles.statLabel}>Días restantes</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{gestacion.fpp}</Text>
                <Text style={styles.statLabel}>Fecha probable</Text>
              </View>
            </View>
          </View>
        )}

        {/* Menu Options */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('PerfilMama')}>
            <View style={styles.menuIconWrapper}>
              <BarChart3 size={24} color="#574146" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Mis Estadísticas</Text>
              <Text style={styles.menuDesc}>Registro de peso, presión y síntomas</Text>
            </View>
            <ChevronRight size={20} color="#807358" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Calendario')}>
            <View style={styles.menuIconWrapper}>
              <CalendarDays size={24} color="#574146" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Mis Citas</Text>
              <Text style={styles.menuDesc}>Historial de consultas médicas</Text>
            </View>
            <ChevronRight size={20} color="#807358" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconWrapper}>
              <FileText size={24} color="#574146" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Mis Notas</Text>
              <Text style={styles.menuDesc}>Registro personal del embarazo</Text>
            </View>
            <ChevronRight size={20} color="#807358" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconWrapper}>
              <BellRing size={24} color="#574146" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Recordatorios</Text>
              <Text style={styles.menuDesc}>Configurar alertas y notificaciones</Text>
            </View>
            <ChevronRight size={20} color="#807358" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Configuracion')}>
            <View style={styles.menuIconWrapper}>
              <Settings size={24} color="#574146" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Configuración</Text>
              <Text style={styles.menuDesc}>Preferencias de la aplicación</Text>
            </View>
            <ChevronRight size={20} color="#807358" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
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
    backgroundColor: '#f1eee8',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,115,88,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
    marginBottom: 32,
  },
  brandAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    resizeMode: 'cover',
  },
  brandTitle: {
    fontSize: 18,
    color: COLORS.primary,
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
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.danger,
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
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  profileAvatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    resizeMode: 'cover',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: COLORS.textTertiary,
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: COLORS.primary,
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
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
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
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  menuContainer: {
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  menuIconWrapper: {
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  menuDesc: {
    fontSize: 14,
    color: COLORS.textTertiary,
  },
  logoutButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.danger,
  },
});