// ──────────────────────────────────────────────────────────
// Componente Avatar reutilizable
// Muestra el icono + color del perfil de la usuaria
// Se sincroniza automáticamente con AuthContext
// ──────────────────────────────────────────────────────────
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Heart, Baby, Flower2, User, Shield } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

const ICON_MAP = {
  heart: Heart,
  baby: Baby,
  flower: Flower2,
  user: User,
  shield: Shield,
};

const DEFAULT_COLOR = '#EB5D8B';
const DEFAULT_ICON = 'heart';

/**
 * Avatar del perfil de la usuaria.
 * Lee avatarIcon y avatarColor del AuthContext automáticamente.
 *
 * @param {number} size - Diámetro del avatar en px (default 40)
 * @param {string} icon - Override manual del icono (opcional)
 * @param {string} color - Override manual del color (opcional)
 * @param {object} style - Estilos adicionales al contenedor
 */
export default function Avatar({ size = 40, icon, color, style }) {
  const { user } = useAuth();

  const iconId = icon || user?.avatarIcon || DEFAULT_ICON;
  const bgColor = color || user?.avatarColor || DEFAULT_COLOR;
  const iconSize = Math.round(size * 0.45);

  const IconComponent = ICON_MAP[iconId] || Heart;

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
        },
        style,
      ]}
    >
      <IconComponent size={iconSize} color="#ffffff" />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
