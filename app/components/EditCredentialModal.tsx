// components/EditCredentialModal.tsx

import React, { useState, useEffect } from 'react';
import { 
    Modal, 
    View, 
    Text, 
    StyleSheet, 
    TextInput, 
    TouchableOpacity, 
    KeyboardAvoidingView, 
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Credential } from '@/storage/credentials';

// Define las props que recibirá el modal
interface EditModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSave: (newValue: string) => Promise<void>; // Función para guardar el nuevo valor
    fieldLabel: string; // Etiqueta del campo (ej: 'Usuario', 'Contraseña')
    initialValue: string | undefined; // Valor actual del campo
    isPassword?: boolean; // Si es un campo de contraseña
}

const EditCredentialModal: React.FC<EditModalProps> = ({ 
    isVisible, 
    onClose, 
    onSave, 
    fieldLabel, 
    initialValue, 
    isPassword = false 
}) => {
    const [newValue, setNewValue] = useState(initialValue || '');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Actualiza el estado local si cambia el valor inicial
    useEffect(() => {
        setNewValue(initialValue || '');
    }, [initialValue]);

    const handleSave = async () => {
        if (!newValue.trim()) {
            alert(`El campo ${fieldLabel} no puede estar vacío.`);
            return;
        }
        setIsSaving(true);
        try {
            await onSave(newValue.trim());
            onClose(); 
        } catch (error) {
            alert('Error al guardar: ' + (error as Error).message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                style={styles.centeredView}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalView}>
                        
                        <View style={styles.header}>
                            <Text style={styles.title}>Editar {fieldLabel}</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close-circle-outline" size={28} color="#6C757D" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Nuevo valor para {fieldLabel}:</Text>
                        
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                onChangeText={setNewValue}
                                value={newValue}
                                placeholder={`Ingresa ${fieldLabel}`}
                                placeholderTextColor="#ADB5BD"
                                secureTextEntry={isPassword && !isPasswordVisible}
                                autoCapitalize="none"
                                editable={!isSaving}
                            />
                            {isPassword && (
                                <TouchableOpacity 
                                    onPress={() => setIsPasswordVisible(!isPasswordVisible)} 
                                    style={styles.passwordToggle}
                                >
                                    <Ionicons 
                                        name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} 
                                        size={22} 
                                        color="#6C757D" 
                                    />
                                </TouchableOpacity>
                            )}
                        </View>

                        <TouchableOpacity 
                            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} 
                            onPress={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.saveButtonText}>Guardar</Text>
                            )}
                        </TouchableOpacity>

                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Fondo oscuro
    },
    modalView: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#343A40',
    },
    closeButton: {
        padding: 5,
    },
    label: {
        fontSize: 14,
        color: '#6C757D',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        marginBottom: 20,
    },
    input: {
        flex: 1,
        height: 50,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#343A40',
    },
    passwordToggle: {
        paddingHorizontal: 15,
    },
    saveButton: {
        backgroundColor: '#28A745',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        backgroundColor: '#A0D8B2',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default EditCredentialModal;