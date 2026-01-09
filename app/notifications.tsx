import React, { useState, useCallback } from 'react';
import { 
    View, Text, StyleSheet, FlatList, TouchableOpacity, 
    SafeAreaView, useColorScheme 
} from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Importamos el almacén que acabas de crear
import { getNotifications, markAllAsRead, AppNotification } from '../storage/notificationsStorage';

export default function NotificationsScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const theme = {
        background: isDark ? '#121212' : '#F8F9FA',
        text: isDark ? '#F8F9FA' : '#212529',
        subText: isDark ? '#ADB5BD' : '#6C757D',
        card: isDark ? '#1E1E1E' : '#FFFFFF',
        border: isDark ? '#333333' : '#E9ECEF',
        primary: '#007BFF',
    };

    const [notifications, setNotifications] = useState<AppNotification[]>([]);

    // Función para cargar las notificaciones del almacén
    const loadNotifications = async () => {
        const data = await getNotifications();
        setNotifications(data);
        // Al entrar a la pantalla, marcamos todas como leídas para limpiar el punto rojo
        await markAllAsRead();
    };

    // Esto hace que cada vez que entres a la pantalla, se actualice la lista
    useFocusEffect(
        useCallback(() => {
            loadNotifications();
        }, [])
    );

    const renderItem = ({ item }: { item: AppNotification }) => (
        <TouchableOpacity 
            style={[styles.notificationCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => {
                if (item.url) {
                    // Aquí es donde ocurre la magia: nos lleva directo a la tarjeta
                    router.push(item.url as any);
                }
            }}
        >
            <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                <Ionicons 
                    name={item.type === 'pet' ? 'paw' : 'notifications'} 
                    size={24} 
                    color={theme.primary} 
                />
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.description, { color: theme.subText }]}>{item.description}</Text>
                <Text style={styles.date}>{item.date}</Text>
            </View>
            {item.url && (
                <Ionicons name="chevron-forward" size={20} color={theme.border} />
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ 
                title: "Notificaciones",
                headerShown: true,
                headerStyle: { backgroundColor: theme.background },
                headerTintColor: theme.text,
            }} />
            
            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="notifications-off-outline" size={80} color={theme.border} />
                        <Text style={[styles.emptyText, { color: theme.subText }]}>
                            No tienes notificaciones pendientes.
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    listContent: { padding: 15 },
    notificationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 15,
        marginBottom: 10,
        borderWidth: 1,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    textContainer: { flex: 1 },
    title: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
    description: { fontSize: 14, marginBottom: 5 },
    date: { fontSize: 11, color: '#999' },
    emptyState: { alignItems: 'center', marginTop: 100 },
    emptyText: { fontSize: 16, marginTop: 10 },
});