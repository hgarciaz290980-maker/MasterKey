import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function OnboardingScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [emergencyId, setEmergencyId] = useState('');

    const handleFinish = async () => {
        if (!name || !email || !emergencyId) {
            Alert.alert("Campos incompletos", "Por favor llena todos los datos para continuar.");
            return;
        }

        try {
            await AsyncStorage.setItem('user_name', name);
            await AsyncStorage.setItem('user_email', email);
            await AsyncStorage.setItem('emergency_id', emergencyId);
            await AsyncStorage.setItem('has_launched', 'true'); // Marcamos que ya se configuró

            router.replace('/'); // Vamos al Dashboard
        } catch (e) {
            Alert.alert("Error", "No se pudieron guardar tus datos.");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
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
                />

                <Text style={styles.label}>Correo de Respaldo (Google)</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="ejemplo@gmail.com" 
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />

                <Text style={styles.label}>ID de Emergencia (Clave única)</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="Crea un código secreto de recuperación" 
                    secureTextEntry
                    value={emergencyId}
                    onChangeText={setEmergencyId}
                />

                <TouchableOpacity style={styles.button} onPress={handleFinish}>
                    <Text style={styles.buttonText}>Comenzar ahora</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    content: { padding: 30, justifyContent: 'center', flex: 1 },
    title: { fontSize: 28, fontWeight: '800', color: '#212529', marginTop: 20 },
    subtitle: { fontSize: 16, color: '#6C757D', marginBottom: 30 },
    label: { fontSize: 14, fontWeight: '700', marginBottom: 8, marginTop: 15 },
    input: { backgroundColor: '#FFF', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#E9ECEF', fontSize: 16 },
    button: { backgroundColor: '#007BFF', padding: 18, borderRadius: 15, marginTop: 40, alignItems: 'center' },
    buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});