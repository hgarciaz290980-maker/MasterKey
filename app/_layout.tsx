// app/_layout.tsx - VERSIÓN SIMPLIFICADA

import React from 'react';
import { Slot } from 'expo-router'; // Usamos Slot para renderizar la ruta actual
import AuthGuard from './components/AuthGuard';

// Este archivo es el punto de entrada de la aplicación
export default function RootLayout() {
  return (
    // 1. Envolvemos toda la app con la seguridad
    <AuthGuard>
      {/* 2. Usamos Slot para renderizar la pantalla actual (que será el menú de inicio) */}
      <Slot />
    </AuthGuard>
  );
}