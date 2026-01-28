import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, SafeAreaView, StatusBar, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const COLORS = {
    deepMidnight: '#040740',
    darkSlate: '#172140',
    electricBlue: '#303AF2',
    neonGreen: '#0DAC40',
    textWhite: '#F8F9FA',
    vibrantRed: '#FF3B30',
};

export default function BackupScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [isAutoBackup, setIsAutoBackup] = useState(false);
    const [lastBackup, setLastBackup] = useState("Nunca");

    useEffect(() => {
        const loadBackupData = async () => {
            const storedEmail = await AsyncStorage.getItem('user_email');
            const storedAuto = await AsyncStorage.getItem('auto_backup');
            const storedLast = await AsyncStorage.getItem('last_backup_date');
            
            if (storedEmail) setEmail(storedEmail);
            if (storedAuto) setIsAutoBackup(JSON.parse(storedAuto));
            if (storedLast) setLastBackup(storedLast);
        };
        loadBackupData();
    }, []);

    const toggleAutoBackup = async (value: boolean) => {
        setIsAutoBackup(value);
        await AsyncStorage.setItem('auto_backup', JSON.stringify(value));
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* HEADER PERSONALIZADO */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>RESPALDOS</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                
        
                {/* CELDA DE VINCULACIÓN DE NUBE */}
                <Text style={styles.sectionLabel}>ESTADO DE LA CONEXIÓN</Text>
                <View style={styles.group}>
                    <TouchableOpacity 
                        style={styles.item} 
                        onPress={() => Alert.alert("Bunker", "Mañana conectaremos el motor de Google Drive.")}
                    >
                        <View style={{ flex: 1 }}>
                            <Text style={styles.itemLabel}>Vincular Google Drive</Text>
                            <Text style={styles.itemSub}>
                                {email ? `Correo: ${email}` : "Sin cuenta configurada"}
                            </Text>
                        </View>
                        
                        {/* ICONO EN ROJO/GRIS PORQUE AÚN NO CONECTAMOS EL MOTOR */}
                        <MaterialCommunityIcons 
                            name="cloud-off-outline" 
                            size={28} 
                            color={COLORS.vibrantRed} 
                        />
                    </TouchableOpacity>
                    
                    <Text style={[styles.footerLegend, { color: COLORS.vibrantRed }]}>
                        ✕ La nube no está vinculada. Toca para iniciar sesión con Google.
                    </Text>
                </View>

                {/* RESPALDO AUTOMÁTICO */}
                <View style={styles.group}>
                    <View style={styles.item}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.itemLabel}>Respaldos Automáticos</Text>
                            <Text style={styles.itemSub}>{isAutoBackup ? "Activado" : "Desactivado"}</Text>
                        </View>
                        <Switch 
                            value={isAutoBackup} 
                            onValueChange={toggleAutoBackup}
                            trackColor={{ false: '#333', true: COLORS.neonGreen }}
                        />
                    </View>
                    <Text style={styles.footerLegend}>Se realiza un respaldo automático cuando guardas cambios en tus cuentas (Solo con WiFi).</Text>
                </View>

                <Text style={styles.sectionLabel}>ARCHIVOS LOCALES</Text>

                {/* EXPORTAR / IMPORTAR */}
                <View style={styles.group}>
                    <TouchableOpacity style={styles.item}>
                        <Ionicons name="download-outline" size={22} color={COLORS.textWhite} />
                        <Text style={[styles.itemLabel, { marginLeft: 15 }]}>Exportar Archivo .bunker</Text>
                    </TouchableOpacity>
                    <Text style={styles.footerLegend}>Genera un archivo local encriptado para guardarlo fuera de la nube.</Text>

                    <View style={styles.thinLine} />

                    <TouchableOpacity style={styles.item}>
                        <Ionicons name="share-outline" size={22} color={COLORS.textWhite} />
                        <Text style={[styles.itemLabel, { marginLeft: 15 }]}>Importar Archivo .bunker</Text>
                    </TouchableOpacity>
                    <Text style={styles.footerLegend}>Carga tus datos desde un archivo .bunker o desde tu respaldo en Drive.</Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.deepMidnight },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 40 },
    headerTitle: { color: '#FFF', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
    backBtn: { padding: 5 },
    scroll: { paddingHorizontal: 20, paddingBottom: 50 },
    cloudCard: { alignItems: 'center', marginVertical: 30 },
    cloudStatus: { fontSize: 18, fontWeight: '900', marginTop: 15, letterSpacing: 1 },
    emailText: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 5 },
    linkButton: { backgroundColor: COLORS.electricBlue, flexDirection: 'row', padding: 18, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
    linkButtonText: { color: '#FFF', fontWeight: 'bold', marginLeft: 10 },
    sectionLabel: { color: COLORS.textWhite, opacity: 0.4, fontSize: 10, fontWeight: 'bold', marginBottom: 12, marginTop: 10, letterSpacing: 1.5 },
    group: { backgroundColor: COLORS.darkSlate, borderRadius: 20, padding: 5, marginBottom: 20, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)' },
    item: { flexDirection: 'row', alignItems: 'center', padding: 18 },
    itemLabel: { color: COLORS.textWhite, fontSize: 15, fontWeight: '700' },
    itemSub: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 },
    footerLegend: { color: 'rgba(255,255,255,0.3)', fontSize: 10, paddingHorizontal: 18, paddingBottom: 15, lineHeight: 14 },
    thinLine: { height: 0.5, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 20 }
});