import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Menu from '../screens/Menu';
import Calendario from '../screens/Calendario';
import Perfil from '../screens/Perfil';
import Footer from '../components/Footer';

const Tab = createMaterialTopTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      tabBar={(props) => <Footer {...props} />}
      swipeEnabled={true}
      animationEnabled={true}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Menu" component={Menu} />
      <Tab.Screen name="Calendario" component={Calendario} />
      <Tab.Screen name="Perfil" component={Perfil} />
    </Tab.Navigator>
  );
}