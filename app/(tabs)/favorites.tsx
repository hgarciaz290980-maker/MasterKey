// app/(tabs)/favorites.tsx (Pantalla de Favoritos)

import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

export default function FavoritesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>⭐ Cuentas Favoritas</Text>
      <Text style={styles.subtitle}>Aquí irán todas tus cuentas marcadas con estrella.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#343A40',
  },
  subtitle: {
    fontSize: 16,
    color: '#6C757D',
  },
});