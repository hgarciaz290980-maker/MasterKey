import React, { useState, useEffect } from 'react'; 
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    SafeAreaView, 
    ScrollView, 
    useColorScheme, 
    StatusBar, 
    Platform,
    BackHandler 
} from 'react-native';
import { Stack, useRouter } from 'expo-router'; 
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';

import BackupManager from '../components/BackupManager'; 

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
        primary: '#007BFF'
    };

    const [isAuthenticated, setIsAuthenticated] = useState(isAppUnlocked);

    const authenticate = async () => {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();

            if (!hasHardware || !isEnrolled) {
                isAppUnlocked = true;
                setIsAuthenticated(true);
                return;
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Acceso a Bunker-K', 
                fallbackLabel: 'Usar PIN del sistema',
                disableDeviceFallback: false,
            });

            if (result.success) {
                isAppUnlocked = true;
                setIsAuthenticated(true);
            }
        } catch (e) {
            console.error("Error en autenticación", e);
        }
    };

    const handleExitApp = () => {
        BackHandler.exitApp();
    };

    useEffect(() => {
        if (!isAppUnlocked) {
            authenticate();
        }
    }, []); 

    if (!isAuthenticated) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.background }]}>
                <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
                <Ionicons name="lock-closed" size={100} color={theme.primary} />
                <Text style={[styles.authTitle, { color: theme.text }]}>Bunker-K Bloqueado</Text>
                
                <TouchableOpacity 
                    style={[styles.authButton, { backgroundColor: theme.primary }]} 
                    onPress={authenticate}
                >
                    <Text style={styles.authButtonText}>Desbloquear con Biometría</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.exitButton} 
                    onPress={handleExitApp}
                >
                    <Text style={[styles.exitButtonText, { color: theme.subText }]}>Salir de la app</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <Stack.Screen 
                options={{ 
                    title: "Bunker-K", 
                    headerShown: true,
                    headerStyle: { backgroundColor: theme.background }, 
                    headerTintColor: theme.text,
                    headerShadowVisible: false
                }} 
            />
            
            <ScrollView 
                contentContainerStyle={[styles.container, { paddingTop: Platform.OS === 'android' ? 10 : 0 }]}
                showsVerticalScrollIndicator={false}
            >
                <Text style={[styles.welcomeText, { color: theme.text }]}>Hola, Hugo</Text>
                <Text style={[styles.subtitle, { color: theme.subText }]}>Tus llaves están más seguras en un Bunker.</Text>

                <TouchableOpacity style={[styles.mainCard, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => router.push('/list?filter=fav')}>
                    <View style={[styles.iconCircle, { backgroundColor: '#FFC107' }]}><Ionicons name="star" size={25} color="#FFF" /></View>
                    <View><Text style={[styles.cardTitle, { color: theme.text }]}>Recurrentes</Text></View>
                    <Ionicons name="chevron-forward" size={24} color="#FFC107" style={styles.arrow} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.mainCard, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => router.push('/list?filter=work')}>
                    <View style={[styles.iconCircle, { backgroundColor: '#6f42c1' }]}><Ionicons name="briefcase" size={25} color="#FFF" /></View>
                    <View><Text style={[styles.cardTitle, { color: theme.text }]}>Trabajo</Text></View>
                    <Ionicons name="chevron-forward" size={24} color="#6f42c1" style={styles.arrow} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.mainCard, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => router.push('/list?filter=all')}>
                    <View style={[styles.iconCircle, { backgroundColor: theme.primary }]}><Ionicons name="key" size={25} color="#FFF" /></View>
                    <View><Text style={[styles.cardTitle, { color: theme.text }]}>Todas mis cuentas</Text></View>
                    <Ionicons name="chevron-forward" size={24} color={theme.primary} style={styles.arrow} />
                </TouchableOpacity>

                <View style={{ marginTop: 10, paddingBottom: 100 }}>
                    <Text style={[styles.sectionTitle, { color: theme.subText }]}>Herramientas</Text>
                    { BackupManager ? <BackupManager /> : <Text style={{color: theme.subText}}>Cargando herramientas...</Text> }
                </View>

            </ScrollView>

            <TouchableOpacity 
                activeOpacity={0.8}
                style={[styles.fab, { backgroundColor: '#007BFF' }]} 
                onPress={() => router.push('/add')}
            >
                <Ionicons name="add" size={35} color="#FFF" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: 'transparent' },
    container: { padding: 20, paddingTop: Platform.OS === 'android' ? 80 : 20 },
    welcomeText: { fontSize: 30, fontWeight: '800' },
    subtitle: { fontSize: 16, marginBottom: 30 },
    sectionTitle: { fontSize: 13, fontWeight: '700', marginLeft: 10, marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
    mainCard: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 18, marginBottom: 15, borderWidth: 1, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    cardTitle: { fontSize: 18, fontWeight: '700' },
    arrow: { position: 'absolute', right: 20 },
    fab: { position: 'absolute', bottom: 70, right: 25, width: 55, height: 55, borderRadius: 32.5, justifyContent: 'center', alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 5 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    authTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 20 },
    authButton: { marginTop: 30, paddingVertical: 15, paddingHorizontal: 40, borderRadius: 15, width: '100%', alignItems: 'center' },
    authButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    exitButton: { marginTop: 20, padding: 10 },
    exitButtonText: { fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' }
});