import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Switch, SafeAreaView, Platform, Modal, StatusBar } from 'react-native';
import { useNavigation } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import Constants from 'expo-constants';

// --- IMPORTACIÓN DEL MOTOR DE NOMBRE ---
import { getUserName, saveUserName } from '../storage/userStorage';

const COLORS = {
    deepMidnight: '#040740',
    darkSlate: '#172140',
    electricBlue: '#303AF2',
    neonGreen: '#0DAC40',
    textWhite: '#F8F9FA'
};

const SectionHeader = ({ title }: { title: string }) => {
    const navigation = useNavigation<DrawerNavigationProp<any>>();
    return (
      <View style={styles.headerWrapper}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{title}</Text>
          <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.backButton}>
            <Text style={styles.backText}>VOLVER</Text>
            <Ionicons name="chevron-back" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.ultraThinLine} />
      </View>
    );
};

export default function SettingsScreen() {
    const [alias, setAlias] = useState("");
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [showPremiumModal, setShowPremiumModal] = useState(false);

    // 🔄 CARGAR NOMBRE AL ENTRAR
    useEffect(() => {
        const loadInitialName = async () => {
            const storedName = await getUserName();
            setAlias(storedName);
        };
        loadInitialName();
    }, []);

    // 💾 GUARDAR NOMBRE AL EDITAR
    const handleNameChange = async (newName: string) => {
        setAlias(newName);
        await saveUserName(newName);
    };

    const appVersion = Constants.expoConfig?.version || "1.0.0";

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <SectionHeader title="Configuración" />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                <Text style={styles.sectionLabel}>MI PERFIL</Text>
                <View style={styles.group}>
                    <View style={styles.profileItem}>
                        <Ionicons name="person-circle-outline" size={32} color={COLORS.electricBlue} />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.externalLabel}>Alias del Bunker</Text>
                            <View style={styles.inputBox}>
                                <TextInput 
                                    style={styles.inputStyle}
                                    value={alias}
                                    onChangeText={handleNameChange} // Ahora guarda mientras escribes
                                    placeholder="Tu nombre aquí..."
                                    placeholderTextColor="rgba(255,255,255,0.2)"
                                />
                            </View>
                        </View>
                    </View>
                </View>

                <Text style={styles.sectionLabel}>MEMBRESÍA</Text>
                <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>PLAN ACTUAL: GRATUITO</Text>
                </View>
                <TouchableOpacity 
                    style={styles.premiumCard} 
                    onPress={() => setShowPremiumModal(true)}
                    activeOpacity={0.9}
                >
                    <View style={{ flex: 1 }}>
                        <Text style={styles.premiumTitle}>Bunker-K Premium</Text>
                        <Text style={styles.premiumSub}>Tu información segura y justo cuando la necesites</Text>
                    </View>
                    <MaterialCommunityIcons name="crown-outline" size={28} color="#FFD700" />
                </TouchableOpacity>

                <Text style={styles.sectionLabel}>APARIENCIA</Text>
                <View style={styles.group}>
                    <View style={styles.item}>
                        <Ionicons name="color-palette-outline" size={22} color={COLORS.electricBlue} />
                        <View style={{ flex: 1, marginLeft: 15 }}>
                            <Text style={styles.itemLabel}>{isDarkMode ? "Deep Midnight" : "Crystal Clear"}</Text>
                            <Text style={styles.appearanceSub}>{isDarkMode ? "Versión obscura" : "Versión clara"}</Text>
                        </View>
                        <Switch 
                            value={isDarkMode} 
                            onValueChange={setIsDarkMode}
                            trackColor={{ false: '#333', true: COLORS.neonGreen }}
                        />
                    </View>
                </View>

                <View style={styles.infoFooter}>
                    <Text style={styles.versionText}>Versión {appVersion}</Text>
                    <Text style={styles.creditsText}>Desarrollado por Hugo Garcia Zarate</Text>
                    <Text style={styles.creditsText}>© 2026 Todos los derechos reservados.</Text>
                </View>

            </ScrollView>

            <Modal visible={showPremiumModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <MaterialCommunityIcons name="crown" size={60} color="#FFD700" />
                        <Text style={styles.modalTitle}>Bunker-K Premium</Text>
                        <View style={styles.benefitList}>
                            <Text style={styles.benefitText}>• Respaldos automáticos ilimitados</Text>
                            <Text style={styles.benefitText}>• Sincronización multi-dispositivo</Text>
                            <Text style={styles.benefitText}>• Acceso a temas exclusivos</Text>
                        </View>
                        <TouchableOpacity style={styles.closeBtn} onPress={() => setShowPremiumModal(false)}>
                            <Text style={styles.closeBtnText}>PRÓXIMAMENTE</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.deepMidnight },
    headerWrapper: { paddingTop: Platform.OS === 'android' ? 50 : 20 },
    headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12 },
    headerTitle: { color: '#FFF', fontSize: 16, fontWeight: '600' },
    backButton: { flexDirection: 'row-reverse', alignItems: 'center' },
    backText: { color: '#FFF', fontSize: 13, marginLeft: 8 },
    ultraThinLine: { height: 0.4, backgroundColor: 'rgba(255, 255, 255, 0.2)' },
    scrollContent: { paddingHorizontal: 20, paddingTop: 10 },
    sectionLabel: { color: COLORS.textWhite, opacity: 0.4, fontSize: 10, fontWeight: 'bold', marginBottom: 10, marginTop: 25, letterSpacing: 1.5 },
    group: { backgroundColor: COLORS.darkSlate, borderRadius: 16, overflow: 'hidden', borderWidth: 0.4, borderColor: 'rgba(255,255,255,0.08)' },
    profileItem: { flexDirection: 'row', alignItems: 'center', padding: 15 },
    externalLabel: { color: COLORS.textWhite, opacity: 0.4, fontSize: 10, fontWeight: '600', marginBottom: 6, marginLeft: 2 },
    inputBox: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
    inputStyle: { color: '#FFF', fontSize: 15, fontWeight: '500', padding: 0 },
    statusBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
    statusBadgeText: { color: COLORS.textWhite, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
    premiumCard: { backgroundColor: COLORS.electricBlue, padding: 18, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    premiumTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    premiumSub: { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2 },
    item: { flexDirection: 'row', alignItems: 'center', padding: 15 },
    itemLabel: { color: COLORS.textWhite, fontSize: 15, fontWeight: '600' },
    appearanceSub: { color: COLORS.textWhite, opacity: 0.4, fontSize: 11, marginTop: 2 },
    infoFooter: { marginTop: 50, alignItems: 'center', marginBottom: 40 },
    versionText: { color: COLORS.textWhite, opacity: 0.6, fontSize: 14, fontWeight: 'bold' },
    creditsText: { color: COLORS.textWhite, opacity: 0.3, fontSize: 11, marginTop: 5 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(4, 7, 64, 0.98)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '85%', backgroundColor: COLORS.darkSlate, padding: 30, borderRadius: 30, alignItems: 'center', borderWidth: 0.4, borderColor: COLORS.electricBlue },
    modalTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginVertical: 20 },
    benefitList: { alignSelf: 'stretch', marginBottom: 30 },
    benefitText: { color: '#FFF', opacity: 0.8, fontSize: 15, marginBottom: 12 },
    closeBtn: { backgroundColor: COLORS.neonGreen, paddingVertical: 14, paddingHorizontal: 40, borderRadius: 15 },
    closeBtnText: { color: COLORS.deepMidnight, fontWeight: '900' }
});