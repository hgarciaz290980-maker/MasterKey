import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardTypeOptions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

interface EditModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
  fieldLabel: string;
  initialValue: string;
  keyboardType?: KeyboardTypeOptions;
  placeholder?: string;
}

export default function EditCredentialModal({ 
  isVisible, onClose, onSave, fieldLabel, initialValue, keyboardType = 'default', placeholder 
}: EditModalProps) {
  const [value, setValue] = useState(initialValue);
  const [period, setPeriod] = useState('AM');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowPassword(false);
      if (initialValue.includes('AM')) {
        setValue(initialValue.replace(' AM', ''));
        setPeriod('AM');
      } else if (initialValue.includes('PM')) {
        setValue(initialValue.replace(' PM', ''));
        setPeriod('PM');
      } else {
        setValue(initialValue);
      }
    }
  }, [initialValue, isVisible]);

  const isPasswordField = 
    fieldLabel.toLowerCase().includes('contraseña') || 
    fieldLabel.toLowerCase().includes('password') || 
    fieldLabel.toLowerCase().includes('clave');

  const isDateField = 
    fieldLabel === 'Fecha' || 
    fieldLabel.toLowerCase().includes('vencimiento') || 
    fieldLabel.toLowerCase().includes('mantenimiento') ||
    fieldLabel.toLowerCase().includes('aceite') ||
    fieldLabel.toLowerCase().includes('frenos') ||
    fieldLabel.toLowerCase().includes('afinación');

  const isTireField = fieldLabel.toLowerCase().includes('llanta');

  const handleTextChange = (text: string) => {
    if (isTireField) {
      // 1. Limpiar caracteres y forzar mayúsculas
      let cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
      let formatted = cleaned;

      // 2. Aplicar regla: 3 números + / + 5 alfanuméricos
      if (cleaned.length > 3) {
        formatted = `${cleaned.slice(0, 3)}/${cleaned.slice(3, 8)}`;
      }
      
      setValue(formatted.slice(0, 9)); // Largo máximo: 3 (num) + 1 (/) + 5 (alfa) = 9
    } else if (isDateField) {
      const cleaned = text.replace(/\D/g, '');
      let formatted = cleaned;
      if (cleaned.length > 2) formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
      if (cleaned.length > 4) formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
      setValue(formatted.slice(0, 10));
    } else if (fieldLabel === 'Hora') {
      let cleaned = text.replace(/[^0-9]/g, '');
      if (cleaned.length > 4) cleaned = cleaned.substring(0, 4);
      let formatted = cleaned;
      if (cleaned.length > 2) formatted = `${cleaned.substring(0, 2)}:${cleaned.substring(2)}`;
      setValue(formatted);
    } else {
      setValue(text);
    }
  };

  const handleConfirm = () => {
    if (fieldLabel === 'Hora') {
      const [h, m] = value.split(':');
      if (parseInt(h) > 12 || parseInt(m) > 59) {
        Alert.alert("Error", "Por favor ingresa una hora válida (01-12)");
        return;
      }
      onSave(`${value} ${period}`);
    } else {
      onSave(value);
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.headerRow}>
            <Text style={styles.label}>{fieldLabel}</Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={handleTextChange}
              autoFocus={true}
              keyboardType={isTireField ? 'default' : keyboardType}
              secureTextEntry={isPasswordField && !showPassword}
              autoCapitalize={isTireField ? 'characters' : 'none'}
              placeholder={placeholder || (isDateField ? "DD/MM/AAAA" : "Escribe aquí...")}
              placeholderTextColor="#666"
              maxLength={isDateField ? 10 : fieldLabel === 'Hora' ? 5 : isTireField ? 9 : undefined}
            />
          </View>

          {fieldLabel === 'Hora' && (
            <View style={styles.periodContainer}>
              {['AM', 'PM'].map((p) => (
                <TouchableOpacity key={p} onPress={() => setPeriod(p)} style={[styles.periodBtn, period === p && styles.periodBtnActive]}>
                  <Text style={{ color: period === p ? '#FFF' : '#ADB5BD', fontWeight: 'bold' }}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}><Text style={styles.cancelText}>Cancelar</Text></TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} style={styles.saveBtn}><Text style={styles.saveText}>Confirmar</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1E1E1E', borderRadius: 20, padding: 25, borderWidth: 1, borderColor: '#333' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#ADB5BD' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#007BFF', marginBottom: 25 },
  input: { flex: 1, paddingVertical: 10, fontSize: 18, color: '#FFF' },
  periodContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 25 },
  periodBtn: { paddingVertical: 8, paddingHorizontal: 20, marginHorizontal: 5, borderRadius: 8, borderWidth: 1, borderColor: '#333' },
  periodBtnActive: { backgroundColor: '#007BFF', borderColor: '#007BFF' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'flex-end' },
  cancelBtn: { marginRight: 20, padding: 10 },
  cancelText: { color: '#ADB5BD', fontWeight: '600' },
  saveBtn: { backgroundColor: '#007BFF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  saveText: { color: '#FFF', fontWeight: 'bold' }
});