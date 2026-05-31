// ──────────────────────────────────────────────────────────
// Pantalla Dr. Manuel — RF-13
// Placeholder con estructura lista para integrar chat.
// ──────────────────────────────────────────────────────────
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MessageCircle, ExternalLink, Shield, ArrowLeft } from 'lucide-react-native';
import ScreenLayout from '../components/ScreenLayout';
import { useTheme } from '../context/ThemeContext';

export default function DrManuel({ navigation }) {
  const { colors, isDark } = useTheme();

  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Bar */}
        <View style={[styles.topbar, { backgroundColor: colors.surfaceAlt, borderBottomColor: colors.cardBorder }]}>
          <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.primaryBg }]} onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={[styles.topbarTitle, { color: colors.primary }]}>Dr. Manuel</Text>
          <View style={styles.topbarSpacer} />
        </View>

        {/* Hero */}
        <View style={[styles.heroCard, { backgroundColor: colors.primary }]}>
          <View style={styles.heroIconCircle}>
            <MessageCircle size={48} color="#ffffff" />
          </View>
          <Text style={styles.heroTitle}>Tu asistente de salud</Text>
          <Text style={styles.heroSubtitle}>
            Dr. Manuel es un asistente virtual de Inteligencia Artificial que te acompaña
            en tu embarazo y primera infancia.
          </Text>
        </View>

        {/* Próximamente */}
        <View style={[styles.comingSoonCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={[styles.badge, { backgroundColor: colors.primaryBgStrong }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>Próximamente</Text>
          </View>
          <Text style={[styles.comingSoonTitle, { color: colors.text }]}>Estamos preparando el chat</Text>
          <Text style={[styles.comingSoonDesc, { color: colors.textSecondary }]}>
            Pronto podrás hacerle consultas a Dr. Manuel directamente desde aquí.
            El asistente está diseñado para responder tus dudas sobre embarazo
            y primera infancia, sin sustituir la consulta médica.
          </Text>
        </View>

        {/* Info Cards */}
        <View style={styles.infoContainer}>
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[styles.infoIconCircle, { backgroundColor: colors.primaryBg }]}>
              <MessageCircle size={20} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>Consultas en lenguaje natural</Text>
              <Text style={[styles.infoDesc, { color: colors.textSecondary }]}>
                Escribí tus dudas de forma simple y Dr. Manuel te orientará.
              </Text>
            </View>
          </View>

          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[styles.infoIconCircle, { backgroundColor: colors.primaryBg }]}>
              <ExternalLink size={20} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>Integración con tus datos</Text>
              <Text style={[styles.infoDesc, { color: colors.textSecondary }]}>
                Dr. Manuel podrá ver tus métricas para darte respuestas más personalizadas.
              </Text>
            </View>
          </View>

          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[styles.infoIconCircle, { backgroundColor: colors.primaryBg }]}>
              <Shield size={20} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>No reemplaza al médico</Text>
              <Text style={[styles.infoDesc, { color: colors.textSecondary }]}>
                La información es de apoyo y no sustituye la consulta con un profesional de la salud.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topbarTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  topbarSpacer: {
    width: 40,
  },
  heroCard: {
    alignItems: 'center',
    borderRadius: 24,
    padding: 32,
    marginBottom: 20,
  },
  heroIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  comingSoonCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 12,
  },
  badgeText: {
    fontWeight: '700',
    fontSize: 13,
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  comingSoonDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  infoContainer: {
    gap: 12,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  infoIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
});
