import * as AuthSession from 'expo-auth-session';
import React, { useState, useEffect } from 'react'; 
import { 
    View, Text, StyleSheet, TouchableOpacity, SafeAreaView, 
    ScrollView, useColorScheme, Platform
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
        primary: '#007BFF'
    };

    const [isAuthenticated, setIsAuthenticated] = useState(isAppUnlocked);
    const [userName, setUserName] = useState('Usuario');

   // --- CONFIGURACIÓN PARA BUILD DE DESARROLLO ---
   const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: "619201497268-vcop7li7m3jdvib2je642d54tmpktkad.apps.googleusercontent.com",
        iosClientId: "619201497268-tk48sp2maotrqmsef0iidt8n822k0gqm.apps.googleusercontent.com",
        webClientId: "619201497268-64s3e67clg56f49t0q4hhr8bu3aeithu.apps.googleusercontent.com",
        scopes: ['https://www.googleapis.com/auth/drive.file'],
    }, {
        // Esta línea es la que resuelve el mismatch en builds nativas
        native: "com.mkpro01.masterkey://google-auth"


    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            console.log("✅ Acceso concedido. Token:", authentication?.accessToken);
        }
    }, [response]);

    // --- LÓGICA DE INICIO Y SEGURIDAD ---
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
            <Stack.Screen options={{ title: "Bunker-K", headerShown: true, headerShadowVisible: false }} />
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={[styles.welcomeText, { color: theme.text }]}>Hola, {userName}</Text>
                
                <TouchableOpacity style={[styles.mainCard, { backgroundColor: theme.card }]} onPress={() => router.push('/list?filter=fav')}>
                    <Ionicons name="star" size={25} color="#FFC107" />
                    <Text style={[styles.cardTitle, { color: theme.text }]}> Recurrentes</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.mainCard, { backgroundColor: theme.card }]} onPress={() => router.push('/list?filter=work')}>
                    <Ionicons name="briefcase" size={25} color="#6f42c1" />
                    <Text style={[styles.cardTitle, { color: theme.text }]}> Trabajo</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.mainCard, { backgroundColor: theme.card }]} onPress={() => router.push('/list?filter=all')}>
                    <Ionicons name="key" size={25} color={theme.primary} />
                    <Text style={[styles.cardTitle, { color: theme.text }]}> Todas mis cuentas</Text>
                </TouchableOpacity>

                <View style={{ marginTop: 20 }}>
                    <Text style={[styles.sectionTitle, { color: theme.subText }]}>Herramientas</Text>
                    { BackupManager && <BackupManager /> }
                    
                    <TouchableOpacity 
                        style={[styles.mainCard, { borderStyle: 'dashed', borderWidth: 1, borderColor: theme.primary, marginTop: 10 }]} 
                        onPress={() => promptAsync()}
                        disabled={!request}
                    >
                        <Ionicons name="cloud-upload" size={20} color={theme.primary} />
                        <Text style={[styles.cardTitle, { color: theme.text }]}> Vincular Google Drive</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <TouchableOpacity style={[styles.fab, { backgroundColor: theme.primary }]} onPress={() => router.push('/add')}>
                <Ionicons name="add" size={35} color="#FFF" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    container: { padding: 20 },
    welcomeText: { fontSize: 28, fontWeight: '800', marginBottom: 20 },
    mainCard: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 15, marginBottom: 15, elevation: 2 },
    cardTitle: { fontSize: 18, fontWeight: '600', marginLeft: 10 },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
    fab: { position: 'absolute', bottom: 30, right: 25, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    authButton: { marginTop: 20, padding: 15, borderRadius: 10 },
    authButtonText: { color: '#FFF', fontWeight: 'bold' }
});