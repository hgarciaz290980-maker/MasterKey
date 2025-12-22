import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    Alert, 
    SafeAreaView, 
    ActivityIndicator, 
    useColorScheme, 
    StatusBar, 
    Platform 
} from 'react-native'; 
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// IMPORTACIONES (Mantenemos la estructura de carpetas)
import InputField from './components/InputField'; 
import { createCredential, Credential } from '../storage/credentials'; 

export default function AddScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  
  const isDark = colorScheme === 'dark';
  const theme = {
      background: isDark ? '#121212' : '#F8F9FA',
      text: isDark ? '#F8F9FA' : '#212529',
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
  };

  const handleSave = async () => {
    if (!formData.accountName.trim() || !formData.username.trim() || !formData.password.trim()) {
        Alert.alert("Campos incompletos", "Por favor ingresa nombre, usuario y contraseña.");
        return;
    }

    setIsSaving(true); 
    try {
        // Log para ver en la terminal de la Mac qué estamos intentando guardar
        console.log("Intentando guardar credencial...", formData);
        
        await createCredential(formData);
        
        console.log("¡Guardado exitoso en SecureStore!");
        Alert.alert("Éxito", "Cuenta guardada correctamente.", [
            { text: "OK", onPress: () => router.back() }
        ]);
    } catch (error: any) {
        // ESTO ES LO MÁS IMPORTANTE: Ver el error real en la terminal
        console.error("ERROR AL GUARDAR:", error);
        Alert.alert("Error de Guardado", `No se pudo guardar: ${error.message || 'Error desconocido'}`);
    } finally {
        setIsSaving(false); 
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Stack.Screen options={{ 
          title: "Nueva Credencial",
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerShadowVisible: false,
      }} />

      <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
        <View style={{ height: 20 }} />
        
        <Text style={[styles.label, { color: theme.text }]}>Categorizar como:</Text>
        <View style={styles.categoryContainer}>
            <TouchableOpacity 
                style={[styles.catButton, { backgroundColor: theme.card, borderColor: theme.border }, formData.category === 'fav' && styles.catActiveFav]}
                onPress={() => setFormData({...formData, category: 'fav'})}
            >
                <Ionicons name="star" size={18} color={formData.category === 'fav' ? "#FFF" : "#FFC107"} />
                <Text style={[styles.catText, { color: formData.category === 'fav' ? '#FFF' : theme.text }]}>Favorito</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.catButton, { backgroundColor: theme.card, borderColor: theme.border }, formData.category === 'work' && styles.catActiveWork]}
                onPress={() => setFormData({...formData, category: 'work'})}
            >
                <Ionicons name="briefcase" size={18} color={formData.category === 'work' ? "#FFF" : "#6f42c1"} />
                <Text style={[styles.catText, { color: formData.category === 'work' ? '#FFF' : theme.text }]}>Trabajo</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.catButton, { backgroundColor: theme.card, borderColor: theme.border }, formData.category === 'none' && styles.catActiveNone]}
                onPress={() => setFormData({...formData, category: 'none'})}
            >
                <Text style={[styles.catText, { color: formData.category === 'none' ? '#FFF' : theme.text }]}>General</Text>
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
                <TouchableOpacity onPress={generateSecurePassword} style={styles.iconAction}>
                    <Ionicons name="flash" size={20} color="#FFC107" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.iconAction}>
                    <Ionicons name={isPasswordVisible ? 'eye-off' : 'eye'} size={20} color={theme.subText} />
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
          label="Nota Personal"
          multiline={true}
          numberOfLines={3}
          value={formData.notes}
          onChangeText={(text: string) => setFormData({...formData, notes: text})}
        />
        
        <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: theme.primary }]} 
            onPress={handleSave} 
            disabled={isSaving}
        >
            {isSaving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Guardar</Text>}
        </TouchableOpacity>
        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  scrollViewContent: { paddingHorizontal: 20 },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 10, textTransform: 'uppercase' },
  categoryContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  catButton: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 12, borderWidth: 1, flex: 0.31, justifyContent: 'center' },
  catActiveFav: { backgroundColor: '#FFC107', borderColor: '#FFC107' },
  catActiveWork: { backgroundColor: '#6f42c1', borderColor: '#6f42c1' },
  catActiveNone: { backgroundColor: '#495057', borderColor: '#495057' },
  catText: { marginLeft: 5, fontSize: 11, fontWeight: 'bold' },
  passwordContainer: { position: 'relative' },
  actionIcons: { position: 'absolute', top: 38, right: 5, flexDirection: 'row' },
  iconAction: { padding: 8 },
  saveButton: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});