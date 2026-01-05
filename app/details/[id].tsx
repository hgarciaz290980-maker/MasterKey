import React, { useState, useCallback } from 'react';
import { 
    View, Text, StyleSheet, SafeAreaView, ActivityIndicator, 
    TouchableOpacity, Alert, ScrollView, Switch, 
    useColorScheme, Linking 
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication'; 

import { getCredentialById, updateCredential, deleteCredential } from '@/storage/credentials'; 
import EditCredentialModal from '../components/EditCredentialModal'; 

type EditableKeys = 'accountName' | 'alias' | 'username' | 'password' | 'notes' | 'category' | 
                   'petTipo' | 'petNombre' | 'petSangre' | 'petChip' | 'petVacunas' | 
                   'petVeterinario' | 'petVeterinarioTelefono' | 'reminderNote' | 'reminderDate' | 'reminderTime';

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
        primary: '#007BFF',
        danger: '#DC3545',
        callButton: '#28A745',
    };
    
    const [credential, setCredential] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingField, setEditingField] = useState<EditableKeys | ''>(''); 
    const [editingLabel, setEditingLabel] = useState('');
    const [isUnlocked, setIsUnlocked] = useState(false); 
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const fieldLabels: Record<string, string> = {
        accountName: 'Nombre', alias: 'Alias', username: 'Usuario', password: 'Contraseña',
        notes: 'Notas', petTipo: 'Tipo de Mascota', petNombre: 'Raza',
        petSangre: 'Sangre', petChip: 'Chip', petVacunas: 'Vacunas / Alergias',
        petVeterinario: 'Nombre del Veterinario', petVeterinarioTelefono: 'Teléfono del Veterinario',
        reminderNote: '¿Qué debemos recordarte?', reminderDate: 'Fecha', reminderTime: 'Hora'
    };

    const fetchCredential = async () => {
        if (!id) return;
        try {
            const data = await getCredentialById(id); 
            setCredential(data || null);
            const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Acceso Bunker' });
            if (result.success) setIsUnlocked(true); else router.back();
        } catch (error) { console.error(error); } finally { setIsLoading(false); }
    };
    
    useFocusEffect(useCallback(() => { fetchCredential(); return () => setIsUnlocked(false); }, [id]));

    const updateField = (field: string, value: any) => {
        setCredential((prev: any) => ({ ...prev, [field]: value }));
        setHasUnsavedChanges(true);
    };

    const generateSecurePassword = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
        let password = "";
        for (let i = 0; i < 16; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        updateField('password', password);
        Alert.alert("Bunker", "Contraseña segura generada.");
    };

    const handleSaveModal = (val: string) => {
        if (!editingField) return;
        updateField(editingField, val);
        setIsModalVisible(false);
    };

    const handleSaveChanges = async () => {
        try {
            await updateCredential(credential);
            Alert.alert("Éxito", "Bunker actualizado", [{ text: "OK", onPress: () => { setHasUnsavedChanges(false); router.back(); } }]);
        } catch (error) {
            Alert.alert("Error", "No se pudieron guardar los cambios");
        }
    };

    const handleDelete = () => {
        Alert.alert("Eliminar", "¿Estás seguro?", [
            { text: "Cancelar", style: "cancel" },
            { text: "Eliminar", style: "destructive", onPress: async () => { await deleteCredential(id as string); router.back(); } }
        ]);
    };

    const renderGroupItem = (label: string, key: EditableKeys, value: string) => (
        <TouchableOpacity style={styles.groupItem} onPress={() => { setEditingField(key); setEditingLabel(fieldLabels[key]); setIsModalVisible(true); }}>
            <View style={{flex: 1}}>
                <Text style={[styles.infoLabel, { color: theme.subText }]}>{label}</Text>
                <Text style={[styles.infoValue, { color: theme.text, textTransform: key === 'petTipo' ? 'capitalize' : 'none' }]}>{value || 'No asignado'}</Text>
            </View>
            <Ionicons name="pencil" size={14} color={theme.primary} />
        </TouchableOpacity>
    );

    const renderRow = (label: string, key: EditableKeys, value: string, isPassword = false) => (
        <View style={{ marginBottom: 15 }}>
            {/* Cabecera del campo: Etiqueta y Opción de Generar si es password */}
            <View style={styles.rowHeader}>
                <Text style={[styles.infoLabel, { color: theme.subText }]}>{label}</Text>
                {isPassword && (
                    <TouchableOpacity onPress={generateSecurePassword}>
                        <Text style={styles.generateText}>Generar clave segura</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={[styles.infoRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.infoValue, { color: theme.text, textTransform: (key === 'petTipo' || key === 'accountName') ? 'capitalize' : 'none' }]}>
                        {isPassword ? (showPassword ? value : '••••••••••••') : (value || 'No asignado')}
                    </Text>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {isPassword && (
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.innerEditBtn}>
                            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={theme.subText} />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => {
                        if (key === 'petTipo') {
                            Alert.alert("Mascota", "Elige tipo", [
                                { text: "Perro 🐶", onPress: () => updateField('petTipo', 'perro') },
                                { text: "Gato 🐱", onPress: () => updateField('petTipo', 'gato') },
                                { text: "Otro 🐾", onPress: () => updateField('petTipo', 'otro') },
                            ]);
                        } else {
                            setEditingField(key); setEditingLabel(fieldLabels[key]); setIsModalVisible(true);
                        }
                    }} style={styles.innerEditBtn}>
                        <Ionicons name="pencil" size={18} color={theme.primary} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    if (isLoading || !isUnlocked) return <View style={[styles.center, {backgroundColor: theme.background}]}><ActivityIndicator size="large" color={theme.primary}/></View>;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ title: "Detalles del Registro" }} />
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                
                <Text style={[styles.sectionTitle, { color: theme.primary }]}>INFORMACIÓN GENERAL</Text>
                {renderRow(credential.category === 'pet' ? 'Nombre Mascota' : 'Nombre', 'accountName', credential.accountName)}
                {renderRow('Alias', 'alias', credential.alias)}

                {credential.category !== 'pet' && (
                    <>
                        <Text style={[styles.sectionTitle, { color: theme.primary, marginTop: 20 }]}>DATOS DE ACCESO</Text>
                        {renderRow('Usuario', 'username', credential.username)}
                        {renderRow('Contraseña', 'password', credential.password, true)}
                        {renderRow('Notas', 'notes', credential.notes)}
                    </>
                )}

                {credential.category === 'pet' && (
                    <>
                        <Text style={[styles.sectionTitle, { color: theme.primary, marginTop: 20 }]}>FICHA MÉDICA 🐾</Text>
                        {renderRow('Tipo', 'petTipo', credential.petTipo)}
                        {renderRow('Raza', 'petNombre', credential.petNombre)}
                        {renderRow('Sangre', 'petSangre', credential.petSangre)}
                        {renderRow('Vacunas / Alergias', 'petVacunas', credential.petVacunas)}
                        
                        <Text style={[styles.sectionTitle, { color: theme.primary, marginTop: 20 }]}>EMERGENCIA</Text>
                        {renderRow('Nombre del Veterinario', 'petVeterinario', credential.petVeterinario)}
                        <View style={[styles.infoRow, { backgroundColor: theme.card, borderColor: theme.callButton, borderLeftWidth: 4 }]}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.infoLabel, { color: theme.subText, marginBottom: 5 }]}>Teléfono</Text>
                                <Text style={[styles.infoValue, { color: theme.text, fontWeight: 'bold' }]}>{credential.petVeterinarioTelefono || 'Sin teléfono'}</Text>
                            </View>
                            <View style={{flexDirection: 'row'}}>
                                {credential.petVeterinarioTelefono && (
                                    <TouchableOpacity onPress={() => Linking.openURL(`tel:${credential.petVeterinarioTelefono}`)} style={[styles.actionBtn, { backgroundColor: theme.callButton }]}>
                                        <Ionicons name="call" size={20} color="#FFF" />
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity onPress={() => { setEditingField('petVeterinarioTelefono'); setEditingLabel('Teléfono del Veterinario'); setIsModalVisible(true); }} style={styles.innerEditBtn}>
                                    <Ionicons name="pencil" size={18} color={theme.primary} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </>
                )}

                <Text style={[styles.sectionTitle, { color: theme.primary, marginTop: 20 }]}>RECORDATORIOS</Text>
                <View style={[styles.infoRow, { backgroundColor: theme.card, borderColor: theme.border, justifyContent: 'space-between' }]}>
                    <Text style={[styles.infoLabel, { color: theme.subText, marginBottom: 0 }]}>Activar recordatorio</Text>
                    <Switch value={!!credential.hasReminder} onValueChange={(val) => updateField('hasReminder', val)} trackColor={{ false: "#767577", true: theme.primary }} />
                </View>

                {credential.hasReminder && (
                    <View style={[styles.reminderCard, { backgroundColor: theme.card, borderColor: theme.primary, borderLeftWidth: 5 }]}>
                        {renderGroupItem('¿Qué debemos recordarte?', 'reminderNote', credential.reminderNote)}
                        <View style={styles.divider} />
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flex: 1 }}>{renderGroupItem('Fecha', 'reminderDate', credential.reminderDate)}</View>
                            <View style={[styles.verticalDivider, { backgroundColor: theme.border }]} />
                            <View style={{ flex: 1 }}>{renderGroupItem('Hora', 'reminderTime', credential.reminderTime)}</View>
                        </View>
                    </View>
                )}

                <View style={styles.footerButtons}>
                    <TouchableOpacity onPress={handleDelete} style={[styles.actionButton, { backgroundColor: theme.danger }]}>
                        <Ionicons name="trash-outline" size={20} color="#FFF" />
                        <Text style={styles.buttonText}>Eliminar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSaveChanges} style={[styles.actionButton, { backgroundColor: theme.primary, opacity: hasUnsavedChanges ? 1 : 0.5 }]} disabled={!hasUnsavedChanges}>
                        <Ionicons name="shield-checkmark-outline" size={20} color="#FFF" />
                        <Text style={styles.buttonText}>Guardar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <EditCredentialModal isVisible={isModalVisible} onClose={() => setIsModalVisible(false)} onSave={handleSaveModal} fieldLabel={editingLabel} initialValue={credential ? credential[editingField as any] || '' : ''} keyboardType={editingField === 'reminderDate' || editingField === 'reminderTime' || editingField === 'petVeterinarioTelefono' ? 'numeric' : 'default'} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    sectionTitle: { fontSize: 11, fontWeight: 'bold', marginBottom: 12, letterSpacing: 1.5, textTransform: 'uppercase' },
    rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5, paddingHorizontal: 5 },
    generateText: { fontSize: 12, color: '#007BFF', fontWeight: 'bold' },
    infoRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14, borderWidth: 1 },
    infoLabel: { fontSize: 11, fontWeight: '700' },
    infoValue: { fontSize: 16 },
    innerEditBtn: { padding: 5, marginLeft: 10 },
    actionBtn: { padding: 10, borderRadius: 10, marginLeft: 10 },
    reminderCard: { borderRadius: 16, marginTop: 10, marginBottom: 10, borderWidth: 1 },
    groupItem: { padding: 12, flexDirection: 'row', alignItems: 'center' },
    divider: { height: 1, backgroundColor: '#E9ECEF', marginHorizontal: 12 },
    verticalDivider: { width: 1, marginVertical: 10 },
    footerButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30, marginBottom: 50 },
    actionButton: { flex: 0.48, height: 55, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 15, marginLeft: 8 }
});