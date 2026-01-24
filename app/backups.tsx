// app/backups.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Switch, ActivityIndicator, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerNavigationProp } from '@react-navigation/drawer';

// IMPORTACIONES DE TU LÓGICA
import { getAllCredentials, saveAllCredentials } from '../storage/credentials';
// @ts-ignore
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
          <TouchableOpacity 
            onPress={() => navigation.openDrawer()} 
            style={styles.backButton}
            activeOpacity={0.7}
          >
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
        setAutoBackup(savedAuto === 'true');
    };

    const toggleAutoBackup = async (value: boolean) => {
        setAutoBackup(value);
        await AsyncStorage.setItem('auto_backup', value.toString());
    };

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const data = await getAllCredentials();
            const success = await uploadToGoogleDrive(JSON.stringify(data));
            if (success) {
                const now = new Date();
                setLastSync(`${now.toLocaleDateString()} ${now.toLocaleTimeString()}`);
                Alert.alert("Bunker-K", "Respaldo en la nube exitoso.");
            }
        } catch (e) {
            Alert.alert("Error", "No se pudo conectar con Google Drive.");
        } finally {
            setIsSyncing(false);
        }
    };

    const handleImport = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
            if (result.canceled) return;
            const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
            const importedData = JSON.parse(content);
            if (Array.isArray(importedData)) {
                Alert.alert("Confirmar", "¿Deseas reemplazar todos tus datos?", [
                    { text: "No" },
                    { text: "Importar", onPress: async () => {
                        await saveAllCredentials(importedData);
                        Alert.alert("Éxito", "Datos restaurados.");
                    }}
                ]);
            }
        } catch (e) {
            Alert.alert("Error", "El archivo no es válido.");
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
                {/* Reducido el margen superior aquí */}
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
                        sublabel="Al abrir o modificar datos"
                        rightElement={<Switch value={autoBackup} onValueChange={toggleAutoBackup} trackColor={{ false: '#333', true: COLORS.neonGreen }} />}
                    />
                </View>

                <Text style={styles.sectionLabel}>RESPALDAR O CARGAR DESDE TU CELULAR</Text>
                <View style={styles.group}>
                    <BackupItem 
                        icon="share-outline" 
                        label="Exportar Cuentas" 
                        sublabel="Genera un archivo cifrado"
                        onPress={() => Alert.alert("Exportar", "Generando archivo...")}
                    />
                    <View style={styles.thinLine} />
                    <BackupItem 
                        icon="download-outline" 
                        label="Importar Cuentas" 
                        sublabel="Carga un archivo cifrado"
                        color={COLORS.neonGreen}
                        onPress={handleImport}
                    />
                </View>
                
                <Text style={styles.footer}>Datos cifrados de punto a punto.</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.deepMidnight },
    
    headerWrapper: { 
        paddingTop: Platform.OS === 'android' ? 50 : 20, // Bajamos el header un poco más
        backgroundColor: COLORS.deepMidnight 
    },
    headerContent: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        paddingBottom: 12 // Menos espacio hacia la línea
    },
    headerTitle: { color: '#FFF', fontSize: 16, fontWeight: '600' },
    backButton: { flexDirection: 'row-reverse', alignItems: 'center' },
    backText: { color: '#FFF', fontSize: 13, marginLeft: 8, fontWeight: '400' },
    ultraThinLine: { 
        height: 0.4, 
        backgroundColor: 'rgba(255, 255, 255, 0.2)', 
        width: '100%' 
    },

    sectionLabel: { color: COLORS.textWhite, opacity: 0.4, fontSize: 10, fontWeight: 'bold', marginBottom: 10, marginTop: 25, letterSpacing: 1.5 },
    group: { backgroundColor: COLORS.darkSlate, borderRadius: 20, overflow: 'hidden', borderWidth: 0.4, borderColor: 'rgba(255,255,255,0.08)' },
    item: { flexDirection: 'row', alignItems: 'center', padding: 18 },
    iconCircle: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    label: { color: '#FFF', fontSize: 15, fontWeight: '600' },
    sub: { color: '#FFF', opacity: 0.5, fontSize: 12, marginTop: 2 },
    thinLine: { height: 0.4, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 20 },
    footer: { color: COLORS.textWhite, opacity: 0.3, textAlign: 'center', fontSize: 11, marginTop: 40, marginBottom: 20 }
});