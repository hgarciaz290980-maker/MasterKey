import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Switch, ActivityIndicator, SafeAreaView, Platform, StatusBar, Share } from 'react-native';
import { useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerNavigationProp } from '@react-navigation/drawer';

// MOTOR DE ALMACENAMIENTO Y DRIVE
import { getAllCredentials, saveAllCredentials } from '../storage/credentials';
// @ts-ignore - Este es el motor que configuramos previamente
import { uploadToGoogleDrive } from './components/googleDriveService';

const COLORS = {
    deepMidnight: '#040740',
    darkSlate: '#172140',
    electricBlue: '#303AF2',
    neonGreen: '#0DAC40',
    textWhite: '#F8F9FA'
};

const SectionHeader = ({ title }: { title: string }) => {
    const navigation = useNavigation<DrawerNavigationProp<any>>();
    return (
      <View style={styles.headerWrapper}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{title}</Text>
          <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.backButton}>
            <Text style={styles.backText}>VOLVER</Text>
            <Ionicons name="chevron-back" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.ultraThinLine} />
      </View>
    );
};

export default function BackupsScreen() {
    const [isSyncing, setIsSyncing] = useState(false);
    const [autoBackup, setAutoBackup] = useState(false);
    const [lastSync, setLastSync] = useState('Pendiente');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const savedAuto = await AsyncStorage.getItem('auto_backup');
        const lastDate = await AsyncStorage.getItem('last_cloud_sync');
        setAutoBackup(savedAuto === 'true');
        if (lastDate) setLastSync(lastDate);
    };

    const toggleAutoBackup = async (value: boolean) => {
        setAutoBackup(value);
        await AsyncStorage.setItem('auto_backup', value.toString());
        if (value) Alert.alert("Bunker-K", "Respaldo automático activado. Se sincronizará en cada cambio importante.");
    };

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const data = await getAllCredentials();
            const success = await uploadToGoogleDrive(JSON.stringify(data));
            if (success) {
                const now = new Date().toLocaleString();
                setLastSync(now);
                await AsyncStorage.setItem('last_cloud_sync', now);
                Alert.alert("Bunker-K", "Sincronización con Google Drive exitosa.");
            }
        } catch (e) {
            Alert.alert("Error de Conexión", "Asegúrate de haber vinculado tu cuenta de Google en la configuración.");
        } finally {
            setIsSyncing(false);
        }
    };

    const handleExport = async () => {
        try {
            const data = await getAllCredentials();
            const fileName = `BunkerK_Backup_${new Date().getTime()}.json`;
            // @ts-ignore
            const fileUri = (FileSystem.cacheDirectory || FileSystem.documentDirectory || '') + fileName;
            
            await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data));
            
            await Share.share({
                url: Platform.OS === 'ios' ? fileUri : undefined,
                message: Platform.OS === 'android' ? JSON.stringify(data) : 'Tu respaldo cifrado de Bunker-K',
                title: 'Exportar Búnker'
            });
        } catch (e) {
            Alert.alert("Error", "No se pudo generar el archivo de exportación.");
        }
    };

    // --- CAPA DE COMPATIBILIDAD ---
    const normalizeData = (data: any[]): any[] => {
        const validCategories = ['fav', 'work', 'personal', 'pet', 'mobility', 'entertainment'];
        return data.map(item => ({
            ...item,
            category: validCategories.includes(item.category) ? item.category : 'personal',
            id: item.id || Date.now().toString(36) + Math.random().toString(36).substring(2),
            reminders: item.reminders || []
        }));
    };

    const handleImport = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ 
                type: "application/json",
                copyToCacheDirectory: true 
            });

            if (result.canceled) return;
            
            const fileUri = result.assets[0].uri;
            const content = await FileSystem.readAsStringAsync(fileUri);
            
            if (!content) throw new Error("Archivo vacío");

            let importedData = JSON.parse(content);
            
            // Si el archivo viene dentro de una propiedad 'credentials' (formato viejo)
            if (importedData.credentials && Array.isArray(importedData.credentials)) {
                importedData = importedData.credentials;
            }

            const dataToSave = Array.isArray(importedData) ? importedData : [importedData];
            const sanitizedData = normalizeData(dataToSave);
            
            Alert.alert(
                "Restaurar Búnker", 
                `Se encontraron ${sanitizedData.length} cuentas. ¿Deseas restaurarlas?`, 
                [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Restaurar", onPress: async () => {
                        await saveAllCredentials(sanitizedData);
                        Alert.alert("Éxito", "Bóveda restaurada y actualizada correctamente.");
                    }}
                ]
            );
        } catch (e) {
            console.log("--- ERROR CRÍTICO ---", e);
            Alert.alert("Error", "No se pudo leer el archivo. Asegúrate de seleccionar un archivo .json válido.");
        }
    };

    const BackupItem = ({ icon, label, sublabel, rightElement, onPress, color = COLORS.electricBlue }: any) => (
        <TouchableOpacity style={styles.item} onPress={onPress} disabled={!onPress}>
            <View style={[styles.iconCircle, { backgroundColor: color + '15' }]}>
                <Ionicons name={icon} size={22} color={color} />
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.sub}>{sublabel}</Text>
            </View>
            {rightElement}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <SectionHeader title="Backups y Nube" />
            
            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10 }}>
                <Text style={[styles.sectionLabel, { marginTop: 10 }]}>RESPALDAR EN LA NUBE (GOOGLE DRIVE)</Text>
                <View style={styles.group}>
                    <BackupItem 
                        icon="cloud-upload-outline" 
                        label="Sincronizar ahora" 
                        sublabel={`Último: ${lastSync}`}
                        rightElement={isSyncing ? <ActivityIndicator color={COLORS.neonGreen} /> : <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.2)" />}
                        onPress={handleSync}
                    />
                    <View style={styles.thinLine} />
                    <BackupItem 
                        icon="sync-outline" 
                        label="Respaldo Automático" 
                        sublabel="Sincroniza al detectar cambios"
                        rightElement={<Switch value={autoBackup} onValueChange={toggleAutoBackup} trackColor={{ false: '#333', true: COLORS.neonGreen }} />}
                    />
                </View>

                <Text style={styles.sectionLabel}>RESPALDO LOCAL EN DISPOSITIVO</Text>
                <View style={styles.group}>
                    <BackupItem 
                        icon="share-outline" 
                        label="Exportar Búnker" 
                        sublabel="Descarga tu archivo .json cifrado"
                        onPress={handleExport}
                    />
                    <View style={styles.thinLine} />
                    <BackupItem 
                        icon="download-outline" 
                        label="Importar Búnker" 
                        sublabel="Cargar una bóveda externa"
                        color={COLORS.neonGreen}
                        onPress={handleImport}
                    />
                </View>
                
                <Text style={styles.footer}>Búnker-K Bridge: Cifrado AES-256 Activo.</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.deepMidnight },
    headerWrapper: { paddingTop: Platform.OS === 'android' ? 50 : 20, backgroundColor: COLORS.deepMidnight },
    headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12 },
    headerTitle: { color: '#FFF', fontSize: 16, fontWeight: '600' },
    backButton: { flexDirection: 'row-reverse', alignItems: 'center' },
    backText: { color: '#FFF', fontSize: 13, marginLeft: 8 },
    ultraThinLine: { height: 0.4, backgroundColor: 'rgba(255, 255, 255, 0.2)' },
    sectionLabel: { color: COLORS.textWhite, opacity: 0.4, fontSize: 10, fontWeight: 'bold', marginBottom: 10, marginTop: 25, letterSpacing: 1.5 },
    group: { backgroundColor: COLORS.darkSlate, borderRadius: 20, overflow: 'hidden', borderWidth: 0.4, borderColor: 'rgba(255,255,255,0.08)' },
    item: { flexDirection: 'row', alignItems: 'center', padding: 18 },
    iconCircle: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    label: { color: '#FFF', fontSize: 15, fontWeight: '600' },
    sub: { color: '#FFF', opacity: 0.5, fontSize: 12, marginTop: 2 },
    thinLine: { height: 0.4, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 20 },
    footer: { color: COLORS.textWhite, opacity: 0.3, textAlign: 'center', fontSize: 11, marginTop: 40, marginBottom: 20 }
});