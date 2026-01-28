import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Colores oficiales del Búnker [cite: 2026-01-26]
const COLORS = {
    deepMidnight: '#040740',
    electricBlue: '#303AF2',
    darkSlate: '#172140',
    neonGreen: '#0DAC40',
    textWhite: '#F8F9FA'
};

interface CategoryCardProps {
  title: string;
  subtitle: string;
  iconName: keyof typeof Ionicons.glyphMap; 
  iconColor: string;
  isCategory: boolean; 
  route?: string; // Nueva prop para navegación dinámica
}

const CategoryCard: React.FC<CategoryCardProps> = ({ 
  title, 
  subtitle, 
  iconName, 
  iconColor, 
  isCategory = false,
  route
}) => {
  const router = useRouter();

  const handlePress = () => {
    if (route) {
        // @ts-ignore
        router.push(route);
    } else {
        console.log(`Navegando a la lista de: ${title}`);
        router.push('/list'); 
    }
  };

  if (!isCategory) {
    // ESTILO DARK PARA CUENTAS FRECUENTES
    return (
      <TouchableOpacity 
        style={styles.frequentCard} 
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={[styles.iconCircle, { backgroundColor: 'rgba(48, 58, 242, 0.15)' }]}>
           <Ionicons name={iconName} size={20} color={iconColor || COLORS.neonGreen} />
        </View>
        <Text style={styles.frequentTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.frequentSubtitle}>{subtitle}</Text>
        <Ionicons 
          name="star" 
          size={14} 
          color="#FFD700" 
          style={styles.starIcon} 
        />
      </TouchableOpacity>
    );
  }

  // ESTILO DARK PARA CATEGORÍAS (Lista)
  return (
    <TouchableOpacity 
      style={styles.categoryCard} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.categoryLeft}>
        <View style={styles.categoryIconContainer}>
            <Ionicons name={iconName} size={24} color={COLORS.neonGreen} />
        </View>
        <View style={styles.categoryTextContainer}>
          <Text style={styles.categoryTitle}>{title.toUpperCase()}</Text>
          <Text style={styles.categorySubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.neonGreen} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  frequentCard: {
    backgroundColor: COLORS.darkSlate,
    borderRadius: 18,
    padding: 15,
    width: '47%', 
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'flex-start',
    minHeight: 110,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  frequentTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textWhite,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  frequentSubtitle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
  },
  starIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.darkSlate,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(13, 172, 64, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTextContainer: {
    marginLeft: 15,
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textWhite,
    letterSpacing: 1.2,
  },
  categorySubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
});

export default CategoryCard;