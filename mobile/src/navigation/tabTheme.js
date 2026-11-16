import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize } from '../theme/colors';

/**
 * Icono de pestaña: relleno cuando esta activa y contorno cuando no.
 * Ej: tabIcon('home') usa 'home' (activa) y 'home-outline' (inactiva).
 */
export function tabIcon(name) {
  return ({ focused, color, size }) => (
    <Ionicons
      name={focused ? name : `${name}-outline`}
      size={size ?? 24}
      color={color}
    />
  );
}

/** Estilo comun de las barras; solo cambia el color activo segun el modo. */
export function tabScreenOptions(activeColor) {
  return {
    tabBarActiveTintColor: activeColor,
    tabBarInactiveTintColor: colors.textMuted,
    tabBarLabelStyle: { fontSize: fontSize.xs, fontWeight: '600' },
    tabBarStyle: {
      backgroundColor: colors.background,
      borderTopColor: colors.border,
    },
    headerStyle: { backgroundColor: colors.background },
    headerTitleStyle: { fontWeight: 'bold', color: colors.text },
  };
}