// ──────────────────────────────────────────────────────────
// Pantalla Dr. Manuel — RF-13
// ──────────────────────────────────────────────────────────
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import ScreenLayout from '../components/ScreenLayout';
import { useTheme } from '../context/ThemeContext';

export default function DrManuel({ navigation }) {
  const { colors } = useTheme();
  
  // Reemplazar esta URL con la URL final de pruebas que entregó el cliente
  const CHAT_TEST_URL = "https://mimanualdelbebe.com/chat";

  return (
    <ScreenLayout>
      <View style={styles.container}>
        {/* Top Bar */}
        <View style={[styles.topbar, { backgroundColor: colors.surfaceAlt, borderBottomColor: colors.cardBorder }]}>
          <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.primaryBg }]} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <ArrowLeft size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={[styles.topbarTitle, { color: colors.primary }]}>Dr. Manuel</Text>
          <View style={styles.topbarSpacer} />
        </View>

        {/* Disclaimer Legal (RF-09 / Regla de Negocio) */}
        <View style={[styles.disclaimerContainer, { backgroundColor: colors.warningBg }]}>
          <Text style={[styles.disclaimerText, { color: colors.warningText }]}>
            La información es de apoyo y no sustituye la consulta con un profesional de la salud.
          </Text>
        </View>

        {/* WebView del Chat */}
        <View style={styles.webviewContainer}>
          <WebView 
            source={{ uri: CHAT_TEST_URL }}
            style={styles.webview}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={[styles.loaderContainer, { backgroundColor: colors.surface }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ color: colors.textSecondary, marginTop: 10 }}>Conectando con Dr. Manuel...</Text>
              </View>
            )}
          />
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 12,
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
  disclaimerContainer: {
    marginHorizontal: 20,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  disclaimerText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  webviewContainer: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#fff', // Fondo blanco seguro para iframes
  },
  webview: {
    flex: 1,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
