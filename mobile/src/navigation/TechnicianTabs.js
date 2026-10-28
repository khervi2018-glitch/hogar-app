import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import TechnicianRequestsScreen from '../screens/TechnicianRequestsScreen';
import MyJobsScreen from '../screens/MyJobsScreen';
import ChatsPlaceholderScreen from '../screens/ChatsPlaceholderScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

function tabIcon(emoji) {
  return ({ focused }) => (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
  );
}

export default function TechnicianTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#10b981', // verde para distinguir modo tecnico
        tabBarInactiveTintColor: '#9ca3af',
      }}
    >
      <Tab.Screen
        name="Solicitudes"
        component={TechnicianRequestsScreen}
        options={{ tabBarIcon: tabIcon('🔔'), title: 'Solicitudes' }}
      />
      <Tab.Screen
        name="TrabajosTec"
        component={MyJobsScreen}
        options={{ tabBarIcon: tabIcon('🔧'), title: 'Mis trabajos', tabBarLabel: 'Trabajos' }}
      />
      <Tab.Screen
        name="ChatsTec"
        component={ChatsPlaceholderScreen}
        options={{ tabBarIcon: tabIcon('💬'), title: 'Chats' }}
      />
      <Tab.Screen
        name="PerfilTec"
        component={ProfileScreen}
        options={{ tabBarIcon: tabIcon('👤'), title: 'Mi perfil' }}
      />
    </Tab.Navigator>
  );
}