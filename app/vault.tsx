import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, StatusBar, Modal, FlatList } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAllCredentials } from '../storage/credentials';
import Svg, { Circle, G } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const COLORS = {
    deepMidnight: '#040740',
    electricBlue: '#303AF2',
    darkSlate: '#172140',
    neonGreen: '#0DAC40', 
    electricPurple: '#9D00FF',
    vibrantRed: '#FF0000',
    textWhite: '#F8F9FA'
};

const HealthRing = ({ size, strokeWidth, percentage, color, offset = 0 }: any) => {
    const radius = (size - strokeWidth) / 2 - offset;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    return (
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
            <Circle 
                cx="50%" cy="50%" r={radius} stroke={color} strokeWidth={strokeWidth}
                fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                strokeLinecap="round" opacity={0.9} 
            />
        </G>
    );
};

export default function VaultScreen() {
    const router = useRouter();
    const [stats, setStats] = useState({
        total: 0,
        fav: 0, personal: 0, work: 0, pet: 0, mobility: 0, entertainment: 0,
        uncategorized: 0, // Nuevo contador
        highRisk: [] as any[],
        mediumRisk: [] as any[],
        secure: [] as any[],
        totalScore: 0,
        totalCredentials: 0
    });

    const [selectedRisk, setSelectedRisk] = useState<{title: string, color: string, items: any[]} | null>(null);

    useFocusEffect(
        React.useCallback(() => {
            const loadVaultData = async () => {
                const allItems: any[] = await getAllCredentials();
                
                const fav = allItems.filter(i => i.category === 'fav').length;
                const personal = allItems.filter(i => i.category === 'personal').length;
                const work = allItems.filter(i => i.category === 'work').length;
                const pet = allItems.filter(i => i.category === 'pet').length;
                const mobility = allItems.filter(i => i.category === 'mobility').length;
                const entertainment = allItems.filter(i => i.category === 'entertainment').length;

                // Cálculo de cuentas sin categorizar
                const categorizedCount = fav + personal + work + pet + mobility + entertainment;
                const uncategorized = allItems.length - categorizedCount;

                const credentials = allItems.filter(i => 
                    i.password && i.password !== 'N/A' && 
                    i.category !== 'pet' && i.category !== 'mobility'
                );

                const highRisk = credentials.filter(c => (c.password?.length || 0) < 6);
                const mediumRisk = credentials.filter(c => (c.password?.length || 0) >= 6 && (c.password?.length || 0) <= 10);
                const secure = credentials.filter(c => (c.password?.length || 0) > 10);

                const score = credentials.length > 0 
                    ? Math.round(((secure.length * 100) + (mediumRisk.length * 50)) / credentials.length)
                    : 0;

                setStats({
                    total: allItems.length,
                    fav, personal, work, pet, mobility, entertainment,
                    uncategorized,
                    highRisk, mediumRisk, secure,
                    totalScore: score,
                    totalCredentials: credentials.length
                });
            };
            loadVaultData();
        }, [])
    );

    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="light-content" />
            <Stack.Screen options={{ 
                headerShown: true,
                title: 'Mi Bóveda', 
                headerStyle: { backgroundColor: COLORS.deepMidnight },
                headerTintColor: '#FFF',
                headerShadowVisible: false,
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
                        <Ionicons name="chevron-back" size={28} color="#FFF" />
                    </TouchableOpacity>
                )
            }} />
            
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.healthCenter}>
                    <Text style={styles.healthTitle}>Seguridad de tus Cuentas</Text>
                    <Text style={styles.healthSubtitle}>Estado General</Text>
                    
                    <View style={styles.canvasContainer}>
                        <Svg height={width * 0.45} width={width * 0.45} viewBox="0 0 120 120">
                            <HealthRing size={120} strokeWidth={8} percentage={stats.totalCredentials > 0 ? (stats.secure.length / stats.totalCredentials) * 100 : 0} color={COLORS.neonGreen} offset={0} />
                            <HealthRing size={120} strokeWidth={8} percentage={stats.totalCredentials > 0 ? (stats.mediumRisk.length / stats.totalCredentials) * 100 : 0} color={COLORS.electricPurple} offset={12} />
                            <HealthRing size={120} strokeWidth={8} percentage={stats.totalCredentials > 0 ? (stats.highRisk.length / stats.totalCredentials) * 100 : 0} color={COLORS.vibrantRed} offset={24} />
                        </Svg>
                        <View style={styles.scoreAbsolute}>
                            <Text style={styles.scoreText}>{stats.totalScore}%</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.summaryCard}>
                    <Text style={styles.summaryText}>
                        Tienes <Text style={{fontWeight:'bold', color: COLORS.neonGreen}}>{stats.total}</Text> datos seguros.
                    </Text>
                    <View style={styles.divider} />
                    
                    <View style={styles.statsGrid}>
                        <StatItem icon="star" label="Recurrentes" count={stats.fav} color="#FFC107" />
                        <StatItem icon="person" label="Personal" count={stats.personal} color={COLORS.neonGreen} />
                        <StatItem icon="briefcase" label="Trabajo" count={stats.work} color={COLORS.electricPurple} />
                    </View>
                    <View style={[styles.statsGrid, {marginTop: 20}]}>
                        <StatItem icon="paw" label="Mascotas" count={stats.pet} color="#fd7e14" />
                        <StatItem icon="car-sport" label="Movilidad" count={stats.mobility} color="#dc3545" />
                        <StatItem icon="play-circle" label="Entretenimiento" count={stats.entertainment} color="#e83e8c" />
                    </View>

                    {/* RECUADRO DE CUENTAS SIN CATEGORIZAR */}
                    {stats.uncategorized > 0 && (
                        <View style={styles.unorganizedBanner}>
                            <Ionicons name="folder-open-outline" size={16} color="rgba(255,255,255,0.5)" />
                            <Text style={styles.unorganizedText}>
                                Tienes <Text style={{color: '#FFF', fontWeight: 'bold'}}>{stats.uncategorized}</Text> cuentas sin categorizar.
                            </Text>
                        </View>
                    )}
                </View>

                <Text style={styles.sectionLabel}>ANÁLISIS DE FORTALEZA</Text>
                
                <TouchableOpacity onPress={() => setSelectedRisk({title: 'Cuentas en Riesgo', color: COLORS.vibrantRed, items: stats.highRisk})}>
                    <RiskSection title="En Riesgo" color={COLORS.vibrantRed} count={stats.highRisk.length} items={stats.highRisk} icon="alert-circle" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setSelectedRisk({title: 'Seguridad Media', color: COLORS.electricPurple, items: stats.mediumRisk})}>
                    <RiskSection title="Media" color={COLORS.electricPurple} count={stats.mediumRisk.length} items={stats.mediumRisk} icon="shield-half" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setSelectedRisk({title: 'Cuentas Seguras', color: COLORS.neonGreen, items: stats.secure})}>
                    <RiskSection title="Seguras" color={COLORS.neonGreen} count={stats.secure.length} items={stats.secure} icon="shield-checkmark" />
                </TouchableOpacity>
            </ScrollView>

            <Modal visible={!!selectedRisk} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, {color: selectedRisk?.color}]}>{selectedRisk?.title}</Text>
                            <TouchableOpacity onPress={() => setSelectedRisk(null)} style={styles.closeBtn}>
                                <Ionicons name="close" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                        <FlatList 
                            data={selectedRisk?.items}
                            keyExtractor={(item) => item.id}
                            renderItem={({item}) => (
                                <View style={styles.detailItem}>
                                    <Ionicons name="key-outline" size={18} color={selectedRisk?.color} style={{marginRight: 12}} />
                                    <Text style={styles.detailText}>{item.accountName}</Text>
                                </View>
                            )}
                            contentContainerStyle={{paddingBottom: 40}}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const StatItem = ({ icon, label, count, color }: any) => (
    <View style={{alignItems:'center', width: '33.3%'}}>
        <View style={{ backgroundColor: color + '15', padding: 8, borderRadius: 12, marginBottom: 4 }}>
            <Ionicons name={icon} size={18} color={color} />
        </View>
        <Text style={{color:'#FFF', fontWeight:'bold', fontSize: 16}}>{count}</Text>
        <Text style={{color:'rgba(255,255,255,0.4)', fontSize: 8, textTransform: 'uppercase', textAlign: 'center', fontWeight: '600'}}>{label}</Text>
    </View>
);

const RiskSection = ({ title, color, count, items, icon }: any) => (
    <View style={styles.riskCard}>
        <View style={styles.rowStart}>
            <Ionicons name={icon} size={22} color={color} />
            <Text style={[styles.riskTitle, { color }]}>{title} ({count})</Text>
            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.2)" style={{marginLeft: 'auto'}} />
        </View>
        {items.length === 0 ? (
            <Text style={[styles.itemRef, { fontStyle: 'italic', fontSize: 11 }]}>Sin elementos críticos</Text>
        ) : (
            items.slice(0, 3).map((item: any, index: number) => (
                <Text key={index} style={styles.itemRef}>• {item.accountName || 'Registro'}</Text>
            ))
        )}
        {count > 3 && <Text style={styles.moreText}>Ver los {count} elementos...</Text>}
    </View>
);

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: COLORS.deepMidnight },
    scroll: { padding: 20, paddingBottom: 40 },
    healthCenter: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
    healthTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
    healthSubtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 },
    canvasContainer: { justifyContent: 'center', alignItems: 'center', marginTop: 25, position: 'relative' },
    scoreAbsolute: { position: 'absolute' },
    scoreText: { color: '#FFF', fontSize: 32, fontWeight: '900' },
    summaryCard: { backgroundColor: COLORS.darkSlate, borderRadius: 24, padding: 20, marginBottom: 25 },
    summaryText: { color: '#FFF', fontSize: 15, textAlign: 'center', marginBottom: 15 },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 20 },
    statsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
    unorganizedBanner: { 
        backgroundColor: 'rgba(255,255,255,0.03)', 
        marginTop: 25, 
        padding: 12, 
        borderRadius: 15, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        borderStyle: 'dashed'
    },
    unorganizedText: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginLeft: 10 },
    rowStart: { flexDirection: 'row', alignItems: 'center' },
    sectionLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '900', marginBottom: 15, letterSpacing: 1.5 },
    riskCard: { backgroundColor: COLORS.darkSlate, borderRadius: 18, padding: 18, marginBottom: 15 },
    riskTitle: { fontSize: 16, fontWeight: 'bold', marginLeft: 12 },
    itemRef: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 10, marginLeft: 34 },
    moreText: { color: COLORS.electricBlue, fontSize: 11, marginTop: 12, marginLeft: 34, fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: COLORS.darkSlate, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, height: height * 0.7 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    closeBtn: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 8, borderRadius: 12 },
    detailItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    detailText: { color: '#FFF', fontSize: 16, fontWeight: '500' }
});