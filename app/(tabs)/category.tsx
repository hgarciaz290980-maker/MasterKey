// app/(tabs)/category.tsx (Tipado y Datos Simulados Corregidos)

import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// --- DEFINICIONES DE TIPOS (INTERFACES) ---
interface AccountData {
    title: string;
    subtitle: string;
    subCategory: string; // Este campo ahora es REQUERIDO
}

interface AccountRowProps {
    title: string;
    subtitle: string;
    categoryTitle: string; 
    subCategory: string; 
}

interface SubCategorySectionProps {
    title: string;
    categoryTitle: string; 
    accounts: AccountData[];
}
// ------------------------------------------

const COLORS = {
  background: '#F8F9FA', 
  primary: '#007BFF',
  text: '#343A40',
  secondary: '#6C757D', 
  card: '#FFFFFF',
  border: '#EAEAEA',
  bullet: '#4C95FF', // Azul para el punto de lista
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 10,
  },
  // --- Estilos de la Tarjeta de Categoría Principal (Personal/Trabajo) ---
  mainCategoryCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 15,
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  mainCategoryText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  mainCategoryCount: {
    fontSize: 14,
    color: COLORS.secondary,
  },
  // --- Estilos de Subcategoría (Expandible) ---
  subCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginHorizontal: 15,
    marginTop: 5,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  subCategoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 5,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.bullet,
    marginRight: 8,
  },
  // --- Estilos de la Fila de Cuenta Individual ---
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: COLORS.card,
    marginHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  accountTitle: {
    fontSize: 15,
    color: COLORS.text,
  },
  accountSubtitle: {
    fontSize: 12,
    color: COLORS.secondary,
  },
});

// Componente para la Fila de Cuenta Individual (CON NAVEGACIÓN A DETALLE)
const AccountRow = ({ title, subtitle, categoryTitle, subCategory }: AccountRowProps) => {
    
    const navigateToDetail = () => {
        router.push({
            pathname: './detail',
            params: {
                title: title,
                category: categoryTitle,
                subCategory: subCategory,
            }
        });
    };

    return (
        <TouchableOpacity style={styles.accountRow} onPress={navigateToDetail}>
            <View>
                <Text style={styles.accountTitle}>{title}</Text>
                <Text style={styles.accountSubtitle}>{subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color={COLORS.secondary} />
        </TouchableOpacity>
    );
};

// Componente de Subcategoría Expandible
const SubCategorySection = ({ title, accounts, categoryTitle }: SubCategorySectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true); 

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View>
      <TouchableOpacity 
        style={styles.subCategoryHeader} 
        onPress={toggleExpand}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={styles.bulletPoint} />
          <Text style={styles.subCategoryTitle}>{title} ({accounts.length})</Text>
        </View>
        <Ionicons 
          name={isExpanded ? "chevron-up-outline" : "chevron-down-outline"} 
          size={20} 
          color={COLORS.secondary} 
        />
      </TouchableOpacity>
      
      {isExpanded && accounts.map((account, index) => (
        <AccountRow 
            key={index} 
            title={account.title} 
            subtitle={account.subtitle}
            categoryTitle={categoryTitle} // Pasamos la categoría principal
            subCategory={title} // Pasamos el nombre de la subcategoría
        />
      ))}
    </View>
  );
};

export default function CategoryScreen() {
  const params = useLocalSearchParams();
  const categoryTitle = params.title || 'Categoría Desconocida';
  
  // Datos simulados (Personales) - CAMPO subCategory AGREGADO
  const personalAccounts = [
    { title: "Netflix", subtitle: "usuario@correo.com", subCategory: "Entretenimiento" },
    { title: "Spotify", subtitle: "musiclover2024", subCategory: "Entretenimiento" },
  ];
  
  const servicesAccounts = [
    { title: "Banco Azteca", subtitle: "usuario@correo.com", subCategory: "Servicios" },
  ];
  
  // Datos simulados (Trabajo) - CAMPO subCategory AGREGADO
  const workAccounts = [
    { title: "GitHub", subtitle: "dev-user", subCategory: "Cuentas de Trabajo" }, 
    { title: "Slack", subtitle: "dev-workspace", subCategory: "Cuentas de Trabajo" }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* 1. Encabezado con Botón Volver */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{categoryTitle}</Text>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Tarjeta de Categoría Principal (Muestra el contador total) */}
        <View style={styles.mainCategoryCard}>
            <Text style={styles.mainCategoryText}>
              {categoryTitle}
            </Text>
            <Text style={styles.mainCategoryCount}>
              {categoryTitle === 'Personales' ? '3 cuentas' : '2 cuentas'}
            </Text>
        </View>

        {/* 2. Secciones Expandibles (Subcategorías) */}
        {categoryTitle === 'Personales' && (
          <>
            <SubCategorySection 
                title="Entretenimiento" 
                accounts={personalAccounts} 
                categoryTitle={categoryTitle}
            />
            <SubCategorySection 
                title="Servicios" 
                accounts={servicesAccounts} 
                categoryTitle={categoryTitle}
            />
          </>
        )}
        
        {categoryTitle === 'Trabajo' && (
          <SubCategorySection 
            title="Cuentas de Trabajo" 
            accounts={workAccounts}
            categoryTitle={categoryTitle}
          />
        )}

        <View style={{ height: 100 }} />

      </ScrollView>
    </SafeAreaView>
  );
}