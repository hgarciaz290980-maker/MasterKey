import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardTypeOptions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard'; // Librería para copiar

interface EditModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
  fieldLabel: string;
  initialValue: string;
  keyboardType?: KeyboardTypeOptions;
}

export default function EditCredentialModal({ 
  isVisible, onClose, onSave, fieldLabel, initialValue, keyboardType = 'default' 
}: EditModalProps) {
  const [value, setValue] = useState(initialValue);
  const [period, setPeriod] = useState('AM');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowPassword(false); // Resetear visibilidad al abrir
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

  const isPasswordField = fieldLabel.toLowerCase().includes('contraseña') || fieldLabel.toLowerCase().includes('password');

  const generatePassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let res = "";
    for (let i = 0; i < 16; i++) res += charset.charAt(Math.floor(Math.random() * charset.length));
    setValue(res);
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(value);
    Alert.alert("Copiado", "Contraseña copiada al portapapeles");
  };

  const handleTextChange = (text: string) => {
    if (fieldLabel === 'Fecha') {
      let cleaned = text.replace(/[^0-9]/g, '');
      if (cleaned.length > 8) cleaned = cleaned.substring(0, 8);
      let formatted = cleaned;
      if (cleaned.length > 2) formatted = `${cleaned.substring(0, 2)}/${cleaned.substring(2)}`;
      if (cleaned.length > 4) formatted = `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}/${cleaned.substring(4)}`;
      setValue(formatted);
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

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.headerRow}>
            <Text style={styles.label}>{fieldLabel}</Text>
            {isPasswordField && (
              <View style={styles.passwordActions}>
                 <TouchableOpacity onPress={copyToClipboard} style={styles.actionIcon}>
                  <Ionicons name="copy-outline" size={20} color="#007BFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={generatePassword}>
                  <Text style={styles.generateText}>Generar nueva</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={handleTextChange}
              autoFocus={true}
              keyboardType={keyboardType}
              secureTextEntry={isPasswordField && !showPassword}
              placeholder={fieldLabel === 'Fecha' ? "DD/MM/AAAA" : fieldLabel === 'Hora' ? "00:00" : "Escribe aquí..."}
              placeholderTextColor="#666"
              maxLength={fieldLabel === 'Fecha' ? 10 : fieldLabel === 'Hora' ? 5 : undefined}
            />
            {isPasswordField && (
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.innerIcon}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#007BFF" />
              </TouchableOpacity>
            )}
          </View>

          {fieldLabel === 'Hora' && (
            <View style={styles.periodContainer}>
              {['AM', 'PM'].map((p) => (
                <TouchableOpacity 
                  key={p} 
                  onPress={() => setPeriod(p)}
                  style={[styles.periodBtn, period === p && styles.periodBtnActive]}
                >
                  <Text style={{ color: period === p ? '#FFF' : '#ADB5BD', fontWeight: 'bold' }}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => onSave(fieldLabel === 'Hora' ? `${value} ${period}` : value)} 
              style={styles.saveBtn}
            >
              <Text style={styles.saveText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1E1E1E', borderRadius: 20, padding: 25, borderWidth: 1, borderColor: '#333' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#ADB5BD' },
  passwordActions: { flexDirection: 'row', alignItems: 'center' },
  actionIcon: { marginRight: 15 },
  generateText: { color: '#007BFF', fontSize: 12, fontWeight: 'bold' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#007BFF', marginBottom: 25 },
  input: { flex: 1, paddingVertical: 10, fontSize: 18, color: '#FFF' },
  innerIcon: { paddingHorizontal: 10 },
  periodContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 25 },
  periodBtn: { paddingVertical: 8, paddingHorizontal: 20, marginHorizontal: 5, borderRadius: 8, borderWidth: 1, borderColor: '#333' },
  periodBtnActive: { backgroundColor: '#007BFF', borderColor: '#007BFF' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'flex-end' },
  cancelBtn: { marginRight: 20, padding: 10 },
  cancelText: { color: '#ADB5BD', fontWeight: '600' },
  saveBtn: { backgroundColor: '#007BFF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  saveText: { color: '#FFF', fontWeight: 'bold' }
});