import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, TextInput, TouchableOpacity, 
    ScrollView, Alert, SafeAreaView, Modal 
} from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// --- AJUSTE DE RUTA DE SERVICIO ---
import { createCredential, Credential, getAllCredentials } from '../storage/credentials';
// @ts-ignore
import { uploadToGoogleDrive } from './components/googleDriveService';
// ------------------------------------

import SpecialCategoryForm from './components/SpecialCategoryForm';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  } as any),
});

export default function AddCredentialScreen() {
    const router = useRouter();
    const { type } = useLocalSearchParams<{ type: string }>();
    
    const [accountName, setAccountName] = useState('');
    const [alias, setAlias] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [notes, setNotes] = useState('');
    const [category, setCategory] = useState<Credential['category']>((type as any) || 'personal');
    const [specialData, setSpecialData] = useState<any>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showPicker, setShowPicker] = useState(false);

    const categories = [
        { id: 'fav', label: 'Recurrentes' },
        { id: 'personal', label: 'Personal' },
        { id: 'work', label: 'Trabajo' },
        { id: 'pet', label: 'Mascota' },
        { id: 'mobility', label: 'Movilidad' },
        { id: 'entertainment', label: 'Entretenimiento' },
    ];

    const formatAutoDate = (text: string) => {
        const cleaned = text.replace(/\D/g, '');
        let formatted = cleaned;
        if (cleaned.length > 2) formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
        if (cleaned.length > 4) formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
        return formatted.slice(0, 10);
    };

    const handleSpecialChange = (field: string, value: string) => {
        let finalValue = value;
        if (field.toLowerCase().includes('fecha')) finalValue = formatAutoDate(value);
        setSpecialData((prev: any) => ({ ...prev, [field]: finalValue }));
    };

    useEffect(() => { checkPermissions(); }, []);

    const checkPermissions = async () => {
        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            if (existingStatus !== 'granted') await Notifications.requestPermissionsAsync();
        }
    };

    const scheduleCategoryNotification = async (name: string, data: any) => {
        try {
            const dateStr = data.petFechaAlerta || data.autoFechaAlerta;
            const timeStr = data.petHoraAlerta || data.autoHoraAlerta;
            const period = data.petPeriodoAlerta || data.autoPeriodoAlerta || 'AM';

            if (dateStr && timeStr) {
                const [day, month, year] = dateStr.trim().split('/').map(Number);
                const [rawHour, minutes] = timeStr.trim().split(':').map(Number);
                let hour = rawHour;
                if (period === 'PM' && hour < 12) hour += 12;
                if (period === 'AM' && hour === 12) hour = 0;
                const triggerDate = new Date(year, month - 1, day, hour, minutes, 0);
                
                if (triggerDate.getTime() > Date.now()) {
                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: `🚨 Bunker-K: ${name}`,
                            body: `Recordatorio: ${data.petNotas || data.autoNotas || 'Revisar detalles.'}`,
                            data: { type: category },
                        },
                        trigger: { date: triggerDate } as any,
                    });
                }
            }
        } catch (error) { console.error(error); }
    };

    const handleSave = async () => {
        if (!accountName) {
            Alert.alert("Error", "El nombre es obligatorio");
            return;
        }
        try {
            await createCredential({
                accountName,
                alias: category === 'pet' ? 'Mascota' : (category === 'mobility' ? alias || 'Auto' : alias), 
                username: (category === 'pet' || category === 'mobility') ? 'N/A' : (username || 'N/A'), 
                password: (category === 'pet' || category === 'mobility') ? 'N/A' : (password || 'N/A'),
                category,
                websiteUrl,
                notes,
                ...specialData 
            });

            await scheduleCategoryNotification(accountName, specialData);

            // --- TRIGGER DE DRIVE ---
            const allData = await getAllCredentials();
            const jsonData = JSON.stringify(allData);
            
            uploadToGoogleDrive(jsonData).then((success: boolean) => {
                if (success) console.log("Copia de seguridad automática actualizada en Drive");
            });

            router.back(); 
        } catch (error) { Alert.alert("Error", "No se pudo guardar"); }
    };

    const generatePassword = () => {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let res = "";
        for (let i = 0; i < 16; i++) res += charset.charAt(Math.floor(Math.random() * charset.length));
        setPassword(res);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: `Nuevo: ${categories.find(c => c.id === category)?.label}`, headerShown: true }} />
            <ScrollView contentContainerStyle={styles.scroll}>
                
                <Text style={styles.label}>
                    {category === 'pet' ? 'Nombre de tu perrhijo o gathijo *' : (category === 'mobility' ? 'Auto *' : 'Nombre de la cuenta *')}
                </Text>
                <TextInput 
                    style={styles.input} 
                    value={accountName} 
                    onChangeText={setAccountName} 
                    placeholder={category === 'pet' ? "Ej: Toby, Luna, Pelusa..." : (category === 'mobility' ? "Ej: Mazda, BYD, Toyota" : "Ej: Netflix, Mi Banco...")} 
                    placeholderTextColor="#666" 
                />
                
                {category !== 'pet' && (
                    <>
                        <Text style={styles.label}>Alias (Opcional)</Text>
                        <TextInput 
                            style={styles.input} 
                            value={alias} 
                            onChangeText={setAlias} 
                            placeholder={category === 'mobility' ? "Ej: Bumblebee, Halcón Milenario..." : "Ej: Cuenta Personal"} 
                            placeholderTextColor="#666" 
                        />
                    </>
                )}

                <Text style={styles.label}>Categoría Seleccionada</Text>
                <TouchableOpacity style={styles.pickerTrigger} onPress={() => setShowPicker(true)}>
                    <Text style={styles.pickerTriggerText}>{categories.find(c => c.id === category)?.label}</Text>
                    <Ionicons name="chevron-down" size={20} color="#007BFF" />
                </TouchableOpacity>

                <SpecialCategoryForm category={category} formData={specialData} onChange={handleSpecialChange} isDark={true} />

                {category !== 'pet' && category !== 'mobility' && (
                    <>
                        <Text style={styles.label}>Usuario / Email *</Text>
                        <TextInput style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" placeholder="correo@ejemplo.com" placeholderTextColor="#666" />
                        <View style={styles.passwordHeader}>
                            <Text style={styles.labelPassword}>Contraseña *</Text>
                            <TouchableOpacity onPress={generatePassword}>
                                <Text style={styles.generateText}>Generar clave segura</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.passwordContainer}>
                            <TextInput style={styles.passwordInput} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} placeholder="••••••••" placeholderTextColor="#666" />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.innerIcon}>
                                <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#007BFF" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.label}>Sitio Web / URL</Text>
                        <TextInput style={styles.input} value={websiteUrl} onChangeText={setWebsiteUrl} placeholder="https://..." placeholderTextColor="#666" />
                    </>
                )}

                <Text style={styles.label}>Notas adicionales</Text>
                <TextInput style={[styles.input, { height: 100 }]} value={notes} onChangeText={setNotes} multiline placeholder="Cualquier detalle extra..." placeholderTextColor="#666" />

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Guardar Cuenta</Text>
                </TouchableOpacity>
            </ScrollView>

            <Modal visible={showPicker} transparent animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowPicker(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Seleccionar Categoría</Text>
                        {categories.map((item) => (
                            <TouchableOpacity key={item.id} style={styles.modalItem} onPress={() => { setCategory(item.id as any); setShowPicker(false); }}>
                                <Text style={styles.modalItemText}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    scroll: { padding: 20 },
    label: { color: '#ADB5BD', fontSize: 14, marginBottom: 8, marginTop: 15, fontWeight: 'bold' },
    input: { backgroundColor: '#1E1E1E', color: '#FFF', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#333' },
    passwordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, marginBottom: 8 },
    labelPassword: { color: '#ADB5BD', fontSize: 14, fontWeight: 'bold' },
    generateText: { color: '#007BFF', fontSize: 12, fontWeight: 'bold' },
    passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E1E', borderRadius: 10, borderWidth: 1, borderColor: '#333' },
    passwordInput: { flex: 1, color: '#FFF', padding: 15, fontSize: 16 },
    innerIcon: { paddingHorizontal: 15 },
    pickerTrigger: { backgroundColor: '#1E1E1E', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#333', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    pickerTriggerText: { color: '#FFF', fontSize: 16 },
    saveButton: { backgroundColor: '#007BFF', padding: 18, borderRadius: 12, marginTop: 40, alignItems: 'center', marginBottom: 50 },
    saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 30 },
    modalContent: { backgroundColor: '#1E1E1E', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#333' },
    modalTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#333' },
    modalItemText: { color: '#FFF', fontSize: 16 }
});