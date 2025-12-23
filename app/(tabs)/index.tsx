import React, { useState, useEffect } from 'react'; // Cambiamos useCallback por useEffect
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
import { Stack, useRouter } from 'expo-router'; // Quitamos useFocusEffect
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';

import BackupManager from '../components/BackupManager'; 

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

    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const authenticate = async () => {
        try {
            // Verificamos si el dispositivo tiene hardware biométrico
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();

            if (!hasHardware || !isEnrolled) {
                // Si no hay huella configurada, dejamos pasar (por ahora)
                setIsAuthenticated(true);
                return;
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Acceso a Bunker-K', // Nombre actualizado
                fallbackLabel: 'Usar PIN del sistema',
                disableDeviceFallback: false,
            });

            if (result.success) {
                setIsAuthenticated(true);
            }
        } catch (e) {
            console.error("Error en autenticación", e);
        }
    };

    const handleExitApp = () => {
        BackHandler.exitApp();
    };

    // CAMBIO CLAVE: Usamos useEffect en lugar de useFocusEffect
    // Esto solo se ejecuta cuando la app SE ABRE, no cuando regresas de otra pantalla.
    useEffect(() => {
        if (!isAuthenticated) {
            authenticate();
        }
    }, []); // El arreglo vacío [] asegura que solo corra una vez al montar el componente

    // PANTALLA DE BLOQUEO
    if (!isAuthenticated) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.background }]}>
                <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
                {/* Tu logo ahora es el candado o podrías poner un Image con tu logo aquí */}
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

    // DASHBOARD PRINCIPAL
    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <Stack.Screen 
                options={{ 
                    title: "Bunker-K", // Nombre actualizado
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
                <Text style={[styles.subtitle, { color: theme.subText }]}>¿Qué claves necesitas hoy?</Text>

                {/* Tus tarjetas de categorías se mantienen igual */}
                <TouchableOpacity style={[styles.mainCard, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => router.push('/list?filter=fav')}>
                    <View style={[styles.iconCircle, { backgroundColor: '#FFC107' }]}><Ionicons name="star" size={30} color="#FFF" /></View>
                    <View><Text style={[styles.cardTitle, { color: theme.text }]}>Mis Favoritos</Text></View>
                    <Ionicons name="chevron-forward" size={24} color="#FFC107" style={styles.arrow} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.mainCard, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => router.push('/list?filter=work')}>
                    <View style={[styles.iconCircle, { backgroundColor: '#6f42c1' }]}><Ionicons name="briefcase" size={30} color="#FFF" /></View>
                    <View><Text style={[styles.cardTitle, { color: theme.text }]}>Trabajo</Text></View>
                    <Ionicons name="chevron-forward" size={24} color="#6f42c1" style={styles.arrow} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.mainCard, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => router.push('/list?filter=all')}>
                    <View style={[styles.iconCircle, { backgroundColor: theme.primary }]}><Ionicons name="key" size={30} color="#FFF" /></View>
                    <View><Text style={[styles.cardTitle, { color: theme.text }]}>Todas las Cuentas</Text></View>
                    <Ionicons name="chevron-forward" size={24} color={theme.primary} style={styles.arrow} />
                </TouchableOpacity>

                <View style={{ marginTop: 20, paddingBottom: 100 }}>
                    <Text style={[styles.sectionTitle, { color: theme.subText }]}>Herramientas</Text>
                    { BackupManager ? <BackupManager /> : <Text style={{color: theme.subText}}>Cargando herramientas...</Text> }
                </View>

            </ScrollView>

            <TouchableOpacity 
                activeOpacity={0.8}
                style={[styles.fab, { backgroundColor: theme.primary }]} 
                onPress={() => router.push('/add')}
            >
                <Ionicons name="add" size={40} color="#FFF" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { 
        flex: 1, // CAMBIAR A 1 para que la pantalla ocupe todo el espacio
        backgroundColor: 'transparent', // O el color de tu fondo
    },
    container: { 
        padding: 25, 
        // Aumentamos a 80 para que el cambio sea drástico y confirmes que funciona
        paddingTop: Platform.OS === 'android' ? 80 : 20 
     },
    welcomeText: { fontSize: 32, fontWeight: '800' },
    subtitle: { fontSize: 16, marginBottom: 30 },
    sectionTitle: { fontSize: 13, fontWeight: '700', marginLeft: 10, marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
    mainCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 24, marginBottom: 15, borderWidth: 1, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    iconCircle: { width: 55, height: 55, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    cardTitle: { fontSize: 18, fontWeight: '700' },
    arrow: { position: 'absolute', right: 20 },
    fab: { position: 'absolute', bottom: 30, right: 25, width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 5 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    authTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 20 },
    authButton: { marginTop: 30, paddingVertical: 15, paddingHorizontal: 40, borderRadius: 15, width: '100%', alignItems: 'center' },
    authButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    exitButton: { marginTop: 20, padding: 10 },
    exitButtonText: { fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' }
});