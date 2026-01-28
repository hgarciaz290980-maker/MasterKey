// app/FloatingButton.tsx (VERSIÓN FINAL CON NAVEGACIÓN FUNCIONANDO)

import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // <-- IMPORTACIÓN NECESARIA

export default function FloatingButton() {
  const router = useRouter(); // Inicializa el router

  const handlePress = () => {
    // Función de navegación: Abre la ruta /add
    router.push('/add'); 
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress}>
      <Ionicons name="add" size={30} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007BFF', 
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 90, 
    right: 20,
    
    // Sombra para hacerlo flotante
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});