import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Dimensions, StatusBar } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const COLORS = {
    deepMidnight: '#040740',
    electricBlue: '#303AF2',
    darkSlate: '#172140',
    textWhite: '#F8F9FA',
    neonGreen: '#0DAC40',
    vibrantYellow: '#FFD700'
};

const SupportCard = ({ icon, iconColor, title, description, onPress }: any) => (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.iconContainer}>
            <Ionicons name={icon} size={24} color={iconColor || COLORS.electricBlue} />
        </View>
        <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardDesc}>{description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.2)" />
    </TouchableOpacity>
);

export default function SupportScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const handleEmailSupport = () => {
        const subject = "Soporte Técnico Bunker";
        const body = "Hola equipo,\n\nNecesito ayuda con:\n\n---\nDetalles técnicos:\nApp: Bunker v1.1";
        Linking.openURL(`mailto:soporte@tucuenta.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="light-content" />
            <Stack.Screen options={{ headerShown: false }} />

            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={28} color="#FFF" />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.header}>
                    <Text style={styles.title}>Soporte Técnico</Text>
                    <Text style={styles.subtitle}>¿Cómo podemos ayudarte hoy?</Text>
                </View>

                <Text style={styles.sectionLabel}>SOLUCIONES RÁPIDAS</Text>
                
                <SupportCard 
                    icon="book-outline" 
                    title="Guía de Primeros Pasos" 
                    description="Aprende a blindar tu información desde cero."
                    onPress={() => { /* Pendiente para Landing Page */ }}
                />
                
                <SupportCard 
                    icon="cloud-offline-outline" 
                    iconColor={COLORS.neonGreen}
                    title="Problemas con Respaldos" 
                    description="Solución a errores de conexión con Google Drive."
                    onPress={() => router.push({
                        pathname: '/article',
                        params: { 
                            title: 'Problemas con Respaldos',
                            icon: 'cloud-offline',
                            color: COLORS.neonGreen,
                            content: "Si el respaldo falla, verifica lo siguiente:\n\n1. Espacio en Drive: Si tu Google Drive está al 100%, Google bloqueará la subida de nuevos datos.\n\n2. Conexión: Asegúrate de no tener un VPN o el modo 'Ahorro de Datos' activo, ya que restringen la sincronización.\n\n3. Re-vinculación: Intenta desvincular y volver a vincular tu cuenta de Google en la sección de Respaldos para refrescar los permisos."
                        }
                    })}
                />

                <SupportCard 
                    icon="finger-print-outline" 
                    iconColor={COLORS.vibrantYellow}
                    title="Biometría y Acceso" 
                    description="Qué hacer si tu huella o FaceID no responde."
                    onPress={() => router.push({
                        pathname: '/article',
                        params: { 
                            title: 'Biometría y Acceso',
                            icon: 'finger-print',
                            color: COLORS.vibrantYellow,
                            content: "Si tu huella o FaceID no responde:\n\n1. Limpieza: Limpia el sensor o la cámara frontal de tu equipo.\n\n2. ID Maestro: Si la biometría falla, Bunker te pedirá tu ID Maestro. Es tu llave física de respaldo, ¡no la olvides!\n\n3. Seguridad: Si registraste una nueva huella en los ajustes de tu celular, Bunker desactivará el acceso biométrico por seguridad. Entra con tu ID Maestro y reactívala en Ajustes."
                        }
                    })}
                />

                <View style={styles.divider} />

                <View style={styles.contactBox}>
                    <Ionicons name="mail-unread-outline" size={40} color={COLORS.electricBlue} />
                    <Text style={styles.contactTitle}>¿No encontraste la solución?</Text>
                    <Text style={styles.contactDesc}>
                        Nuestro equipo técnico puede revisarlo.
                    </Text>
                    
                    <TouchableOpacity style={styles.emailBtn} onPress={handleEmailSupport}>
                        <Text style={styles.emailBtnText}>Enviar Correo a Soporte</Text>
                    </TouchableOpacity>
                </View>
                
                <Text style={styles.versionText}>Bunker App v1.1.0 | 2026</Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.deepMidnight },
    backBtn: { paddingHorizontal: 15, paddingVertical: 10, zIndex: 10 },
    scroll: { paddingHorizontal: width * 0.05, paddingBottom: 40 },
    header: { marginBottom: 30, marginTop: 10 },
    title: { color: '#FFF', fontSize: 28, fontWeight: '900' },
    subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 16, marginTop: 5 },
    sectionLabel: { color: COLORS.electricBlue, fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginBottom: 15 },
    card: { 
        backgroundColor: COLORS.darkSlate, 
        borderRadius: 20, 
        padding: 15, 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
    },
    iconContainer: { width: 45, height: 45, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
    cardContent: { flex: 1, marginLeft: 15 },
    cardTitle: { color: '#FFF', fontSize: 15, fontWeight: '700' },
    cardDesc: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 30 },
    contactBox: { 
        backgroundColor: COLORS.darkSlate, 
        borderRadius: 24, 
        padding: 25, 
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.electricBlue,
        borderStyle: 'dashed'
    },
    contactTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginTop: 15 },
    contactDesc: { color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 18 },
    emailBtn: { backgroundColor: COLORS.electricBlue, paddingVertical: 15, paddingHorizontal: 30, borderRadius: 30, marginTop: 20, width: '100%', alignItems: 'center' },
    emailBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
    versionText: { color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 40, fontSize: 10, letterSpacing: 1 }
});