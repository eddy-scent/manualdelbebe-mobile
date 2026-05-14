// ──────────────────────────────────────────────────────────
// Pantalla Dr. Manuel — RF-13
// Placeholder con estructura lista para integrar iframe.
// El FAB de Menu navega aquí cuando se implemente el chat.
// ──────────────────────────────────────────────────────────
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MessageCircle, ExternalLink, Shield, ArrowLeft } from 'lucide-react-native';
import ScreenLayout from '../components/ScreenLayout';
import { COLORS } from '../utils/constants';

export default function DrManuel({ navigation }) {
  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Bar */}
        <View style={styles.topbar}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color="#574146" />
          </TouchableOpacity>
          <Text style={styles.topbarTitle}>Dr. Manuel</Text>
          <View style={styles.topbarSpacer} />
        </View>

        {/* Hero */}
        <View style={styles.heroCard}>
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
        <View style={styles.comingSoonCard}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Próximamente</Text>
          </View>
          <Text style={styles.comingSoonTitle}>Estamos preparando el chat</Text>
          <Text style={styles.comingSoonDesc}>
            Pronto podrás hacerle consultas a Dr. Manuel directamente desde aquí.
            El asistente está diseñado para responder tus dudas sobre embarazo
            y primera infancia, sin sustituir la consulta médica.
          </Text>
        </View>

        {/* Info Cards */}
        <View style={styles.infoContainer}>
          <View style={styles.infoCard}>
            <View style={styles.infoIconCircle}>
              <MessageCircle size={20} color={COLORS.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Consultas en lenguaje natural</Text>
              <Text style={styles.infoDesc}>
                Escribí tus dudas de forma simple y Dr. Manuel te orientará.
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoIconCircle}>
              <ExternalLink size={20} color={COLORS.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Integración con tus datos</Text>
              <Text style={styles.infoDesc}>
                Dr. Manuel podrá ver tus métricas para darte respuestas más personalizadas.
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoIconCircle}>
              <Shield size={20} color={COLORS.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>No reemplaza al médico</Text>
              <Text style={styles.infoDesc}>
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
    backgroundColor: '#f1eee8',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,115,88,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(235,93,139,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topbarTitle: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '700',
  },
  topbarSpacer: {
    width: 40,
  },
  heroCard: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
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
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
  },
  badge: {
    backgroundColor: COLORS.primaryBgStrong,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 12,
  },
  badgeText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  comingSoonDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  infoContainer: {
    gap: 12,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  infoIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryBg,
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
    color: COLORS.text,
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});