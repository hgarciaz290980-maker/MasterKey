import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Configuración para que el Pop-up aparezca
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  } as any),
});

export default function TabLayout() {
  const router = useRouter();

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

        if (finalStatus !== 'granted') return;

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Bunker-K Alerts',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#007BFF',
          });
        }
      } catch (error) {
        console.log("Error configurando notificaciones:", error);
      }
    }
    
    setupNotifications();

    // ESCUCHADOR DE CLIC CORREGIDO
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      // Usamos "as any" para que no se queje de las rutas
      const data = response.notification.request.content.data as any;
      
      if (data && data.url) {
        router.push(data.url);
      } else {
        router.push('/notifications' as any);
      }
    });

    return () => {
      // Corregido: La forma correcta de quitar el oído en esta versión
      responseListener.remove();
    };
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}