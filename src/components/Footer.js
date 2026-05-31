import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, CalendarDays, User } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

const TABS = [
  { key: 'Menu', icon: Home, label: 'Home' },
  { key: 'Calendario', icon: CalendarDays, label: 'Calendario' },
  { key: 'Perfil', icon: User, label: 'Perfil' },
];

export default function Footer({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const activeTab = state?.routes?.[state?.index]?.name ?? 'Menu';

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom, backgroundColor: colors.card }]}>
      <View style={[styles.bottomBar, {
        backgroundColor: isDark ? colors.card : 'rgba(255,255,255,0.95)',
        borderTopColor: isDark ? colors.cardBorder : 'rgba(235,93,139,0.05)',
      }]}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const IconComponent = tab.icon;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.bottomTab, isActive && { backgroundColor: colors.primaryBg }]}
              onPress={() => navigation.navigate(tab.key)}
              activeOpacity={0.7}
            >
              <IconComponent size={20} color={isActive ? colors.primary : colors.textTertiary} />
              <Text style={[styles.bottomTabText, isActive && { color: colors.primary, fontWeight: '700' }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: '#ffffff' },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 70,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(235,93,139,0.05)',
    shadowColor: '#eb5d8b',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 10,
  },
  bottomTab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 64,
  },
  bottomTabActive: {
    backgroundColor: 'rgba(235,93,139,0.1)',
  },
  bottomTabIcon: {
    fontSize: 20,
  },
  bottomTabText: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '500',
    color: '#807358',
  },
  bottomTabTextActive: {
    color: '#eb5d8b',
    fontWeight: '700',
  },
});
