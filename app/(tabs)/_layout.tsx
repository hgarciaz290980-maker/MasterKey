import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

// Bypass de seguridad: Cargamos la librería solo si el módulo nativo existe
let Notifications: any;
try {
  Notifications = require('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    } as any),
  });
} catch (e) {
  console.warn("Módulo de notificaciones no disponible en este entorno");
}

export default function TabLayout() {
  useEffect(() => {
    async function requestPermissions() {
      try {
        if (Platform.OS !== 'web' && Notifications) {
          const { status: existingStatus } = await Notifications.getPermissionsAsync();
          if (existingStatus !== 'granted') {
            await Notifications.requestPermissionsAsync();
          }
        }
      } catch (error) {
        console.log("Notificaciones no inicializadas (Entorno Expo Go)");
      }
    }
    
    requestPermissions();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}