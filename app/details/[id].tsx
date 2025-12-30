import React, { useState, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    SafeAreaView, 
    ActivityIndicator, 
    TouchableOpacity, 
    Alert, 
    ScrollView,
    Modal,
    useColorScheme 
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard'; 
import * as LocalAuthentication from 'expo-local-authentication'; 

import { getCredentialById, deleteCredential, updateCredential, Credential } from '@/storage/credentials'; 
import EditCredentialModal from '../components/EditCredentialModal'; 

type EditableKeys = 'accountName' | 'alias' | 'username' | 'password' | 'websiteUrl' | 'recoveryEmail' | 'notes' | 'category';

const CATEGORIES_LIST = [
    { id: 'fav', label: 'Recurrentes', icon: 'star', color: '#FFC107' },
    { id: 'personal', label: 'Personal', icon: 'person', color: '#20c997' },
    { id: 'work', label: 'Trabajo', icon: 'briefcase', color: '#6f42c1' },
    { id: 'pet', label: 'Mascota', icon: 'paw', color: '#fd7e14' },
    { id: 'mobility', label: 'Movilidad', icon: 'car-sport', color: '#dc3545' },
    { id: 'entertainment', label: 'Entretenimiento', icon: 'play-circle', color: '#e83e8c' },
] as const;

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
        specialText: isDark ? '#3DA9FC' : '#0056b3',
        placeholder: isDark ? '#666' : '#ADB5BD'
    };
    
    const [credential, setCredential] = useState<Credential | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingField, setEditingField] = useState<EditableKeys | ''>(''); 
    const [editingLabel, setEditingLabel] = useState('');
    const [isUnlocked, setIsUnlocked] = useState(false); 
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const fieldMap: Record<EditableKeys, string> = {
        accountName: 'Nombre de Cuenta',
        alias: 'Alias',
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
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Acceso a la cuenta',
                fallbackLabel: 'Usar PIN',
            });
            if (result.success) setIsUnlocked(true);
            else router.back();
        } catch (error) {
            console.error("Error cargando detalles:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    useFocusEffect(useCallback(() => {
        fetchCredential();
        return () => { setIsUnlocked(false); setHasUnsavedChanges(false); };
    }, [id]));

    const updateCredentialField = (field: EditableKeys, value: string) => {
        setCredential(prev => {
            if (!prev) return null;
            return { ...prev, [field]: value };
        });
        setHasUnsavedChanges(true);
    };

    const handleSaveEdit = (newValue: string) => {
        if (!editingField) return;
        updateCredentialField(editingField, newValue);
        setIsModalVisible(false);
    };

    const handleSaveChanges = async () => {
        if (!credential) return;
        try {
            await updateCredential(credential);
            setHasUnsavedChanges(false);
            Alert.alert("Bunker", "Cambios guardados correctamente", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (e) {
            Alert.alert("Error", "No se pudieron guardar los cambios.");
        }
    };

    const copyToClipboard = async (text: string | undefined, field: string) => {
        if (!text) return;
        await Clipboard.setStringAsync(text);
        Alert.alert("Copiado", `${field} copiado.`);
    };

    const handleDelete = () => {
        Alert.alert("Eliminar", "¿Estás seguro de que quieres borrar esta cuenta?", [
            { text: "Cancelar", style: "cancel" },
            { text: "Eliminar", style: "destructive", onPress: async () => {
                if (id) { await deleteCredential(id); router.replace('/(tabs)'); }
            }}
        ]);
    };

    const selectedCategory = CATEGORIES_LIST.find(c => c.id === credential?.category) || CATEGORIES_LIST[1];

    if (isLoading || !isUnlocked) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background, justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ title: "Detalles", headerShadowVisible: false }} />
            
            {credential ? (
                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}> 
                    
                    {/* ENCABEZADO AZUL: NOMBRE Y SELECTOR DE CATEGORÍA */}
                    <View style={[styles.detailCard, { backgroundColor: theme.specialCard, borderColor: theme.primary, borderWidth: 1 }]}>
                        <Text style={[styles.accountNameLabel, { color: theme.specialText }]}>Cuenta:</Text>
                        <View style={styles.accountNameContainer}>
                            <Text style={[styles.accountNameText, { color: theme.primary }]}>{credential.accountName}</Text>
                            <TouchableOpacity onPress={() => { setEditingField('accountName'); setEditingLabel(fieldMap['accountName']); setIsModalVisible(true); }} style={styles.iconButton}>
                                <Ionicons name="pencil-outline" size={22} color={theme.primary} /> 
                            </TouchableOpacity>
                        </View>

                        {/* EL SELECTOR AHORA DENTRO DEL RECUADRO AZUL */}
                        <Text style={[styles.innerLabel, { color: theme.specialText }]}>Categoría:</Text>
                        <TouchableOpacity 
                            style={[styles.categoryPickerToggle, { backgroundColor: theme.card, borderColor: theme.border }]}
                            onPress={() => setShowCategoryModal(true)}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name={selectedCategory.icon as any} size={20} color={selectedCategory.color} />
                                <Text style={[styles.categoryValueText, { color: theme.text }]}> {selectedCategory.label}</Text>
                            </View>
                            <Ionicons name="chevron-down" size={18} color={theme.subText} />
                        </TouchableOpacity>
                    </View>

                    {/* ALIAS */}
                    <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
                        <Text style={[styles.detailLabel, { color: theme.subText }]}>Alias:</Text>
                        <View style={styles.detailValueContainer}>
                            <Text style={[styles.detailValue, { color: theme.text }]}>{credential.alias || 'Sin alias'}</Text>
                            <TouchableOpacity onPress={() => { setEditingField('alias'); setEditingLabel(fieldMap['alias']); setIsModalVisible(true); }} style={styles.iconButton}>
                                <Ionicons name="pencil-outline" size={20} color={theme.subText} /> 
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* USUARIO */}
                    <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
                        <Text style={[styles.detailLabel, { color: theme.subText }]}>Usuario:</Text>
                        <View style={styles.detailValueContainer}>
                            <Text style={[styles.detailValue, { color: theme.text }]}>{credential.username}</Text>
                            <TouchableOpacity onPress={() => { setEditingField('username'); setEditingLabel(fieldMap['username']); setIsModalVisible(true); }} style={styles.iconButton}>
                                <Ionicons name="pencil-outline" size={20} color={theme.subText} /> 
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => copyToClipboard(credential.username, 'Usuario')} style={styles.iconButton}>
                                <Ionicons name="copy-outline" size={20} color={theme.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                    {/* CONTRASEÑA */}
                    <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
                        <Text style={[styles.detailLabel, { color: theme.subText }]}>Contraseña:</Text>
                        <View style={styles.detailValueContainer}>
                            <Text style={[styles.detailValue, { color: theme.text }]}>
                                {isPasswordVisible ? credential.password : '••••••••••••'}
                            </Text>
                            <TouchableOpacity onPress={() => { setEditingField('password'); setEditingLabel(fieldMap['password']); setIsModalVisible(true); }} style={styles.iconButton}>
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
                    
                    {/* URL DEL SITIO */}
                    <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
                        <Text style={[styles.detailLabel, { color: theme.subText }]}>URL Sitio Web:</Text>
                        <View style={styles.detailValueContainer}>
                            <Text style={[styles.detailValue, { color: theme.text }]}>{credential.websiteUrl || 'No definida'}</Text>
                            <TouchableOpacity onPress={() => { setEditingField('websiteUrl'); setEditingLabel(fieldMap['websiteUrl']); setIsModalVisible(true); }} style={styles.iconButton}>
                                <Ionicons name="pencil-outline" size={20} color={theme.subText} /> 
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* NOTAS */}
                    <View style={[styles.detailCard, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
                        <Text style={[styles.detailLabel, { color: theme.subText }]}>Notas:</Text>
                        <View style={styles.detailValueContainer}>
                            <Text style={[styles.notesText, { color: theme.text }]}>{credential.notes || 'Sin notas'}</Text>
                            <TouchableOpacity onPress={() => { setEditingField('notes'); setEditingLabel(fieldMap['notes']); setIsModalVisible(true); }} style={styles.iconButton}>
                                <Ionicons name="pencil-outline" size={20} color={theme.subText} /> 
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                    {/* BOTONES DE ACCIÓN */}
                    <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity onPress={handleDelete} style={[styles.actionButton, styles.deleteButton]}>
                            <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                            <Text style={styles.actionButtonText}>Eliminar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            onPress={handleSaveChanges} 
                            style={[styles.actionButton, styles.saveButton, !hasUnsavedChanges && styles.disabled]}
                            disabled={!hasUnsavedChanges}
                        >
                            <Ionicons name="shield-checkmark-outline" size={20} color="#FFFFFF" />
                            <Text style={styles.actionButtonText}>Guardar</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            ) : null}

            {/* MODAL PARA CAMBIAR CATEGORÍA */}
            <Modal visible={showCategoryModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Cambiar Categoría</Text>
                        {CATEGORIES_LIST.map((item) => (
                            <TouchableOpacity 
                                key={item.id}
                                style={styles.categoryItem}
                                onPress={() => {
                                    updateCredentialField('category', item.id);
                                    setShowCategoryModal(false);
                                }}
                            >
                                <Ionicons name={item.icon as any} size={24} color={item.color} />
                                <Text style={[styles.categoryItemText, { color: theme.text }]}>{item.label}</Text>
                                {credential?.category === item.id && <Ionicons name="checkmark-circle" size={24} color={theme.primary} />}
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.closeModal} onPress={() => setShowCategoryModal(false)}>
                            <Text style={{ color: theme.primary, fontWeight: 'bold' }}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            
            {isModalVisible && credential && editingField && (
                <EditCredentialModal
                    isVisible={isModalVisible}
                    onClose={() => setIsModalVisible(false)}
                    onSave={handleSaveEdit}
                    fieldLabel={editingLabel}
                    initialValue={(credential[editingField as EditableKeys] as string) || ''} 
                    isPassword={editingField === 'password'}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    scrollContainer: { padding: 20, paddingTop: 30, paddingBottom: 60 },
    accountNameLabel: { fontSize: 11, marginBottom: 2, textTransform: 'uppercase', fontWeight: 'bold', opacity: 0.8 },
    accountNameContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    accountNameText: { fontSize: 24, fontWeight: '800', flex: 1 },
    innerLabel: { fontSize: 11, marginBottom: 6, textTransform: 'uppercase', fontWeight: 'bold', opacity: 0.8 },
    detailCard: { padding: 15, borderRadius: 16, marginBottom: 12 },
    detailLabel: { fontSize: 13, marginBottom: 6, fontWeight: '600' },
    detailValueContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    detailValue: { fontSize: 16, fontWeight: '500', flex: 1 },
    categoryPickerToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderRadius: 12, borderWidth: 1 },
    categoryValueText: { fontSize: 15, fontWeight: '700' },
    iconButton: { padding: 5, marginLeft: 10 },
    notesText: { fontSize: 15, lineHeight: 22, flex: 1 },
    actionButtonsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, gap: 12 },
    actionButton: { flex: 1, flexDirection: 'row', padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    deleteButton: { backgroundColor: '#DC3545' },
    saveButton: { backgroundColor: '#007BFF' },
    disabled: { opacity: 0.5 },
    actionButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '85%', borderRadius: 20, padding: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    categoryItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 0.5, borderBottomColor: '#333' },
    categoryItemText: { flex: 1, marginLeft: 15, fontSize: 16, fontWeight: '600' },
    closeModal: { marginTop: 20, alignItems: 'center', padding: 10 }
});