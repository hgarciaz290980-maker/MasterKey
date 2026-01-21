import React, { useState, useEffect, useCallback } from 'react'; 
import { 
    View, Text, StyleSheet, TouchableOpacity, SafeAreaView, 
    ScrollView, useColorScheme, Platform, Modal, Alert
} from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router'; 
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications'; 
import * as Linking from 'expo-linking';

// --- NUEVA LIBRERÍA NATIVA ---
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

import BackupManager from '../components/BackupManager'; 
import { getNotifications, saveNotification } from '../../storage/notificationsStorage';

// --- CONFIGURACIÓN DE GOOGLE ---
GoogleSignin.configure({
  webClientId: '619201497268-rvpm6438n7773l4ir71quoctnemc23st.apps.googleusercontent.com',
  offlineAccess: true,
  scopes: ['https://www.googleapis.com/auth/drive.file'], 
});

let isAppUnlocked = false;

export default function DashboardScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    
    const theme = {
        background: isDark ? '#090912ff' : '#F8F9FA',
        text: isDark ? '#F8F9FA' : '#212529',
        card: isDark ? '#1b1e2cff' : '#FFFFFF',
        subText: isDark ? '#ADB5BD' : '#6C757D',
        border: isDark ? '#333333' : '#E9ECEF',
        primary: '#007BFF',
        danger: '#DC3545'
    };

    const [isAuthenticated, setIsAuthenticated] = useState(isAppUnlocked);
    const [userName, setUserName] = useState('Usuario');
    const [showTypeSelector, setShowTypeSelector] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isGoogleLinked, setIsGoogleLinked] = useState(false);

    const categories = [
        { id: 'fav', label: 'Recurrentes', icon: 'star', color: '#FFC107' },
        { id: 'personal', label: 'Personal', icon: 'person', color: '#20c997' },
        { id: 'work', label: 'Trabajo', icon: 'briefcase', color: '#6f42c1' },
        { id: 'pet', label: 'Mascota', icon: 'paw', color: '#fd7e14' },
        { id: 'mobility', label: 'Movilidad', icon: 'car-sport', color: '#dc3545' },
        { id: 'entertainment', label: 'Entretenimiento', icon: 'play-circle', color: '#e83e8c' },
    ];

    useEffect(() => {
        async function configureNotifications() {
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('bunkerk-alerts', {
                    name: 'Alertas Bunker-K',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#007BFF',
                });
            }
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            if (existingStatus !== 'granted') {
                await Notifications.requestPermissionsAsync();
            }
        }
        configureNotifications();
        checkGoogleUser();
    }, []);

    const checkGoogleUser = async () => {
        const isSignedIn = GoogleSignin.hasPreviousSignIn();
        setIsGoogleLinked(isSignedIn);
    };

    const handleGoogleSignIn = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            // En la versión nativa, los tokens se manejan internamente, 
            // pero podemos guardar que ya está logueado.
            setIsGoogleLinked(true);
            Alert.alert("Éxito", "Bunker-K está vinculado con Google Drive nativamente.");
        } catch (error: any) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                console.log("Usuario canceló");
            } else {
                Alert.alert("Error de Google", error.message);
                console.log("Detalle error:", error);
            }
        }
    };

    const updateNotificationCount = async () => {
        try {
            const allNotifications = await getNotifications();
            const unread = allNotifications.filter((n: any) => !n.isRead).length;
            setUnreadCount(unread);
        } catch (e) { console.log("Error contador"); }
    };

    useFocusEffect(
        useCallback(() => {
            if (isAuthenticated) updateNotificationCount();
        }, [isAuthenticated])
    );

    useEffect(() => {
        const checkSetup = async () => {
            const hasLaunched = await AsyncStorage.getItem('has_launched');
            const storedName = await AsyncStorage.getItem('user_name');
            if (!hasLaunched) { router.replace('/onboarding' as any); }
            else if (storedName) { setUserName(storedName); }
        };
        checkSetup();
    }, []);

    const authenticate = async () => {
        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Acceso a Bunker-K', 
            fallbackLabel: 'Usar PIN del sistema',
        });
        if (result.success) { isAppUnlocked = true; setIsAuthenticated(true); }
    };

    useEffect(() => { if (!isAppUnlocked) authenticate(); }, []); 

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
            <Stack.Screen options={{ headerShown: false }} />
            
            <ScrollView contentContainerStyle={styles.container} bounces={false} showsVerticalScrollIndicator={false}>
                
                <View style={styles.brandContainer}>
                    <Text style={[styles.brandText, { color: '#F8F9FA' }]}>Bunker-K</Text>
                </View>

                <View style={styles.headerRow}>
                    <Text style={[styles.welcomeText, { color: theme.text }]}>Hola, {userName}</Text>
                    <TouchableOpacity style={styles.notificationBtn} onPress={() => router.push('/notifications' as any)}>
                        <Ionicons name="notifications-outline" size={26} color={theme.text} />
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
                        <Ionicons name={cat.icon as any} size={22} color={cat.color} />
                        <Text style={[styles.cardTitle, { color: theme.text }]}> {cat.label}</Text>
                    </TouchableOpacity>
                ))}

                <TouchableOpacity style={[styles.mainCard, { backgroundColor: theme.card, marginBottom: 15 }]} onPress={() => router.push('/list?filter=all' as any)}>
                    <Ionicons name="key" size={22} color={theme.primary} />
                    <Text style={[styles.cardTitle, { color: theme.text }]}> Todas mis cuentas</Text>
                </TouchableOpacity>

                <View style={{ marginTop: 5 }}>
                    <Text style={[styles.sectionTitle, { color: theme.subText }]}>Herramientas</Text>
                    <View style={styles.toolsRow}>
                        { BackupManager && <BackupManager /> }
                    </View>

                    <TouchableOpacity 
                        style={[
                            styles.googleCard, 
                            { borderColor: isGoogleLinked ? '#28A745' : theme.primary, marginTop: 10 }
                        ]} 
                        onPress={handleGoogleSignIn}
                    >
                        <Ionicons 
                            name={isGoogleLinked ? "cloud-done" : "cloud-upload"} 
                            size={18} 
                            color={isGoogleLinked ? '#28A745' : theme.primary} 
                        />
                        <Text style={[styles.googleText, { color: theme.text, fontSize: 14 }]}> 
                            {isGoogleLinked ? " Drive Vinculado" : " Vincular Google Drive"}
                        </Text>
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
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowTypeSelector(false)}>
                    <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>¿Qué deseas agregar?</Text>
                        <View style={styles.gridContainer}>
                            {categories.map((cat) => (
                                <TouchableOpacity key={cat.id} style={styles.gridItem} onPress={() => { setShowTypeSelector(false); router.push(`/add?type=${cat.id}` as any); }}>
                                    <View style={[styles.iconCircle, { backgroundColor: cat.color + '20' }]}>
                                        <Ionicons name={cat.icon as any} size={28} color={cat.color} />
                                    </View>
                                    <Text style={[styles.gridLabel, { color: theme.text }]}>{cat.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity style={styles.cancelButton} onPress={() => setShowTypeSelector(false)}>
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
    container: { paddingHorizontal: 20, paddingBottom: 10, paddingTop: 55 },
    brandContainer: { marginBottom: 2 },
    brandText: { fontSize: 32, fontWeight: '900', letterSpacing: -1.5 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    welcomeText: { fontSize: 22, fontWeight: '600', opacity: 0.9 },
    notificationBtn: { position: 'relative', padding: 5 },
    badge: { position: 'absolute', right: 0, top: 0, minWidth: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#FFF' },
    badgeText: { color: '#FFF', fontSize: 8, fontWeight: 'bold' },
    mainCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 10, elevation: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
    cardTitle: { fontSize: 16, fontWeight: '600', marginLeft: 10 },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
    toolsRow: { marginBottom: 5 },
    googleCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 12, borderStyle: 'dashed', borderWidth: 1 },
    googleText: { fontWeight: '600', marginLeft: 10 },
    fab: { position: 'absolute', bottom: 250, right: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 4 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    authButton: { marginTop: 20, padding: 15, borderRadius: 10 },
    authButtonText: { color: '#FFF', fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, borderWidth: 1, minHeight: 400 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    gridItem: { width: '30%', alignItems: 'center', marginBottom: 20 },
    iconCircle: { width: 55, height: 55, borderRadius: 27.5, justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
    gridLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
    cancelButton: { marginTop: 5, padding: 10, alignItems: 'center' }
});