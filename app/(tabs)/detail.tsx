// app/(tabs)/detail.tsx (Pantalla de Detalle de Cuenta - Tipado Corregido)

import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

// --- DEFINICIONES DE TIPOS (INTERFACES) ---
interface DetailFieldProps {
    label: string;
    value: string;
    isSecret?: boolean;
    isURL?: boolean;
}

interface NoteFieldProps {
    label: string;
    value: string;
}
// ------------------------------------------

const COLORS = {
    background: '#F8F9FA',
    primary: '#007BFF', // Azul
    text: '#343A40',
    secondary: '#6C757D', // Gris medio
    card: '#FFFFFF',
    border: '#EAEAEA',
    warning: '#DC3545', // Rojo para eliminar
    favorite: '#FFD700', // Oro para favorito
    chipBackground: '#E0EFFF', // Azul muy claro para el chip
    chipText: '#0056B3', // Azul oscuro para el chip
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
        justifyContent: 'space-between',
    },
    headerActions: {
        flexDirection: 'row',
    },
    actionButton: {
        marginLeft: 20,
    },
    contentContainer: {
        padding: 15,
    },
    // --- Chip de Categoría ---
    categoryChipContainer: {
        flexDirection: 'row',
        alignSelf: 'flex-start',
        backgroundColor: COLORS.chipBackground,
        borderRadius: 20,
        paddingVertical: 5,
        paddingHorizontal: 15,
        marginBottom: 15,
    },
    categoryChipText: {
        color: COLORS.chipText,
        fontWeight: 'bold',
        fontSize: 13,
    },
    // --- Título Principal ---
    accountTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    accountTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    // --- Fila de Detalle de Campo ---
    detailCard: {
        backgroundColor: COLORS.card,
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    detailLabel: {
        fontSize: 14,
        color: COLORS.secondary,
        marginBottom: 5,
    },
    detailValueContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailValue: {
        fontSize: 16,
        color: COLORS.text,
        flexShrink: 1, // Permite que el texto se ajuste
    },
    copyButton: {
        marginLeft: 15,
        padding: 5,
    },
    // --- Campo de URL ---
    urlLink: {
        color: COLORS.primary,
        textDecorationLine: 'underline',
        fontSize: 16,
    },
    // --- Campo de Nota ---
    noteCard: {
        minHeight: 80,
    },
    noteText: {
        fontSize: 15,
        color: COLORS.text,
    }
});

// Componente para la Tarjeta de Detalle (Genérica)
const DetailField = ({ label, value, isSecret = false, isURL = false }: DetailFieldProps) => {
    const [showValue, setShowValue] = useState(!isSecret);

    const displayValue = isSecret && !showValue ? '••••••••••' : value;

    const handleCopy = () => {
        // En una aplicación real, usaríamos Clipboard de Expo
        alert(`Copiado: ${value}`);
    };

    return (
        <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>{label}</Text>
            <View style={styles.detailValueContainer}>
                {isURL ? (
                    <Text style={styles.urlLink} numberOfLines={1}>
                        {displayValue}
                    </Text>
                ) : (
                    <Text style={styles.detailValue} numberOfLines={1}>
                        {displayValue}
                    </Text>
                )}

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {isSecret && (
                        <TouchableOpacity onPress={() => setShowValue(!showValue)}>
                            <Ionicons 
                                name={showValue ? 'eye-off-outline' : 'eye-outline'} 
                                size={24} 
                                color={COLORS.secondary} 
                            />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={handleCopy} style={styles.copyButton}>
                        <Ionicons name="copy-outline" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

// Componente para la Nota
const NoteField = ({ label, value }: NoteFieldProps) => (
    <View style={[styles.detailCard, styles.noteCard]}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.noteText}>{value}</Text>
    </View>
);

export default function DetailScreen() {
    const params = useLocalSearchParams();
    // Usamos los datos simulados que enviaremos desde category.tsx
    const title = params.title || 'Cuenta';
    const category = params.category || 'Personal';
    const subCategory = params.subCategory || 'Entretenimiento';

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* 1. Encabezado con Acciones */}
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="create-outline" size={24} color={COLORS.secondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="trash-outline" size={24} color={COLORS.warning} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.contentContainer}>
                {/* 2. Chip de Categoría */}
                <View style={styles.categoryChipContainer}>
                    <Text style={styles.categoryChipText}>
                        {category} • {subCategory}
                    </Text>
                </View>

                {/* 3. Título de la Cuenta y Favorito */}
                <View style={styles.accountTitleRow}>
                    <Text style={styles.accountTitle}>{title}</Text>
                    <FontAwesome name="heart" size={30} color={COLORS.favorite} />
                </View>

                {/* 4. Campos de Detalle */}
                <DetailField 
                    label="Usuario / Número de Cuenta" 
                    value="usuario@correo.com" 
                />
                <DetailField 
                    label="Contraseña" 
                    value="ClaveUltraSecreta123" 
                    isSecret={true} 
                />
                <DetailField 
                    label="Correo de Registro" 
                    value="usuario@correo.com" 
                />
                <DetailField 
                    label="Correo de Recuperación" 
                    value="backup@correo.com" 
                />
                <DetailField 
                    label="URL del Sitio Web" 
                    value="https://www.netflix.com" 
                    isURL={true} 
                />

                {/* 5. Nota Personal */}
                <NoteField 
                    label="Nota Personal" 
                    value="Plan Premium - 4 pantallas" 
                />
                
                <View style={{ height: 50 }} />
            </ScrollView>
        </SafeAreaView>
    );
}