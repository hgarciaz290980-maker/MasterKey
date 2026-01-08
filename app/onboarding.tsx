import React, { useState } from 'react';
import { 
    View, Text, StyleSheet, TextInput, TouchableOpacity, 
    SafeAreaView, Alert, KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications'; 
import * as Device from 'expo-device'; 

// CONFIGURACIÓN DEL MANEJADOR (SOLUCIÓN DEFINITIVA CON TYPE ASSERTION)
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    } as any), // El "as any" ignora las validaciones estrictas de TS que causan el error
});

export default function OnboardingScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [emergencyId, setEmergencyId] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const requestNotificationPermissions = async () => {
        if (!Device.isDevice) {
            console.log('Las notificaciones requieren un dispositivo físico');
            return false;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            Alert.alert(
                "Permisos requeridos", 
                "Para que los recordatorios funcionen, necesitas habilitar las notificaciones en los ajustes del celular."
            );
            return false;
        }
        return true;
    };

    const handleFinish = async () => {
        if (!name || !email || !emergencyId) {
            Alert.alert("Campos incompletos", "Por favor llena todos los datos para continuar.");
            return;
        }

        try {
            await requestNotificationPermissions();

            await AsyncStorage.setItem('user_name', name);
            await AsyncStorage.setItem('user_email', email);
            await AsyncStorage.setItem('emergency_id', emergencyId);
            await AsyncStorage.setItem('has_launched', 'true');

            router.replace('/'); 
        } catch (e) {
            Alert.alert("Error", "No se pudieron guardar tus datos.");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.content}>
                        <Ionicons name="shield-checkmark" size={80} color="#007BFF" />
                        <Text style={styles.title}>Bienvenido a Bunker-K</Text>
                        <Text style={styles.subtitle}>Configura tu perfil de seguridad inicial.</Text>

                        <Text style={styles.label}>Tu Nombre</Text>
                        <TextInput 
                            style={styles.input} 
                            placeholder="¿Cómo quieres que te llame?" 
                            value={name}
                            onChangeText={setName}
                            placeholderTextColor="#ADB5BD"
                        />

                        <Text style={styles.label}>Correo de Respaldo (Google)</Text>
                        <TextInput 
                            style={styles.input} 
                            placeholder="ejemplo@gmail.com" 
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                            placeholderTextColor="#ADB5BD"
                        />

                        <Text style={styles.label}>ID de Emergencia (Clave única)</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput 
                                style={styles.passwordInput} 
                                placeholder="Código secreto" 
                                secureTextEntry={!showPassword} 
                                value={emergencyId}
                                onChangeText={setEmergencyId}
                                placeholderTextColor="#ADB5BD"
                            />
                            <TouchableOpacity 
                                style={styles.eyeIcon} 
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Ionicons 
                                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                                    size={24} 
                                    color="#6C757D" 
                                />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.button} onPress={handleFinish}>
                            <Text style={styles.buttonText}>Comenzar ahora</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    scrollContent: { flexGrow: 1 },
    content: { padding: 30, justifyContent: 'center', flex: 1 },
    title: { fontSize: 28, fontWeight: '800', color: '#212529', marginTop: 20 },
    subtitle: { fontSize: 16, color: '#6C757D', marginBottom: 30 },
    label: { fontSize: 14, fontWeight: '700', marginBottom: 8, marginTop: 15 },
    input: { backgroundColor: '#FFF', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#E9ECEF', fontSize: 16, color: '#212529' },
    passwordContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#FFF', 
        borderRadius: 12, 
        borderWidth: 1, 
        borderColor: '#E9ECEF' 
    },
    passwordInput: { flex: 1, padding: 15, fontSize: 16, color: '#212529' },
    eyeIcon: { paddingRight: 15 },
    button: { backgroundColor: '#007BFF', padding: 18, borderRadius: 15, marginTop: 40, alignItems: 'center' },
    buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});