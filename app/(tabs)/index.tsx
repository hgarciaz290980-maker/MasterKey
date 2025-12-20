// app/(tabs)/index.tsx (Versión ESTABLE y FINAL con CredentialCard)

import React, { useState, useCallback, useMemo } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    SafeAreaView, 
    FlatList, 
    ActivityIndicator, 
    Alert, 
    TextInput,
    Platform
} from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar'; 
import * as LocalAuthentication from 'expo-local-authentication';

// Importaciones de archivos locales
import { loadCredentials, Credential } from '../../storage/credentials'; 
import CredentialCard from '../components/CredentialCard'; 

export default function HomeScreen() {
    const router = useRouter();
    
    const [credentials, setCredentials] = useState<Credential[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false); 
    const [searchTerm, setSearchTerm] = useState(''); 

    // --- LÓGICA DE SEGURIDAD ---
    const authenticate = async () => {
        if (isAuthenticated) return; 
        
        try {
            const isSupported = await LocalAuthentication.hasHardwareAsync();
            const enrolled = await LocalAuthentication.isEnrolledAsync();

            if (isSupported && enrolled) {
                const result = await LocalAuthentication.authenticateAsync({
                    promptMessage: 'Desbloquea MasterKey para ver tus claves',
                    cancelLabel: 'Cancelar',
                    disableDeviceFallback: false,
                });

                if (result.success) {
                    setIsAuthenticated(true);
                    fetchCredentials();
                } else {
                    Alert.alert("Acceso Denegado", "Debes autenticarte para entrar.", [
                        { text: "Reintentar", onPress: authenticate }
                    ]);
                }
            } else {
                // Si el dispositivo no tiene biometría, dejamos pasar por ahora
                setIsAuthenticated(true);
                fetchCredentials();
            }
        } catch (error) {
            console.error("Error de autenticación:", error);
            setIsAuthenticated(false);
        }
    };

    // --- CARGA DE DATOS ---
    const fetchCredentials = async () => {
        setIsLoading(true);
        try {
            const storedCredentials = await loadCredentials();
            setCredentials(storedCredentials);
        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Se ejecuta cada vez que el usuario entra a esta pestaña
    useFocusEffect(
        useCallback(() => {
            if (!isAuthenticated) {
                authenticate();
            } else {
                fetchCredentials();
            }
            return () => {}; 
        }, [isAuthenticated])
    );

    // --- FILTRADO DE BÚSQUEDA ---
    const filteredCredentials = useMemo(() => {
        if (!searchTerm) return credentials;
        const lowerSearch = searchTerm.toLowerCase();
        return credentials.filter(cred => 
            cred.accountName.toLowerCase().includes(lowerSearch) ||
            cred.username.toLowerCase().includes(lowerSearch)
        );
    }, [credentials, searchTerm]);

    // --- RENDERIZADO DE CONTENIDO ---
    const renderContent = () => {
        if (!isAuthenticated) {
            return (
                <View style={styles.centered}>
                    <Ionicons name="lock-closed" size={80} color="#007BFF" />
                    <Text style={styles.statusText}>MasterKey Bloqueado</Text>
                    <TouchableOpacity style={styles.authButton} onPress={authenticate}>
                        <Text style={styles.authButtonText}>Desbloquear con Biometría</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (isLoading) {
            return (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#007BFF" />
                    <Text style={styles.statusText}>Cargando...</Text>
                </View>
            );
        }
        
        return (
            <>
                {/* Barra de Búsqueda */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#6C757D" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar cuenta o usuario..."
                        placeholderTextColor="#ADB5BD"
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                    />
                </View>

                {/* Lista de Credenciales */}
                <FlatList
                    data={filteredCredentials}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <CredentialCard 
                            credential={item} 
                            onPress={() => router.push(`/details/${item.id}`)} 
                        />
                    )}
                    style={styles.list}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="shield-outline" size={60} color="#DEE2E6" />
                            <Text style={styles.emptyText}>
                                {searchTerm ? 'No se encontraron resultados' : 'No tienes cuentas guardadas aún'}
                            </Text>
                        </View>
                    }
                />
            </>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="auto" /> 
            <Stack.Screen options={{ title: "Mis Cuentas" }} />

            <View style={styles.container}>
                {renderContent()}
            </View>

            {/* Botón flotante para agregar (FAB) */}
            {isAuthenticated && (
                <TouchableOpacity 
                    style={styles.fab} 
                    onPress={() => router.push('/add')}
                >
                    <Ionicons name="add" size={32} color="#FFFFFF" />
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    container: {
        flex: 1,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 15,
        margin: 15,
        marginTop: Platform.OS === 'ios' ? 10 : 40, // Ajuste para el notch
        height: 50,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#343A40',
    },
    list: {
        paddingHorizontal: 15,
    },
    listContent: {
        paddingBottom: 100, 
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    statusText: {
        fontSize: 18,
        color: '#6C757D',
        marginTop: 15,
        fontWeight: '600',
    },
    authButton: {
        marginTop: 25,
        backgroundColor: '#007BFF',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 10,
    },
    authButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 80,
    },
    emptyText: {
        fontSize: 16,
        color: '#ADB5BD',
        marginTop: 10,
        textAlign: 'center',
    },
    fab: {
        position: 'absolute',
        width: 65,
        height: 65,
        right: 25,
        bottom: 25, 
        backgroundColor: '#007BFF',
        borderRadius: 32.5,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#007BFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
});