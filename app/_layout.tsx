import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Configuramos cómo se porta la notificación cuando la app está abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.MAX,
  } as any),
});

export default function TabLayout() {
  useEffect(() => {
    async function setupNotifications() {
      if (Platform.OS === 'web') return;

      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          console.log("Permisos denegados por el usuario");
          return;
        }

        if (Platform.OS === 'android') {
          // Este canal es el que vincula el permiso del sistema con el Popup
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Alertas de Bunker-K',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#007BFF',
            enableVibrate: true,
            showBadge: true,
          });
        }
        console.log("✅ Canal 'default' configurado correctamente");
      } catch (error) {
        console.log("Error configurando notificaciones:", error);
      }
    }
    
    setupNotifications();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}