import { useEffect } from 'react';
import { Animated } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { EtapaProvider } from './src/context/EtapaContext';
import { initializeMockData } from './src/services/mockService';
import { initializeNotifications } from './src/services/notificationService';
import InicioSesion from './src/screens/InicioSesion';
import Registro from './src/screens/Registro';
import MainTabs from './src/navigation/MainTabs';
import Configuracion from './src/screens/Configuracion';
import PerfilHijo from './src/screens/PerfilHijo';
import PerfilMama from './src/screens/PerfilMama';
import RegistroBebe from './src/screens/RegistroBebe';
import Recordatorios from './src/screens/Recordatorios';
import DrManuel from './src/screens/DrManuel';

const Stack = createStackNavigator();

// Animación personalizada: fade suave + escala ligera (sin parpadeo)
const forFadeFromCenter = ({ current }) => ({
  cardStyle: {
    opacity: current.progress,
    transform: [
      {
        scale: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.97, 1],
        }),
      },
    ],
  },
});

// Navegación interna que usa el tema
function AppNavigation() {
  const { colors, isDark } = useTheme();

  // Tema de React Navigation basado en nuestro ThemeContext
  const navTheme = isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: colors.surface,
          card: colors.card,
          text: colors.text,
          primary: colors.primary,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: colors.surface,
          card: colors.card,
          text: colors.text,
          primary: colors.primary,
        },
      };

  useEffect(() => {
    initializeMockData();
    initializeNotifications();
  }, []);

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName="InicioSesion"
        screenOptions={{
          headerShown: false,
          animationEnabled: true,
          gestureEnabled: true,
          cardStyleInterpolator: forFadeFromCenter,
          cardStyle: { backgroundColor: colors.surface },
        }}
      >
        <Stack.Screen
          name="InicioSesion"
          component={InicioSesion}
          options={{
            gestureDirection: 'horizontal',
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          }}
        />
        <Stack.Screen
          name="Registro"
          component={Registro}
          options={{
            gestureDirection: 'horizontal',
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          }}
        />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Configuracion" component={Configuracion} />
        <Stack.Screen name="PerfilHijo" component={PerfilHijo} />
        <Stack.Screen name="PerfilMama" component={PerfilMama} />
        <Stack.Screen name="RegistroBebe" component={RegistroBebe} />
        <Stack.Screen name="Recordatorios" component={Recordatorios} />
        <Stack.Screen name="DrManuel" component={DrManuel} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <EtapaProvider>
            <AppNavigation />
          </EtapaProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}