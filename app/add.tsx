import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, TextInput, TouchableOpacity, 
    ScrollView, Alert, SafeAreaView, Modal 
} from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { createCredential, Credential } from '../storage/credentials';
import SpecialCategoryForm from './components/SpecialCategoryForm';

export default function AddCredentialScreen() {
    const router = useRouter();
    const { type } = useLocalSearchParams<{ type: string }>();
    
    const [accountName, setAccountName] = useState('');
    const [alias, setAlias] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [notes, setNotes] = useState('');
    
    // Inicializamos con el tipo que viene del Dashboard
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

    const generatePassword = () => {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let res = "";
        for (let i = 0; i < 16; i++) res += charset.charAt(Math.floor(Math.random() * charset.length));
        setPassword(res);
    };

    const handleSpecialChange = (field: string, value: string) => {
        setSpecialData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!accountName) {
            Alert.alert("Error", "El nombre de la cuenta es obligatorio");
            return;
        }

        try {
            await createCredential({
                accountName,
                alias,
                username: (category === 'pet' || category === 'mobility') ? 'N/A' : (username || 'N/A'), 
                password: (category === 'pet' || category === 'mobility') ? 'N/A' : (password || 'N/A'),
                category,
                websiteUrl,
                notes,
                ...specialData 
            });

            Alert.alert("Éxito", "Cuenta guardada en el Bunker");
            router.back(); 
        } catch (error) {
            Alert.alert("Error", "No se pudo guardar la cuenta");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ 
                title: `Nuevo: ${categories.find(c => c.id === category)?.label}`, 
                headerShown: true 
            }} />
            <ScrollView contentContainerStyle={styles.scroll}>
                
                <Text style={styles.label}>Nombre de la cuenta *</Text>
                <TextInput style={styles.input} value={accountName} onChangeText={setAccountName} placeholder="Ej: Netflix / Nombre Mascota" placeholderTextColor="#666" />

                <Text style={styles.label}>Alias de la cuenta (Opcional)</Text>
                <TextInput style={styles.input} value={alias} onChangeText={setAlias} placeholder="Ej: Mi cuenta principal" placeholderTextColor="#666" />

                <Text style={styles.label}>Categoría Seleccionada</Text>
                <TouchableOpacity style={styles.pickerTrigger} onPress={() => setShowPicker(true)}>
                    <Text style={styles.pickerTriggerText}>
                        {categories.find(c => c.id === category)?.label}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#007BFF" />
                </TouchableOpacity>

                <SpecialCategoryForm 
                    category={category}
                    formData={specialData}
                    onChange={handleSpecialChange}
                    isDark={true}
                />

                {/* OCULTAR CAMPOS DE ACCESO SI ES MASCOTA O MOVILIDAD */}
                {category !== 'pet' && category !== 'mobility' && (
                    <>
                        <Text style={styles.label}>Usuario / Email *</Text>
                        <TextInput style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" placeholderTextColor="#666" />

                        <View style={styles.passwordHeader}>
                            <Text style={styles.labelPassword}>Contraseña *</Text>
                            <TouchableOpacity onPress={generatePassword}>
                                <Text style={styles.generateText}>Generar clave segura</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.passwordContainer}>
                            <TextInput style={styles.passwordInput} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} placeholderTextColor="#666" />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.innerIcon}>
                                <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#007BFF" />
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                <Text style={styles.label}>Sitio Web / URL</Text>
                <TextInput style={styles.input} value={websiteUrl} onChangeText={setWebsiteUrl} placeholder="www.ejemplo.com" placeholderTextColor="#666" />

                <Text style={styles.label}>Notas adicionales</Text>
                <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top' }]} value={notes} onChangeText={setNotes} multiline placeholderTextColor="#666" />

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
                                {category === item.id && <Ionicons name="checkmark-circle" size={22} color="#007BFF" />}
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
    input: { backgroundColor: '#1E1E1E', color: '#FFF', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#333', marginBottom: 5 },
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
    modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#333', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    modalItemText: { color: '#FFF', fontSize: 16 }
});