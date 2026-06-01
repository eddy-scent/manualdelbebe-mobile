import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Menu from '../screens/Menu';
import Calendario from '../screens/Calendario';
import Perfil from '../screens/Perfil';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { useTheme } from '../context/ThemeContext';
import * as calendarService from '../services/calendarService';

const Tab = createMaterialTopTabNavigator();

export default function MainTabs({ navigation }) {
  const { colors } = useTheme();
  const [todayEventsCount, setTodayEventsCount] = useState(0);

  useEffect(() => {
    const loadToday = async () => {
      const today = await calendarService.getTodayEvents();
      setTodayEventsCount(today.length);
    };
    loadToday();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <Header navigation={navigation} todayEventsCount={todayEventsCount} />
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
    </View>
  );
}