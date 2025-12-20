import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator } from 'react-native'; 
import { Stack, useRouter } from 'expo-router';
import InputField from './components/InputField'; 
import { Ionicons } from '@expo/vector-icons';
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
      category: 'none', // Valor por defecto
  });

  const generateSecurePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let password = "";
    for (let i = 0; i < 16; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password: password });
    setIsPasswordVisible(true);
    Alert.alert("Clave Generada", "Se ha creado una contraseña segura.");
  };

  const handleSave = async () => {
    if (!formData.accountName || !formData.username || !formData.password) {
        Alert.alert("Error", "Completa los campos obligatorios.");
        return;
    }
    setIsSaving(true); 
    try {
        await createCredential(formData);
        Alert.alert("Éxito", "Guardado correctamente.");
        router.back(); 
    } catch (error) {
        Alert.alert("Error", "No se pudo guardar.");
    } finally {
        setIsSaving(false); 
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: "Nueva Credencial" }} />

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={{ height: 40 }} />
        
        {/* SELECTOR DE CATEGORÍA */}
        <Text style={styles.label}>Categorizar como:</Text>
        <View style={styles.categoryContainer}>
            <TouchableOpacity 
                style={[styles.catButton, formData.category === 'fav' && styles.catActiveFav]}
                onPress={() => setFormData({...formData, category: 'fav'})}
            >
                <Ionicons name="star" size={20} color={formData.category === 'fav' ? "#FFF" : "#FFC107"} />
                <Text style={[styles.catText, formData.category === 'fav' && styles.textWhite]}>Favorito</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.catButton, formData.category === 'work' && styles.catActiveWork]}
                onPress={() => setFormData({...formData, category: 'work'})}
            >
                <Ionicons name="briefcase" size={20} color={formData.category === 'work' ? "#FFF" : "#6f42c1"} />
                <Text style={[styles.catText, formData.category === 'work' && styles.textWhite]}>Trabajo</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.catButton, formData.category === 'none' && styles.catActiveNone]}
                onPress={() => setFormData({...formData, category: 'none'})}
            >
                <Text style={[styles.catText, formData.category === 'none' && styles.textWhite]}>Ninguna</Text>
            </TouchableOpacity>
        </View>

        <InputField 
          label="Nombre de la Cuenta"
          placeholder="Netflix, Gmail..."
          value={formData.accountName}
          onChangeText={(text: string) => setFormData({...formData, accountName: text})}
        />
        
        <InputField 
          label="Usuario"
          autoCapitalize="none"
          value={formData.username}
          onChangeText={(text: string) => setFormData({...formData, username: text})}
        />
        
        <View style={styles.passwordContainer}>
            <InputField 
                label="Contraseña"
                secureTextEntry={!isPasswordVisible} 
                value={formData.password}
                onChangeText={(text: string) => setFormData({...formData, password: text})}
                inputStyle={{ paddingRight: 90 }} 
            />
            <View style={styles.actionIcons}>
                <TouchableOpacity onPress={generateSecurePassword} style={{ padding: 8 }}>
                    <Ionicons name="flash" size={22} color="#FFC107" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={{ padding: 8 }}>
                    <Ionicons name={isPasswordVisible ? 'eye-off' : 'eye'} size={22} color="#6C757D" />
                </TouchableOpacity>
            </View>
        </View>

        <InputField 
          label="URL del Sitio"
          placeholder="ejemplo.com"
          autoCapitalize="none"
          value={formData.websiteUrl}
          onChangeText={(text: string) => setFormData({...formData, websiteUrl: text})}
        />

        {/* --- CAMPO RECUPERADO --- */}
        <InputField 
          label="Nota Personal (Opcional)"
          placeholder="Información adicional"
          multiline={true}
          numberOfLines={4}
          inputStyle={{ height: 100, textAlignVertical: 'top' }}
          value={formData.notes}
          onChangeText={(text: string) => setFormData({...formData, notes: text})}
        />
        
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isSaving}>
            {isSaving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Guardar</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollViewContent: { paddingHorizontal: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#343A40', marginBottom: 10 },
  categoryContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  catButton: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', 
    padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#DEE2E6', flex: 0.32, justifyContent: 'center'
  },
  catActiveFav: { backgroundColor: '#FFC107', borderColor: '#FFC107' },
  catActiveWork: { backgroundColor: '#6f42c1', borderColor: '#6f42c1' },
  catActiveNone: { backgroundColor: '#6C757D', borderColor: '#6C757D' },
  catText: { marginLeft: 5, fontSize: 12, fontWeight: 'bold', color: '#495057' },
  textWhite: { color: '#FFF' },
  passwordContainer: { position: 'relative', marginBottom: 20 },
  actionIcons: { position: 'absolute', top: 35, right: 5, flexDirection: 'row' },
  saveButton: { backgroundColor: '#007BFF', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 20, marginBottom: 40 },
  saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});