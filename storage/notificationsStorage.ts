import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_KEY = '@user_notifications';

export interface AppNotification {
    id: string;
    title: string;
    description: string;
    date: string;
    type: 'pet' | 'mobility' | 'work' | 'general';
    isRead: boolean;
    url?: string; // Aquí guardaremos la ruta exacta "a la cocina"
}

// Función para guardar una nueva notificación en el historial
export const saveNotification = async (notification: AppNotification) => {
    try {
        const existing = await getNotifications();
        const updated = [notification, ...existing];
        await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    } catch (e) {
        console.error("Error al guardar notificación:", e);
    }
};

// Función para obtener todas las notificaciones
export const getNotifications = async (): Promise<AppNotification[]> => {
    try {
        const data = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
};

// Función para limpiar el contador (marcar todas como leídas)
export const markAllAsRead = async () => {
    try {
        const notifications = await getNotifications();
        const updated = notifications.map(n => ({ ...n, isRead: true }));
        await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    } catch (e) {
        console.error("Error al marcar como leídas");
    }
};