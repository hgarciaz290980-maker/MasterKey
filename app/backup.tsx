import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, SafeAreaView, StatusBar, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// --- IMPORTACIONES ---
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
const FileSystem: any = require('expo-file-system/legacy'); 

// Importamos la función que realmente usa tu app para guardar cuentas
import { saveAllCredentials } from '../storage/credentials';

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

    useEffect(() => {
        const loadBackupData = async () => {
            const storedEmail = await AsyncStorage.getItem('user_email');
            const storedAuto = await AsyncStorage.getItem('auto_backup');
            if (storedEmail) setEmail(storedEmail);
            if (storedAuto) setIsAutoBackup(JSON.parse(storedAuto || "false"));
        };
        loadBackupData();
    }, []);

    const toggleAutoBackup = async (value: boolean) => {
        setIsAutoBackup(value);
        await AsyncStorage.setItem('auto_backup', JSON.stringify(value));
    };

    // --- FUNCIÓN DE EXPORTACIÓN CON NOMBRE DINÁMICO ---
    const handleExport = async () => {
        try {
            // 1. Obtenemos los datos de configuración
            const allKeys = await AsyncStorage.getAllKeys();
            const allData = await AsyncStorage.multiGet(allKeys);
            const backupObject = Object.fromEntries(allData);
            
            const jsonString = JSON.stringify(backupObject);

            // 2. GENERAMOS LA FECHA ACTUAL PARA EL NOMBRE
            const hoy = new Date();
            const dia = String(hoy.getDate()).padStart(2, '0');
            const mes = String(hoy.getMonth() + 1).padStart(2, '0');
            const anio = hoy.getFullYear();
            const nombreArchivo = `Bunker_data_${dia}_${mes}_${anio}.bunker`;

            // 3. Creamos el archivo con el nombre dinámico
            const fileUri = `${FileSystem.cacheDirectory}${nombreArchivo}`;
            
            await FileSystem.writeAsStringAsync(fileUri, jsonString, { encoding: "utf8" });
            
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, { 
                    dialogTitle: 'Guardar respaldo de Bunker',
                    UTI: 'public.item' // Ayuda a iOS a entender que es un archivo general
                });
            }
        } catch (error) {
            Alert.alert("Error", "No se pudo generar el archivo.");
        }
    };

    const handleImport = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
            if (result.canceled) return;

            const fileUri = result.assets[0].uri;
            const content = await FileSystem.readAsStringAsync(fileUri);
            const data = JSON.parse(content);

            Alert.alert(
                "Restauración de Cuentas",
                "Se detectaron registros antiguos. Se guardarán en el almacenamiento seguro del sistema. ¿Proceder?",
                [
                    { text: "Cancelar", style: "cancel" },
                    { 
                        text: "Importar", 
                        onPress: async () => {
                            try {
                                const keys = Object.keys(data);
                                let cuentasEncontradas: any[] = [];

                                if (keys.includes("0")) {
                                    cuentasEncontradas = Object.values(data);
                                } else if (data.vault_items) {
                                    cuentasEncontradas = typeof data.vault_items === 'string' ? JSON.parse(data.vault_items) : data.vault_items;
                                } else if (data.accounts) {
                                    cuentasEncontradas = typeof data.accounts === 'string' ? JSON.parse(data.accounts) : data.accounts;
                                }

                                if (cuentasEncontradas.length > 0) {
                                    await saveAllCredentials(cuentasEncontradas);
                                    const nombre = data.user_name || "Usuario";
                                    await AsyncStorage.setItem('user_name', nombre);
                                    Alert.alert("Éxito", `Se restauraron ${cuentasEncontradas.length} cuentas en el almacenamiento seguro. REINICIA LA APP.`);
                                } else {
                                    Alert.alert("Aviso", "No se encontraron datos de cuentas válidos.");
                                }
                            } catch (e) {
                                console.error(e);
                                Alert.alert("Error", "Fallo al inyectar en SecureStore.");
                            }
                        }
                    }
                ]
            );
        } catch (error) {
            Alert.alert("Error", "Archivo no válido.");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>RESPALDOS</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={styles.sectionLabel}>ESTADO DE LA CONEXIÓN</Text>
                <View style={styles.group}>
                    <TouchableOpacity style={styles.item} onPress={() => Alert.alert("Bunker", "Mañana conectaremos el motor de Google Drive.")}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.itemLabel}>Vincular Google Drive</Text>
                            <Text style={styles.itemSub}>{email ? `Correo: ${email}` : "Sin cuenta configurada"}</Text>
                        </View>
                        <MaterialCommunityIcons name="cloud-off-outline" size={28} color={COLORS.vibrantRed} />
                    </TouchableOpacity>
                    <Text style={[styles.footerLegend, { color: COLORS.vibrantRed }]}>
                        ✕ La nube no está vinculada. Toca para iniciar sesión con Google.
                    </Text>
                </View>

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
                <View style={styles.group}>
                    <TouchableOpacity style={styles.item} onPress={handleExport}>
                        <Ionicons name="download-outline" size={22} color={COLORS.textWhite} />
                        <Text style={[styles.itemLabel, { marginLeft: 15 }]}>Exportar Archivo .bunker</Text>
                    </TouchableOpacity>
                    <Text style={styles.footerLegend}>Genera un archivo local encriptado para guardarlo fuera de la nube.</Text>

                    <View style={styles.thinLine} />

                    <TouchableOpacity style={styles.item} onPress={handleImport}>
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
    sectionLabel: { color: COLORS.textWhite, opacity: 0.4, fontSize: 10, fontWeight: 'bold', marginBottom: 12, marginTop: 10, letterSpacing: 1.5 },
    group: { backgroundColor: COLORS.darkSlate, borderRadius: 20, padding: 5, marginBottom: 20, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)' },
    item: { flexDirection: 'row', alignItems: 'center', padding: 18 },
    itemLabel: { color: COLORS.textWhite, fontSize: 15, fontWeight: '700' },
    itemSub: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 },
    footerLegend: { color: 'rgba(255,255,255,0.3)', fontSize: 10, paddingHorizontal: 18, paddingBottom: 15, lineHeight: 14 },
    thinLine: { height: 0.5, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 20 }
});