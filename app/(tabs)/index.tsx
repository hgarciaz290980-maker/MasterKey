import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, useColorScheme } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';

// Intentaremos la ruta absoluta que suele ser más segura en Expo
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
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Desbloquea MasterKey',
            });
            if (result.success) setIsAuthenticated(true);
        } catch (e) {
            setIsAuthenticated(true); // Entrar si falla el sensor
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (!isAuthenticated) authenticate();
        }, [isAuthenticated])
    );

    if (!isAuthenticated) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.background }]}>
                <Ionicons name="lock-closed" size={80} color={theme.primary} />
                <TouchableOpacity style={[styles.authButton, { backgroundColor: theme.primary }]} onPress={authenticate}>
                    <Text style={styles.authButtonText}>Desbloquear</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ title: "MasterKey", headerStyle: { backgroundColor: theme.background }, headerTintColor: theme.text }} />
            
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={[styles.welcomeText, { color: theme.text }]}>Hola, Hugo</Text>
                <Text style={[styles.subtitle, { color: theme.subText }]}>¿Qué claves necesitas hoy?</Text>

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
                    <Text style={[styles.sectionTitle, { color: theme.subText }]}>Seguridad</Text>
                    {/* El botón ahora es opcional, si falla el archivo no rompe la app */}
                    { BackupManager ? <BackupManager /> : <Text>Cargando herramientas...</Text> }
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
    container: { padding: 25 },
    welcomeText: { fontSize: 28, fontWeight: '800' },
    subtitle: { fontSize: 16, marginBottom: 20 },
    sectionTitle: { fontSize: 14, fontWeight: '700', marginLeft: 10, marginBottom: 5, textTransform: 'uppercase' },
    mainCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 20, marginBottom: 15, borderWidth: 1 },
    iconCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    cardTitle: { fontSize: 18, fontWeight: '700' },
    arrow: { position: 'absolute', right: 20 },
    fab: { position: 'absolute', bottom: 30, right: 25, width: 65, height: 65, borderRadius: 35, justifyContent: 'center', alignItems: 'center', elevation: 8 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    authButton: { marginTop: 20, padding: 15, borderRadius: 10 },
    authButtonText: { color: '#FFF', fontWeight: 'bold' }
});