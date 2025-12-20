import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';

export default function DashboardScreen() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const authenticate = async () => {
        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Desbloquea MasterKey',
        });
        if (result.success) setIsAuthenticated(true);
    };

    useFocusEffect(
        useCallback(() => {
            if (!isAuthenticated) authenticate();
        }, [isAuthenticated])
    );

    if (!isAuthenticated) {
        return (
            <View style={styles.centered}>
                <Ionicons name="lock-closed" size={80} color="#007BFF" />
                <TouchableOpacity style={styles.authButton} onPress={authenticate}>
                    <Text style={styles.authButtonText}>Desbloquear</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ title: "MasterKey" }} />
            
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.welcomeText}>Hola, Hugo</Text>
                <Text style={styles.subtitle}>¿Qué claves necesitas hoy?</Text>

                {/* TARJETA 1: FAVORITOS */}
                <TouchableOpacity 
                    style={[styles.mainCard, { backgroundColor: '#FFF9E6', borderColor: '#FFC107' }]}
                    onPress={() => router.push('/list?filter=fav')}
                >
                    <View style={[styles.iconCircle, { backgroundColor: '#FFC107' }]}>
                        <Ionicons name="star" size={30} color="#FFF" />
                    </View>
                    <View>
                        <Text style={styles.cardTitle}>Mis Favoritos</Text>
                        <Text style={styles.cardDesc}>Cuentas destacadas</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#FFC107" style={styles.arrow} />
                </TouchableOpacity>

                {/* TARJETA 2: TRABAJO */}
                <TouchableOpacity 
                    style={[styles.mainCard, { backgroundColor: '#F3EFFF', borderColor: '#6f42c1' }]}
                    onPress={() => router.push('/list?filter=work')}
                >
                    <View style={[styles.iconCircle, { backgroundColor: '#6f42c1' }]}>
                        <Ionicons name="briefcase" size={30} color="#FFF" />
                    </View>
                    <View>
                        <Text style={styles.cardTitle}>Trabajo</Text>
                        <Text style={styles.cardDesc}>Herramientas laborales</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#6f42c1" style={styles.arrow} />
                </TouchableOpacity>

                {/* TARJETA 3: TODAS */}
                <TouchableOpacity 
                    style={[styles.mainCard, { backgroundColor: '#E6F0FF', borderColor: '#007BFF' }]}
                    onPress={() => router.push('/list?filter=all')}
                >
                    <View style={[styles.iconCircle, { backgroundColor: '#007BFF' }]}>
                        <Ionicons name="key" size={30} color="#FFF" />
                    </View>
                    <View>
                        <Text style={styles.cardTitle}>Todas las Cuentas</Text>
                        <Text style={styles.cardDesc}>Ver listado completo</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#007BFF" style={styles.arrow} />
                </TouchableOpacity>

            </ScrollView>

            {/* BOTÓN FLOTANTE (+) SIEMPRE PRESENTE */}
            <TouchableOpacity style={styles.fab} onPress={() => router.push('/add')}>
                <Ionicons name="add" size={35} color="#FFF" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
    container: { padding: 25 },
    welcomeText: { fontSize: 28, fontWeight: '800', color: '#212529', marginTop: 10 },
    subtitle: { fontSize: 16, color: '#6C757D', marginBottom: 30 },
    mainCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
        marginBottom: 20,
        borderWidth: 1,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    iconCircle: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginRight: 20 },
    cardTitle: { fontSize: 20, fontWeight: '700', color: '#212529' },
    cardDesc: { fontSize: 14, color: '#6C757D' },
    arrow: { position: 'absolute', right: 20 },
    fab: { position: 'absolute', bottom: 30, right: 30, width: 70, height: 70, borderRadius: 35, backgroundColor: '#007BFF', justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#007BFF', shadowOpacity: 0.4, shadowRadius: 10 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    authButton: { marginTop: 20, backgroundColor: '#007BFF', padding: 15, borderRadius: 10 },
    authButtonText: { color: '#FFF', fontWeight: 'bold' }
});