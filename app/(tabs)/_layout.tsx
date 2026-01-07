import { Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';

// Configuración protegida
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    } as Notifications.NotificationBehavior),
  });
} catch (e) {
  console.warn("Módulo de notificaciones no disponible aún");
}

export default function RootLayout() {
  useEffect(() => {
    async function requestPermissions() {
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        if (existingStatus !== 'granted') {
          await Notifications.requestPermissionsAsync();
        }
        
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          });
        }
      } catch (error) {
        console.log("Notificaciones nativas no listas");
      }
    }
    requestPermissions();
  }, []);

  return (
    <Stack screenOptions={{ 
      headerShown: true,
      headerStyle: { backgroundColor: '#F8F9FA' },
      headerShadowVisible: false,
    }}>
        {/* Aseguramos que las rutas internas se manejen correctamente */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}