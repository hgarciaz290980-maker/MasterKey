// components/CategoryCard.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Definición de las propiedades que recibirá el componente
interface CategoryCardProps {
  title: string;
  subtitle: string;
  iconName: keyof typeof Ionicons.glyphMap; 
  iconColor: string;
  isCategory: boolean; // true para Personal/Trabajo, false para Netflix/Spotify
}

const CategoryCard: React.FC<CategoryCardProps> = ({ 
  title, 
  subtitle, 
  iconName, 
  iconColor, 
  isCategory = false 
}) => {
  const router = useRouter();

  const handlePress = () => {
    // Aquí iría la navegación a la pantalla de detalle o lista
    console.log(`Navegando a: ${title}`);
    // router.push('/category'); 
  };

  if (!isCategory) {
    // ESTILO PARA TARJETAS DE CUENTAS FRECUENTES (Netflix, Spotify)
    return (
      <TouchableOpacity 
        style={styles.frequentCard} 
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={[styles.iconCircle, { backgroundColor: iconColor }]}>
          <Text style={styles.initials}>{title.charAt(0)}</Text>
        </View>
        <Text style={styles.frequentTitle}>{title}</Text>
        <Text style={styles.frequentSubtitle}>{subtitle}</Text>
        <Ionicons 
          name="star-outline" 
          size={20} 
          color="#FFD700" 
          style={styles.starIcon} 
        />
      </TouchableOpacity>
    );
  }

  // ESTILO PARA TARJETAS DE CATEGORÍA (Personal, Trabajo)
  return (
    <TouchableOpacity 
      style={styles.categoryCard} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.categoryLeft}>
        <Ionicons name={iconName} size={28} color="#495057" />
        <View style={styles.categoryTextContainer}>
          <Text style={styles.categoryTitle}>{title}</Text>
          <Text style={styles.categorySubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#ADB5BD" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // --- Estilos para Cuentas Frecuentes (Grid) ---
  frequentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    width: '47%', // 47% para dejar espacio para margen
    marginBottom: 15,
    elevation: 2, // Sombra Android
    shadowColor: '#000', // Sombra iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    alignItems: 'flex-start',
    minHeight: 120,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  initials: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  frequentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343A40',
    marginBottom: 2,
  },
  frequentSubtitle: {
    fontSize: 12,
    color: '#6C757D',
  },
  starIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },

  // --- Estilos para Categorías (Lista) ---
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTextContainer: {
    marginLeft: 15,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#343A40',
  },
  categorySubtitle: {
    fontSize: 14,
    color: '#6C757D',
  },
});

export default CategoryCard;