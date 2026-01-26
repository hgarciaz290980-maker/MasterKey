import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Platform, StatusBar, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
    deepMidnight: '#040740',
    darkSlate: '#172140',
    electricBlue: '#303AF2',
    textWhite: '#F8F9FA',
};

export default function LegalScreen() {
    const router = useRouter();
    const [accepted, setAccepted] = useState(false);

    // Verificar si ya aceptó previamente
    useEffect(() => {
        const checkStatus = async () => {
            const status = await AsyncStorage.getItem('terms_accepted');
            if (status === 'true') setAccepted(true);
        };
        checkStatus();
    }, []);

    const handleAcceptance = async () => {
        try {
            await AsyncStorage.setItem('terms_accepted', 'true');
            setAccepted(true);
            Alert.alert("Bunker-K", "Has aceptado los términos y condiciones de soberanía digital.");
            router.back(); // Regresa al menú después de aceptar
        } catch (e) {
            console.error(e);
        }
    };

    const LegalSection = ({ title, content }: { title: string, content: string }) => (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.sectionContent}>{content}</Text>
            <View style={styles.separator} />
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* Header con margen superior corregido para que no quede debajo del notch */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>LEGAL Y PRIVACIDAD</Text>
                <View style={{ width: 40 }} /> 
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.manifestoText}>
                    "Tu cerebro nació para crear y sentir, no para ser un archivo de contraseñas. Búnker-K es tu capacidad extendida; tu propio territorio digital."
                </Text>

                <LegalSection 
                    title="1. CIFRADO Y ALMACENAMIENTO LOCAL"
                    content="Toda la información se cifra mediante algoritmos de alta seguridad antes de ser guardada. Los datos residen únicamente en la memoria interna de tu dispositivo. No utilizamos servidores propios ni externos."
                />

                <LegalSection 
                    title="2. RESPALDOS Y BORRADO DE APP"
                    content="IMPORTANTE: Si desinstalas la aplicación sin haber realizado un respaldo, perderás toda tu información de forma irreversible. Se recomienda usar los respaldos en Google Drive disponibles en Configuración."
                />

                <LegalSection 
                    title="3. EL PUENTE SEGURO (GOOGLE DRIVE)"
                    content="Búnker-K actúa exclusivamente como un puente técnico. La app no tiene acceso a tus archivos de Drive; el archivo viaja cifrado y solo puede ser leído por tu instancia de Búnker-K."
                />

                <LegalSection 
                    title="4. DESLINDE DE RESPONSABILIDAD"
                    content="La permanencia y seguridad de los datos es responsabilidad exclusiva del usuario. El desarrollador no se hace responsable por pérdida de datos derivada de olvido de contraseñas o fallos del dispositivo."
                />

                {/* BOTÓN DE ACEPTACIÓN DINÁMICO */}
                <View style={styles.footerAction}>
                    <TouchableOpacity 
                        style={[styles.acceptBtn, accepted && styles.acceptedBtn]}
                        onPress={handleAcceptance}
                        disabled={accepted}
                    >
                        <Text style={styles.acceptBtnText}>
                            {accepted ? "TÉRMINOS ACEPTADOS" : "ENTIENDO Y ACEPTO LOS TÉRMINOS"}
                        </Text>
                        <Ionicons 
                            name={accepted ? "checkmark-circle" : "shield-checkmark-outline"} 
                            size={20} 
                            color="#FFF" 
                        />
                    </TouchableOpacity>
                </View>

                <Text style={styles.versionInfo}>Última actualización: 26 de Enero, 2026</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.deepMidnight },
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 15, 
        paddingTop: Platform.OS === 'ios' ? 10 : 40, // Corrección para que no quede debajo del menú del celular
        paddingBottom: 15,
        borderBottomWidth: 0.4,
        borderBottomColor: 'rgba(255,255,255,0.1)'
    },
    headerTitle: { color: '#FFF', fontSize: 13, fontWeight: '900', letterSpacing: 2 },
    backButton: { padding: 5 },
    scrollContent: { padding: 25 },
    manifestoText: { 
        color: COLORS.textWhite, 
        fontStyle: 'italic', 
        opacity: 0.6, 
        textAlign: 'center', 
        lineHeight: 22,
        marginBottom: 40,
        fontSize: 14
    },
    sectionContainer: { marginBottom: 30 },
    sectionTitle: { color: '#FFF', fontSize: 13, fontWeight: 'bold', letterSpacing: 1, marginBottom: 12 }, // Títulos en Blanco
    sectionContent: { color: COLORS.textWhite, opacity: 0.7, lineHeight: 24, fontSize: 14, textAlign: 'justify' },
    separator: { height: 0.4, backgroundColor: 'rgba(255,255,255,0.1)', marginTop: 25 },
    footerAction: { 
        marginTop: 20,
        marginBottom: 20
    },
    acceptBtn: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: COLORS.electricBlue, 
        paddingVertical: 18, 
        borderRadius: 15,
        shadowColor: COLORS.electricBlue,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5
    },
    acceptedBtn: {
        backgroundColor: '#28a745', // Color verde suave solo cuando ya aceptó
        opacity: 0.8
    },
    acceptBtnText: { color: '#FFF', fontWeight: '900', marginRight: 12, fontSize: 13, letterSpacing: 0.5 },
    versionInfo: { color: COLORS.textWhite, opacity: 0.3, fontSize: 10, textAlign: 'center', marginTop: 20, marginBottom: 20 },
});