import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// --- PALETA ACTUALIZADA (Deep Midnight) ---
const COLORS = {
    deepMidnight: '#040740',
    electricBlue: '#303AF2',
    darkSlate: '#172140',
    neonGreen: '#0DAC40',
    electricPurple: '#9D00FF',
    vibrantRed: '#FF0000',
    textWhite: '#F8F9FA',
    secondaryText: 'rgba(248, 249, 250, 0.6)',
    border: 'rgba(255, 255, 255, 0.05)',
};

interface DetailFieldProps {
    label: string;
    value: string;
    isSecret?: boolean;
    isURL?: boolean;
}

const DetailField = ({ label, value, isSecret = false, isURL = false }: DetailFieldProps) => {
    const [showValue, setShowValue] = useState(!isSecret);
    const displayValue = isSecret && !showValue ? '••••••••••' : value;

    return (
        <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>{label}</Text>
            <View style={styles.detailValueContainer}>
                <Text style={[styles.detailValue, isURL && styles.urlLink]} numberOfLines={1}>
                    {displayValue}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {isSecret && (
                        <TouchableOpacity onPress={() => setShowValue(!showValue)}>
                            <Ionicons name={showValue ? 'eye-off-outline' : 'eye-outline'} size={22} color={COLORS.secondaryText} />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.copyButton}>
                        <Ionicons name="copy-outline" size={22} color={COLORS.electricBlue} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default function DetailScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    console.log("Parámetros recibidos en detalle:", JSON.stringify(params, null, 2));
    
    // Forzamos a que sean string para que TypeScript no se queje
    const category = Array.isArray(params.category) ? params.category[0] : (params.category || 'Mascota');
    const title = Array.isArray(params.title) ? params.title[0] : (params.title || 'Husky');
    const subCategory = Array.isArray(params.subCategory) ? params.subCategory[0] : (params.subCategory || 'Salud');
    const petType = Array.isArray(params.petType) ? params.petType[0] : (params.petType || 'dog'); 

    // Ahora category.toLowerCase() ya no marcará error
    const isPetCategory = category.toLowerCase() === 'mascota';

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Encabezado */}
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.textWhite} />
                </TouchableOpacity>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="create-outline" size={24} color={COLORS.secondaryText} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="trash-outline" size={24} color={COLORS.vibrantRed} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
                {/* Chip de Categoría */}
                <View style={styles.categoryChipContainer}>
                    <Text style={styles.categoryChipText}>{category} • {subCategory}</Text>
                </View>

                {/* Título y Favorito */}
                <View style={styles.accountTitleRow}>
                    <Text style={styles.accountTitle}>{title}</Text>
                    <FontAwesome name="star" size={28} color="#FFC107" />
                </View>

                {/* --- INCIDENCIA: SELECTOR DE TIPO DE MASCOTA --- */}
                {category.toLowerCase() === 'mascota' && (
                    <View style={styles.petTypeWrapper}>
                        <Text style={styles.sectionTitle}>TIPO DE MASCOTA</Text>
                        <View style={styles.typeSelectorContainer}>
                            <View style={[styles.typeCard, petType === 'dog' && styles.typeCardSelected]}>
                                <Ionicons name="paw" size={28} color={petType === 'dog' ? COLORS.electricBlue : COLORS.textWhite} />
                                <Text style={styles.typeText}>Perro</Text>
                            </View>
                            <View style={[styles.typeCard, petType === 'cat' && styles.typeCardSelected]}>
                                <Ionicons name="logo-octocat" size={28} color={petType === 'cat' ? COLORS.electricBlue : COLORS.textWhite} />
                                <Text style={styles.typeText}>Gato</Text>
                            </View>
                            <View style={[styles.typeCard, petType === 'other' && styles.typeCardSelected]}>
                                <Ionicons name="help-circle-outline" size={28} color={petType === 'other' ? COLORS.electricBlue : COLORS.textWhite} />
                                <Text style={styles.typeText}>Otro</Text>
                            </View>
                        </View>
                    </View>
                )}

                <Text style={styles.sectionTitle}>INFORMACIÓN GENERAL</Text>
                <DetailField label="Alias / Nombre" value={title} />
                <DetailField label="Especie / Raza" value="Siberian Husky" />
                
                <Text style={styles.sectionTitle}>FICHA MÉDICA</Text>
                <DetailField label="Número de Chip" value="985112000123456" isSecret={true} />
                <DetailField label="Veterinario" value="Dr. García - Clínica Canina" />
                
                <View style={{ height: 50 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.deepMidnight },
    headerContainer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerActions: { flexDirection: 'row' },
    actionButton: { marginLeft: 20 },
    contentContainer: { paddingHorizontal: 20 },
    categoryChipContainer: {
        backgroundColor: 'rgba(48, 58, 242, 0.15)',
        alignSelf: 'flex-start',
        borderRadius: 12,
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginBottom: 15,
    },
    categoryChipText: { color: COLORS.electricBlue, fontWeight: 'bold', fontSize: 12 },
    accountTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    accountTitle: { fontSize: 32, fontWeight: 'bold', color: COLORS.textWhite },
    sectionTitle: { color: COLORS.electricBlue, fontSize: 11, fontWeight: 'bold', marginBottom: 15, letterSpacing: 1 },
    detailCard: {
        backgroundColor: COLORS.darkSlate,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    detailLabel: { fontSize: 12, color: COLORS.secondaryText, marginBottom: 4 },
    detailValueContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    detailValue: { fontSize: 16, color: COLORS.textWhite, flexShrink: 1 },
    copyButton: { marginLeft: 15 },
    urlLink: { color: COLORS.electricBlue, textDecorationLine: 'underline' },
    
    // Estilos del Selector de Mascota
    petTypeWrapper: { marginBottom: 25 },
    typeSelectorContainer: { flexDirection: 'row', justifyContent: 'space-between' },
    typeCard: {
        width: '31%',
        backgroundColor: COLORS.darkSlate,
        borderRadius: 16,
        paddingVertical: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    typeCardSelected: {
        borderColor: COLORS.electricBlue,
        backgroundColor: 'rgba(48, 58, 242, 0.1)',
    },
    typeText: { color: COLORS.textWhite, fontSize: 11, marginTop: 8, fontWeight: '600' }
});