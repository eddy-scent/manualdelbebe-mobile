import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import InicioSesion from './src/screens/InicioSesion';
import Registro from './src/screens/Registro';
import MainTabs from './src/navigation/MainTabs';
import Configuracion from './src/screens/Configuracion';
import PerfilHijo from './src/screens/PerfilHijo';
import PerfilMama from './src/screens/PerfilMama';
import DrManuel from './src/screens/DrManuel';

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="InicioSesion"
            screenOptions={{
              headerShown: false,
              animationEnabled: true,
              gestureEnabled: true,
              cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            }}
          >
            <Stack.Screen name="InicioSesion" component={InicioSesion} />
            <Stack.Screen name="Registro" component={Registro} />
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Configuracion" component={Configuracion} />
            <Stack.Screen name="PerfilHijo" component={PerfilHijo} />
            <Stack.Screen name="PerfilMama" component={PerfilMama} />
            <Stack.Screen name="DrManuel" component={DrManuel} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}