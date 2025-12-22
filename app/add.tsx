import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator, useColorScheme } from 'react-native'; 
import { Stack, useRouter } from 'expo-router';
import InputField from './components/InputField'; 
import { Ionicons } from '@expo/vector-icons';
import { createCredential, Credential } from '../storage/credentials'; 

export default function AddScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  
  const isDark = colorScheme === 'dark';
  const theme = {
      background: isDark ? '#121212' : '#F8F9FA',
      text: isDark ? '#F8F9FA' : '#212529', // Blanco brillante en oscuro
      card: isDark ? '#1E1E1E' : '#FFFFFF',
      subText: isDark ? '#ADB5BD' : '#6C757D',
      border: isDark ? '#333333' : '#DEE2E6',
      primary: isDark ? '#3DA9FC' : '#007BFF',
  };

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false); 

  const [formData, setFormData] = useState<Omit<Credential, 'id'>>({
      accountName: '',
      username: '',
      password: '',
      recoveryEmail: '',
      websiteUrl: '',
      notes: '',
      category: 'none',
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ 
          title: "Nueva Credencial",
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text
      }} />

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={{ height: 40 }} />
        
        <Text style={[styles.label, { color: theme.text }]}>Categorizar como:</Text>
        <View style={styles.categoryContainer}>
            <TouchableOpacity 
                style={[styles.catButton, { backgroundColor: theme.card, borderColor: theme.border }, formData.category === 'fav' && styles.catActiveFav]}
                onPress={() => setFormData({...formData, category: 'fav'})}
            >
                <Ionicons name="star" size={20} color={formData.category === 'fav' ? "#FFF" : "#FFC107"} />
                <Text style={[styles.catText, { color: isDark ? '#FFF' : '#495057' }]}>Favorito</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.catButton, { backgroundColor: theme.card, borderColor: theme.border }, formData.category === 'work' && styles.catActiveWork]}
                onPress={() => setFormData({...formData, category: 'work'})}
            >
                <Ionicons name="briefcase" size={20} color={formData.category === 'work' ? "#FFF" : "#6f42c1"} />
                <Text style={[styles.catText, { color: isDark ? '#FFF' : '#495057' }]}>Trabajo</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.catButton, { backgroundColor: theme.card, borderColor: theme.border }, formData.category === 'none' && styles.catActiveNone]}
                onPress={() => setFormData({...formData, category: 'none'})}
            >
                <Text style={[styles.catText, { color: isDark ? '#FFF' : '#495057' }]}>Ninguna</Text>
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
          value={formData.username}
          onChangeText={(text: string) => setFormData({...formData, username: text})}
        />
        
        <View style={styles.passwordContainer}>
            <InputField 
                label="Contraseña"
                secureTextEntry={!isPasswordVisible} 
                value={formData.password}
                onChangeText={(text: string) => setFormData({...formData, password: text})}
            />
            <View style={styles.actionIcons}>
                <TouchableOpacity onPress={generateSecurePassword} style={{ padding: 8 }}>
                    <Ionicons name="flash" size={22} color="#FFC107" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={{ padding: 8 }}>
                    <Ionicons name={isPasswordVisible ? 'eye-off' : 'eye'} size={22} color={theme.subText} />
                </TouchableOpacity>
            </View>
        </View>

        <InputField 
          label="URL del Sitio"
          placeholder="ejemplo.com"
          value={formData.websiteUrl}
          onChangeText={(text: string) => setFormData({...formData, websiteUrl: text})}
        />

        <InputField 
          label="Nota Personal (Opcional)"
          placeholder="Información adicional"
          multiline={true}
          numberOfLines={4}
          value={formData.notes}
          onChangeText={(text: string) => setFormData({...formData, notes: text})}
        />
        
        <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.primary }]} onPress={handleSave} disabled={isSaving}>
            {isSaving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Guardar</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollViewContent: { paddingHorizontal: 20 },
  label: { fontSize: 16, fontWeight: '700', marginBottom: 10 }, // Más grosor para ver mejor
  categoryContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  catButton: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 10, borderWidth: 1, flex: 0.32, justifyContent: 'center' },
  catActiveFav: { backgroundColor: '#FFC107', borderColor: '#FFC107' },
  catActiveWork: { backgroundColor: '#6f42c1', borderColor: '#6f42c1' },
  catActiveNone: { backgroundColor: '#6C757D', borderColor: '#6C757D' },
  catText: { marginLeft: 5, fontSize: 12, fontWeight: 'bold' },
  passwordContainer: { position: 'relative' },
  actionIcons: { position: 'absolute', top: 38, right: 5, flexDirection: 'row' },
  saveButton: { padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 20, marginBottom: 40 },
  saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});