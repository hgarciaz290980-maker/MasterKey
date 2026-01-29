import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager, StatusBar, Dimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Habilitar animaciones en Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const COLORS = {
    deepMidnight: '#040740',
    electricBlue: '#303AF2',
    darkSlate: '#172140',
    neonGreen: '#0DAC40', 
    vibrantRed: '#FF0000',
    vibrantYellow: '#FFD700', 
    textWhite: '#F8F9FA',
    electricPurple: '#BF00FF',
    celeste: '#B2FFFF'
};

interface AccordionProps {
    title: string;
    content: string;
    icon: string;
    isCritical?: boolean;
}

const AccordionItem = ({ title, content, icon, isCritical }: AccordionProps) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    return (
        <View style={[styles.itemContainer, isCritical && expanded && styles.criticalBorder]}>
            <TouchableOpacity style={styles.header} onPress={toggleExpand} activeOpacity={0.7}>
                <View style={styles.titleRow}>
                    <Ionicons 
                        name={icon as any} 
                        size={20} 
                        color={
                            isCritical ? COLORS.vibrantYellow : 
                            icon === "swap-horizontal-outline" ? COLORS.neonGreen : 
                            icon === "shield-checkmark" ? COLORS.neonGreen :
                            icon === "cloud-upload" ? COLORS.electricPurple :
                            icon === "key" ? COLORS.celeste :
                            COLORS.electricBlue
                        } 
                    />
                    <Text style={styles.questionText}>{title}</Text>
                </View>
                <Ionicons 
                    name={expanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="rgba(255,255,255,0.3)" 
                />
            </TouchableOpacity>
            
            {expanded && (
                <View style={styles.content}>
                    <Text style={styles.responseText}>{content}</Text>
                </View>
            )}
        </View>
    );
};

export default function FAQScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const sections = [
        {
            category: "SEGURIDAD Y PRIVACIDAD",
            items: [
                {
                    icon: "shield-checkmark",
                    title: "¿Dónde se guardan mis contraseñas?",
                    content: "Bunker es una bóveda de soberanía digital. Tus datos NO viven en nuestros servidores; viven cifrados localmente en la memoria de tu teléfono. Nadie más tiene acceso a ellos."
                },
                {
                    icon: "key",
                    title: "¿Pueden recuperar mi ID si lo olvido?",
                    content: "No. Por seguridad absoluta, no existe una base de datos central. Tu ID maestro es la única llave. Si se pierde, el búnker permanece bloqueado para siempre para evitar intrusiones."
                }
            ]
        },
        {
            category: "RESPALDOS Y NUBE",
            items: [
                {
                    icon: "cloud-upload",
                    title: "¿Por qué debo hacer respaldos?",
                    content: "Al ser una app local, si pierdes tu equipo o se daña, la información se pierde. El respaldo en tu Google Drive personal es tu clon de seguridad fuera del dispositivo."
                },
                {
                    icon: "sync",
                    title: "¿Por qué no pueden ayudarme a recuperar mi información?",
                    content: "Por seguridad, al guardar un dato o contraseña en la aplicación, este se cifra de manera automática y local en tu celular. Tu información no es almacenada en servidores propios o de terceros, porlotanto no tenemos acceso a tus llaves e información, esto es lo que blinda la seguridad de tus datos."
                }
            ]
        },
        {
            category: "ZONA CRÍTICA",
            items: [
                {
                    icon: "warning",
                    title: "No desinstales la app sin leer esto",
                    content: "Si desinstalas Bunker, se borrarán todos tus archivos cifrados. ANTES de hacerlo, asegúrate de realizar un respaldo manual exitoso en la sección de Respaldos.",
                    isCritical: true
                },
                {
                    icon: "swap-horizontal-outline",
                    title: "¿Cómo muevo mi Bóveda a otro equipo?",
                    content: "1. Haz un respaldo en tu equipo actual. 2. Instala Bunker en el nuevo equipo. 3. Usa el MISMO ID maestro. 4. Importa tu información desde la sección de Respaldos."
                }
            ]
        }
    ];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="light-content" />
            <Stack.Screen options={{ headerShown: false }} />

            <TouchableOpacity 
                style={styles.backBtn} 
                onPress={() => router.back()}
            >
                <Ionicons name="chevron-back" size={28} color="#FFF" />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.intro}>
                    <Text style={styles.introTitle}>Centro de Ayuda Bunker</Text>
                    <Text style={styles.introSub}>Todo lo que necesitas saber para mantener tu territorio digital blindado.</Text>
                </View>

                {sections.map((section, idx) => (
                    <View key={idx} style={styles.section}>
                        <Text style={styles.categoryLabel}>{section.category}</Text>
                        {section.items.map((item, i) => (
                            <AccordionItem key={i} {...item} />
                        ))}
                    </View>
                ))}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>¿Aún tienes dudas?</Text>
                    <TouchableOpacity style={styles.supportBtn} onPress={() => router.push('/support' as any)}>
                        <Text style={styles.supportBtnText}>Contactar a Soporte</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.deepMidnight },
    backBtn: { paddingHorizontal: 15, paddingVertical: 10, zIndex: 10 },
    scroll: { paddingHorizontal: width * 0.05, paddingBottom: 60 },
    intro: { marginBottom: 30, alignItems: 'center', marginTop: 10 },
    introTitle: { color: '#FFF', fontSize: 24, fontWeight: '900', textAlign: 'center' },
    introSub: { color: 'rgba(255,255,255,0.5)', fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
    section: { marginBottom: 25 },
    categoryLabel: { color: COLORS.electricBlue, fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginBottom: 15, marginLeft: 5 },
    itemContainer: { backgroundColor: COLORS.darkSlate, borderRadius: 16, marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    criticalBorder: { borderColor: COLORS.vibrantYellow }, 
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18 },
    titleRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    questionText: { color: '#FFF', fontSize: 15, fontWeight: '600', marginLeft: 12, flex: 1 },
    content: { padding: 18, paddingTop: 0, borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.05)' },
    responseText: { color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 22 },
    footer: { marginTop: 20, alignItems: 'center', paddingBottom: 40 },
    footerText: { color: 'rgba(255,255,255,0.4)', marginBottom: 15 },
    supportBtn: { paddingVertical: 12, paddingHorizontal: 25, borderRadius: 25, borderWidth: 1, borderColor: COLORS.electricBlue },
    supportBtnText: { color: COLORS.electricBlue, fontWeight: 'bold' }
});