import React, { useState } from 'react';
import { 
    View, Text, StyleSheet, FlatList, SafeAreaView, 
    TouchableOpacity, useColorScheme 
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface AppNotification {
    id: string;
    title: string;
    description: string;
    date: string;
    type: 'pet' | 'mobility' | 'work' | 'general';
    isRead: boolean;
}

export default function NotificationsScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const theme = {
        background: isDark ? '#121212' : '#F8F9FA',
        text: isDark ? '#F8F9FA' : '#212529',
        card: isDark ? '#1E1E1E' : '#FFFFFF',
        subText: isDark ? '#ADB5BD' : '#6C757D',
        primary: '#007BFF',
        border: isDark ? '#333333' : '#E9ECEF',
    };

    const [notifications] = useState<AppNotification[]>([
        { id: '1', title: 'Vacuna de Max', description: 'Hoy toca la vacuna contra la rabia.', date: 'Hoy, 10:00 AM', type: 'pet', isRead: false },
        { id: '2', title: 'Seguro del Auto', description: 'Tu póliza vence en 3 días.', date: 'Ayer', type: 'mobility', isRead: false },
        { id: '3', title: 'Backup Completado', description: 'Tu respaldo en Google Drive se realizó con éxito.', date: '5 Ene', type: 'general', isRead: true },
    ]);

    const getIcon = (type: string) => {
        switch(type) {
            case 'pet': return { name: 'paw' as const, color: '#fd7e14' };
            case 'mobility': return { name: 'car-sport' as const, color: '#dc3545' };
            case 'work': return { name: 'briefcase' as const, color: '#6f42c1' };
            default: return { name: 'notifications' as const, color: theme.primary };
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
            <Stack.Screen options={{ 
                title: "Notificaciones",
                headerShown: true,
                headerStyle: { backgroundColor: theme.background },
                headerTintColor: theme.text,
                headerShadowVisible: false,
            }} />

            <FlatList 
                data={notifications}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 20 }}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="notifications-off-outline" size={60} color={theme.border} />
                        <Text style={[styles.emptyText, { color: theme.subText }]}>Sin notificaciones.</Text>
                    </View>
                }
                renderItem={({ item }) => {
                    const icon = getIcon(item.type);
                    return (
                        <View style={[styles.notifCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            <View style={[styles.iconBadge, { backgroundColor: icon.color + '15' }]}>
                                <Ionicons name={icon.name} size={22} color={icon.color} />
                            </View>
                            <View style={styles.textContent}>
                                <View style={styles.row}>
                                    <Text style={[styles.notifTitle, { color: theme.text }]}>{item.title}</Text>
                                    {!item.isRead && <View style={styles.unreadDot} />}
                                </View>
                                <Text style={[styles.notifDesc, { color: theme.subText }]}>{item.description}</Text>
                                <Text style={[styles.notifDate, { color: theme.subText }]}>{item.date}</Text>
                            </View>
                        </View>
                    );
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    emptyState: { alignItems: 'center', marginTop: 100 },
    emptyText: { fontSize: 16, marginTop: 15 },
    notifCard: { flexDirection: 'row', padding: 15, borderRadius: 16, marginBottom: 12, borderWidth: 1, alignItems: 'center' },
    iconBadge: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    textContent: { flex: 1 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    notifTitle: { fontSize: 16, fontWeight: 'bold' },
    notifDesc: { fontSize: 14, marginTop: 2, lineHeight: 18 },
    notifDate: { fontSize: 12, marginTop: 8, opacity: 0.7 },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#007BFF' }
});