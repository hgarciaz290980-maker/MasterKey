import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, TextInput, TouchableOpacity, 
    ScrollView, Alert, Dimensions, KeyboardAvoidingView, Platform 
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// --- SERVICIOS Y COMPONENTES (Rutas corregidas quirúrgicamente) ---
import { createCredential, getAllCredentials } from '../storage/credentials';
import { uploadToGoogleDrive } from './components/googleDriveService'; 
import SpecialCategoryForm from './components/SpecialCategoryForm';

const COLORS = {
    deepMidnight: '#040740',
    electricBlue: '#303AF2',
    darkSlate: '#172140',
    neonGreen: '#0DAC40',
    textWhite: '#F8F9FA'
};

export default function CreateScreen() {
    const router = useRouter();
    const { type } = useLocalSearchParams<{ type: string }>();
    
    // ESTADOS COMPLETOS (Mantenidos según tu lógica original)
    const [accountName, setAccountName] = useState('');
    const [alias, setAlias] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [notes, setNotes] = useState('');
    const [specialData, setSpecialData] = useState<any>({});
    const [category, setCategory] = useState<any>('personal');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (type) setCategory(type);
    }, [type]);

    const generatePassword = () => {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let res = "";
        for (let i = 0; i < 16; i++) res += charset.charAt(Math.floor(Math.random() * charset.length));
        setPassword(res);
    };

    const handleSave = async () => {
        if (!accountName) {
            Alert.alert("Error", "El nombre es obligatorio");
            return;
        }
        try {
            await createCredential({
                accountName,
                alias: (category === 'pet' || category === 'mobility') ? category.toUpperCase() : (alias || 'Cuenta'), 
                username: (category === 'pet' || category === 'mobility') ? 'N/A' : (username || 'N/A'), 
                password: (category === 'pet' || category === 'mobility') ? 'N/A' : (password || 'N/A'),
                category,
                websiteUrl,
                notes,
                ...specialData 
            });

            const allData = await getAllCredentials();
            uploadToGoogleDrive(JSON.stringify(allData));

            Alert.alert("Bóveda Actualizada", "Información blindada con éxito.");
            router.back(); 
        } catch (error) { Alert.alert("Error", "No se pudo guardar"); }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1, backgroundColor: COLORS.deepMidnight}}>
            <Stack.Screen options={{ headerShown: false }} />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>NUEVA FICHA</Text>
                </View>

                <View style={styles.card}>
                    {/* NOMBRE PRINCIPAL */}
                    <Text style={styles.labelNombre}>
                        {category === 'pet' ? 'NOMBRE DE TU MASCOTA *' : (category === 'mobility' ? 'VEHÍCULO *' : 'NOMBRE DE LA CUENTA *')}
                    </Text>
                    <TextInput 
                        style={styles.input} 
                        value={accountName} 
                        onChangeText={setAccountName} 
                        placeholder="Escribir aquí..." 
                        placeholderTextColor="rgba(255,255,255,0.2)" 
                    />

                    {/* ALIAS (Solo si no es mascota/auto) */}
                    {category !== 'pet' && category !== 'mobility' && (
                        <>
                            <Text style={styles.labelNombre}>ALIAS (OPCIONAL)</Text>
                            <TextInput 
                                style={styles.input} 
                                value={alias} 
                                onChangeText={setAlias} 
                                placeholder="Ej: Mi Personal, Oficina..." 
                                placeholderTextColor="rgba(255,255,255,0.2)" 
                            />
                        </>
                    )}

                    {/* FORMULARIOS ESPECIALES */}
                    <SpecialCategoryForm 
                        category={category} 
                        formData={specialData} 
                        onChange={(f:string, v:string) => setSpecialData((p:any)=>({...p, [f]:v}))} 
                        isDark={true} 
                    />

                    {/* CAMPOS DE CREDENCIALES (Ocultos para mascota/auto) */}
                    {category !== 'pet' && category !== 'mobility' && (
                        <>
                            <Text style={styles.labelNombre}>USUARIO / EMAIL *</Text>
                            <TextInput 
                                style={styles.input} 
                                value={username} 
                                onChangeText={setUsername} 
                                autoCapitalize="none" 
                                placeholder="correo@ejemplo.com" 
                                placeholderTextColor="rgba(255,255,255,0.2)" 
                            />
                            
                            <View style={styles.passwordHeader}>
                                <Text style={styles.labelNombre}>CONTRASEÑA *</Text>
                                <TouchableOpacity onPress={generatePassword}>
                                    <Text style={styles.generateText}>GENERAR CLAVE</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.passwordContainer}>
                                <TextInput 
                                    style={[styles.input, { flex: 1 }]} 
                                    value={password} 
                                    onChangeText={setPassword} 
                                    secureTextEntry={!showPassword} 
                                    placeholder="••••••••" 
                                    placeholderTextColor="rgba(255,255,255,0.2)" 
                                />
                                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={COLORS.neonGreen} />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.labelNombre}>SITIO WEB / URL</Text>
                            <TextInput 
                                style={styles.input} 
                                value={websiteUrl} 
                                onChangeText={setWebsiteUrl} 
                                placeholder="https://..." 
                                placeholderTextColor="rgba(255,255,255,0.2)" 
                            />
                        </>
                    )}

                    {/* NOTAS */}
                    <Text style={styles.labelNombre}>NOTAS ADICIONALES</Text>
                    <TextInput 
                        style={[styles.input, styles.textArea]} 
                        value={notes} 
                        onChangeText={setNotes} 
                        multiline 
                        numberOfLines={4}
                        placeholder="Cualquier detalle extra..." 
                        placeholderTextColor="rgba(255,255,255,0.2)" 
                    />

                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>BLINDAR INFORMACIÓN</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    scroll: { padding: 20, paddingTop: 60 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
    backBtn: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 12 },
    headerTitle: { color: '#FFF', fontSize: 14, fontWeight: '900', marginLeft: 15, letterSpacing: 2 },
    card: { backgroundColor: COLORS.darkSlate, padding: 25, borderRadius: 30, marginBottom: 50 },
    input: { backgroundColor: 'rgba(255,255,255,0.05)', color: '#FFF', padding: 15, borderRadius: 15, fontSize: 16 },
    textArea: { height: 120, textAlignVertical: 'top' }, 
    passwordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    generateText: { color: COLORS.electricBlue, fontSize: 10, fontWeight: '900', marginTop: 15, letterSpacing: 1 },
    passwordContainer: { flexDirection: 'row', alignItems: 'center' },
    eyeIcon: { position: 'absolute', right: 15 },
    saveButton: { backgroundColor: COLORS.electricBlue, padding: 20, borderRadius: 18, marginTop: 40, alignItems: 'center' },
    saveButtonText: { color: '#FFF', fontWeight: '900', letterSpacing: 2, fontSize: 12 },
    labelNombre: { 
        color: COLORS.neonGreen, 
        fontSize: 11, 
        fontWeight: '900', 
        marginBottom: 10, 
        marginTop: 25, 
        letterSpacing: 1.5 
    },
});