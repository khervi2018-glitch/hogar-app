import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import TechnicianRequestsScreen from '../screens/TechnicianRequestsScreen';
import MyJobsScreen from '../screens/MyJobsScreen';
import ChatsPlaceholderScreen from '../screens/ChatsPlaceholderScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { tabIcon, tabScreenOptions } from './tabTheme';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

export default function TechnicianTabs() {
  return (
    // Verde = modo tecnico, para distinguirlo del naranja del modo cliente
    <Tab.Navigator screenOptions={tabScreenOptions(colors.tech)}>
      <Tab.Screen
        name="Solicitudes"
        component={TechnicianRequestsScreen}
        options={{ tabBarIcon: tabIcon('notifications'), title: 'Solicitudes' }}
      />
      <Tab.Screen
        name="TrabajosTec"
        component={MyJobsScreen}
        options={{ tabBarIcon: tabIcon('construct'), title: 'Mis trabajos', tabBarLabel: 'Trabajos' }}
      />
      <Tab.Screen
        name="ChatsTec"
        component={ChatsPlaceholderScreen}
        options={{ tabBarIcon: tabIcon('chatbubbles'), title: 'Chats' }}
      />
      <Tab.Screen
        name="PerfilTec"
        component={ProfileScreen}
        options={{ tabBarIcon: tabIcon('person'), title: 'Mi perfil', tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}