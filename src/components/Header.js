// ──────────────────────────────────────────────────────────
// Componente Header — Persistente en las pestañas principales
// Avatar + MomsAI + Campanita + Ajustes
// ──────────────────────────────────────────────────────────
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Settings } from 'lucide-react-native';
import Avatar from './Avatar';
import { useTheme } from '../context/ThemeContext';

export default function Header({ navigation, todayEventsCount = 0 }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top, backgroundColor: colors.surface }]}>
      <View style={[styles.header, { backgroundColor: colors.surfaceAlt, borderBottomColor: colors.cardBorder }]}>
        <Avatar size={32} />
        <Text style={[styles.title, { color: colors.primary }]}>MomsAI</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.primaryBg }]}
            onPress={() => navigation.navigate('Calendario')}
            activeOpacity={0.7}
          >
            <Bell size={18} color={colors.textSecondary} />
            {todayEventsCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.danger }]}>
                <Text style={styles.badgeText}>{todayEventsCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.primaryBg }]}
            onPress={() => navigation.navigate('Configuracion')}
            activeOpacity={0.7}
          >
            <Settings size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    zIndex: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    marginLeft: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
});
