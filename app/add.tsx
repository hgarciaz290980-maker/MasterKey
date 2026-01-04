import React, { useState } from 'react';
import { 
    View, Text, StyleSheet, TextInput, TouchableOpacity, 
    ScrollView, Alert, SafeAreaView, Modal 
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { createCredential, Credential } from '../storage/credentials';

export default function AddCredentialScreen() {
    const router = useRouter();
    
    // 1. Añadimos el estado para el alias
    const [accountName, setAccountName] = useState('');
    const [alias, setAlias] = useState(''); // <-- NUEVO
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [notes, setNotes] = useState('');
    const [category, setCategory] = useState<Credential['category']>('personal');
    
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

    const handleSave = async () => {
        if (!accountName || !username || !password) {
            Alert.alert("Error", "Los campos con * son obligatorios");
            return;
        }

        try {
            // 2. Pasamos el alias real a la función de guardado
            await createCredential({
                accountName,
                alias, // <-- AHORA GUARDA LO QUE ESCRIBAS
                username,
                password,
                category,
                websiteUrl,
                notes
            });

            Alert.alert("Éxito", "Cuenta guardada en el Bunker");
            router.back(); 
        } catch (error) {
            Alert.alert("Error", "No se pudo guardar la cuenta");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: "Nueva Cuenta", headerShown: true }} />
            <ScrollView contentContainerStyle={styles.scroll}>
                
                <Text style={styles.label}>Nombre de la cuenta *</Text>
                <TextInput style={styles.input} value={accountName} onChangeText={setAccountName} placeholder="Ej: Netflix" placeholderTextColor="#666" />

                {/* 3. CAMPO DE ALIAS INTEGRADO JUSTO AQUÍ */}
                <Text style={styles.label}>Alias de la cuenta (Opcional)</Text>
                <TextInput 
                    style={styles.input} 
                    value={alias} 
                    onChangeText={setAlias} 
                    placeholder="Ej: Mi cuenta principal" 
                    placeholderTextColor="#666" 
                />

                <Text style={styles.label}>Categoría</Text>
                <TouchableOpacity style={styles.pickerTrigger} onPress={() => setShowPicker(true)}>
                    <Text style={styles.pickerTriggerText}>
                        {categories.find(c => c.id === category)?.label || "Seleccionar categoría"}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#007BFF" />
                </TouchableOpacity>

                <Text style={styles.label}>Usuario / Email *</Text>
                <TextInput style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" placeholderTextColor="#666" />

                <Text style={styles.label}>Contraseña *</Text>
                <View style={styles.passwordRow}>
                    <TextInput 
                        style={[styles.input, { flex: 1 }]} 
                        value={password} 
                        onChangeText={setPassword} 
                        secureTextEntry={!showPassword} 
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.iconBtn}>
                        <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#007BFF" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={generatePassword} style={styles.iconBtn}>
                        <Ionicons name="flash" size={24} color="#FFD700" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.label}>Sitio Web</Text>
                <TextInput style={styles.input} value={websiteUrl} onChangeText={setWebsiteUrl} placeholder="www.ejemplo.com" placeholderTextColor="#666" />

                <Text style={styles.label}>Notas adicionales</Text>
                <TextInput 
                    style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
                    value={notes} 
                    onChangeText={setNotes} 
                    multiline 
                    placeholderTextColor="#666" 
                />

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Guardar Cuenta</Text>
                </TouchableOpacity>
            </ScrollView>

            <Modal visible={showPicker} transparent animationType="fade">
                <TouchableOpacity 
                    style={styles.modalOverlay} 
                    activeOpacity={1} 
                    onPress={() => setShowPicker(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Seleccionar Categoría</Text>
                        {categories.map((item) => (
                            <TouchableOpacity 
                                key={item.id} 
                                style={styles.modalItem}
                                onPress={() => { setCategory(item.id as any); setShowPicker(false); }}
                            >
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
    passwordRow: { flexDirection: 'row', alignItems: 'center' },
    iconBtn: { marginLeft: 10, padding: 5 },
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