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
    ScrollView,
    useColorScheme 
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard'; 
import * as LocalAuthentication from 'expo-local-authentication'; // PARA EL ACCESO

// Importación de storage
import { getCredentialById, deleteCredential, updateCredential, Credential } from '@/storage/credentials'; 
import EditCredentialModal from '../components/EditCredentialModal'; 

type EditableKeys = 'accountName' | 'username' | 'password' | 'websiteUrl' | 'recoveryEmail' | 'notes' | 'category';

export default function CredentialDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const colorScheme = useColorScheme();
    
    const isDark = colorScheme === 'dark';
    const theme = {
        background: isDark ? '#121212' : '#F8F9FA',
        text: isDark ? '#F8F9FA' : '#212529',
        card: isDark ? '#1E1E1E' : '#FFFFFF',
        subText: isDark ? '#ADB5BD' : '#6C757D',
        border: isDark ? '#333333' : '#E9ECEF',
        primary: isDark ? '#3DA9FC' : '#007BFF',
        specialCard: isDark ? '#1A2A3A' : '#E6F0FF', 
        specialText: isDark ? '#3DA9FC' : '#0056b3'
    };
    
    const [credential, setCredential] = useState<Credential | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingField, setEditingField] = useState<EditableKeys | ''>(''); 
    const [editingLabel, setEditingLabel] = useState('');
    const [isUnlocked, setIsUnlocked] = useState(false); // PARA EL ACCESO

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
            setCredential(data || null);

            // SOLO PIDE HUELLA AL ENTRAR
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Acceso a la cuenta',
                fallbackLabel: 'Usar PIN',
            });

            if (result.success) {
                setIsUnlocked(true);
            } else {
                router.back(); // Si falla o cancela, regresa
            }
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
            return () => setIsUnlocked(false);
        }, [id])
    );
    
    const copyToClipboard = async (text: string | undefined, field: string) => {
        if (!text) {
             Alert.alert("Aviso", `El campo ${field} está vacío.`);
             return;
        }
        await Clipboard.setStringAsync(text);
        Alert.alert("Copiado", `${field} copiado al portapapeles.`);
    };

    const handleDelete = () => {
        Alert.alert(
            "Eliminar",
            "¿Estás seguro de que quieres borrar esta cuenta?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            if (id) {
                                await deleteCredential(id);
                                router.replace('/(tabs)'); 
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
        <TouchableOpacity onPress={handleDelete} style={{ marginRight: 15 }} disabled={!credential}>
            <Ionicons name="trash-outline" size={24} color={!credential ? '#ADB5BD' : '#DC3545'} />
        </TouchableOpacity>
    );

    // Pantalla de espera mientras se autentica
    if (isLoading || !isUnlocked) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background, justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ 
                title: "Detalles", 
                headerRight: HeaderButtons,
                headerStyle: { backgroundColor: theme.background },
                headerTintColor: theme.text,
                headerShadowVisible: false
            }} />
            
            {credential ? (
                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}> 
                    <View style={[styles.detailCard, { backgroundColor: theme.specialCard, borderColor: theme.primary, borderWidth: 1 }]}>
                        <Text style={[styles.accountNameLabel, { color: theme.specialText }]}>Cuenta:</Text>
                        <View style={styles.accountNameContainer}>
                            <Text style={[styles.accountNameText, { color: theme.primary }]}>{credential.accountName}</Text>
                            <TouchableOpacity onPress={() => handleEditField('accountName')} style={styles.iconButton}>
                                <Ionicons name="pencil-outline" size={22} color={theme.primary} /> 
                            </TouchableOpacity>
                        </View>

                        <View style={styles.categoryPicker}>
                            <TouchableOpacity 
                                style={[styles.catBtn, { backgroundColor: theme.card, borderColor: theme.border }, credential.category === 'fav' && styles.catActiveFav]}
                                onPress={() => updateCredentialField('category', 'fav')}
                            >
                                <Ionicons name="star" size={16} color={credential.category === 'fav' ? "#FFF" : "#FFC107"} />
                                <Text style={[styles.catBtnText, { color: theme.subText }, credential.category === 'fav' && styles.textWhite]}>Fav</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.catBtn, { backgroundColor: theme.card, borderColor: theme.border }, credential.category === 'work' && styles.catActiveWork]}
                                onPress={() => updateCredentialField('category', 'work')}
                            >
                                <Ionicons name="briefcase" size={16} color={credential.category === 'work' ? "#FFF" : "#6f42c1"} />
                                <Text style={[styles.catBtnText, { color: theme.subText }, credential.category === 'work' && styles.textWhite]}>Trabajo</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.catBtn, { backgroundColor: theme.card, borderColor: theme.border }, (credential.category === 'none' || !credential.category) && styles.catActiveNone]}
                                onPress={() => updateCredentialField('category', 'none')}
                            >
                                <Ionicons name="remove-circle-outline" size={16} color={(credential.category === 'none' || !credential.category) ? "#FFF" : "#6C757D"} />
                                <Text style={[styles.catBtnText, { color: theme.subText }, (credential.category === 'none' || !credential.category) && styles.textWhite]}>Ninguna</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
                        <Text style={[styles.detailLabel, { color: theme.subText }]}>Usuario:</Text>
                        <View style={styles.detailValueContainer}>
                            <Text style={[styles.detailValue, { color: theme.text }]}>{credential.username}</Text>
                            <TouchableOpacity onPress={() => handleEditField('username')} style={styles.iconButton}>
                                <Ionicons name="pencil-outline" size={20} color={theme.subText} /> 
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => copyToClipboard(credential.username, 'Usuario')} style={styles.iconButton}>
                                <Ionicons name="copy-outline" size={20} color={theme.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
                        <Text style={[styles.detailLabel, { color: theme.subText }]}>Contraseña:</Text>
                        <View style={styles.detailValueContainer}>
                            <Text style={[styles.detailValue, { color: theme.text }]}>
                                {isPasswordVisible ? credential.password : '••••••••••••••••'}
                            </Text>
                            <TouchableOpacity onPress={() => handleEditField('password')} style={styles.iconButton}>
                                <Ionicons name="pencil-outline" size={20} color={theme.subText} /> 
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.iconButton}>
                                <Ionicons name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.subText} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => copyToClipboard(credential.password, 'Contraseña')} style={styles.iconButton}>
                                <Ionicons name="copy-outline" size={20} color={theme.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                    <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
                        <Text style={[styles.detailLabel, { color: theme.subText }]}>URL Sitio Web:</Text>
                        <View style={styles.detailValueContainer}>
                            <Text style={[styles.detailValue, { color: theme.text }]}>{credential.websiteUrl || 'No definida'}</Text>
                            <TouchableOpacity onPress={() => handleEditField('websiteUrl')} style={styles.iconButton}>
                                <Ionicons name="pencil-outline" size={20} color={theme.subText} /> 
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={[styles.notesCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={[styles.detailLabel, { color: theme.subText }]}>Notas Personales:</Text>
                        <View style={styles.detailValueContainer}>
                            <Text style={[styles.notesText, { color: theme.text }]}>{credential.notes || 'Sin notas adicionales'}</Text>
                            <TouchableOpacity onPress={() => handleEditField('notes')} style={styles.iconButton}>
                                <Ionicons name="pencil-outline" size={20} color={theme.subText} /> 
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                    <TouchableOpacity onPress={handleDelete} style={styles.deleteButtonBody}>
                        <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.deleteButtonText}>Eliminar Credencial</Text>
                    </TouchableOpacity>
                </ScrollView>
            ) : null}
            
            {isModalVisible && editingField && editingField !== 'category' && credential && (
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
    safeArea: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    scrollContainer: { padding: 20, paddingBottom: 60, paddingTop: 60 },
    errorText: { fontSize: 18, textAlign: 'center' },
    accountNameLabel: { fontSize: 12, marginBottom: 2, textTransform: 'uppercase', fontWeight: 'bold' },
    accountNameContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    accountNameText: { fontSize: 24, fontWeight: '800', flex: 1 },
    categoryPicker: { flexDirection: 'row', marginTop: 15, justifyContent: 'space-between' },
    catBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderRadius: 10, flex: 0.31, justifyContent: 'center', borderWidth: 1 },
    catBtnText: { fontSize: 11, fontWeight: '700', marginLeft: 4 },
    catActiveFav: { backgroundColor: '#FFC107', borderColor: '#FFC107' },
    catActiveWork: { backgroundColor: '#6f42c1', borderColor: '#6f42c1' },
    catActiveNone: { backgroundColor: '#6C757D', borderColor: '#6C757D' },
    textWhite: { color: '#FFF' },
    detailCard: { padding: 18, borderRadius: 16, marginBottom: 12, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
    detailLabel: { fontSize: 13, marginBottom: 6, fontWeight: '600' },
    detailValueContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    detailValue: { fontSize: 16, fontWeight: '500', flex: 1 },
    iconButton: { padding: 5, marginLeft: 10 },
    notesCard: { padding: 18, borderRadius: 16, marginTop: 5, borderWidth: 1 },
    notesText: { fontSize: 15, lineHeight: 22, flex: 1 },
    deleteButtonBody: { flexDirection: 'row', backgroundColor: '#DC3545', padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 35 },
    deleteButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16, marginLeft: 10 }
});