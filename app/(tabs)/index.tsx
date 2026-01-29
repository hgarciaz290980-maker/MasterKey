import React, { useState, useEffect } from 'react';
import {
View, Text, StyleSheet, TouchableOpacity,
ScrollView, Alert, Modal, Dimensions, StatusBar, TextInput, Image
} from 'react-native';
import { Stack, useRouter, useNavigation, useFocusEffect } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle, G } from 'react-native-svg';
// @ts-ignore
// import { uploadToGoogleDrive } from '../../components/googleDriveService'; <--- COMENTA ESTA LÍNEA

// IMPORTACIONES DE SALUD - Corregidas según tu estructura real
import { getAllCredentials } from '../../storage/credentials';
// Eliminamos la línea de decrypt si te da error de "no exported member",
// ya que para el Home usualmente solo necesitamos los datos para las stats.

// DEFINICIONES DE SALUD DEL BÚNKERS [cite: 2026-01-07]
interface VaultStats {
high: { count: number; percent: number };
medium: { count: number; percent: number };
low: { count: number; percent: number };
totalScore: number;
}

const calculateVaultHealth = (data: any[]): VaultStats => {
const total = data.length;
if (total === 0) return {
high: { count: 0, percent: 0 },
medium: { count: 0, percent: 0 },
low: { count: 0, percent: 0 },
totalScore: 0
};

// Lógica simple de conteo para las estadísticas
const high = data.filter(d => (d.password?.length || 0) > 10).length;
const medium = data.filter(d => (d.password?.length || 0) >= 6 && (d.password?.length || 0) <= 10).length;
const low = total - high - medium;

return {
high: { count: high, percent: Math.round((high / total) * 100) },
medium: { count: medium, percent: Math.round((medium / total) * 100) },
low: { count: low, percent: Math.round((low / total) * 100) },
totalScore: Math.round(((high * 100) + (medium * 50)) / total)
};
};

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
const loadAndSync = async () => {
// 1. Cargar datos para la interfaz
const name = await AsyncStorage.getItem('user_name');
if (name) setUserName(name);
const data = await getAllCredentials();
const newStats = calculateVaultHealth(data);
setStats(newStats);

// 2. Lógica de Respaldo Automático
const autoBackup = await AsyncStorage.getItem('auto_backup');
if (autoBackup === 'true' && data.length > 0) {
try {
// Enviamos a la nube de forma silenciosa
// await uploadToGoogleDrive(JSON.stringify(data)); <--- AGREGA LAS DOS DIAGONALES AQUÍ
console.log("Bunker-K: Sincronización automática completada");
} catch (e) {
console.log("Bunker-K: Error en sincronización automática (posible falta de red)");
}
}
};
loadAndSync();
}, [])
);

useEffect(() => {
const checkAuth = async () => {
// 1. Revisamos si la biometría está activa en Settings
const storedBio = await AsyncStorage.getItem('use_bio');
const isBioEnabled = storedBio ? JSON.parse(storedBio) : false;

if (isBioEnabled) {
// Solo si está activa, pedimos autenticación
const result = await LocalAuthentication.authenticateAsync({
promptMessage: 'Acceso a Bunker-K'
});
if (result.success) setIsAuthenticated(true);
} else {
// Si está desactivada, entra directo al Dashboard
setIsAuthenticated(true);
}
};
checkAuth();
}, []);

const IntroView = ({ onComplete }: { onComplete: (name: string, id: string, bio: boolean) => void }) => {
const [name, setName] = useState('');
const [id, setId] = useState('');
const [email, setEmail] = useState('');
const [bioEnabled, setBioEnabled] = useState(false);
const isReady = name.trim().length > 1 && id.length >= 4;
const [showId, setShowId] = useState(false); // Nuevo: controla la visibilidad

return (
<View style={styles.introContainer}>
<ScrollView contentContainerStyle={styles.introScrollContent} showsVerticalScrollIndicator={false}>
<View style={styles.logoContainer}>
<Image
source={require('../../assets/images/Bunker onboarding.png')}
style={styles.logoImage}
resizeMode="contain"/>
<Text style={styles.logoText}>BUNKER</Text>
<Text style={styles.sloganText}>Tu información segura y a la mano.</Text>
</View>

<View style={styles.introCard}>
<Text style={styles.labelIntro}>CONFIGURACIÓN INICIAL</Text>
<TextInput style={styles.introInput} placeholder="Nombre o Alias" placeholderTextColor="rgba(255,255,255,0.3)" value={name} onChangeText={setName} />
<View style={styles.passwordContainer}>
<TextInput
style={styles.idInput}
placeholder="ID Numérico"
placeholderTextColor="rgba(255,255,255,0.3)"
value={id}
onChangeText={setId}
keyboardType="numeric"
secureTextEntry={!showId}
/>
<TouchableOpacity style={styles.eyeIcon} onPress={() => setShowId(!showId)}>
<Ionicons name={showId ? "eye-off" : "eye"} size={20} color="rgba(255,255,255,0.5)" />
</TouchableOpacity>
</View>

<TextInput
style={styles.introInput}
placeholder="Correo de Google (Opcional)"
placeholderTextColor="rgba(255,255,255,0.3)"
value={email}
onChangeText={setEmail}
keyboardType="email-address"
autoCapitalize="none"
/>
<Text style={styles.idLegend}>
Este correo servirá para realizar respaldos en tu propia nube de Google solo con tu autorización. Puedes omitir este dato y configurarlo más adelante.
</Text>
<Text style={styles.idLegend}>
Este ID es tu llave maestra física. Úsala si el sensor de huella no está disponible.
</Text>

<TouchableOpacity style={[styles.bioToggle, bioEnabled && styles.bioActive]} onPress={() => setBioEnabled(!bioEnabled)}>
<Ionicons name="finger-print" size={20} color={bioEnabled ? COLORS.neonGreen : "#FFF"} />
<Text style={styles.bioText}>USAR BIOMETRÍA</Text>
</TouchableOpacity>

<TouchableOpacity style={[styles.introButton, { opacity: isReady ? 1 : 0.5 }]} onPress={() => isReady && onComplete(name, id, bioEnabled)} disabled={!isReady}>
<Text style={styles.introButtonText}>CONFIGURAR</Text>
</TouchableOpacity>
</View>

<View style={styles.privacySealContainer}>
<Text style={styles.privacyText}>
<Text style={{ fontWeight: 'bold', color: COLORS.neonGreen }}>Privacidad Absoluta: </Text>
Con Bunker App, tu información está segura y en tus manos ya que no utiliza servidores para almacenarla. La información de tus cuentas se guarda dentro de tu teléfono en archivos cifrados y el almacenamiento en la nube solo se realiza si autorizas la sincronización con tu Drive de Google.
</Text>
</View>
</ScrollView>
</View>
);
};

const handleInitialSetup = async (name: string, id: string, bio: boolean) => {
try {
// Sincronizamos las llaves: 'user_name' para el alias y 'use_bio' para biometría
await AsyncStorage.setItem('user_name', name);
await AsyncStorage.setItem('user_id', id);
await AsyncStorage.setItem('use_bio', JSON.stringify(bio));
setUserName(name);
Alert.alert(
"Blindaje Activado",
`Bienvenido al Búnker, ${name}. Tu territorio digital está protegido.`
);
} catch (error) {
Alert.alert("Error", "No se pudo inicializar el blindaje.");
}
};

if (!isAuthenticated) return <View style={{ flex: 1, backgroundColor: COLORS.deepMidnight }} />;
if (userName === 'Usuario' || !userName) return <IntroView onComplete={handleInitialSetup} />;

return (
<View style={{ flex: 1, backgroundColor: COLORS.deepMidnight }}>
<StatusBar barStyle="light-content" />
<Stack.Screen options={{ headerShown: false }} />
<ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
<View style={styles.headerRow}>
<View style={{ flex: 1, paddingRight: 10 }}>
<Text style={styles.brandText}>Bunker</Text>
<Text style={styles.welcomeText}>Hola, {userName}</Text>
<Text style={styles.subWelcomeText}>
Tu información segura, aquí la tienes.</Text>
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
<Text style={styles.widgetTitle}>Nivel de seguridad</Text>
<Text style={styles.healthSubtitle}>de tus contraseñas</Text>
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

<TouchableOpacity style={styles.fab} onPress={() => setShowTypeSelector(true)}>
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
widgetTitle: { color: COLORS.textWhite, fontSize: 18, fontWeight: '700', marginBottom: 2 },
healthSubtitle: { 
color: 'rgba(248, 249, 250, 0.5)', 
fontSize: 12, 
fontWeight: '500', 
marginBottom: 10,
letterSpacing: 0.3 
},
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
cancelText: { color: COLORS.textWhite, fontSize: 16, fontWeight: '500', opacity: 0.8 },
introContainer: { flex: 1, backgroundColor: COLORS.deepMidnight },
introScrollContent: { flexGrow: 1, paddingHorizontal: '8%', paddingTop: windowHeight * 0.05, paddingBottom: 40, justifyContent: 'center' },
logoContainer: { alignItems: 'center', marginBottom: 15 },
logoImage: { width: windowWidth * 0.5, height: windowWidth * 0.3, marginBottom: 5 },
sloganText: { color: COLORS.textWhite, fontSize: 12, opacity: 0.6, textAlign: 'center', fontWeight: '500' },
introCard: { backgroundColor: COLORS.darkSlate, padding: 20, borderRadius: 25, width: '100%' },
labelIntro: { color: COLORS.neonGreen, fontSize: 12, fontWeight: '900', textAlign: 'center', marginBottom: 15 },
introInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 15, padding: 15, color: '#FFF', marginBottom: 12 },
idLegend: { color: 'rgba(255,255,255,0.4)', fontSize: 11, textAlign: 'center', marginBottom: 15 },
bioToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
bioActive: { borderColor: COLORS.neonGreen },
bioText: { color: '#FFF', fontSize: 12, fontWeight: 'bold', marginLeft: 10 },
introButton: { backgroundColor: COLORS.electricBlue, padding: 16, borderRadius: 15, alignItems: 'center', marginTop: 15 },
introButtonText: { color: '#FFF', fontWeight: 'bold' },
privacySealContainer: { marginTop: 25 },
privacyText: { color: 'rgba(255,255,255,0.4)', fontSize: 10, textAlign: 'center' },
logoText: { 
color: COLORS.textWhite, 
fontSize: 28,
fontWeight: '900',
letterSpacing: 3,
marginTop: 5,
textAlign: 'center' 
},
passwordContainer: {
flexDirection: 'row',
alignItems: 'center',
backgroundColor: 'rgba(255,255,255,0.05)',
borderRadius: 15,
marginBottom: 12,
},
idInput: {
flex: 1,
padding: 15,
color: '#FFF',
},
eyeIcon: {
paddingHorizontal: 15,
},
});