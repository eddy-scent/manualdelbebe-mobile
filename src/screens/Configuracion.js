// ──────────────────────────────────────────────────────────
// Pantalla de Configuración — RF-03 (Edición de Perfil)
// + Selector de tema claro/oscuro
// ──────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Camera,
  Check,
  Eye,
  EyeOff,
  Heart,
  Baby,
  Flower2,
  Sun,
  Moon,
  User,
  Mail,
  Lock,
  LogOut,
  ChevronRight,
  Shield,
} from 'lucide-react-native';
import ScreenLayout from '../components/ScreenLayout';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { isValidEmail, isValidName } from '../utils/validators';

// Iconos predefinidos para el avatar
const AVATAR_ICONS = [
  { id: 'heart', icon: Heart, label: 'Corazón' },
  { id: 'baby', icon: Baby, label: 'Bebé' },
  { id: 'flower', icon: Flower2, label: 'Flor' },
  { id: 'user', icon: User, label: 'Usuaria' },
  { id: 'shield', icon: Shield, label: 'Protección' },
];

// Paleta de colores para los iconos de avatar
const AVATAR_COLORS = [
  '#EB5D8B', '#6EC1E4', '#A78BFA', '#F59E0B',
  '#10B981', '#F97316', '#EC4899', '#8B5CF6',
];

export default function Configuracion({ navigation }) {
  const { user, updateProfile, logout } = useAuth();
  const { theme, colors, isDark, toggleTheme } = useTheme();

  // ─── Estado del formulario de perfil ───
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // ─── Estado del avatar ───
  const [selectedIcon, setSelectedIcon] = useState(user?.avatarIcon || 'heart');
  const [selectedColor, setSelectedColor] = useState(user?.avatarColor || '#EB5D8B');
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // Sincronizar datos del usuario cuando cambie
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setSelectedIcon(user.avatarIcon || 'heart');
      setSelectedColor(user.avatarColor || '#EB5D8B');
    }
  }, [user]);

  // ─── Guardar perfil ───
  const handleSaveProfile = async () => {
    setError('');
    setSuccessMsg('');

    // Validar nombre
    if (!isValidName(fullName)) {
      setError('El nombre debe tener al menos 2 caracteres.');
      return;
    }

    // Validar email
    if (!isValidEmail(email)) {
      setError('Ingresá un correo electrónico válido.');
      return;
    }

    // Validar cambio de contraseña (si se quiere cambiar)
    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) {
        setError('Ingresá tu contraseña actual para cambiarla.');
        return;
      }
      if (newPassword.length < 6) {
        setError('La nueva contraseña debe tener al menos 6 caracteres.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
      }
    }

    setSaving(true);

    // Preparar datos a actualizar
    const updates = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      avatarIcon: selectedIcon,
      avatarColor: selectedColor,
    };

    // Si quiere cambiar contraseña, verificar la actual
    if (newPassword && currentPassword) {
      if (currentPassword !== user?.password) {
        setError('La contraseña actual es incorrecta.');
        setSaving(false);
        return;
      }
      updates.password = newPassword;
    }

    const result = await updateProfile(updates);
    setSaving(false);

    if (result.success) {
      setSuccessMsg('Perfil actualizado correctamente.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setError(result.message || 'Error al actualizar el perfil.');
    }
  };

  // ─── Cerrar sesión ───
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

  // ─── Renderizar avatar seleccionado ───
  const renderAvatarIcon = (iconId, color, size = 32) => {
    const found = AVATAR_ICONS.find((a) => a.id === iconId);
    if (!found) return <Heart size={size} color="#ffffff" />;
    const IconComp = found.icon;
    return <IconComp size={size} color="#ffffff" />;
  };

  // ─── Estilos dinámicos basados en tema ───
  const dynamicStyles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    topbar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surfaceAlt,
      borderBottomWidth: 1,
      borderBottomColor: colors.cardBorder,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 20,
      marginBottom: 24,
    },
    topbarTitle: {
      fontSize: 18,
      color: colors.primary,
      fontWeight: '700',
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primaryBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 12,
      marginLeft: 4,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    avatarContainer: {
      alignItems: 'center',
      marginBottom: 24,
    },
    avatarCircle: {
      width: 96,
      height: 96,
      borderRadius: 48,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    avatarEditOverlay: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.cardBorder,
    },
    avatarEditText: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: '600',
    },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 8,
      marginLeft: 4,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceAlt,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      paddingHorizontal: 14,
      marginBottom: 16,
    },
    input: {
      flex: 1,
      height: 48,
      color: colors.text,
      fontSize: 16,
    },
    toggleButton: {
      padding: 8,
    },
    themeCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    themeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 4,
    },
    themeInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    themeIconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    themeLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    themeSublabel: {
      fontSize: 13,
      color: colors.textTertiary,
      marginTop: 2,
    },
    themeOptions: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 16,
    },
    themeOption: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderRadius: 16,
      borderWidth: 2,
    },
    themeOptionText: {
      fontSize: 14,
      fontWeight: '600',
    },
    saveButton: {
      backgroundColor: colors.primary,
      borderRadius: 999,
      paddingVertical: 16,
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 5,
      marginBottom: 16,
    },
    saveButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '700',
    },
    errorBox: {
      backgroundColor: colors.dangerBg,
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.danger,
    },
    errorText: {
      color: colors.danger,
      fontSize: 14,
      textAlign: 'center',
    },
    successBox: {
      backgroundColor: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)',
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#10B981',
    },
    successText: {
      color: '#10B981',
      fontSize: 14,
      textAlign: 'center',
    },
    logoutButton: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.danger,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
      marginBottom: 40,
    },
    logoutText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.danger,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ─── Top Bar ─── */}
        <View style={dynamicStyles.topbar}>
          <TouchableOpacity style={dynamicStyles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <ArrowLeft size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={dynamicStyles.topbarTitle}>Configuración</Text>
          <View style={styles.topbarSpacer} />
        </View>

        {/* ═══════════════════════════════════════════
            SECCIÓN 1: EDITAR PERFIL
            ═══════════════════════════════════════════ */}
        <Text style={dynamicStyles.sectionTitle}>Editar Perfil</Text>

        <View style={dynamicStyles.card}>
          {/* Avatar */}
          <TouchableOpacity
            style={dynamicStyles.avatarContainer}
            onPress={() => setShowAvatarModal(true)}
            activeOpacity={0.7}
          >
            <View style={[dynamicStyles.avatarCircle, { backgroundColor: selectedColor }]}>
              {renderAvatarIcon(selectedIcon, '#ffffff', 40)}
              <View style={dynamicStyles.avatarEditOverlay}>
                <Camera size={14} color={colors.textSecondary} />
              </View>
            </View>
            <Text style={dynamicStyles.avatarEditText}>Cambiar icono</Text>
          </TouchableOpacity>

          {/* Errores y éxitos */}
          {error ? (
            <View style={dynamicStyles.errorBox}>
              <Text style={dynamicStyles.errorText}>{error}</Text>
            </View>
          ) : null}
          {successMsg ? (
            <View style={dynamicStyles.successBox}>
              <Text style={dynamicStyles.successText}>{successMsg}</Text>
            </View>
          ) : null}

          {/* Nombre */}
          <Text style={dynamicStyles.label}>Nombre completo</Text>
          <View style={dynamicStyles.inputRow}>
            <View style={styles.inputIcon}>
              <User size={18} color={colors.textTertiary} />
            </View>
            <TextInput
              value={fullName}
              onChangeText={(t) => { setFullName(t); setError(''); setSuccessMsg(''); }}
              placeholder="Tu nombre"
              placeholderTextColor={colors.textTertiary}
              style={dynamicStyles.input}
            />
          </View>

          {/* Email */}
          <Text style={dynamicStyles.label}>Correo electrónico</Text>
          <View style={dynamicStyles.inputRow}>
            <View style={styles.inputIcon}>
              <Mail size={18} color={colors.textTertiary} />
            </View>
            <TextInput
              value={email}
              onChangeText={(t) => { setEmail(t); setError(''); setSuccessMsg(''); }}
              placeholder="tu@email.com"
              placeholderTextColor={colors.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              style={dynamicStyles.input}
            />
          </View>

          {/* Contraseña actual */}
          <Text style={dynamicStyles.label}>Contraseña actual</Text>
          <View style={dynamicStyles.inputRow}>
            <View style={styles.inputIcon}>
              <Lock size={18} color={colors.textTertiary} />
            </View>
            <TextInput
              value={currentPassword}
              onChangeText={(t) => { setCurrentPassword(t); setError(''); setSuccessMsg(''); }}
              placeholder="••••••••"
              placeholderTextColor={colors.textTertiary}
              secureTextEntry={!showCurrentPassword}
              style={dynamicStyles.input}
            />
            <TouchableOpacity
              style={dynamicStyles.toggleButton}
              onPress={() => setShowCurrentPassword((p) => !p)}
            >
              {showCurrentPassword
                ? <Eye size={18} color={colors.textTertiary} />
                : <EyeOff size={18} color={colors.textTertiary} />}
            </TouchableOpacity>
          </View>

          {/* Nueva contraseña */}
          <Text style={dynamicStyles.label}>Nueva contraseña</Text>
          <View style={dynamicStyles.inputRow}>
            <View style={styles.inputIcon}>
              <Lock size={18} color={colors.textTertiary} />
            </View>
            <TextInput
              value={newPassword}
              onChangeText={(t) => { setNewPassword(t); setError(''); setSuccessMsg(''); }}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={colors.textTertiary}
              secureTextEntry={!showNewPassword}
              style={dynamicStyles.input}
            />
            <TouchableOpacity
              style={dynamicStyles.toggleButton}
              onPress={() => setShowNewPassword((p) => !p)}
            >
              {showNewPassword
                ? <Eye size={18} color={colors.textTertiary} />
                : <EyeOff size={18} color={colors.textTertiary} />}
            </TouchableOpacity>
          </View>

          {/* Confirmar contraseña */}
          {newPassword.length > 0 && (
            <>
              <Text style={dynamicStyles.label}>Confirmar nueva contraseña</Text>
              <View style={dynamicStyles.inputRow}>
                <View style={styles.inputIcon}>
                  <Check size={18} color={colors.textTertiary} />
                </View>
                <TextInput
                  value={confirmPassword}
                  onChangeText={(t) => { setConfirmPassword(t); setError(''); setSuccessMsg(''); }}
                  placeholder="Repetí la nueva contraseña"
                  placeholderTextColor={colors.textTertiary}
                  secureTextEntry
                  style={dynamicStyles.input}
                />
              </View>
            </>
          )}

          {/* Botón guardar */}
          <TouchableOpacity
            style={dynamicStyles.saveButton}
            onPress={handleSaveProfile}
            activeOpacity={0.85}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator color="#ffffff" />
              : <Text style={dynamicStyles.saveButtonText}>Guardar cambios</Text>}
          </TouchableOpacity>
        </View>

        {/* ═══════════════════════════════════════════
            SECCIÓN 2: TEMA
            ═══════════════════════════════════════════ */}
        <Text style={dynamicStyles.sectionTitle}>Apariencia</Text>

        <View style={dynamicStyles.themeCard}>
          <View style={dynamicStyles.themeRow}>
            <View style={dynamicStyles.themeInfo}>
              <View style={[dynamicStyles.themeIconCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(235,93,139,0.08)' }]}>
                {isDark
                  ? <Moon size={22} color="#A78BFA" />
                  : <Sun size={22} color="#F59E0B" />}
              </View>
              <View>
                <Text style={dynamicStyles.themeLabel}>
                  {isDark ? 'Modo oscuro' : 'Modo claro'}
                </Text>
                <Text style={dynamicStyles.themeSublabel}>
                  {isDark ? 'Tema oscuro activado' : 'Tema claro activado'}
                </Text>
              </View>
            </View>
          </View>

          <View style={dynamicStyles.themeOptions}>
            <TouchableOpacity
              style={[
                dynamicStyles.themeOption,
                {
                  backgroundColor: !isDark ? colors.primaryBg : 'transparent',
                  borderColor: !isDark ? colors.primary : colors.inputBorder,
                },
              ]}
              onPress={() => { if (isDark) toggleTheme(); }}
              activeOpacity={0.7}
            >
              <Sun size={18} color={!isDark ? colors.primary : colors.textTertiary} />
              <Text style={[
                dynamicStyles.themeOptionText,
                { color: !isDark ? colors.primary : colors.textTertiary },
              ]}>
                Claro
              </Text>
              {!isDark && <Check size={16} color={colors.primary} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                dynamicStyles.themeOption,
                {
                  backgroundColor: isDark ? 'rgba(167,139,250,0.15)' : 'transparent',
                  borderColor: isDark ? '#A78BFA' : colors.inputBorder,
                },
              ]}
              onPress={() => { if (!isDark) toggleTheme(); }}
              activeOpacity={0.7}
            >
              <Moon size={18} color={isDark ? '#A78BFA' : colors.textTertiary} />
              <Text style={[
                dynamicStyles.themeOptionText,
                { color: isDark ? '#A78BFA' : colors.textTertiary },
              ]}>
                Oscuro
              </Text>
              {isDark && <Check size={16} color="#A78BFA" />}
            </TouchableOpacity>
          </View>
        </View>

        {/* ═══════════════════════════════════════════
            SECCIÓN 3: EXENCIÓN DE RESPONSABILIDAD
            ═══════════════════════════════════════════ */}
        <Text style={dynamicStyles.sectionTitle}>Legal</Text>

        <View style={dynamicStyles.card}>
          <View style={styles.disclaimerRow}>
            <Shield size={20} color={colors.primary} />
            <View style={styles.disclaimerContent}>
              <Text style={[styles.disclaimerTitle, { color: colors.text }]}>Exención de responsabilidad</Text>
              <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
                La información proporcionada por esta aplicación es de carácter orientativo y no sustituye
                la consulta con un profesional de la salud. Ante cualquier duda, consultá a tu médico.
              </Text>
            </View>
          </View>
        </View>

        {/* ═══════════════════════════════════════════
            SECCIÓN 4: CERRAR SESIÓN
            ═══════════════════════════════════════════ */}
        <TouchableOpacity style={dynamicStyles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <LogOut size={18} color={colors.danger} />
          <Text style={dynamicStyles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ═══════════════════════════════════════════
          MODAL: Selector de Icono de Avatar
          ═══════════════════════════════════════════ */}
      <Modal
        visible={showAvatarModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAvatarModal(false)}
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalSafeArea}>
            <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.cardBorder }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Elegí tu icono</Text>
                <TouchableOpacity
                  style={[styles.modalClose, { backgroundColor: colors.surfaceAlt }]}
                  onPress={() => setShowAvatarModal(false)}
                >
                  <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Listo</Text>
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalScroll}>
                {/* Selector de icono */}
                <Text style={[styles.modalSectionLabel, { color: colors.textSecondary }]}>Icono</Text>
                <View style={styles.iconGrid}>
                  {AVATAR_ICONS.map((item) => {
                    const IconComp = item.icon;
                    const isSelected = selectedIcon === item.id;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.iconOption,
                          {
                            backgroundColor: isSelected ? selectedColor : colors.surfaceAlt,
                            borderColor: isSelected ? selectedColor : colors.inputBorder,
                          },
                        ]}
                        onPress={() => setSelectedIcon(item.id)}
                        activeOpacity={0.7}
                      >
                        <IconComp size={28} color={isSelected ? '#ffffff' : colors.textSecondary} />
                        <Text style={[
                          styles.iconLabel,
                          { color: isSelected ? '#ffffff' : colors.textSecondary },
                        ]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Selector de color */}
                <Text style={[styles.modalSectionLabel, { color: colors.textSecondary, marginTop: 24 }]}>
                  Color de fondo
                </Text>
                <View style={styles.colorGrid}>
                  {AVATAR_COLORS.map((color) => {
                    const isSelected = selectedColor === color;
                    return (
                      <TouchableOpacity
                        key={color}
                        style={[
                          styles.colorOption,
                          { backgroundColor: color },
                          isSelected && styles.colorOptionSelected,
                        ]}
                        onPress={() => setSelectedColor(color)}
                        activeOpacity={0.7}
                      >
                        {isSelected && <Check size={18} color="#ffffff" />}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Preview */}
                <Text style={[styles.modalSectionLabel, { color: colors.textSecondary, marginTop: 24 }]}>
                  Vista previa
                </Text>
                <View style={styles.previewContainer}>
                  <View style={[styles.previewAvatar, { backgroundColor: selectedColor }]}>
                    {renderAvatarIcon(selectedIcon, '#ffffff', 40)}
                  </View>
                </View>
              </ScrollView>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  topbarSpacer: {
    width: 40,
  },
  inputIcon: {
    marginRight: 12,
  },
  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  disclaimerContent: {
    flex: 1,
  },
  disclaimerTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  disclaimerText: {
    fontSize: 13,
    lineHeight: 20,
  },

  // ─── Modal de Avatar ───
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSafeArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalClose: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modalScroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  modalSectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconOption: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    gap: 6,
  },
  iconLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  previewContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  previewAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
