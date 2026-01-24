import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DrawerNavigationProp } from '@react-navigation/drawer';

// IMPORTACIONES DE TU MOTOR Y STORAGE
import { getAllCredentials } from '../storage/credentials';
import { calculateVaultHealth } from '../storage/securityEngine';

const COLORS = {
    deepMidnight: '#040740',
    darkSlate: '#172140',
    neonGreen: '#0DAC40',
    electricBlue: '#303AF2',
    vibrantRed: '#FF0000',
    textWhite: '#F8F9FA'
};

// --- COMPONENTE DE CABECERA (PARÁMETROS PERFECCIONADOS) ---
const SectionHeader = ({ title }: { title: string }) => {
    const navigation = useNavigation<DrawerNavigationProp<any>>();
  
    return (
      <View style={styles.headerWrapper}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{title}</Text>
          <TouchableOpacity 
            onPress={() => navigation.openDrawer()} 
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Text style={styles.backText}>VOLVER</Text>
            <Ionicons name="chevron-back" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.ultraThinLine} />
      </View>
    );
};

export default function SecuritySettingsScreen() {
    const [isBiometricActive, setIsBiometricActive] = useState(true);
    const [vaultScore, setVaultScore] = useState(0);

    useEffect(() => {
        loadSecurityStatus();
    }, []);

    const loadSecurityStatus = async () => {
        const data = await getAllCredentials();
        const stats = calculateVaultHealth(data);
        setVaultScore(stats.totalScore);
    };

    const SecurityItem = ({ icon, label, sublabel, rightElement, onPress }: any) => (
        <TouchableOpacity 
            style={styles.itemContainer} 
            onPress={onPress} 
            disabled={!onPress}
        >
            <View style={styles.itemLeft}>
                <View style={styles.iconWrapper}>
                    <Ionicons name={icon} size={22} color={COLORS.electricBlue} />
                </View>
                <View>
                    <Text style={styles.itemLabel}>{label}</Text>
                    {sublabel && <Text style={styles.itemSublabel}>{sublabel}</Text>}
                </View>
            </View>
            {rightElement}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <SectionHeader title="Seguridad" />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                {/* ESTADO GLOBAL (Con margen superior reducido) */}
                <View style={styles.statusCard}>
                    <View>
                        <Text style={styles.statusTitle}>Tus cuentas son</Text>
                        <Text style={styles.statusValue}>{vaultScore}% Seguras</Text>
                    </View>
                    <Ionicons name="shield-checkmark" size={40} color={COLORS.neonGreen} />
                </View>

                <Text style={styles.sectionHeader}>AUTENTICACIÓN</Text>
                <View style={styles.group}>
                    <SecurityItem 
                        icon="finger-print-outline" 
                        label="Acceso Biométrico" 
                        sublabel="Activar huella digital"
                        rightElement={
                            <Switch 
                                value={isBiometricActive} 
                                onValueChange={setIsBiometricActive}
                                trackColor={{ false: '#333', true: COLORS.neonGreen }}
                            />
                        }
                    />
                    <View style={styles.thinLine} />
                    <SecurityItem 
                        icon="lock-closed-outline" 
                        label="PIN de Acceso" 
                        sublabel="Cambiar PIN de acceso"
                        onPress={() => Alert.alert("Bunker-K", "Módulo de cambio de PIN en desarrollo.")}
                    />
                </View>

                <Text style={styles.sectionHeader}>AVANZADO</Text>
                <View style={styles.group}>
                    <SecurityItem 
                        icon="trash-outline" 
                        label="Eliminar todos los datos" 
                        sublabel="Esta acción no se puede deshacer"
                        onPress={() => Alert.alert("¡PELIGRO!", "¿Estás seguro de borrar TODA la bóveda?", [{text: 'Cancelar'}, {text: 'BORRAR TODO', style: 'destructive'}])}
                    />
                </View>

                <Text style={styles.footerManifesto}>
                    "Tu territorio digital, blindado por ti y para ti."
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.deepMidnight },
    
    // Header con los parámetros que validamos en Backups
    headerWrapper: { 
        paddingTop: Platform.OS === 'android' ? 50 : 20, 
        backgroundColor: COLORS.deepMidnight 
    },
    headerContent: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        paddingBottom: 12 
    },
    headerTitle: { color: '#FFF', fontSize: 16, fontWeight: '600' },
    backButton: { flexDirection: 'row-reverse', alignItems: 'center' },
    backText: { color: '#FFF', fontSize: 13, marginLeft: 8, fontWeight: '400' },
    ultraThinLine: { 
        height: 0.4, 
        backgroundColor: 'rgba(255, 255, 255, 0.2)', 
        width: '100%' 
    },

    // Ajuste de contenido
    scrollContent: { paddingHorizontal: 20, paddingTop: 10 }, 
    statusCard: { 
        backgroundColor: COLORS.darkSlate, 
        padding: 25, 
        borderRadius: 24, 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginTop: 10, // Espacio reducido respecto a la línea
        marginBottom: 25,
        borderWidth: 0.4,
        borderColor: 'rgba(255,255,255,0.08)'
    },
    statusTitle: { color: COLORS.textWhite, opacity: 0.6, fontSize: 14, fontWeight: '600' },
    statusValue: { color: COLORS.textWhite, fontSize: 24, fontWeight: '900', marginTop: 5 },
    sectionHeader: { color: COLORS.textWhite, opacity: 0.4, fontSize: 10, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 10, marginLeft: 5 },
    group: { backgroundColor: COLORS.darkSlate, borderRadius: 20, overflow: 'hidden', marginBottom: 25, borderWidth: 0.4, borderColor: 'rgba(255,255,255,0.08)' },
    itemContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18 },
    itemLeft: { flexDirection: 'row', alignItems: 'center' },
    iconWrapper: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(48, 58, 242, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    itemLabel: { color: COLORS.textWhite, fontSize: 16, fontWeight: '600' },
    itemSublabel: { color: COLORS.textWhite, fontSize: 12, opacity: 0.5, marginTop: 2 },
    thinLine: { height: 0.4, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 18 },
    footerManifesto: { color: COLORS.textWhite, opacity: 0.3, textAlign: 'center', fontSize: 12, marginTop: 20, marginBottom: 30, fontStyle: 'italic' }
});