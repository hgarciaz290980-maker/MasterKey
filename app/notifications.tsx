import React, { useState, useCallback } from 'react';
import { 
    View, Text, StyleSheet, FlatList, TouchableOpacity, 
    SafeAreaView, useColorScheme 
} from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getNotifications, deleteNotification } from '../storage/notificationsStorage';

export default function NotificationsScreen() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const theme = {
        background: isDark ? '#121212' : '#F8F9FA',
        text: isDark ? '#F8F9FA' : '#212529',
        card: isDark ? '#1E1E1E' : '#FFFFFF',
        border: isDark ? '#333333' : '#E9ECEF',
        subText: isDark ? '#ADB5BD' : '#6C757D',
        primary: '#007BFF',
    };

    const loadNotifications = async () => {
        const data = await getNotifications();
        // Las mostramos de la más reciente a la más antigua
        setNotifications([...data].reverse());
    };

    useFocusEffect(
        useCallback(() => {
            loadNotifications();
        }, [])
    );

    const handlePressNotification = async (item: any) => {
        // 1. Borramos de la base de datos para que desaparezca al leerla
        await deleteNotification(item.id);
        
        // 2. Redirigimos al detalle si existe la URL
        if (item.url) {
            router.push(item.url as any);
        } else {
            // Si no hay URL, solo refrescamos la lista
            loadNotifications();
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity 
            style={[styles.notificationCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => handlePressNotification(item)}
        >
            <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}>
                <Ionicons 
                    name={item.type === 'pet' ? "paw" : "notifications"} 
                    size={22} 
                    color={theme.primary} 
                />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.notifTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.notifDesc, { color: theme.subText }]}>{item.description}</Text>
                <Text style={[styles.notifDate, { color: theme.primary }]}>{item.date}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.border} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ title: "Centro de Notificaciones" }} />
            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 20 }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="notifications-off-outline" size={60} color={theme.border} />
                        <Text style={[styles.emptyText, { color: theme.subText }]}>No tienes notificaciones pendientes</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    notificationCard: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 16, 
        borderRadius: 16, 
        borderWidth: 1, 
        marginBottom: 12 
    },
    iconContainer: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' },
    notifTitle: { fontSize: 16, fontWeight: 'bold' },
    notifDesc: { fontSize: 14, marginTop: 2 },
    notifDate: { fontSize: 11, marginTop: 5, fontWeight: '700', textTransform: 'uppercase' },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 15, fontSize: 16, textAlign: 'center' }
});