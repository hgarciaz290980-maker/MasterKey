// app/(tabs)/_layout.tsx (CÓDIGO FINAL ESTABLE PARA 3 PESTAÑAS)

import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { ComponentProps } from 'react'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 

const COLORS = {
  primary: '#007BFF', // Azul
  tabIconDefault: '#ADB5BD', // Gris para íconos inactivos
};

type IconProps = ComponentProps<typeof Ionicons>;

const TabIcon = ({ name, color, focused }: { name: IconProps['name'], color: string, focused: boolean }) => {
  return <Ionicons name={name} size={focused ? 28 : 24} color={color} />;
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets(); 

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary, 
        tabBarInactiveTintColor: COLORS.tabIconDefault,
        tabBarLabelStyle: { fontSize: 11, marginBottom: 2 }, 
        tabBarStyle: {
          backgroundColor: '#FFFFFF', 
          height: 60 + insets.bottom, 
          paddingBottom: insets.bottom + 5, 
          paddingTop: 5, 
        },
        headerShown: false,
      }}>

      {/* 1. PESTAÑA DE FAVORITOS (Estrella) */}
      <Tabs.Screen
        name="favorites" 
        options={{
          title: 'Favs', 
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'star' : 'star-outline'} color={color} focused={focused} />
          ),
        }}
      />
      
      {/* 2. PESTAÑA DE INICIO (Casita) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} color={color} focused={focused} />
          ),
        }}
      />

      {/* 3. PESTAÑA DE TRABAJO (Portafolio) */}
      <Tabs.Screen
        name="work"
        options={{
          title: 'Trabajo',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'briefcase' : 'briefcase-outline'} color={color} focused={focused} />
          ),
        }}
      />

      {/* Ocultamos las pantallas de navegación interna */}
       <Tabs.Screen
        name="category"
        options={{ href: null }}
      />
       <Tabs.Screen
        name="detail"
        options={{ href: null }}
      />
      
    </Tabs>
  );
}