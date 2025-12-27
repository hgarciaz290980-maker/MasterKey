import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TextInput,
    TouchableOpacity,
    useColorScheme
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EditModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSave: (newValue: string) => void;
    fieldLabel: string;
    initialValue: string;
    isPassword?: boolean;
}

export default function EditCredentialModal({
    isVisible,
    onClose,
    onSave,
    fieldLabel,
    initialValue,
    isPassword
}: EditModalProps) {
    const [value, setValue] = useState(initialValue);
    const [showPassword, setShowPassword] = useState(false);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue, isVisible]);

    // Función para generar contraseña segura dentro del modal
    const generatePassword = () => {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
        let retVal = "";
        for (let i = 0; i < 16; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        setValue(retVal);
        setShowPassword(true);
    };

    return (
        <Modal visible={isVisible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={[styles.modalContainer, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: isDark ? '#FFF' : '#212529' }]}>{fieldLabel}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close-circle" size={28} color="#ADB5BD" />
                        </TouchableOpacity>
                    </View>

                    {/* Botón de Generar solo si es campo de Password */}
                    {isPassword && (
                        <TouchableOpacity onPress={generatePassword} style={styles.generateContainer}>
                            <Ionicons name="refresh-circle-outline" size={20} color="#007BFF" />
                            <Text style={styles.generateText}>Generar Contraseña Segura</Text>
                        </TouchableOpacity>
                    )}

                    <View style={[styles.inputContainer, { backgroundColor: isDark ? '#2C2C2E' : '#F8F9FA' }]}>
                        <TextInput
                            style={[styles.input, { color: isDark ? '#FFF' : '#212529' }]}
                            value={value}
                            onChangeText={setValue}
                            secureTextEntry={isPassword && !showPassword}
                            autoFocus
                        />
                        {isPassword && (
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#6C757D" />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveButton} onPress={() => onSave(value)}>
                            <Text style={styles.saveButtonText}>Guardar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 25 },
    modalContainer: { borderRadius: 24, padding: 25, elevation: 10 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 20, fontWeight: 'bold' },
    generateContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, alignSelf: 'flex-start' },
    generateText: { color: '#007BFF', fontWeight: 'bold', marginLeft: 5, fontSize: 14 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 15, marginBottom: 25 },
    input: { flex: 1, paddingVertical: 15, fontSize: 16 },
    eyeIcon: { padding: 5 },
    buttonRow: { flexDirection: 'row', gap: 12 },
    cancelButton: { flex: 1, backgroundColor: '#E9ECEF', padding: 15, borderRadius: 12, alignItems: 'center' },
    cancelButtonText: { color: '#495057', fontWeight: 'bold', fontSize: 16 },
    saveButton: { flex: 1, backgroundColor: '#007BFF', padding: 15, borderRadius: 12, alignItems: 'center' },
    saveButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});