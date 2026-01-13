import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, AppState, AppStateStatus, View, ActivityIndicator, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as LocalAuthentication from 'expo-local-authentication';
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
  const [isLocked, setIsLocked] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // --- LÓGICA DE SEGURIDAD GLOBAL ---
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      // Si la app se va a segundo plano o multitarea, la bloqueamos
      if (nextAppState === 'inactive' || nextAppState === 'background') {
        setIsLocked(true);
      }

      // Si regresa a primer plano y estaba bloqueada
      if (nextAppState === 'active' && isLocked && !isAuthenticating) {
        authenticateUser();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [isLocked, isAuthenticating]);

  const authenticateUser = async () => {
    setIsAuthenticating(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Bunker-K: Confirmar Identidad',
        fallbackLabel: 'Usar código de seguridad',
      });

      if (result.success) {
        setIsLocked(false);
      } else {
        // Si falla o cancela, mantenemos bloqueado para forzar re-intento manual
        setIsLocked(true);
      }
    } catch (error) {
      console.error("Error de autenticación:", error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // --- LÓGICA DE NOTIFICACIONES ---
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

    const notificationSubscription = Notifications.addNotificationReceivedListener(async (notification) => {
      const { title, body } = notification.request.content;
      const data = notification.request.content.data as { 
        description?: string; 
        type?: 'pet' | 'general'; 
        url?: string 
      };
      
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

    return () => notificationSubscription.remove();
  }, []);

  // --- VISTA DE BLOQUEO ---
  // Si la app está bloqueada, mostramos una pantalla de carga/seguridad
  if (isLocked) {
    return (
      <View style={styles.lockContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <View style={{ marginTop: 20 }}>
          <View style={styles.retryBtn}>
            <ActivityIndicator size="small" color="#007BFF" />
          </View>
        </View>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  lockContainer: {
    flex: 1,
    backgroundColor: '#121212', // O el color de fondo de tu tema
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryBtn: {
    padding: 15,
    borderRadius: 10,
  }
});