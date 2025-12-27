import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TextInput, 
    TouchableOpacity, 
    SafeAreaView, 
    ScrollView, 
    Alert,
    useColorScheme 
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { createCredential } from '@/storage/credentials';

export default function AddCredentialScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const theme = {
        background: isDark ? '#121212' : '#F8F9FA',
        text: isDark ? '#F8F9FA' : '#212529',
        card: isDark ? '#1E1E1E' : '#FFFFFF',
        border: isDark ? '#333333' : '#E9ECEF',
        primary: '#007BFF',
        placeholder: isDark ? '#666' : '#ADB5BD'
    };

    const [accountName, setAccountName] = useState('');
    const [alias, setAlias] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [notes, setNotes] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    // Función para generar contraseña segura
    const generateSecurePassword = () => {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
        let retVal = "";
        for (let i = 0; i < 16; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        setPassword(retVal);
        setIsPasswordVisible(true); // La mostramos para que el usuario la vea al generarla
    };

    const handleSave = async () => {
        if (!accountName || !username || !password) {
            Alert.alert("Error", "Por favor completa los campos obligatorios");
            return;
        }

        try {
            await createCredential({
                accountName,
                alias,
                username,
                password,
                websiteUrl,
                notes,
                category: 'none'
            });

            Alert.alert("Éxito", "Cuenta guardada en Bunker", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error) {
            Alert.alert("Error", "No se pudo guardar la cuenta.");
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ title: "Nueva Cuenta", headerShadowVisible: false }} />
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                
                <Text style={[styles.label, { color: theme.text }]}>Nombre de la Cuenta *</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                    placeholder="Ej: Netflix, Gmail..."
                    placeholderTextColor={theme.placeholder}
                    value={accountName}
                    onChangeText={setAccountName}
                />

                <Text style={[styles.label, { color: theme.text }]}>Alias (Opcional)</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                    placeholder="Ej: Personal, Trabajo..."
                    placeholderTextColor={theme.placeholder}
                    value={alias}
                    onChangeText={setAlias}
                />

                <Text style={[styles.label, { color: theme.text }]}>Usuario / Correo *</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                    placeholder="Tu usuario o email"
                    placeholderTextColor={theme.placeholder}
                    autoCapitalize="none"
                    value={username}
                    onChangeText={setUsername}
                />

                <View style={styles.labelContainer}>
                    <Text style={[styles.label, { color: theme.text }]}>Contraseña *</Text>
                    <TouchableOpacity onPress={generateSecurePassword}>
                        <Text style={[styles.generateText, { color: theme.primary }]}>Generar Segura</Text>
                    </TouchableOpacity>
                </View>
                
                <View style={[styles.passwordContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <TextInput
                        style={[styles.passwordInput, { color: theme.text }]}
                        placeholder="Tu contraseña"
                        placeholderTextColor={theme.placeholder}
                        secureTextEntry={!isPasswordVisible}
                        value={password}
                        onChangeText={setPassword}
                    />
                    <TouchableOpacity 
                        style={styles.eyeIcon} 
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                    >
                        <Ionicons 
                            name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} 
                            size={22} 
                            color={theme.placeholder} 
                        />
                    </TouchableOpacity>
                </View>

                <Text style={[styles.label, { color: theme.text }]}>URL del Sitio Web</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                    placeholder="https://..."
                    placeholderTextColor={theme.placeholder}
                    autoCapitalize="none"
                    value={websiteUrl}
                    onChangeText={setWebsiteUrl}
                />

                <Text style={[styles.label, { color: theme.text }]}>Notas</Text>
                <TextInput
                    style={[styles.input, styles.textArea, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                    placeholder="Información adicional..."
                    placeholderTextColor={theme.placeholder}
                    multiline
                    numberOfLines={4}
                    value={notes}
                    onChangeText={setNotes}
                />

                <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.primary }]} onPress={handleSave}>
                    <Ionicons name="shield-checkmark-outline" size={24} color="#FFF" style={{ marginRight: 10 }} />
                    <Text style={styles.saveButtonText}>Guardar en Bunker</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    container: { 
        // Eliminamos flex: 1 de aquí para que el ScrollView funcione correctamente
        paddingHorizontal: 20, 
        paddingTop: 60, 
        paddingBottom: 100, // Más espacio al final para el botón
    },
    // Este controla el grupo de "Contraseña" y "Generar Segura"
    labelContainer: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginTop: 5, 
        marginBottom: 8 
    },
    // Este controla los títulos individuales (Nombre, Alias, etc.)
    label: { 
        fontSize: 14, 
        fontWeight: '700',
        marginBottom: 8,   // <--- Esto separa el texto de la casilla de abajo
        marginTop: 10,    // <--- Esto separa el texto del campo de arriba
    },
    generateText: { fontSize: 13, fontWeight: '600' },
    // Casillas normales
    input: { 
        padding: 10, 
        borderRadius: 12, 
        borderWidth: 1, 
        fontSize: 16, 
        marginBottom: 5 // Espacio pequeño porque el margen fuerte lo da el siguiente label
    },
    // Casilla de contraseña
    passwordContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        borderRadius: 12, 
        borderWidth: 1, 
        marginBottom: 5 
    },
    passwordInput: { flex: 1, padding: 15, fontSize: 16 },
    eyeIcon: { padding: 10 },
    textArea: { height: 100, textAlignVertical: 'top' },
    saveButton: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: 12, 
        borderRadius: 15, 
        marginTop: 20, // <--- Más espacio antes del botón final
        elevation: 3 
    },
    saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});