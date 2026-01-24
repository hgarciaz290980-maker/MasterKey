import React, { useState, useEffect } from 'react'; 
import { 
    View, Text, StyleSheet, TouchableOpacity, 
    ScrollView, Alert, Modal, Dimensions, StatusBar
} from 'react-native';
import { Stack, useRouter, useNavigation, useFocusEffect } from 'expo-router'; 
import { DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle, G } from 'react-native-svg';

// IMPORTACIONES DE SALUD
import { getAllCredentials } from '../../storage/credentials';
import { calculateVaultHealth, VaultStats } from '../../storage/securityEngine';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

const COLORS = {
    deepMidnight: '#040740',
    electricBlue: '#303AF2',
    darkSlate: '#172140',
    neonGreen: '#0DAC40', 
    electricPurple: '#9D00FF',
    vibrantRed: '#FF0000',
    textWhite: '#F8F9FA'
};

interface HealthRingProps {
    size: number; strokeWidth: number; percentage: number; color: string; offset?: number;
}

const HealthRing = ({ size, strokeWidth, percentage, color, offset = 0 }: HealthRingProps) => {
    const radius = (size - strokeWidth) / 2 - offset;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    return (
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
            <Circle cx="50%" cy="50%" r={radius} stroke={color} strokeWidth={strokeWidth}
                fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                strokeLinecap="round" opacity={0.9} />
        </G>
    );
};

export default function DashboardScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userName, setUserName] = useState('Usuario');
    const [showTypeSelector, setShowTypeSelector] = useState(false);

    const [stats, setStats] = useState<VaultStats>({
        high: { count: 0, percent: 0 },
        medium: { count: 0, percent: 0 },
        low: { count: 0, percent: 0 },
        totalScore: 0
    });

    const categories = [
        { id: 'fav', label: 'Recurrentes', icon: 'star', color: '#FFC107' },
        { id: 'personal', label: 'Personal', icon: 'person', color: COLORS.neonGreen },
        { id: 'work', label: 'Trabajo', icon: 'briefcase', color: COLORS.electricPurple },
        { id: 'pet', label: 'Mascota', icon: 'paw', color: '#fd7e14' },
        { id: 'mobility', label: 'Movilidad', icon: 'car-sport', color: '#dc3545' },
        { id: 'entertainment', label: 'Entretenimiento', icon: 'play-circle', color: '#e83e8c' },
    ];

    useFocusEffect(
        React.useCallback(() => {
            const loadData = async () => {
                const name = await AsyncStorage.getItem('user_alias');
                if (name) setUserName(name);
                
                const data = await getAllCredentials();
                const newStats = calculateVaultHealth(data);
                setStats(newStats);
            };
            loadData();
        }, [])
    );

    useEffect(() => {
        (async () => {
            const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Acceso a Bunker-K' });
            if (result.success) setIsAuthenticated(true);
        })();
    }, []);

    if (!isAuthenticated) return <View style={{ flex: 1, backgroundColor: COLORS.deepMidnight }} />;

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.deepMidnight }}>
            <StatusBar barStyle="light-content" />
            <Stack.Screen options={{ headerShown: false }} />
            
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                
                <View style={styles.headerRow}>
                    <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text style={styles.brandText}>Bunker-K</Text>
                        <Text style={styles.welcomeText}>Hola, {userName}</Text>
                        <Text style={styles.subWelcomeText}>
                            Aquí tienes tu información, segura y en el momento que la necesites.
                        </Text>
                    </View>
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity style={styles.notificationBtn} onPress={() => router.push('/notifications' as any)}>
                            <Ionicons name="notifications-outline" size={24} color={COLORS.textWhite} />
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.notificationBtn, { marginLeft: 10 }]} 
                            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                        >
                            <Ionicons name="menu-outline" size={28} color={COLORS.textWhite} />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={styles.healthWidget} onPress={() => Alert.alert("Salud", `Puntaje: ${stats.totalScore}%`)}>
                    <View style={styles.widgetInner}>
                        <View style={styles.canvasContainer}>
                            <Svg height={windowWidth * 0.3} width={windowWidth * 0.3} viewBox="0 0 120 120">
                                <HealthRing size={120} strokeWidth={10} percentage={stats.high.percent} color={COLORS.neonGreen} offset={0} />
                                <HealthRing size={120} strokeWidth={10} percentage={stats.medium.percent} color={COLORS.electricPurple} offset={16} />
                                <HealthRing size={120} strokeWidth={10} percentage={stats.low.percent} color={COLORS.vibrantRed} offset={32} />
                            </Svg>
                            <View style={styles.scoreContainer}><Text style={styles.scoreText}>{stats.totalScore}%</Text></View>
                        </View>
                        <View style={{ marginLeft: 20, flex: 1 }}>
                            <Text style={styles.widgetTitle}>Salud Bóveda</Text>
                            <Text style={styles.statusText}><Ionicons name="shield-checkmark" color={COLORS.neonGreen} /> Fuertes ({stats.high.count})</Text>
                            <Text style={styles.statusText}><Ionicons name="alert-circle" color={COLORS.electricPurple} /> Medias ({stats.medium.count})</Text>
                            <Text style={styles.statusText}><Ionicons name="warning" color={COLORS.vibrantRed} /> Riesgo ({stats.low.count})</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>Categorías</Text>
                
                <View style={styles.grid}>
                    {categories.map((cat) => (
                        <TouchableOpacity key={cat.id} style={styles.catCard} onPress={() => router.push(`/list?filter=${cat.id}` as any)}>
                            <Ionicons name={cat.icon as any} size={22} color={cat.color} />
                            <Text style={styles.catLabel}>{cat.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity style={styles.btnAll} onPress={() => router.push('/list' as any)}>
                    <Ionicons name="key" size={20} color="#FFF" />
                    <Text style={styles.btnText}> Todas mis cuentas</Text>
                </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity 
                style={styles.fab} 
                onPress={() => setShowTypeSelector(true)}
            >
                <Ionicons name="add" size={35} color="#FFF" />
            </TouchableOpacity>

            <Modal visible={showTypeSelector} transparent animationType="slide">
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowTypeSelector(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>¿Qué deseas agregar?</Text>
                        <View style={styles.modalGrid}>
                            {categories.map((cat) => (
                                <TouchableOpacity 
                                    key={cat.id} 
                                    style={styles.modalItem} 
                                    onPress={() => { 
                                        setShowTypeSelector(false); 
                                        // RUTA DE NAVEGACIÓN CORREGIDA
                                        router.push({ pathname: '/create', params: { type: cat.id } } as any); 
                                    }}
                                >
                                    <View style={[styles.iconCircle, { backgroundColor: cat.color + '20' }]}>
                                        <Ionicons name={cat.icon as any} size={28} color={cat.color} />
                                    </View>
                                    <Text style={styles.modalItemLabel}>{cat.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity style={styles.cancelButton} onPress={() => setShowTypeSelector(false)}>
                            <View style={styles.cancelIconCircle}><Ionicons name="close" size={14} color={COLORS.vibrantRed} /></View>
                            <Text style={styles.cancelText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { paddingHorizontal: '5%', paddingTop: windowHeight * 0.08, paddingBottom: 180 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 25 },
    brandText: { color: COLORS.textWhite, fontSize: 28, fontWeight: '900' },
    welcomeText: { color: COLORS.textWhite, fontSize: 18, fontWeight: '600', marginTop: 2 },
    subWelcomeText: { color: COLORS.textWhite, opacity: 0.4, fontSize: 11, marginTop: 4, lineHeight: 16 },
    notificationBtn: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 15 },
    healthWidget: { backgroundColor: COLORS.darkSlate, borderRadius: 24, padding: 20, marginBottom: 25 },
    widgetInner: { flexDirection: 'row', alignItems: 'center' },
    canvasContainer: { justifyContent: 'center', alignItems: 'center' },
    scoreContainer: { position: 'absolute' },
    scoreText: { color: COLORS.textWhite, fontSize: 20, fontWeight: 'bold' },
    widgetTitle: { color: COLORS.textWhite, fontSize: 18, fontWeight: '700', marginBottom: 5 },
    statusText: { color: COLORS.textWhite, fontSize: 13, opacity: 0.8, marginBottom: 4 },
    sectionTitle: { color: COLORS.textWhite, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 15, opacity: 0.5 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    catCard: { width: '48%', backgroundColor: COLORS.darkSlate, padding: 15, borderRadius: 18, marginBottom: 15 },
    catLabel: { color: COLORS.textWhite, fontSize: 14, fontWeight: '600', marginTop: 8 },
    btnAll: { flexDirection: 'row', backgroundColor: COLORS.electricBlue, padding: 18, borderRadius: 18, marginTop: 10, justifyContent: 'center', alignItems: 'center' },
    btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
    fab: { position: 'absolute', bottom: windowHeight * 0.07, right: 25, width: 65, height: 65, borderRadius: 33, backgroundColor: COLORS.neonGreen, justifyContent: 'center', alignItems: 'center', elevation: 12, zIndex: 999 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: COLORS.darkSlate, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, minHeight: 450 },
    modalTitle: { color: COLORS.textWhite, fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    modalGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    modalItem: { width: '30%', alignItems: 'center', marginBottom: 20 },
    iconCircle: { width: 55, height: 55, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
    modalItemLabel: { color: COLORS.textWhite, fontSize: 11, textAlign: 'center' },
    cancelButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 30, paddingVertical: 10 },
    cancelIconCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: COLORS.vibrantRed, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
    cancelText: { color: COLORS.textWhite, fontSize: 16, fontWeight: '500', opacity: 0.8 }
});