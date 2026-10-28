import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import MyJobsScreen from '../screens/MyJobsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChatsPlaceholderScreen from '../screens/ChatsPlaceholderScreen';

const Tab = createBottomTabNavigator();

// Helper: icono de pestaña con emoji
function tabIcon(emoji) {
  return ({ focused }) => (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
  );
}

export default function ClientTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#9ca3af',
      }}
    >
      <Tab.Screen
        name="Inicio"
        component={HomeScreen}
        options={{ tabBarIcon: tabIcon('🏠'), title: 'CHAMBA' }}
      />
      <Tab.Screen
        name="MisTrabajos"
        component={MyJobsScreen}
        options={{ tabBarIcon: tabIcon('📋'), title: 'Mis trabajos', tabBarLabel: 'Trabajos' }}
      />
      <Tab.Screen
        name="Chats"
        component={ChatsPlaceholderScreen}
        options={{ tabBarIcon: tabIcon('💬'), title: 'Chats' }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{ tabBarIcon: tabIcon('👤'), title: 'Mi perfil' }}
      />
    </Tab.Navigator>
  );
}