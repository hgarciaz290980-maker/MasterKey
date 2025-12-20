// app/details/[id].tsx (Versión FINAL y ESTABLE sin errores de Sintaxis/Tipado)

import React, { useState, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    SafeAreaView, 
    ActivityIndicator, 
    TouchableOpacity, 
    Alert, 
    Platform, 
    ScrollView 
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard'; 

// Importación y componentes necesarios (asumiendo que EditCredentialModal existe)
import { getCredentialById, deleteCredential, updateCredential, Credential } from '@/storage/credentials'; 
import EditCredentialModal from '../components/EditCredentialModal'; 

// Definición de las claves que SÍ se pueden editar
type EditableKeys = 'accountName' | 'username' | 'password' | 'websiteUrl' | 'recoveryEmail' | 'notes';


export default function CredentialDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    
    const [credential, setCredential] = useState<Credential | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    // Estados para el Modal de Edición
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingField, setEditingField] = useState<EditableKeys | ''>(''); 
    const [editingLabel, setEditingLabel] = useState('');
    
    // Mapeo de campos a etiquetas (CORREGIDO)
    const fieldMap: Record<EditableKeys, string> = {
        accountName: 'Nombre de Cuenta',
        username: 'Usuario',
        password: 'Contraseña',
        websiteUrl: 'URL del Sitio Web',
        recoveryEmail: 'Correo de Recuperación',
        notes: 'Notas Personales',
    };
    
    // 1. Cargar la Credencial
    const fetchCredential = async () => {
        if (!id) return;

        setIsLoading(true);
        try {
            const data = await getCredentialById(id); 
            setCredential(data);
        } catch (error) {
            console.error("Error cargando detalles:", error);
            setCredential(null);
        } finally {
            setIsLoading(false);
        }
    };
    
    useFocusEffect(
        useCallback(() => {
            fetchCredential();
            return () => {};
        }, [id])
    );
    
    // 2. Funciones de acción
    const copyToClipboard = async (text: string | undefined, field: string) => {
        if (!text) {
             Alert.alert("Error", `El campo ${field} está vacío y no se puede copiar.`);
             return;
        }
        await Clipboard.setStringAsync(text);
        Alert.alert("Copiado", `${field} copiado al portapapeles.`);
    };

    const handleDelete = () => {
        Alert.alert(
            "Confirmar Eliminación",
            "¿Estás seguro de que quieres eliminar esta credencial de forma permanente?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            if (id) {
                                await deleteCredential(id);
                                Alert.alert("Éxito", "Credencial eliminada.");
                                router.back(); 
                            }
                        } catch (error) {
                            Alert.alert("Error", "No se pudo eliminar la credencial.");
                        }
                    }
                }
            ]
        );
    };

    // 3. Lógica de Edición (Función clave)
    const handleEditField = (fieldName: EditableKeys) => {
        if (!credential) return;

        setEditingField(fieldName);
        setEditingLabel(fieldMap[fieldName]);
        setIsModalVisible(true);
    };

    const handleSaveEdit = async (newValue: string) => {
        if (!credential || !editingField) return;

        const updatedCredential: Credential = {
            ...credential,
            [editingField]: newValue
        };

        try {
            await updateCredential(updatedCredential);
            await fetchCredential(); 
            Alert.alert("Éxito", `${fieldMap[editingField]} actualizado correctamente.`);
        } catch (e) {
            throw new Error("No se pudo guardar la actualización.");
        }
    };


    // Componente de Botones del Header (SOLO ELIMINAR, TIPADO CORREGIDO)
    const HeaderButtons = () => {
        const disabled: boolean = !credential; // Tipado explícito para evitar ts(7005)
        const deleteColor = disabled ? '#ADB5BD' : '#DC3545';

        return (
            <View style={{ flexDirection: 'row', marginRight: 10 }}>
                {/* Botón de Eliminar (Basura) */}
                <TouchableOpacity onPress={handleDelete} style={{ marginLeft: 15 }} disabled={disabled}>
                    <Ionicons name="trash-outline" size={24} color={deleteColor} />
                </TouchableOpacity>
            </View>
        );
    };


    // --- RENDERIZACIÓN ---
    const title = credential?.accountName || (isLoading ? "Cargando..." : "Detalles");
    
    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen 
                options={{ 
                    title: title,
                    headerRight: HeaderButtons, 
                }} 
            />
            
            {/* Pantalla de Carga y Error se mantienen */}
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007BFF" />
                    <Text style={styles.loadingText}>Cargando detalles...</Text>
                </View>
            )}

            {!isLoading && !credential && (
                <View style={styles.container}>
                    <Text style={styles.errorText}>Credencial no encontrada o error de carga.</Text>
                </View>
            )}

            {/* Pantalla de Detalles */}
            {!isLoading && credential && (
                <ScrollView contentContainerStyle={styles.scrollContainer} style={[Platform.OS === 'android' && styles.androidPaddingTop]}> 
                    
                    {/* Nombre de la Cuenta - También editable */}
                    <View style={[styles.detailCard, styles.accountNameCard]}>
                        <Text style={styles.accountNameLabel}>Cuenta:</Text>
                        <View style={styles.accountNameContainer}>
                            <Text style={styles.accountNameText}>{credential.accountName}</Text>
                            <TouchableOpacity onPress={() => handleEditField('accountName')} style={styles.iconButton}>
                                <Ionicons name="pencil-outline" size={22} color="#007BFF" /> 
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* --- Usuario --- */}
                    <View style={styles.detailCard}>
                        <Text style={styles.detailLabel}>Usuario:</Text>
                        <View style={styles.detailValueContainer}>
                            <Text style={styles.detailValue}>{credential.username}</Text>
                            <TouchableOpacity onPress={() => handleEditField('username')} style={styles.iconButton}>
                                <Ionicons name="pencil-outline" size={20} color="#6C757D" /> 
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => copyToClipboard(credential.username, 'Usuario')} style={styles.iconButton}>
                                <Ionicons name="copy-outline" size={20} color="#007BFF" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* --- Contraseña --- */}
                    <View style={styles.detailCard}>
                        <Text style={styles.detailLabel}>Contraseña:</Text>
                        <View style={styles.detailValueContainer}>
                            <Text style={styles.detailValue}>
                                {isPasswordVisible ? credential.password : '••••••••••••••••'}
                            </Text>
                            <TouchableOpacity onPress={() => handleEditField('password')} style={styles.iconButton}>
                                <Ionicons name="pencil-outline" size={20} color="#6C757D" /> 
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.iconButton}>
                                <Ionicons 
                                    name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} 
                                    size={20} 
                                    color="#6C757D" 
                                />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => copyToClipboard(credential.password, 'Contraseña')} style={styles.iconButton}>
                                <Ionicons name="copy-outline" size={20} color="#007BFF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                    {/* --- URL del Sitio Web (Opcional) --- */}
                    {credential.websiteUrl !== undefined && (
                        <View style={styles.detailCard}>
                            <Text style={styles.detailLabel}>URL:</Text>
                            <View style={styles.detailValueContainer}>
                                <Text style={styles.detailValue}>{credential.websiteUrl}</Text>
                                <TouchableOpacity onPress={() => handleEditField('websiteUrl')} style={styles.iconButton}>
                                    <Ionicons name="pencil-outline" size={20} color="#6C757D" /> 
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => copyToClipboard(credential.websiteUrl, 'URL')} style={styles.iconButton}>
                                    <Ionicons name="copy-outline" size={20} color="#007BFF" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* --- Correo de Recuperación (Opcional) --- */}
                    {credential.recoveryEmail !== undefined && (
                        <View style={styles.detailCard}>
                            <Text style={styles.detailLabel}>Correo de Recuperación:</Text>
                            <View style={styles.detailValueContainer}>
                                <Text style={styles.detailValue}>{credential.recoveryEmail}</Text>
                                <TouchableOpacity onPress={() => handleEditField('recoveryEmail')} style={styles.iconButton}>
                                    <Ionicons name="pencil-outline" size={20} color="#6C757D" /> 
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => copyToClipboard(credential.recoveryEmail, 'Correo')} style={styles.iconButton}>
                                    <Ionicons name="copy-outline" size={20} color="#007BFF" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* --- Notas Personales (Opcional) --- */}
                    {credential.notes !== undefined && (
                        <View style={styles.notesCard}>
                            <Text style={styles.detailLabel}>Notas:</Text>
                            <View style={styles.detailValueContainer}>
                                <Text style={styles.notesText}>{credential.notes}</Text>
                                <TouchableOpacity onPress={() => handleEditField('notes')} style={styles.iconButton}>
                                    <Ionicons name="pencil-outline" size={20} color="#6C757D" /> 
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    
                    {/* --- Botón de ELIMINAR en el Cuerpo --- */}
                    <TouchableOpacity onPress={handleDelete} style={styles.deleteButtonBody}>
                        <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.deleteButtonText}>Eliminar Credencial</Text>
                    </TouchableOpacity>

                </ScrollView>
            )}
            
            {/* Modal de Edición (Fuera de la ScrollView) */}
            {credential && editingField && (
                <EditCredentialModal
                    isVisible={isModalVisible}
                    onClose={() => setIsModalVisible(false)}
                    onSave={handleSaveEdit}
                    fieldLabel={editingLabel}
                    // Accedemos al valor actual de forma segura
                    initialValue={credential[editingField]} 
                    isPassword={editingField === 'password'}
                />
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
        padding: 20,
    },
    androidPaddingTop: {
        paddingTop: 10, 
    },
    scrollContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#6C757D',
    },
    errorText: {
        fontSize: 18,
        color: '#DC3545',
        textAlign: 'center',
        marginTop: 50,
    },
    
    // Estilo para el nombre de la cuenta (ajustado para la edición)
    accountNameCard: {
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: '#E6F0FF',
        borderColor: '#007BFF',
        borderWidth: 1,
    },
    accountNameLabel: {
        fontSize: 14,
        color: '#0056b3',
        marginBottom: 5,
    },
    accountNameContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    accountNameText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#007BFF',
        flex: 1,
    },

    detailCard: {
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    detailLabel: {
        fontSize: 14,
        color: '#6C757D',
        marginBottom: 5,
    },
    detailValueContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailValue: {
        fontSize: 18,
        fontWeight: '600',
        color: '#343A40',
        flex: 1, 
    },
    iconButton: {
        marginLeft: 15,
    },
    notesCard: {
        backgroundColor: '#E9ECEF',
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
    },
    notesText: {
        fontSize: 16,
        color: '#495057',
        lineHeight: 24,
        flex: 1,
    },
    deleteButtonBody: { 
        flexDirection: 'row',
        backgroundColor: '#DC3545',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
    },
    deleteButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 10,
    }
});