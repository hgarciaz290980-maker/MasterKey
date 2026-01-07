import React, { useState, useCallback } from 'react';
import { 
    View, Text, StyleSheet, SafeAreaView, ActivityIndicator, 
    TouchableOpacity, Alert, ScrollView, Switch, 
    useColorScheme, Linking, Modal
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication'; 

import { getCredentialById, updateCredential, deleteCredential, Reminder } from '@/storage/credentials'; 
import EditCredentialModal from '../components/EditCredentialModal'; 

// Actualizamos las llaves editables para incluir movilidad
type EditableKeys = 'accountName' | 'alias' | 'username' | 'password' | 'notes' | 'category' | 
                   'petTipo' | 'petNombre' | 'petSangre' | 'petChip' | 'petVacunas' | 
                   'petVeterinario' | 'petVeterinarioTelefono' |
                   'autoMarca' | 'autoModelo' | 'autoAnio' | 'autoPlacas' |
                   'autoAseguradoraNombre' | 'autoPoliza' | 'autoVencimientoPoliza' | 'autoAseguradoraTelefono' |
                   'autoLlantaAncho' | 'autoLlantaPerfil' | 'autoLlantaRin' |
                   'autoNoCircula' | 'autoDiaNoCircula' | 'autoAceiteFecha' | 'autoFrenosFecha' | 'autoAfinacionFecha';

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
    
    const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
    const [editingReminderField, setEditingReminderField] = useState<'note' | 'date' | 'time' | ''>('');

    const [isUnlocked, setIsUnlocked] = useState(false); 
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);

    const categories = [
        { id: 'fav', label: 'Recurrentes' },
        { id: 'personal', label: 'Personal' },
        { id: 'work', label: 'Trabajo' },
        { id: 'pet', label: 'Mascota' },
        { id: 'mobility', label: 'Movilidad' },
        { id: 'entertainment', label: 'Entretenimiento' },
    ];

    const fieldLabels: Record<string, string> = {
        accountName: 'Nombre', alias: 'Alias', username: 'Usuario', password: 'Contraseña',
        notes: 'Notas', petTipo: 'Tipo de Mascota', petNombre: 'Raza',
        petSangre: 'Sangre', petChip: 'Chip', petVacunas: 'Vacunas / Alergias',
        petVeterinario: 'Nombre del Veterinario', petVeterinarioTelefono: 'Teléfono del Veterinario',
        autoMarca: 'Marca', autoModelo: 'Modelo', autoAnio: 'Año', autoPlacas: 'Placas',
        autoAseguradoraNombre: 'Aseguradora', autoPoliza: 'Póliza', autoVencimientoPoliza: 'Vencimiento',
        autoAseguradoraTelefono: 'Teléfono de Siniestros', autoLlantaAncho: 'Ancho de Llanta',
        autoLlantaPerfil: 'Perfil de Llanta', autoLlantaRin: 'Rin', autoNoCircula: 'Hoy No Circula',
        autoDiaNoCircula: 'Día de Restricción', autoAceiteFecha: 'Fecha Aceite',
        autoFrenosFecha: 'Fecha Frenos', autoAfinacionFecha: 'Fecha Afinación'
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

    const addReminder = () => {
        const newReminder: Reminder = { id: Date.now().toString(), note: 'Nuevo Recordatorio', date: '', time: '' };
        const updatedReminders = [...(credential.reminders || []), newReminder];
        updateField('reminders', updatedReminders);
    };

    const updateReminderField = (reminderId: string, field: 'note' | 'date' | 'time', value: string) => {
        const updatedReminders = credential.reminders.map((r: Reminder) => r.id === reminderId ? { ...r, [field]: value } : r);
        updateField('reminders', updatedReminders);
    };

    const removeReminder = (reminderId: string) => {
        const updatedReminders = credential.reminders.filter((r: Reminder) => r.id !== reminderId);
        updateField('reminders', updatedReminders);
    };

    const handleSaveModal = (val: string) => {
        if (editingReminderId && editingReminderField) {
            updateReminderField(editingReminderId, editingReminderField as any, val);
            setEditingReminderId(null);
            setEditingReminderField('');
        } else if (editingField) {
            updateField(editingField, val);
        }
        setIsModalVisible(false);
    };

    const handleSaveChanges = async () => {
        try {
            await updateCredential(credential);
            Alert.alert("Éxito", "Bunker actualizado", [{ text: "OK", onPress: () => { setHasUnsavedChanges(false); router.back(); } }]);
        } catch (error) { Alert.alert("Error", "No se pudieron guardar los cambios"); }
    };

    const handleDelete = () => {
        Alert.alert("Eliminar", "¿Estás seguro?", [
            { text: "Cancelar", style: "cancel" },
            { text: "Eliminar", style: "destructive", onPress: async () => { await deleteCredential(id as string); router.back(); } }
        ]);
    };

    const renderRow = (label: string, key: EditableKeys, value: string, isPassword = false) => (
        <View style={{ marginBottom: 15 }}>
            <Text style={[styles.infoLabel, { color: theme.subText, marginBottom: 5 }]}>{label}</Text>
            <View style={[styles.infoRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.infoValue, { color: theme.text }]}>
                        {isPassword ? (showPassword ? value : '••••••••••••') : (value || 'No asignado')}
                    </Text>
                </View>
                <TouchableOpacity onPress={() => { setEditingField(key); setEditingLabel(fieldLabels[key]); setIsModalVisible(true); }} style={styles.innerEditBtn}>
                    <Ionicons name="pencil" size={18} color={theme.primary} />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (isLoading || !isUnlocked) return <View style={[styles.center, {backgroundColor: theme.background}]}><ActivityIndicator size="large" color={theme.primary}/></View>;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ title: "Detalles del Registro" }} />
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                
                <Text style={[styles.sectionTitle, { color: theme.primary }]}>INFORMACIÓN GENERAL</Text>
                
                <Text style={[styles.infoLabel, { color: theme.subText, marginBottom: 8 }]}>Categoría</Text>
                <TouchableOpacity 
                    style={[styles.pickerTrigger, { backgroundColor: theme.card, borderColor: theme.border }]} 
                    onPress={() => setShowCategoryPicker(true)}
                >
                    <Text style={[styles.pickerTriggerText, { color: theme.text }]}>
                        {categories.find(c => c.id === credential.category)?.label || "Seleccionar categoría"}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={theme.primary} />
                </TouchableOpacity>

                {renderRow('Nombre', 'accountName', credential.accountName)}
                {renderRow('Alias', 'alias', credential.alias)}

                {/* --- SECCIÓN ESPECÍFICA MOVILIDAD --- */}
                {credential.category === 'mobility' && (
                    <>
                        <Text style={[styles.sectionTitle, { color: theme.primary, marginTop: 20 }]}>DATOS DEL VEHÍCULO 🚗</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{ width: '48%' }}>{renderRow('Marca', 'autoMarca', credential.autoMarca)}</View>
                            <View style={{ width: '48%' }}>{renderRow('Modelo', 'autoModelo', credential.autoModelo)}</View>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{ width: '48%' }}>{renderRow('Año', 'autoAnio', credential.autoAnio)}</View>
                            <View style={{ width: '48%' }}>{renderRow('Placas', 'autoPlacas', credential.autoPlacas)}</View>
                        </View>

                        <Text style={[styles.sectionTitle, { color: theme.primary, marginTop: 20 }]}>SEGURO</Text>
                        {renderRow('Aseguradora', 'autoAseguradoraNombre', credential.autoAseguradoraNombre)}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{ width: '48%' }}>{renderRow('Póliza', 'autoPoliza', credential.autoPoliza)}</View>
                            <View style={{ width: '48%' }}>{renderRow('Vencimiento', 'autoVencimientoPoliza', credential.autoVencimientoPoliza)}</View>
                        </View>
                        
                        {/* Teléfono Seguro con Llamada */}
                        <Text style={[styles.infoLabel, { color: theme.subText, marginBottom: 5 }]}>Teléfono de Siniestros</Text>
                        <View style={[styles.infoRow, { backgroundColor: theme.card, borderColor: theme.callButton, borderLeftWidth: 4 }]}>
                            <Text style={[styles.infoValue, { color: theme.text, flex: 1, fontWeight: 'bold' }]}>{credential.autoAseguradoraTelefono || 'Sin teléfono'}</Text>
                            {credential.autoAseguradoraTelefono && (
                                <TouchableOpacity onPress={() => Linking.openURL(`tel:${credential.autoAseguradoraTelefono}`)} style={[styles.actionBtn, { backgroundColor: theme.callButton }]}>
                                    <Ionicons name="call" size={18} color="#FFF" />
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity onPress={() => { setEditingField('autoAseguradoraTelefono'); setEditingLabel('Teléfono de Siniestros'); setIsModalVisible(true); }} style={styles.innerEditBtn}>
                                <Ionicons name="pencil" size={18} color={theme.primary} />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.sectionTitle, { color: theme.primary, marginTop: 30 }]}>MANTENIMIENTO</Text>
                        <Text style={[styles.infoLabel, { color: theme.subText, marginBottom: 5 }]}>Especificaciones Llantas</Text>
                        <View style={[styles.infoRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            <Text style={[styles.infoValue, { color: theme.text, flex: 1 }]}>
                                {credential.autoLlantaAncho || '---'} / {credential.autoLlantaPerfil || '---'} {credential.autoLlantaRin || '---'}
                            </Text>
                            <TouchableOpacity onPress={() => { setEditingField('autoLlantaAncho'); setEditingLabel('Ancho Llanta'); setIsModalVisible(true); }} style={styles.innerEditBtn}>
                                <Ionicons name="construct-outline" size={18} color={theme.primary} />
                            </TouchableOpacity>
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
                            <View style={{ width: '48%' }}>{renderRow('No Circula', 'autoNoCircula', credential.autoNoCircula)}</View>
                            <View style={{ width: '48%' }}>{renderRow('Día', 'autoDiaNoCircula', credential.autoDiaNoCircula)}</View>
                        </View>

                        {renderRow('Último Aceite', 'autoAceiteFecha', credential.autoAceiteFecha)}
                        {renderRow('Últimos Frenos', 'autoFrenosFecha', credential.autoFrenosFecha)}
                        {renderRow('Última Afinación', 'autoAfinacionFecha', credential.autoAfinacionFecha)}
                    </>
                )}

                {/* --- SECCIÓN ESPECÍFICA MASCOTAS --- */}
                {credential.category === 'pet' && (
                    <>
                        <Text style={[styles.sectionTitle, { color: theme.primary, marginTop: 20 }]}>FICHA MÉDICA 🐾</Text>
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
                            {credential.petVeterinarioTelefono && (
                                <TouchableOpacity onPress={() => Linking.openURL(`tel:${credential.petVeterinarioTelefono}`)} style={[styles.actionBtn, { backgroundColor: theme.callButton }]}>
                                    <Ionicons name="call" size={20} color="#FFF" />
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity onPress={() => { setEditingField('petVeterinarioTelefono'); setEditingLabel('Teléfono del Veterinario'); setIsModalVisible(true); }} style={styles.innerEditBtn}>
                                <Ionicons name="pencil" size={18} color={theme.primary} />
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                {/* --- DATOS DE ACCESO PARA OTRAS CATEGORÍAS --- */}
                {credential.category !== 'pet' && credential.category !== 'mobility' && (
                    <>
                        <Text style={[styles.sectionTitle, { color: theme.primary, marginTop: 20 }]}>DATOS DE ACCESO</Text>
                        {renderRow('Usuario', 'username', credential.username)}
                        {renderRow('Contraseña', 'password', credential.password, true)}
                    </>
                )}

                <Text style={[styles.sectionTitle, { color: theme.primary, marginTop: 20 }]}>NOTAS Y RECORDATORIOS</Text>
                {renderRow('Notas Adicionales', 'notes', credential.notes)}

                <View style={[styles.infoRow, { backgroundColor: theme.card, borderColor: theme.border, justifyContent: 'space-between', marginBottom: 10 }]}>
                    <Text style={[styles.infoLabel, { color: theme.subText, marginBottom: 0 }]}>Activar recordatorios</Text>
                    <Switch value={!!credential.hasReminder} onValueChange={(val) => updateField('hasReminder', val)} trackColor={{ false: "#767577", true: theme.primary }} />
                </View>

                {credential.hasReminder && (
                    <>
                        {credential.reminders?.map((rem: Reminder, index: number) => (
                            <View key={rem.id} style={[styles.reminderCard, { backgroundColor: theme.card, borderColor: theme.primary, borderLeftWidth: 5 }]}>
                                <View style={styles.reminderHeader}>
                                    <Text style={{fontSize: 10, fontWeight: 'bold', color: theme.primary}}>RECORDATORIO #{index + 1}</Text>
                                    <TouchableOpacity onPress={() => removeReminder(rem.id)}><Ionicons name="close-circle" size={20} color={theme.danger} /></TouchableOpacity>
                                </View>
                                <TouchableOpacity style={styles.groupItem} onPress={() => { setEditingReminderId(rem.id); setEditingReminderField('note'); setEditingLabel('¿Qué recordar?'); setIsModalVisible(true); }}>
                                    <View style={{flex: 1}}>
                                        <Text style={[styles.infoLabel, { color: theme.subText }]}>¿Qué debemos recordarte?</Text>
                                        <Text style={[styles.infoValue, { color: theme.text }]}>{rem.note || 'Toca para editar'}</Text>
                                    </View>
                                    <Ionicons name="pencil" size={14} color={theme.primary} />
                                </TouchableOpacity>
                                <View style={styles.divider} />
                                <View style={{ flexDirection: 'row' }}>
                                    <TouchableOpacity style={[styles.groupItem, {flex: 1}]} onPress={() => { setEditingReminderId(rem.id); setEditingReminderField('date'); setEditingLabel('Fecha'); setIsModalVisible(true); }}>
                                        <View style={{flex: 1}}><Text style={[styles.infoLabel, { color: theme.subText }]}>Fecha</Text><Text style={[styles.infoValue, { color: theme.text }]}>{rem.date || 'DD/MM/AAAA'}</Text></View>
                                        <Ionicons name="pencil" size={14} color={theme.primary} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.groupItem, {flex: 1}]} onPress={() => { setEditingReminderId(rem.id); setEditingReminderField('time'); setEditingLabel('Hora'); setIsModalVisible(true); }}>
                                        <View style={{flex: 1}}><Text style={[styles.infoLabel, { color: theme.subText }]}>Hora</Text><Text style={[styles.infoValue, { color: theme.text }]}>{rem.time || 'HH:MM AM/PM'}</Text></View>
                                        <Ionicons name="pencil" size={14} color={theme.primary} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                        <TouchableOpacity style={styles.addReminderBtn} onPress={addReminder}>
                            <Ionicons name="add-circle-outline" size={22} color={theme.primary} /><Text style={[styles.addReminderText, { color: theme.primary }]}>Agregar otro recordatorio</Text>
                        </TouchableOpacity>
                    </>
                )}

                <View style={styles.footerButtons}>
                    <TouchableOpacity onPress={handleDelete} style={[styles.actionButton, { backgroundColor: theme.danger }]}>
                        <Ionicons name="trash-outline" size={20} color="#FFF" /><Text style={styles.buttonText}>Eliminar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSaveChanges} style={[styles.actionButton, { backgroundColor: theme.primary, opacity: hasUnsavedChanges ? 1 : 0.5 }]} disabled={!hasUnsavedChanges}>
                        <Ionicons name="shield-checkmark-outline" size={20} color="#FFF" /><Text style={styles.buttonText}>Guardar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <Modal visible={showCategoryPicker} transparent animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowCategoryPicker(false)}>
                    <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Seleccionar Categoría</Text>
                        {categories.map((item) => (
                            <TouchableOpacity key={item.id} style={[styles.modalItem, { borderBottomColor: theme.border }]} onPress={() => { updateField('category', item.id); setShowCategoryPicker(false); }}>
                                <Text style={[styles.modalItemText, { color: theme.text }]}>{item.label}</Text>
                                {credential.category === item.id && <Ionicons name="checkmark-circle" size={22} color={theme.primary} />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            <EditCredentialModal 
                isVisible={isModalVisible} 
                onClose={() => setIsModalVisible(false)} 
                onSave={handleSaveModal} 
                fieldLabel={editingLabel} 
                initialValue={
                    editingReminderId 
                    ? credential.reminders.find((r: any) => r.id === editingReminderId)?.[editingReminderField] || ''
                    : (credential ? credential[editingField as any] || '' : '')
                } 
                keyboardType={
                    editingField === 'petVeterinarioTelefono' || editingField === 'autoAseguradoraTelefono' || 
                    editingReminderField === 'date' || editingReminderField === 'time' ? 'numeric' : 'default'
                } 
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    sectionTitle: { fontSize: 11, fontWeight: 'bold', marginBottom: 12, letterSpacing: 1.5, textTransform: 'uppercase' },
    infoRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 5 },
    infoLabel: { fontSize: 11, fontWeight: '700' },
    infoValue: { fontSize: 16 },
    innerEditBtn: { padding: 5, marginLeft: 10 },
    actionBtn: { padding: 8, borderRadius: 8, marginLeft: 10 },
    reminderCard: { borderRadius: 16, marginTop: 10, marginBottom: 10, borderWidth: 1, overflow: 'hidden' },
    reminderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingTop: 10 },
    groupItem: { padding: 12, flexDirection: 'row', alignItems: 'center' },
    divider: { height: 1, backgroundColor: '#E9ECEF', marginHorizontal: 12 },
    addReminderBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, marginTop: 5, marginBottom: 20 },
    addReminderText: { fontWeight: 'bold', marginLeft: 8, fontSize: 14 },
    footerButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, marginBottom: 50 },
    actionButton: { flex: 0.48, height: 55, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 15, marginLeft: 8 },
    pickerTrigger: { padding: 15, borderRadius: 10, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    pickerTriggerText: { fontSize: 16 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 30 },
    modalContent: { borderRadius: 20, padding: 20, borderWidth: 1 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    modalItem: { paddingVertical: 15, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    modalItemText: { fontSize: 16 }
});