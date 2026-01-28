// components/SearchBar.tsx

import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SearchBar() {
  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        {/* Icono de Lupa */}
        <Ionicons name="search" size={20} color="#6C757D" style={styles.searchIcon} />
        
        {/* Campo de Búsqueda */}
        <TextInput
          style={styles.input}
          placeholder="Buscar credenciales..."
          placeholderTextColor="#6C757D"
          // Aquí se añadiría la lógica de búsqueda (onChangeText)
        />
      </View>
      
      {/* Icono de Engranaje (Configuración) */}
      <Ionicons name="settings-outline" size={24} color="#343A40" style={styles.settingsIcon} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  searchSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginRight: 15,
    height: 45,
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  searchIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingLeft: 0,
    backgroundColor: '#FFFFFF',
    color: '#343A40',
    fontSize: 16,
  },
  settingsIcon: {
    // Estilos del icono de configuración (engranaje)
  }
});