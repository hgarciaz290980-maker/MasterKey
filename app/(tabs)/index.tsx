import * as AuthSession from 'expo-auth-session';
import React, { useState, useEffect } from 'react'; 
import { 
    View, Text, StyleSheet, TouchableOpacity, SafeAreaView, 
    ScrollView, useColorScheme, Platform, Modal
} from 'react-native';
import { Stack, useRouter } from 'expo-router'; 
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser'; 
import * as Google from 'expo-auth-session/providers/google';

import BackupManager from '../components/BackupManager'; 

WebBrowser.maybeCompleteAuthSession(); 

let isAppUnlocked = false;

export default function DashboardScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    
    const theme = {
        background: isDark ? '#121212' : '#F8F9FA',
        text: isDark ? '#F8F9FA' : '#212529',
        card: isDark ? '#1E1E1E' : '#FFFFFF',
        subText: isDark ? '#ADB5BD' : '#6C757D',
        border: isDark ? '#333333' : '#E9ECEF',
        primary: '#007BFF',
        danger: '#DC3545'
    };

    const [isAuthenticated, setIsAuthenticated] = useState(isAppUnlocked);
    const [userName, setUserName] = useState('Usuario');
    const [showTypeSelector, setShowTypeSelector] = useState(false);
    
    const [unreadCount, setUnreadCount] = useState(3);

    const categories = [
        { id: 'fav', label: 'Recurrentes', icon: 'star', color: '#FFC107' },
        { id: 'personal', label: 'Personal', icon: 'person', color: '#20c997' },
        { id: 'work', label: 'Trabajo', icon: 'briefcase', color: '#6f42c1' },
        { id: 'pet', label: 'Mascota', icon: 'paw', color: '#fd7e14' },
        { id: 'mobility', label: 'Movilidad', icon: 'car-sport', color: '#dc3545' },
        { id: 'entertainment', label: 'Entretenimiento', icon: 'play-circle', color: '#e83e8c' },
    ];

   const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: "619201497268-vcop7li7m3jdvib2je642d54tmpktkad.apps.googleusercontent.com",
        iosClientId: "619201497268-tk48sp2maotrqmsef0iidt8n822k0gqm.apps.googleusercontent.com",
        webClientId: "619201497268-64s3e67clg56f49t0q4hhr8bu3aeithu.apps.googleusercontent.com",
        scopes: ['https://www.googleapis.com/auth/drive.file'],
    }, {
        native: "com.mkpro01.masterkey://google-auth"
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            console.log("✅ Acceso concedido. Token:", authentication?.accessToken);
        }
    }, [response]);

    useEffect(() => {
        const checkSetup = async () => {
            try {
                const hasLaunched = await AsyncStorage.getItem('has_launched');
                const storedName = await AsyncStorage.getItem('user_name');
                if (!hasLaunched) {
                    router.replace('/onboarding' as any);
                } else if (storedName) {
                    setUserName(storedName);
                }
            } catch (e) {
                console.error("Error cargando configuración", e);
            }
        };
        checkSetup();
    }, []);

    const authenticate = async () => {
        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Acceso a Bunker-K', 
                fallbackLabel: 'Usar PIN del sistema',
            });
            if (result.success) {
                isAppUnlocked = true;
                setIsAuthenticated(true);
            }
        } catch (e) {
            console.error("Error en autenticación", e);
        }
    };

    useEffect(() => {
        if (!isAppUnlocked) authenticate();
    }, []); 

    const handleSelectCategory = (type: string) => {
        setShowTypeSelector(false);
        router.push(`/add?type=${type}` as any);
    };

    if (!isAuthenticated) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.background }]}>
                <Ionicons name="lock-closed" size={100} color={theme.primary} />
                <TouchableOpacity style={[styles.authButton, { backgroundColor: theme.primary }]} onPress={authenticate}>
                    <Text style={styles.authButtonText}>Desbloquear Bunker-K</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <Stack.Screen 
                options={{ 
                    title: "Bunker-K", 
                    headerShown: true, 
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: theme.background },
                    headerTitleStyle: { color: theme.text, fontWeight: 'bold' },
                    headerTintColor: theme.text, 
                }} 
            />
            <ScrollView contentContainerStyle={styles.container}>
                
                <View style={styles.headerRow}>
                    <Text style={[styles.welcomeText, { color: theme.text }]}>Hola, {userName}</Text>
                    
                    <TouchableOpacity 
                        style={styles.notificationBtn}
                        onPress={() => router.push('/notifications' as any)}
                    >
                        <Ionicons name="notifications-outline" size={28} color={theme.text} />
                        {unreadCount > 0 && (
                            <View style={[styles.badge, { backgroundColor: theme.danger }]}>
                                <Text style={styles.badgeText}>{unreadCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
                
                {categories.map((cat) => (
                    <TouchableOpacity 
                        key={cat.id}
                        style={[styles.mainCard, { backgroundColor: theme.card }]} 
                        onPress={() => router.push(`/list?filter=${cat.id}` as any)}
                    >
                        <Ionicons name={cat.icon as any} size={25} color={cat.color} />
                        <Text style={[styles.cardTitle, { color: theme.text }]}> {cat.label}</Text>
                    </TouchableOpacity>
                ))}

                <TouchableOpacity style={[styles.mainCard, { backgroundColor: theme.card, marginBottom: 30 }]} onPress={() => router.push('/list?filter=all' as any)}>
                    <Ionicons name="key" size={25} color={theme.primary} />
                    <Text style={[styles.cardTitle, { color: theme.text }]}> Todas mis cuentas</Text>
                </TouchableOpacity>

                <View style={{ marginTop: -15 }}>
                    <Text style={[styles.sectionTitle, { color: theme.subText }]}>Herramientas</Text>
                    <View style={styles.toolsRow}>
                        { BackupManager && <BackupManager /> }
                    </View>
                    <TouchableOpacity 
                        style={[styles.googleCard, { borderColor: theme.primary }]} 
                        onPress={() => promptAsync()}
                        disabled={!request}
                    >
                        <Ionicons name="cloud-upload" size={20} color={theme.primary} />
                        <Text style={[styles.googleText, { color: theme.text }]}> Vincular Google Drive</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <TouchableOpacity 
                style={[styles.fab, { backgroundColor: theme.primary }]} 
                onPress={() => setShowTypeSelector(true)}
            >
                <Ionicons name="add" size={35} color="#FFF" />
            </TouchableOpacity>

            <Modal visible={showTypeSelector} transparent animationType="slide">
                <TouchableOpacity 
                    style={styles.modalOverlay} 
                    activeOpacity={1} 
                    onPress={() => setShowTypeSelector(false)}
                >
                    <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>¿Qué deseas agregar?</Text>
                        <View style={styles.gridContainer}>
                            {categories.map((cat) => (
                                <TouchableOpacity 
                                    key={cat.id} 
                                    style={styles.gridItem}
                                    onPress={() => handleSelectCategory(cat.id)}
                                >
                                    <View style={[styles.iconCircle, { backgroundColor: cat.color + '20' }]}>
                                        <Ionicons name={cat.icon as any} size={28} color={cat.color} />
                                    </View>
                                    <Text style={[styles.gridLabel, { color: theme.text }]}>{cat.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity 
                            style={styles.cancelButton} 
                            onPress={() => setShowTypeSelector(false)}
                        >
                            <Text style={{ color: '#DC3545', fontWeight: 'bold' }}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    container: { padding: 20 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    welcomeText: { fontSize: 28, fontWeight: '800' },
    notificationBtn: { position: 'relative', padding: 5 },
    badge: { 
        position: 'absolute', 
        right: 0, 
        top: 0, 
        minWidth: 18, 
        height: 18, 
        borderRadius: 9, 
        justifyContent: 'center', 
        alignItems: 'center', 
        borderWidth: 2, 
        borderColor: '#FFF' 
    },
    badgeText: { color: '#FFF', fontSize: 9, fontWeight: 'bold' },
    mainCard: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 15, 
        borderRadius: 15, 
        marginBottom: 15, 
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3
    },
    cardTitle: { fontSize: 18, fontWeight: '600', marginLeft: 10 },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 15 },
    toolsRow: { marginBottom: 10 },
    googleCard: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: 15, 
        borderRadius: 15, 
        borderStyle: 'dashed', 
        borderWidth: 1, 
        marginTop: 5 
    },
    googleText: { fontSize: 16, fontWeight: '600', marginLeft: 10 },
    fab: { 
        position: 'absolute', 
        bottom: 20, 
        right: 25, 
        width: 60, 
        height: 60, 
        borderRadius: 30, 
        justifyContent: 'center', 
        alignItems: 'center', 
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    authButton: { marginTop: 20, padding: 15, borderRadius: 10 },
    authButtonText: { color: '#FFF', fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, borderWidth: 1, minHeight: 420 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 25, textAlign: 'center' },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    gridItem: { width: '30%', alignItems: 'center', marginBottom: 25 },
    iconCircle: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    gridLabel: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
    cancelButton: { marginTop: 10, padding: 15, alignItems: 'center' }
});