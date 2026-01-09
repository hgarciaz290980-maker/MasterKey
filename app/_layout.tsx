import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { saveNotification } from '../storage/notificationsStorage';

// Configuramos el comportamiento de las notificaciones
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

        if (finalStatus !== 'granted') return;

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Alertas de Bunker-K',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#007BFF',
            enableVibrate: true,
            showBadge: true,
          });
        }
      } catch (error) {
        console.log("Error en setup:", error);
      }
    }
    
    setupNotifications();

    // ESCUCHADOR: Se activa cuando llega una notificación
    const subscription = Notifications.addNotificationReceivedListener(async (notification) => {
      const { title, body } = notification.request.content;
      // Forzamos a que data se trate como un objeto con nuestras propiedades
      const data = notification.request.content.data as { 
        description?: string; 
        type?: 'pet' | 'general'; 
        url?: string 
      };
      
      // Guardamos en la campanita en el momento exacto que llega la notificación
      await saveNotification({
        id: notification.request.identifier + "_" + Date.now(),
        title: title || 'Recordatorio Bunker-K',
        description: data?.description || body || 'Revisar detalles',
        date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        type: data?.type || 'general',
        isRead: false,
        url: data?.url || undefined
      });
    });

    return () => subscription.remove();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}