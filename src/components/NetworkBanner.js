// ──────────────────────────────────────────────────────────
// NetworkBanner — Muestra banner de estado de conectividad
// y provee contexto a toda la app
// ──────────────────────────────────────────────────────────
import React, { createContext, useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const NetworkContext = createContext({ isConnected: true });

export function useNetwork() {
  return useContext(NetworkContext);
}

export default function NetworkBanner({ children }) {
  const [isConnected, setIsConnected] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const translateY = useState(new Animated.Value(-40))[0];

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected ?? true;
      setIsConnected(connected);
      if (!connected) {
        setShowBanner(true);
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(translateY, {
          toValue: -40,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowBanner(false));
      }
    });
    return () => unsubscribe();
  }, [translateY]);

  return (
    <NetworkContext.Provider value={{ isConnected }}>
      {children}
      {showBanner && (
        <Animated.View
          style={[
            styles.banner,
            { transform: [{ translateY }] },
          ]}
        >
          <Text style={styles.bannerText}>
            Sin conexión a internet — Algunas funciones pueden no estar disponibles
          </Text>
        </Animated.View>
      )}
    </NetworkContext.Provider>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#E8913A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    zIndex: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
