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
    Switch,
    TextInput,
    useColorScheme,
    Platform
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard'; 
import * as LocalAuthentication from 'expo-local-authentication'; 

// IMPORTACIÓN SEGURA PARA EVITAR EL ERROR DE "RNCDatePicker"
let DateTimePicker: any = null;
try {
    DateTimePicker = require('@react-native-community/datetimepicker').default;
} catch (e) {
    console.log("Modo manual activado: DateTimePicker no disponible.");
}

import { getCredentialById, deleteCredential, updateCredential, Credential } from '@/storage/credentials'; 
import { scheduleReminder } from '@/storage/notifications'; 
import EditCredentialModal from '../components/EditCredentialModal'; 

type EditableKeys = 'accountName' | 'alias' | 'username' | 'password' | 'websiteUrl' | 'notes' | 'category' | 'reminderNote';

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
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingField, setEditingField] = useState<EditableKeys | ''>(''); 
    const [editingLabel, setEditingLabel] = useState('');
    const [isUnlocked, setIsUnlocked] = useState(false); 
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [manualDate, setManualDate] = useState('');

    const fieldMap: Record<EditableKeys, string> = {
        accountName: 'Nombre de Cuenta',
        alias: 'Alias',
        username: 'Usuario',
        password: 'Contraseña',
        websiteUrl: 'URL del Sitio Web',
        notes: 'Notas Personales',
        category: 'Categoría',
        reminderNote: 'Nota del Recordatorio'
    };

    // --- FUNCIONES DE ACCIÓN ---
    const updateField = (field: EditableKeys, value: any) => {
        setCredential(prev => {
            if (!prev) return null;
            return { ...prev, [field]: value };
        });
        setHasUnsavedChanges(true);
    };

    const handleSaveEdit = (newValue: string) => {
        if (!editingField) return;
        updateField(editingField, newValue);
        setIsModalVisible(false);
    };

    // Lógica para poner diagonales automáticas (DD/MM/AAAA)
    const handleManualDateChange = (text: string) => {
        let cleaned = text.replace(/\D/g, ''); // Solo números
        let formatted = cleaned;
        
        if (cleaned.length > 2) {
            formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
        }
        if (cleaned.length > 4) {
            formatted = formatted.slice(0, 5) + '/' + cleaned.slice(4, 8);
        }
        
        setManualDate(formatted);

        if (formatted.length === 10) {
            const [day, month, year] = formatted.split('/').map(Number);
            const date = new Date(year, month - 1, day);
            if (!isNaN(date.getTime())) {
                updateField('reminderDate' as any, date.toISOString());
            }
        }
    };

    const fetchCredential = async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const data = await getCredentialById(id); 
            setCredential(data || null);
            if (data?.reminderDate) {
                const d = new Date(data.reminderDate);
                setManualDate(`${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`);
            }
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

    const handleSaveChanges = async () => {
        if (!credential) return;
        try {
            await updateCredential(credential);
            if (credential.hasReminder && credential.reminderDate) {
                const dateObj = new Date(credential.reminderDate);
                if (dateObj > new Date()) {
                    await scheduleReminder(credential.accountName, credential.reminderNote || 'Recordatorio Bunker-K', dateObj);
                }
            }
            setHasUnsavedChanges(false);
            Alert.alert("Éxito", "Cambios guardados", [{ text: "OK", onPress: () => router.back() }]);
        } catch (e) {
            Alert.alert("Error", "No se pudo guardar.");
        }
    };

    const copyToClipboard = async (text: string | undefined, field: string) => {
        if (!text) return;
        await Clipboard.setStringAsync(text);
        Alert.alert("Copiado", `${field} copiado.`);
    };

    const handleDelete = () => {
        Alert.alert("Eliminar", "¿Borrar cuenta?", [
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
                    
                    {/* CABECERA */}
                    <View style={[styles.detailCard, { backgroundColor: theme.specialCard, borderColor: theme.primary, borderWidth: 1 }]}>
                        <Text style={[styles.accountNameLabel, { color: theme.specialText }]}>Cuenta:</Text>
                        <View style={styles.accountNameContainer}>
                            <Text style={[styles.accountNameText, { color: theme.primary }]}>{credential.accountName}</Text>
                            <TouchableOpacity onPress={() => { setEditingField('accountName'); setEditingLabel(fieldMap['accountName']); setIsModalVisible(true); }} style={styles.iconButton}>
                                <Ionicons name="pencil-outline" size={22} color={theme.primary} /> 
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.innerLabel, { color: theme.specialText }]}>Categoría:</Text>
                        <TouchableOpacity style={[styles.categoryPickerToggle, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => setShowCategoryModal(true)}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name={selectedCategory.icon as any} size={20} color={selectedCategory.color} />
                                <Text style={[styles.categoryValueText, { color: theme.text }]}> {selectedCategory.label}</Text>
                            </View>
                            <Ionicons name="chevron-down" size={18} color={theme.subText} />
                        </TouchableOpacity>
                    </View>

                    {/* CAMPOS DE DATOS */}
                    {[
                        { label: 'Alias', key: 'alias', value: credential.alias || 'Sin alias', copy: false },
                        { label: 'Usuario', key: 'username', value: credential.username, copy: true },
                        { label: 'Contraseña', key: 'password', value: '••••••••', copy: true },
                        { label: 'Sitio Web', key: 'websiteUrl', value: credential.websiteUrl || 'No especificado', copy: false },
                        { label: 'Notas', key: 'notes', value: credential.notes || 'Sin notas', copy: false }
                    ].map((item) => (
                        <View key={item.key} style={[styles.detailCard, { backgroundColor: theme.card }]}>
                            <Text style={[styles.detailLabel, { color: theme.subText }]}>{item.label}:</Text>
                            <View style={styles.detailValueContainer}>
                                <Text style={[styles.detailValue, { color: theme.text }]} numberOfLines={1}>{item.value}</Text>
                                <View style={{ flexDirection: 'row' }}>
                                    {item.copy && (
                                        <TouchableOpacity onPress={() => copyToClipboard(item.key === 'password' ? credential.password : (credential[item.key as keyof Credential] as string), item.label)} style={styles.iconButton}>
                                            <Ionicons name="copy-outline" size={20} color={theme.primary} />
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity onPress={() => { setEditingField(item.key as EditableKeys); setEditingLabel(fieldMap[item.key as EditableKeys]); setIsModalVisible(true); }} style={styles.iconButton}>
                                        <Ionicons name="pencil-outline" size={20} color={theme.subText} /> 
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))}

                    {/* RECORDATORIO */}
                    <View style={[styles.detailCard, { 
                        backgroundColor: theme.card, 
                        borderLeftWidth: 4, 
                        borderLeftColor: credential.hasReminder ? theme.primary : theme.border,
                        marginTop: 10 
                    }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={[styles.detailLabel, { color: theme.text }]}>Recordatorio activo</Text>
                            <Switch 
                                value={credential.hasReminder || false} 
                                onValueChange={(val) => updateField('hasReminder' as any, val)}
                                trackColor={{ false: "#333", true: theme.primary }}
                            />
                        </View>

                        {credential.hasReminder && (
                            <View style={{ marginTop: 15, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: isDark ? '#333' : '#EEE' }}>
                                <Text style={[styles.innerLabel, { color: theme.subText }]}>¿Qué debemos recordarte?</Text>
                                <TextInput 
                                    style={[styles.textInput, { color: theme.text, backgroundColor: isDark ? '#252525' : '#F0F0F0' }]}
                                    value={credential.reminderNote || ''}
                                    onChangeText={(val) => updateField('reminderNote', val)}
                                    placeholder="Ej: Pagar suscripción"
                                    placeholderTextColor={theme.placeholder}
                                />
                                
                                <Text style={[styles.innerLabel, { color: theme.subText, marginTop: 15 }]}>Fecha (Día/Mes/Año):</Text>
                                
                                <View style={[styles.manualDateContainer, { backgroundColor: isDark ? '#252525' : '#F0F0F0' }]}>
                                    <Ionicons name="calendar-outline" size={18} color={theme.subText} style={{ marginRight: 10 }} />
                                    <TextInput 
                                        style={{ color: theme.text, flex: 1, height: 45 }}
                                        value={manualDate}
                                        onChangeText={handleManualDateChange}
                                        placeholder="Ej: 31/12/2025"
                                        placeholderTextColor={theme.placeholder}
                                        keyboardType="numeric"
                                        maxLength={10}
                                    />
                                </View>
                            </View>
                        )}
                    </View>
                    
                    {/* ACCIONES */}
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

            {/* MODAL CATEGORÍA */}
            <Modal visible={showCategoryModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Categoría</Text>
                        {CATEGORIES_LIST.map((item) => (
                            <TouchableOpacity key={item.id} style={styles.categoryItem} onPress={() => { updateField('category', item.id); setShowCategoryModal(false); }}>
                                <Ionicons name={item.icon as any} size={24} color={item.color} />
                                <Text style={[styles.categoryItemText, { color: theme.text }]}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>
            
            {/* MODAL EDICIÓN */}
            {isModalVisible && credential && editingField && (
                <EditCredentialModal
                    isVisible={isModalVisible}
                    onClose={() => setIsModalVisible(false)}
                    onSave={handleSaveEdit}
                    fieldLabel={editingLabel}
                    initialValue={(credential[editingField as keyof Credential] as string) || ''}
                    isPassword={editingField === 'password'}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    scrollContainer: { padding: 20, paddingTop: 30, paddingBottom: 60 },
    detailCard: { padding: 15, borderRadius: 16, marginBottom: 12 },
    accountNameLabel: { fontSize: 11, marginBottom: 2, textTransform: 'uppercase', fontWeight: 'bold', opacity: 0.8 },
    accountNameContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    accountNameText: { fontSize: 24, fontWeight: '800', flex: 1 },
    innerLabel: { fontSize: 11, marginBottom: 6, textTransform: 'uppercase', fontWeight: 'bold', opacity: 0.8 },
    detailLabel: { fontSize: 13, marginBottom: 6, fontWeight: '600' },
    detailValueContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    detailValue: { fontSize: 16, fontWeight: '500', flex: 1 },
    categoryPickerToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderRadius: 12, borderWidth: 1 },
    categoryValueText: { fontSize: 15, fontWeight: '700' },
    iconButton: { padding: 5, marginLeft: 10 },
    textInput: { padding: 12, borderRadius: 10, marginTop: 5 },
    manualDateContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderRadius: 10, marginTop: 5 },
    actionButtonsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, gap: 12 },
    actionButton: { flex: 1, flexDirection: 'row', padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    deleteButton: { backgroundColor: '#DC3545' },
    saveButton: { backgroundColor: '#007BFF' },
    disabled: { opacity: 0.5 },
    actionButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '85%', borderRadius: 20, padding: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    categoryItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
    categoryItemText: { flex: 1, marginLeft: 15, fontSize: 16, fontWeight: '600' }
});