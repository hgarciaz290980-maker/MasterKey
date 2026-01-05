import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardTypeOptions } from 'react-native';

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

  useEffect(() => {
    if (isVisible) {
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

  // ESTA FUNCIÓN ES LA QUE PONE LAS DIAGONALES Y PUNTOS
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
          <Text style={styles.label}>{fieldLabel}</Text>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={handleTextChange} // <-- CONECTADO CORRECTAMENTE AHORA
            autoFocus={true}
            keyboardType={keyboardType}
            placeholder={fieldLabel === 'Fecha' ? "DD/MM/AAAA" : fieldLabel === 'Hora' ? "00:00" : "Escribe aquí..."}
            placeholderTextColor="#999"
            maxLength={fieldLabel === 'Fecha' ? 10 : fieldLabel === 'Hora' ? 5 : undefined}
          />

          {fieldLabel === 'Hora' && (
            <View style={styles.periodContainer}>
              {['AM', 'PM'].map((p) => (
                <TouchableOpacity 
                  key={p} 
                  onPress={() => setPeriod(p)}
                  style={[styles.periodBtn, period === p && styles.periodBtnActive]}
                >
                  <Text style={{ color: period === p ? '#FFF' : '#333', fontWeight: 'bold' }}>{p}</Text>
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
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 20, padding: 25, elevation: 5 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  input: { borderBottomWidth: 1, borderBottomColor: '#007BFF', paddingVertical: 10, fontSize: 18, marginBottom: 25, color: '#000' },
  periodContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 25 },
  periodBtn: { paddingVertical: 8, paddingHorizontal: 20, marginHorizontal: 5, borderRadius: 8, borderWidth: 1, borderColor: '#DDD' },
  periodBtnActive: { backgroundColor: '#007BFF', borderColor: '#007BFF' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'flex-end' },
  cancelBtn: { marginRight: 20, padding: 10 },
  cancelText: { color: '#666', fontWeight: '600' },
  saveBtn: { backgroundColor: '#007BFF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  saveText: { color: '#FFF', fontWeight: 'bold' }
});