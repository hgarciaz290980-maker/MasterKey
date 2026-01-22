import React, { useState, useCallback } from 'react';
import { 
    View, Text, StyleSheet, SafeAreaView, ActivityIndicator, 
    TouchableOpacity, Alert, ScrollView, Switch, 
    useColorScheme, Linking, Modal, Platform, Dimensions
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication'; 
import * as Clipboard from 'expo-clipboard';

import { getCredentialById, updateCredential, deleteCredential, Reminder } from '../../storage/credentials'; 
import EditCredentialModal from '../components/EditCredentialModal'; 

const { height, width } = Dimensions.get('window');

// Definimos la estructura de una vacuna para que TS sepa qué es
interface PetVaccine {
    id: string;
    name: string;
    date: string;
}

type EditableKeys = 'accountName' | 'alias' | 'username' | 'password' | 'notes' | 'category' | 
                   'petTipo' | 'petNombre' | 'petSangre' | 'petChip' | 'petNacimiento' |
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
    
    const [editingVaccineId, setEditingVaccineId] = useState<string | null>(null);
    const [editingVaccineField, setEditingVaccineField] = useState<'name' | 'date' | ''>('');
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
        accountName: 'Nombre', username: 'Usuario', password: 'Contraseña',
        notes: 'Notas', petTipo: 'Tipo de Mascota', petNombre: 'Raza',
        petSangre: 'Sangre', petChip: 'Chip', petNacimiento: 'Fecha de Nacimiento',
        petVeterinario: 'Nombre del Veterinario', petVeterinarioTelefono: 'Teléfono del Veterinario',
        autoMarca: 'Marca', autoModelo: 'Modelo', autoAnio: 'Año', autoPlacas: 'Placas',
        autoAseguradoraNombre: 'Aseguradora', autoPoliza: 'Póliza', autoVencimientoPoliza: 'Vencimiento',
        autoAseguradoraTelefono: 'Teléfono de Siniestros', autoLlantaAncho: 'Llantas (Especificación)',
        autoLlantaPerfil: 'Perfil de Llanta', autoLlantaRin: 'Rin', autoNoCircula: 'Hoy No Circula',
        autoDiaNoCircula: 'Día de Restricción', 
        autoAceiteFecha: 'Último cambio de aceite',
        autoFrenosFecha: 'Último cambio de frenos', 
        autoAfinacionFecha: 'Último servicio de afinación'
    };

    const calcularEdad = (fechaStr: string) => {
        if (!fechaStr || !fechaStr.includes('/')) return "---";
        try {
            const [dia, mes, anio] = fechaStr.split('/').map(Number);
            if (!dia || !mes || !anio || anio < 1000) return "---";
            const hoy = new Date();
            const cumple = new Date(anio, mes - 1, dia);
            let años = hoy.getFullYear() - cumple.getFullYear();
            let meses = hoy.getMonth() - cumple.getMonth();
            if (hoy.getDate() < cumple.getDate()) meses--;
            if (meses < 0) { años--; meses += 12; }
            const textoAños = años === 1 ? "1 año" : `${años} años`;
            const textoMeses = meses === 1 ? "1 mes" : `${meses} meses`;
            if (años <= 0) return textoMeses;
            return `${textoAños}${meses > 0 ? ` ${textoMeses}` : ""}`;
        } catch (e) { return "---"; }
    };

    const fetchCredential = async () => {
        if (!id) return;
        try {
            const data = await getCredentialById(id) as any; // Usamos 'as any' para evitar el error de la captura
            if (data && !data.petVacunasList) {
                data.petVacunasList = []; 
            }
            setCredential(data || null);
            const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Acceso Bunker' });
            if (result.success) setIsUnlocked(true); else router.back();
        } catch (error) { console.error(error); } finally { setIsLoading(false); }
    };
    
    useFocusEffect(useCallback(() => { fetchCredential(); return () => setIsUnlocked(false); }, [id]));

    const copyToClipboard = async (val: string) => {
        await Clipboard.setStringAsync(val);
        Alert.alert("Copiado", "Dato copiado al portapapeles");
    };

    const updateField = (field: string, value: any) => {
        setCredential((prev: any) => ({ ...prev, [field]: value }));
        setHasUnsavedChanges(true);
    };

    const addVaccine = () => {
        const newVaccine: PetVaccine = { id: Date.now().toString(), name: '', date: '' };
        const currentList = credential.petVacunasList || [];
        updateField('petVacunasList', [...currentList, newVaccine]);
    };

    const handleSaveModal = (val: string) => {
        let formattedValue = val;
        const isDateField = editingField === 'petNacimiento' || 
                           editingField === 'autoVencimientoPoliza' || 
                           editingVaccineField === 'date' ||
                           editingReminderField === 'date';

        if (isDateField && val.length === 8 && !val.includes('/')) {
            formattedValue = `${val.substring(0, 2)}/${val.substring(2, 4)}/${val.substring(4, 8)}`;
        }

        if (editingVaccineId && editingVaccineField) {
            const newList = credential.petVacunasList.map((v: PetVaccine) => 
                v.id === editingVaccineId ? { ...v, [editingVaccineField]: formattedValue } : v
            );
            updateField('petVacunasList', newList);
            setEditingVaccineId(null);
            setEditingVaccineField('');
        } else if (editingReminderId && editingReminderField) {
            const updatedReminders = credential.reminders.map((r: Reminder) => 
                r.id === editingReminderId ? { ...r, [editingReminderField]: formattedValue } : r
            );
            updateField('reminders', updatedReminders);
            setEditingReminderId(null);
            setEditingReminderField('');
        } else if (editingField) {
            updateField(editingField, formattedValue);
        }
        setIsModalVisible(false);
    };

    const handleSaveChanges = async () => {
        try {
            await updateCredential(credential);
            setHasUnsavedChanges(false);
            Alert.alert("Éxito", "Bunker actualizado", [{ text: "OK", onPress: () => router.back() }]);
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
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.infoValue, { color: theme.text, flex: 1 }]}>
                        {isPassword ? (showPassword ? value : '••••••••••••') : (value || 'No asignado')}
                    </Text>
                    {isPassword && value && (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ paddingHorizontal: 12 }}>
                                <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color={theme.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => copyToClipboard(value)} style={{ paddingHorizontal: 12 }}>
                                <Ionicons name="copy-outline" size={22} color={theme.primary} />
                            </TouchableOpacity>
                        </View>
                    )}
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
            <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: height * 0.15 }]} showsVerticalScrollIndicator={false}>
                
                <Text style={[styles.sectionTitle, { color: theme.primary }]}>INFORMACIÓN GENERAL</Text>
                
                <Text style={[styles.infoLabel, { color: theme.subText, marginBottom: 8 }]}>Categoría</Text>
                <TouchableOpacity style={[styles.pickerTrigger, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => setShowCategoryPicker(true)}>
                    <Text style={[styles.pickerTriggerText, { color: theme.text }]}>
                        {categories.find(c => c.id === credential.category)?.label || "Seleccionar categoría"}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={theme.primary} />
                </TouchableOpacity>

                {renderRow('Nombre', 'accountName', credential.accountName)}

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

                       {/* --- SECCIÓN DE SEGURO CORREGIDA --- */}
<Text style={[styles.sectionTitle, { color: theme.primary, marginTop: 20 }]}>SEGURO</Text>
{renderRow('Aseguradora', 'autoAseguradoraNombre', credential.autoAseguradoraNombre)}

{/* Envolvemos Póliza y Vencimiento en un solo renglón */}
<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
    <View style={{ width: '48%' }}>
        <Text style={[styles.infoLabel, { color: theme.subText, marginBottom: 5 }]}>Póliza</Text>
        <TouchableOpacity 
            onPress={() => { setEditingField('autoPoliza'); setEditingLabel('Póliza'); setIsModalVisible(true); }} 
            style={[styles.infoRow, { backgroundColor: theme.card, borderColor: theme.border, paddingVertical: 12 }]}
        >
            <Text style={[styles.infoValue, { color: theme.text, fontSize: 14 }]} numberOfLines={1}>
                {credential.autoPoliza || 'No asignada'}
            </Text>
        </TouchableOpacity>
    </View>
    <View style={{ width: '48%' }}>
        <Text style={[styles.infoLabel, { color: theme.subText, marginBottom: 5 }]}>Vencimiento</Text>
        <TouchableOpacity 
            onPress={() => { setEditingField('autoVencimientoPoliza'); setEditingLabel('Vencimiento'); setIsModalVisible(true); }} 
            style={[styles.infoRow, { backgroundColor: theme.card, borderColor: theme.border, paddingVertical: 12 }]}
        >
            <Text style={[styles.infoValue, { color: theme.text, fontSize: 14 }]}>
                {credential.autoVencimientoPoliza || 'DD/MM/AAAA'}
            </Text>
        </TouchableOpacity>
    </View>
</View>
                        
                        <Text style={[styles.infoLabel, { color: theme.subText, marginBottom: 5 }]}>Teléfono de Siniestros</Text>
                        <View style={[styles.infoRow, { backgroundColor: theme.card, borderColor: theme.callButton, borderLeftWidth: 4, marginBottom: 15 }]}>
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

                        <Text style={[styles.sectionTitle, { color: theme.primary, marginTop: 15 }]}>MANTENIMIENTO</Text>
                        {renderRow('Llantas (Especificación)', 'autoLlantaAncho', credential.autoLlantaAncho)}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{ width: '48%' }}>{renderRow('No Circula', 'autoNoCircula', credential.autoNoCircula)}</View>
                            <View style={{ width: '48%' }}>{renderRow('Día', 'autoDiaNoCircula', credential.autoDiaNoCircula)}</View>
                        </View>
                        {renderRow('Último cambio de aceite', 'autoAceiteFecha', credential.autoAceiteFecha)}
                        {renderRow('Último cambio de frenos', 'autoFrenosFecha', credential.autoFrenosFecha)}
                        {renderRow('Último servicio de afinación', 'autoAfinacionFecha', credential.autoAfinacionFecha)}
                    </>
                )}

                {credential.category === 'pet' && (
                    <>
                        <Text style={[styles.sectionTitle, { color: theme.primary, marginTop: 20 }]}>TIPO DE MASCOTA 🐾</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                            <TouchableOpacity style={[styles.petTypeCard, { backgroundColor: theme.card, borderColor: credential.petTipo === 'perro' ? theme.primary : theme.border }]} onPress={() => updateField('petTipo', 'perro')}>
                                <Ionicons name="paw" size={28} color={credential.petTipo === 'perro' ? theme.primary : theme.subText} />
                                <Text style={[styles.petTypeText, { color: credential.petTipo === 'perro' ? theme.primary : theme.subText }]}>Perro</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.petTypeCard, { backgroundColor: theme.card, borderColor: credential.petTipo === 'gato' ? theme.primary : theme.border }]} onPress={() => updateField('petTipo', 'gato')}>
                                <Ionicons name="logo-octocat" size={28} color={credential.petTipo === 'gato' ? theme.primary : theme.subText} />
                                <Text style={[styles.petTypeText, { color: credential.petTipo === 'gato' ? theme.primary : theme.subText }]}>Gato</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.petTypeCard, { backgroundColor: theme.card, borderColor: credential.petTipo === 'otro' ? theme.primary : theme.border }]} onPress={() => updateField('petTipo', 'otro')}>
                                <Ionicons name="help-circle-outline" size={28} color={credential.petTipo === 'otro' ? theme.primary : theme.subText} />
                                <Text style={[styles.petTypeText, { color: credential.petTipo === 'otro' ? theme.primary : theme.subText }]}>Otro</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.sectionTitle, { color: theme.primary }]}>FICHA MÉDICA</Text>
                        {renderRow('Raza', 'petNombre', credential.petNombre)}

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                            <View style={{ width: '48%' }}>
                                <Text style={[styles.infoLabel, { color: theme.subText, marginBottom: 5 }]}>Fecha de Nacimiento</Text>
                                <TouchableOpacity onPress={() => { setEditingField('petNacimiento'); setEditingLabel('Fecha de Nacimiento'); setIsModalVisible(true); }} style={[styles.infoRow, { backgroundColor: theme.card, borderColor: theme.border, paddingVertical: 12 }]}>
                                    <Text style={[styles.infoValue, { color: theme.text, fontSize: 14 }]}>{credential.petNacimiento || 'DD/MM/AAAA'}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ width: '48%' }}>
                                <Text style={[styles.infoLabel, { color: theme.subText, marginBottom: 5 }]}>Edad Actual</Text>
                                <View style={[styles.infoRow, { backgroundColor: theme.card, borderColor: theme.border, paddingVertical: 12, opacity: 0.8 }]}>
                                    <Text style={[styles.infoValue, { color: theme.primary, fontSize: 14, fontWeight: 'bold' }]}>{calcularEdad(credential.petNacimiento)}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10}}>
                            <Text style={[styles.sectionTitle, { color: theme.primary, marginBottom: 0 }]}>VACUNAS APLICADAS</Text>
                            <TouchableOpacity onPress={addVaccine} style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Ionicons name="add-circle" size={20} color={theme.primary} />
                                <Text style={{color: theme.primary, fontWeight: 'bold', fontSize: 12, marginLeft: 4}}>Agregar</Text>
                            </TouchableOpacity>
                        </View>

                        {credential.petVacunasList && credential.petVacunasList.map((vac: PetVaccine) => (
                            <View key={vac.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                                <View style={{ width: '48%' }}>
                                    <TouchableOpacity onPress={() => { setEditingVaccineId(vac.id); setEditingVaccineField('name'); setEditingLabel('Nombre de la Vacuna'); setIsModalVisible(true); }} style={[styles.infoRow, { backgroundColor: theme.card, borderColor: theme.border, paddingVertical: 12 }]}>
                                        <Text style={[styles.infoValue, { color: theme.text, fontSize: 14 }]} numberOfLines={1}>{vac.name || 'Vacuna'}</Text>
                                        <Ionicons name="pencil" size={12} color={theme.primary} style={{marginLeft: 5}} />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ width: '48%' }}>
                                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                        <TouchableOpacity onPress={() => { setEditingVaccineId(vac.id); setEditingVaccineField('date'); setEditingLabel('Fecha Aplicación'); setIsModalVisible(true); }} style={[styles.infoRow, { backgroundColor: theme.card, borderColor: theme.border, paddingVertical: 12, flex: 1 }]}>
                                            <Text style={[styles.infoValue, { color: theme.text, fontSize: 14 }]}>{vac.date || 'DD/MM/AAAA'}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => {
                                            const newList = credential.petVacunasList.filter((v: PetVaccine) => v.id !== vac.id);
                                            updateField('petVacunasList', newList);
                                        }} style={{marginLeft: 8}}>
                                            <Ionicons name="trash-outline" size={18} color={theme.danger} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))}

                        <View style={{marginTop: 10}}>
                            {renderRow('Tipo de Sangre', 'petSangre', credential.petSangre)}
                            {renderRow('Chip / Tatuaje', 'petChip', credential.petChip)}
                        </View>
                        
                        <Text style={[styles.sectionTitle, { color: theme.primary, marginTop: 20 }]}>EMERGENCIA</Text>
                        {renderRow('Nombre del Veterinario', 'petVeterinario', credential.petVeterinario)}
                        <View style={[styles.infoRow, { backgroundColor: theme.card, borderColor: theme.callButton, borderLeftWidth: 4, marginBottom: 15 }]}>
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
                    <Text style={[styles.infoLabel, { color: theme.subText }]}>Activar recordatorios</Text>
                    <Switch value={!!credential.hasReminder} onValueChange={(val) => updateField('hasReminder', val)} trackColor={{ false: "#767577", true: theme.primary }} />
                </View>

                {credential.hasReminder && (
                    <View style={{ marginBottom: 20 }}>
                        {credential.reminders?.map((rem: Reminder, index: number) => (
                            <View key={rem.id} style={[styles.reminderCard, { backgroundColor: theme.card, borderColor: theme.primary, borderLeftWidth: 5 }]}>
                                <View style={styles.reminderHeader}>
                                    <Text style={{fontSize: 10, fontWeight: 'bold', color: theme.primary}}>RECORDATORIO #{index + 1}</Text>
                                    <TouchableOpacity onPress={() => {
                                        const updatedReminders = credential.reminders.filter((r: Reminder) => r.id !== rem.id);
                                        updateField('reminders', updatedReminders);
                                    }}><Ionicons name="close-circle" size={20} color={theme.danger} /></TouchableOpacity>
                                </View>
                                <TouchableOpacity style={styles.groupItem} onPress={() => { setEditingReminderId(rem.id); setEditingReminderField('note'); setEditingLabel('Nota'); setIsModalVisible(true); }}>
                                    <View style={{flex: 1}}><Text style={[styles.infoLabel, { color: theme.subText }]}>Nota</Text><Text style={[styles.infoValue, { color: theme.text }]}>{rem.note || 'Toca para editar'}</Text></View>
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
                    </View>
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
                placeholder={editingField === 'autoVencimientoPoliza' || editingField === 'petNacimiento' || editingVaccineField === 'date' ? "DD/MM/AAAA" : ""} 
                initialValue={
                    editingVaccineId ? credential.petVacunasList.find((v: any) => v.id === editingVaccineId)?.[editingVaccineField] || '' :
                    editingReminderId ? credential.reminders.find((r: any) => r.id === editingReminderId)?.[editingReminderField] || '' : 
                    (credential ? credential[editingField as any] || '' : '')
                } 
                keyboardType={
                    editingField === 'petVeterinarioTelefono' || 
                    editingField === 'autoAseguradoraTelefono' || 
                    editingField === 'petNacimiento' || 
                    editingVaccineField === 'date' ||
                    editingReminderField === 'date' || 
                    editingReminderField === 'time' ? 'numeric' : 'default'
                } 
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { paddingHorizontal: width * 0.05, paddingTop: Platform.OS === 'ios' ? 40 : 35, paddingBottom: height * 0.15 },
    sectionTitle: { fontSize: 11, fontWeight: 'bold', marginBottom: 15, letterSpacing: 1.5, textTransform: 'uppercase' },
    infoRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 5 },
    infoLabel: { fontSize: 11, fontWeight: '700' },
    infoValue: { fontSize: 16 },
    innerEditBtn: { padding: 5, marginLeft: 10 },
    actionBtn: { padding: 8, borderRadius: 8, marginLeft: 10 },
    reminderCard: { borderRadius: 16, marginTop: 10, marginBottom: 10, borderWidth: 1, overflow: 'hidden' },
    reminderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingTop: 10 },
    groupItem: { padding: 12, flexDirection: 'row', alignItems: 'center' },
    divider: { height: 1, backgroundColor: '#E9ECEF', marginHorizontal: 12 },
    footerButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    actionButton: { flex: 0.48, height: 55, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 15, marginLeft: 8 },
    pickerTrigger: { padding: 15, borderRadius: 10, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    pickerTriggerText: { fontSize: 16 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 30 },
    modalContent: { borderRadius: 20, padding: 20, borderWidth: 1 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    modalItem: { paddingVertical: 15, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    modalItemText: { fontSize: 16 },
    petTypeCard: { width: '31%', height: 85, borderRadius: 16, borderWidth: 2, justifyContent: 'center', alignItems: 'center', padding: 10 },
    petTypeText: { fontSize: 11, fontWeight: 'bold', marginTop: 6 },
});