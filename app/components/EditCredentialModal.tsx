// app/components/EditCredentialModal.tsx

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
    ActivityIndicator,
    Alert // Cambiado alert por Alert de RN para mejor UX
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Props del modal
interface EditModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSave: (newValue: string) => Promise<void>; 
    fieldLabel: string; 
    initialValue: string | undefined; 
    isPassword?: boolean; 
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

    useEffect(() => {
        setNewValue(initialValue || '');
    }, [initialValue, isVisible]); // Se resetea al abrirse

    const handleSave = async () => {
        if (!newValue.trim()) {
            Alert.alert("Atención", `El campo ${fieldLabel} no puede estar vacío.`);
            return;
        }
        setIsSaving(true);
        try {
            await onSave(newValue.trim());
            onClose(); 
        } catch (error) {
            Alert.alert('Error', 'No se pudo actualizar: ' + (error as Error).message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal
            animationType="slide" // 'slide' se siente más natural en Android
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    style={styles.centeredView}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <View style={styles.modalView}>
                        
                        <View style={styles.header}>
                            <Text style={styles.title}>Editar {fieldLabel}</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton} disabled={isSaving}>
                                <Ionicons name="close-circle" size={28} color="#6C757D" />
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
                                autoFocus={true} // El foco automático ayuda al usuario
                            />
                            {isPassword && (
                                <TouchableOpacity 
                                    onPress={() => setIsPasswordVisible(!isPasswordVisible)} 
                                    style={styles.passwordToggle}
                                >
                                    <Ionicons 
                                        name={isPasswordVisible ? 'eye-off' : 'eye'} 
                                        size={22} 
                                        color="#6C757D" 
                                    />
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.buttonRow}>
                            <TouchableOpacity 
                                style={styles.cancelButton} 
                                onPress={onClose}
                                disabled={isSaving}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>

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

                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Un poco más oscuro para resaltar el modal
    },
    modalView: {
        width: '85%',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212529',
    },
    closeButton: {
        padding: 5,
    },
    label: {
        fontSize: 13,
        color: '#495057',
        marginBottom: 10,
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F3F5',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#DEE2E6',
        marginBottom: 20,
    },
    input: {
        flex: 1,
        height: 50,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#212529',
    },
    passwordToggle: {
        paddingHorizontal: 15,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#007BFF', // Azul profesional
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#E9ECEF',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#495057',
        fontWeight: '600',
    },
    saveButtonDisabled: {
        backgroundColor: '#B0D4FF',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default EditCredentialModal;