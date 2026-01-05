// storage/notifications.ts
let Notifications: any;

try {
    Notifications = require('expo-notifications');
    
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        }),
    });
} catch (e) {
    console.warn("Módulo de notificaciones no disponible en este entorno.");
}

export async function scheduleReminder(title: string, body: string, date: Date) {
    if (!Notifications) {
        console.error("No se pueden programar notificaciones: Módulo no cargado.");
        return;
    }

    try {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
            const { status: newStatus } = await Notifications.requestPermissionsAsync();
            if (newStatus !== 'granted') return;
        }

        await Notifications.scheduleNotificationAsync({
            content: { title, body },
            trigger: { date: date },
        });
    } catch (error) {
        console.error("Error al programar notificación:", error);
    }
}