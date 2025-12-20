// app/details/[id].tsx (Versión con CATEGORÍAS integrada)

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

import { getCredentialById, deleteCredential, updateCredential, Credential } from '@/storage/credentials'; 
import EditCredentialModal from '../components/EditCredentialModal'; 

// Añadimos 'category' a las llaves editables
type EditableKeys = 'accountName' | 'username' | 'password' | 'websiteUrl' | 'recoveryEmail' | 'notes' | 'category';

export default function CredentialDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    
    const [credential, setCredential] = useState<Credential | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingField, setEditingField] = useState<EditableKeys | ''>(''); 
    const [editingLabel, setEditingLabel] = useState('');
    
    const fieldMap: Record<EditableKeys, string> = {
        accountName: 'Nombre de Cuenta',
        username: 'Usuario',
        password: 'Contraseña',
        websiteUrl: 'URL del Sitio Web',
        recoveryEmail: 'Correo de Recuperación',
        notes: 'Notas Personales',
        category: 'Categoría'
    };
    
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
    
    const copyToClipboard = async (text: string | undefined, field: string) => {
        if (!text) {
             Alert.alert("Error", `El campo ${field} está vacío.`);
             return;
        }
        await Clipboard.setStringAsync(text);
        Alert.alert("Copiado", `${field} copiado al portapapeles.`);
    };

    const handleDelete = () => {
        Alert.alert(
            "Confirmar Eliminación",
            "¿Estás seguro de que quieres eliminar esta credencial?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            if (id) {
                                await deleteCredential(id);
                                router.back(); 
                            }
                        } catch (error) {
                            Alert.alert("Error", "No se pudo eliminar.");
                        }
                    }
                }
            ]
        );
    };

    const handleEditField = (fieldName: EditableKeys) => {
        if (!credential) return;
        setEditingField(fieldName);
        setEditingLabel(fieldMap[fieldName]);
        setIsModalVisible(true);
    };

    // Función mejorada para manejar actualizaciones rápidas (como categoría)
    const updateCredentialField = async (field: EditableKeys, value: string) => {
        if (!credential) return;
        const updated = { ...credential, [field]: value };
        try {
            await updateCredential(updated);
            setCredential(updated);
        } catch (e) {
            Alert.alert("Error", "No se pudo actualizar.");
        }
    };

    const handleSaveEdit = async (newValue: string) => {
        if (!credential || !editingField) return;
        await updateCredentialField(editingField, newValue);
        setIsModalVisible(false);
    };

    const HeaderButtons = () => (
        <View style={{ flexDirection: 'row', marginRight: 10 }}>
            <TouchableOpacity onPress={handleDelete} style={{ marginLeft: 15 }} disabled={!credential}>
                <Ionicons name="trash-outline" size={24} color={!credential ? '#ADB5BD' : '#DC3545'} />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ title: credential?.accountName || "Detalles", headerRight: HeaderButtons }} />
            
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007BFF" />
                </View>
            ) : credential ? (
                <ScrollView contentContainerStyle={styles.scrollContainer}> 
                    
                    {/* Tarjeta de Cuenta y SELECTOR DE CATEGORÍA */}
                    <View style={[styles.detailCard, styles.accountNameCard]}>
                        <Text style={styles.accountNameLabel}>Cuenta:</Text>
                        <View style={styles.accountNameContainer}>
                            <Text style={styles.accountNameText}>{credential.accountName}</Text>
                            <TouchableOpacity onPress={() => handleEditField('accountName')} style={styles.iconButton}>
                                <Ionicons name="pencil-outline" size={22} color="#007BFF" /> 
                            </TouchableOpacity>
                        </View>

                        {/* Selector de Categoría Rápido */}
                        <View style={styles.categoryPicker}>
                            <TouchableOpacity 
                                style={[styles.catBtn, credential.category === 'fav' && styles.catActiveFav]}
                                onPress={() => updateCredentialField('category', 'fav')}
                            >
                                <Ionicons name="star" size={18} color={credential.category === 'fav' ? "#FFF" : "#FFC107"} />
                                <Text style={[styles.catBtnText, credential.category === 'fav' && styles.textWhite]}>Fav</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.catBtn, credential.category === 'work' && styles.catActiveWork]}
                                onPress={() => updateCredentialField('category', 'work')}
                            >
                                <Ionicons name="briefcase" size={18} color={credential.category === 'work' ? "#FFF" : "#6f42c1"} />
                                <Text style={[styles.catBtnText, credential.category === 'work' && styles.textWhite]}>Trabajo</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.catBtn, (credential.category === 'none' || !credential.category) && styles.catActiveNone]}
                                onPress={() => updateCredentialField('category', 'none')}
                            >
                                <Ionicons name="remove-circle-outline" size={18} color={(credential.category === 'none' || !credential.category) ? "#FFF" : "#6C757D"} />
                                <Text style={[styles.catBtnText, (credential.category === 'none' || !credential.category) && styles.textWhite]}>Ninguna</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Usuario */}
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

                    {/* Contraseña */}
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
                                <Ionicons name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} size={20} color="#6C757D" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => copyToClipboard(credential.password, 'Contraseña')} style={styles.iconButton}>
                                <Ionicons name="copy-outline" size={20} color="#007BFF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                    {/* URL */}
                    <View style={styles.detailCard}>
                        <Text style={styles.detailLabel}>URL:</Text>
                        <View style={styles.detailValueContainer}>
                            <Text style={styles.detailValue}>{credential.websiteUrl || 'No definida'}</Text>
                            <TouchableOpacity onPress={() => handleEditField('websiteUrl')} style={styles.iconButton}>
                                <Ionicons name="pencil-outline" size={20} color="#6C757D" /> 
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Notas */}
                    <View style={styles.notesCard}>
                        <Text style={styles.detailLabel}>Notas:</Text>
                        <View style={styles.detailValueContainer}>
                            <Text style={styles.notesText}>{credential.notes || 'Sin notas adicionales'}</Text>
                            <TouchableOpacity onPress={() => handleEditField('notes')} style={styles.iconButton}>
                                <Ionicons name="pencil-outline" size={20} color="#6C757D" /> 
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                    <TouchableOpacity onPress={handleDelete} style={styles.deleteButtonBody}>
                        <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.deleteButtonText}>Eliminar Credencial</Text>
                    </TouchableOpacity>

                </ScrollView>
            ) : (
                <View style={styles.container}><Text style={styles.errorText}>Error al cargar.</Text></View>
            )}
            
            {credential && editingField && editingField !== 'category' && (
                <EditCredentialModal
                    isVisible={isModalVisible}
                    onClose={() => setIsModalVisible(false)}
                    onSave={handleSaveEdit}
                    fieldLabel={editingLabel}
                    initialValue={credential[editingField] || ''} 
                    isPassword={editingField === 'password'}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
    container: { flex: 1, padding: 20 },
    scrollContainer: { padding: 20, paddingTop: Platform.OS === 'ios' ? 20 : 40, paddingBottom: 40 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { fontSize: 18, color: '#DC3545', textAlign: 'center', marginTop: 50 },
    accountNameCard: { padding: 15, backgroundColor: '#E6F0FF', borderColor: '#007BFF', borderWidth: 1 },
    accountNameLabel: { fontSize: 12, color: '#0056b3', marginBottom: 2 },
    accountNameContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    accountNameText: { fontSize: 22, fontWeight: 'bold', color: '#007BFF', flex: 1 },
    categoryPicker: { flexDirection: 'row', marginTop: 15, justifyContent: 'space-between' },
    catBtn: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 8, backgroundColor: '#FFF', flex: 0.3, justifyContent: 'center', borderWidth: 1, borderColor: '#D0E3FF' },
    catBtnText: { fontSize: 11, fontWeight: '700', marginLeft: 4, color: '#495057' },
    catActiveFav: { backgroundColor: '#FFC107', borderColor: '#FFC107' },
    catActiveWork: { backgroundColor: '#6f42c1', borderColor: '#6f42c1' },
    catActiveNone: { backgroundColor: '#6C757D', borderColor: '#6C757D' },
    textWhite: { color: '#FFF' },
    detailCard: { backgroundColor: '#FFFFFF', padding: 15, borderRadius: 12, marginBottom: 12, elevation: 2 },
    detailLabel: { fontSize: 13, color: '#6C757D', marginBottom: 4 },
    detailValueContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    detailValue: { fontSize: 16, fontWeight: '600', color: '#343A40', flex: 1 },
    iconButton: { marginLeft: 12 },
    notesCard: { backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginTop: 5, borderWidth: 1, borderColor: '#EEE' },
    notesText: { fontSize: 15, color: '#495057', lineHeight: 22, flex: 1 },
    deleteButtonBody: { flexDirection: 'row', backgroundColor: '#DC3545', padding: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 30 },
    deleteButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16, marginLeft: 10 }
});