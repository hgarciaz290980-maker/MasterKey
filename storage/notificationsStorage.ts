import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_KEY = '@bunkerk_notifications_v1';

export interface NotificationItem {
    id: string;
    title: string;
    description: string;
    date: string;
    type: 'pet' | 'general';
    isRead: boolean;
    url?: string;
}

export const saveNotification = async (notification: NotificationItem) => {
    try {
        const existing = await getNotifications();
        const updated = [...existing, notification];
        await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    } catch (e) {
        console.error("Error saving notification", e);
    }
};

export const getNotifications = async (): Promise<NotificationItem[]> => {
    try {
        const data = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
};

// Esta es la función que borra la notificación de la lista cuando la tocas
export const deleteNotification = async (id: string) => {
    try {
        const existing = await getNotifications();
        const updated = existing.filter(n => n.id !== id);
        await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    } catch (e) {
        console.error("Error deleting notification", e);
    }
};