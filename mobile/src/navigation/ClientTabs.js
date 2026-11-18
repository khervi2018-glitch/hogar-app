import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import MyJobsScreen from '../screens/MyJobsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ConversationsScreen from '../screens/ConversationsScreen';
import { tabIcon, tabScreenOptions } from './tabTheme';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

export default function ClientTabs() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions(colors.primary)}>
      <Tab.Screen
        name="Inicio"
        component={HomeScreen}
        options={{ tabBarIcon: tabIcon('home'), title: 'CHAMBA', tabBarLabel: 'Inicio' }}
      />
      <Tab.Screen
        name="MisTrabajos"
        component={MyJobsScreen}
        options={{ tabBarIcon: tabIcon('clipboard'), title: 'Mis trabajos', tabBarLabel: 'Trabajos' }}
      />
      <Tab.Screen
        name="Chats"
        component={ConversationsScreen}
        options={{ tabBarIcon: tabIcon('chatbubbles'), title: 'Chats' }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{ tabBarIcon: tabIcon('person'), title: 'Mi perfil', tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}