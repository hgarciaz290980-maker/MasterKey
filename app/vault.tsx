import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAllCredentials } from '../storage/credentials';
import Svg, { Circle, G } from 'react-native-svg';

const { width } = Dimensions.get('window');

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
        fav: 0,
        personal: 0,
        work: 0,
        pet: 0,
        mobility: 0,
        entertainment: 0,
        highRisk: [] as any[],
        mediumRisk: [] as any[],
        secure: [] as any[],
        totalScore: 0,
        totalCredentials: 0
    });

    useEffect(() => {
        const loadVaultData = async () => {
            const allItems: any[] = await getAllCredentials();
            
            // Filtrado por categorías para el resumen
            const fav = allItems.filter(i => i.type === 'fav').length;
            const personal = allItems.filter(i => i.type === 'personal').length;
            const work = allItems.filter(i => i.type === 'work').length;
            const pet = allItems.filter(i => i.type === 'pet').length;
            const mobility = allItems.filter(i => i.type === 'mobility').length;
            const entertainment = allItems.filter(i => i.type === 'entertainment').length;

            // Filtrado de riesgos (solo para los que tienen password)
            const credentials = allItems.filter(i => i.password);
            const highRisk = credentials.filter(c => (c.password?.length || 0) < 6);
            const mediumRisk = credentials.filter(c => (c.password?.length || 0) >= 6 && (c.password?.length || 0) <= 10);
            const secure = credentials.filter(c => (c.password?.length || 0) > 10);

            const score = credentials.length > 0 
                ? Math.round(((secure.length * 100) + (mediumRisk.length * 50)) / credentials.length)
                : 0;

            setStats({
                total: allItems.length,
                fav, personal, work, pet, mobility, entertainment,
                highRisk, mediumRisk, secure,
                totalScore: score,
                totalCredentials: credentials.length
            });
        };
        loadVaultData();
    }, []);

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
                            <HealthRing size={120} strokeWidth={8} percentage={stats.secure.length > 0 ? (stats.secure.length / stats.totalCredentials) * 100 : 0} color={COLORS.neonGreen} offset={0} />
                            <HealthRing size={120} strokeWidth={8} percentage={stats.mediumRisk.length > 0 ? (stats.mediumRisk.length / stats.totalCredentials) * 100 : 0} color={COLORS.electricPurple} offset={12} />
                            <HealthRing size={120} strokeWidth={8} percentage={stats.highRisk.length > 0 ? (stats.highRisk.length / stats.totalCredentials) * 100 : 0} color={COLORS.vibrantRed} offset={24} />
                        </Svg>
                        <View style={styles.scoreAbsolute}>
                            <Text style={styles.scoreText}>{stats.totalScore}%</Text>
                        </View>
                    </View>
                </View>

                {/* RESUMEN DE LAS 6 CATEGORÍAS */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryText}>
                        Tienes <Text style={{fontWeight:'bold', color: COLORS.neonGreen}}>{stats.total}</Text> datos seguros y a la mano en Bunker.
                    </Text>
                    <View style={styles.divider} />
                    
                    <View style={styles.statsGrid}>
                        <StatItem icon="star" label="Recurrentes" count={stats.fav} />
                        <StatItem icon="person" label="Personal" count={stats.personal} />
                        <StatItem icon="briefcase" label="Trabajo" count={stats.work} />
                    </View>
                    <View style={[styles.statsGrid, {marginTop: 20}]}>
                        <StatItem icon="paw" label="Mascotas" count={stats.pet} />
                        <StatItem icon="car-sport" label="Movilidad" count={stats.mobility} />
                        <StatItem icon="play-circle" label="Entretenimiento" count={stats.entertainment} />
                    </View>
                </View>

                <Text style={styles.sectionLabel}>ANÁLISIS DE FORTALEZA</Text>
                
                <RiskSection title="En Riesgo" color={COLORS.vibrantRed} count={stats.highRisk.length} items={stats.highRisk} icon="alert-circle" />
                <RiskSection title="Media" color={COLORS.electricPurple} count={stats.mediumRisk.length} items={stats.mediumRisk} icon="shield-half" />
                <RiskSection title="Seguras" color={COLORS.neonGreen} count={stats.secure.length} items={stats.secure} icon="shield-checkmark" />

            </ScrollView>
        </View>
    );
}

const StatItem = ({ icon, label, count }: any) => (
    <View style={{alignItems:'center', width: '33.3%'}}>
        <Ionicons name={icon} size={20} color={COLORS.electricBlue} />
        <Text style={{color:'#FFF', fontWeight:'bold', fontSize: 16, marginTop: 2}}>{count}</Text>
        <Text style={{color:'rgba(255,255,255,0.4)', fontSize: 9, textTransform: 'uppercase', textAlign: 'center'}}>{label}</Text>
    </View>
);

const RiskSection = ({ title, color, count, items, icon }: any) => (
    <View style={styles.riskCard}>
        <View style={styles.rowStart}>
            <Ionicons name={icon} size={22} color={color} />
            <Text style={[styles.riskTitle, { color }]}>{title} ({count})</Text>
        </View>
        {items.length === 0 ? (
            <Text style={[styles.itemRef, { fontStyle: 'italic', fontSize: 11 }]}>Sin elementos críticos</Text>
        ) : (
            items.slice(0, 3).map((item: any, index: number) => (
                <Text key={index} style={styles.itemRef}>• {item.service || 'Registro'}</Text>
            ))
        )}
        {count > 3 && <Text style={styles.moreText}>+{count - 3} más</Text>}
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
    rowStart: { flexDirection: 'row', alignItems: 'center' },
    sectionLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '900', marginBottom: 15, letterSpacing: 1.5 },
    riskCard: { backgroundColor: COLORS.darkSlate, borderRadius: 18, padding: 18, marginBottom: 15 },
    riskTitle: { fontSize: 16, fontWeight: 'bold', marginLeft: 12 },
    itemRef: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 10, marginLeft: 34 },
    moreText: { color: COLORS.electricBlue, fontSize: 11, marginTop: 8, marginLeft: 34, fontWeight: 'bold' }
});