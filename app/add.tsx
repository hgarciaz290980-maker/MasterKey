// app/add.tsx (Versión FINAL y CORREGIDA - Usa createCredential)

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator } from 'react-native'; 
import { Stack, useRouter } from 'expo-router';
import InputField from './components/InputField'; 
import { Ionicons } from '@expo/vector-icons';
// RUTA CORREGIDA: Importamos createCredential en lugar de addCredential
import { createCredential, Credential } from '../storage/credentials'; 


export default function AddScreen() {
  const router = useRouter();

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false); 

  const [formData, setFormData] = useState<Omit<Credential, 'id'>>({
      accountName: '',
      username: '',
      password: '',
      recoveryEmail: '',
      websiteUrl: '',
      notes: '',
  });

  const handleSave = async () => {
    if (!formData.accountName || !formData.username || !formData.password) {
        Alert.alert("Error", "Por favor, completa Nombre de la Cuenta, Usuario y Contraseña.");
        return;
    }

    setIsSaving(true); 

    try {
        // CORREGIDO: Usamos createCredential
        await createCredential(formData);

        Alert.alert("Éxito", "La credencial se ha guardado de forma segura.");
        router.back(); 
        
    } catch (error) {
        Alert.alert("Error de Guardado", "No se pudo guardar la credencial. Inténtalo de nuevo.");
        console.error("Error al guardar:", error);
    } finally {
        setIsSaving(false); 
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      
      <Stack.Screen 
        options={{ 
          title: "Agregar Nueva Cuenta",
        }} 
      />

      <ScrollView 
        contentContainerStyle={styles.scrollViewContent} 
        keyboardShouldPersistTaps="handled"
      >
        
        <View style={{ height: 60 }} /> 
        
        <InputField 
          label="Nombre de la Cuenta"
          placeholder="Ej: Netflix, Google, Banco Santander"
          value={formData.accountName}
          onChangeText={(text: string) => setFormData({...formData, accountName: text})}
        />
        
        <InputField 
          label="Usuario / Número de Cuenta"
          placeholder="ejemplo@correo.com o miusuario"
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.username}
          onChangeText={(text: string) => setFormData({...formData, username: text})}
        />
        
        <View style={styles.passwordContainer}>
            <InputField 
                label="Contraseña"
                placeholder="Ingresa la contraseña"
                secureTextEntry={!isPasswordVisible} 
                value={formData.password}
                onChangeText={(text: string) => setFormData({...formData, password: text})}
                inputStyle={styles.passwordInput} 
            />
            <TouchableOpacity 
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                style={styles.eyeIcon}
            >
                <Ionicons 
                    name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} 
                    size={24} 
                    color="#6C757D" 
                />
            </TouchableOpacity>
        </View>

        <InputField 
          label="Correo de Recuperación (Opcional)"
          placeholder="backup@correo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.recoveryEmail}
          onChangeText={(text: string) => setFormData({...formData, recoveryEmail: text})}
        />
        
        <InputField 
          label="URL del Sitio Web (Opcional)"
          placeholder="https://www.ejemplo.com"
          keyboardType="url"
          autoCapitalize="none"
          value={formData.websiteUrl}
          onChangeText={(text: string) => setFormData({...formData, websiteUrl: text})}
        />

        <InputField 
          label="Nota Personal (Opcional)"
          placeholder="Información adicional sobre la cuenta"
          multiline={true}
          numberOfLines={4}
          inputStyle={styles.notesInput}
          value={formData.notes}
          onChangeText={(text: string) => setFormData({...formData, notes: text})}
        />
        
        <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSave}
            disabled={isSaving} 
        >
            {isSaving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
                <Text style={styles.saveButtonText}>Guardar Credencial</Text>
            )}
        </TouchableOpacity>

        <View style={{ height: 20 }} /> 
        
      </ScrollView>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, 
    backgroundColor: '#F8F9FA',
  },
  scrollViewContent: {
    paddingHorizontal: 20,
  },
  
  saveButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  passwordContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  passwordInput: {
    paddingRight: 50, 
  },
  eyeIcon: {
    position: 'absolute',
    top: 35, 
    right: 5,
    padding: 10,
    zIndex: 10,
  },
  notesInput: {
    height: 100, 
    textAlignVertical: 'top',
  }
});