import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert, useColorScheme } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy'; 
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';

// CORRECCIÓN: Usamos getAllCredentials y saveAllCredentials según tus capturas
import { getAllCredentials, saveAllCredentials } from '../../storage/credentials'; 

export default function BackupManager() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const handleExport = async () => {
        try {
            const credentials = await getAllCredentials();
            if (!credentials || credentials.length === 0) {
                Alert.alert("Aviso", "No hay claves para exportar.");
                return;
            }
            const jsonData = JSON.stringify(credentials, null, 2);
            const fileUri = FileSystem.cacheDirectory + 'MasterKey_Backup.json';
            await FileSystem.writeAsStringAsync(fileUri, jsonData);
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
            }
        } catch (error) {
            Alert.alert("Error", "No se pudo generar el respaldo.");
        }
    };

    const handleImport = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true
            });

            if (result.canceled) return;

            const fileUri = result.assets[0].uri;
            const fileContent = await FileSystem.readAsStringAsync(fileUri);
            const importedData = JSON.parse(fileContent);

            if (Array.isArray(importedData)) {
                // Obtenemos las que ya tienes para no borrarlas
                const currentData = await getAllCredentials();
                
                // Combinamos las actuales con las nuevas (Importante: esto evita duplicados si tienen el mismo ID)
                const combinedData = [...currentData];
                
                importedData.forEach(newCred => {
                    const exists = combinedData.some(c => c.id === newCred.id);
                    if (!exists) combinedData.push(newCred);
                });

                // Guardamos la lista completa usando tu función saveAllCredentials
                await saveAllCredentials(combinedData);
                
                Alert.alert("Éxito", `Importación completada. Se añadieron las cuentas nuevas.`);
            } else {
                Alert.alert("Error", "El archivo no tiene el formato correcto.");
            }
        } catch (error) {
            Alert.alert("Error", "Hubo un problema al leer el archivo.");
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={[styles.button, { backgroundColor: isDark ? '#1E1E1E' : '#FFF', borderColor: isDark ? '#333' : '#EEE' }]} 
                onPress={handleExport}
            >
                <Ionicons name="cloud-upload-outline" size={22} color="#007BFF" />
                <Text style={[styles.text, { color: isDark ? '#FFF' : '#333' }]}>Exportar Respaldo</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.button, { backgroundColor: isDark ? '#1E1E1E' : '#FFF', borderColor: isDark ? '#333' : '#EEE', marginTop: 12 }]} 
                onPress={handleImport}
            >
                <Ionicons name="cloud-download-outline" size={22} color="#28A745" />
                <Text style={[styles.text, { color: isDark ? '#FFF' : '#333' }]}>Importar Respaldo</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginTop: 10 },
    button: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 14, borderWidth: 1, marginHorizontal: 5 },
    text: { marginLeft: 15, fontSize: 16, fontWeight: '700' },
});