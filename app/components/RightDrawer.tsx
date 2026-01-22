import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { AppState, AppStateStatus, View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const COLORS = { 
    deepMidnight: '#040740', 
    electricBlue: '#303AF2', 
    textWhite: '#F8F9FA'
};

function CustomDrawerContent(props: any) {
  const router = useRouter();
  
  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: COLORS.deepMidnight }}>
      <View style={{ padding: 25, marginBottom: 10 }}>
        <Text style={{ color: COLORS.textWhite, fontSize: 24, fontWeight: '900', letterSpacing: 1 }}>BUNKER-K</Text>
        <Text style={{ color: COLORS.textWhite, opacity: 0.5, fontSize: 11, marginTop: 5 }}>TERRITORIO DIGITAL BLINDADO</Text>
      </View>

      <View style={styles.divider} />

      <DrawerItem
        label="Mi Bóveda"
        labelStyle={styles.drawerLabel}
        icon={() => <Ionicons name="shield-checkmark-outline" size={22} color={COLORS.textWhite} />}
        onPress={() => router.push('/(tabs)')}
      />

      <DrawerItem
        label="Seguridad"
        labelStyle={styles.drawerLabel}
        icon={() => <Ionicons name="finger-print-outline" size={22} color={COLORS.textWhite} />}
        onPress={() => router.push('/security-settings' as any)}
      />

      <DrawerItem
        label="Respaldos"
        labelStyle={styles.drawerLabel}
        icon={() => <Ionicons name="cloud-upload-outline" size={22} color={COLORS.textWhite} />}
        onPress={() => router.push('/backup' as any)}
      />

      <DrawerItem
        label="Configuración"
        labelStyle={styles.drawerLabel}
        icon={() => <Ionicons name="options-outline" size={22} color={COLORS.textWhite} />}
        onPress={() => router.push('/settings' as any)}
      />

      <View style={styles.divider} />

      <DrawerItem
        label="Legal y Privacidad"
        labelStyle={styles.drawerLabel}
        icon={() => <Ionicons name="document-lock-outline" size={22} color={COLORS.textWhite} />}
        onPress={() => router.push('/legal' as any)}
      />

      <DrawerItem
        label="Preguntas Frecuentes"
        labelStyle={styles.drawerLabel}
        icon={() => <Ionicons name="help-circle-outline" size={22} color={COLORS.textWhite} />}
        onPress={() => router.push('/faq' as any)}
      />

      {/* AQUÍ EL CAMBIO: AUDÍFONOS POR CHATBUBBLES */}
      <DrawerItem
        label="Soporte Técnico"
        labelStyle={styles.drawerLabel}
        icon={() => <Ionicons name="chatbubbles-outline" size={22} color={COLORS.textWhite} />}
        onPress={() => router.push('/support' as any)}
      />

      <View style={styles.divider} />

      <DrawerItem
        label="Cerrar Bóveda"
        labelStyle={{ color: '#FF4444', fontWeight: 'bold' }}
        icon={() => <Ionicons name="lock-closed" size={22} color="#FF4444" />}
        onPress={() => { /* Lógica de cierre */ }}
      />
    </DrawerContentScrollView>
  );
}

export default function RootLayout() {
  const router = useRouter();
  const [isLocked, setIsLocked] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'inactive' || nextAppState === 'background') setIsLocked(true);
      if (nextAppState === 'active' && isLocked && !isAuthenticating) authenticateUser();
    };
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [isLocked, isAuthenticating]);

  const authenticateUser = async () => {
    setIsAuthenticating(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Bunker-K: Identidad Requerida' });
      if (result.success) setIsLocked(false);
    } catch (e) { console.error(e); } finally { setIsAuthenticating(false); }
  };

  if (isLocked) {
    return (
      <View style={styles.lockContainer}>
        <ActivityIndicator size="large" color={COLORS.electricBlue} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Drawer 
          drawerContent={(props) => <CustomDrawerContent {...props} />}
          screenOptions={({ navigation }) => ({
            headerStyle: { backgroundColor: COLORS.deepMidnight, elevation: 0, shadowOpacity: 0 },
            headerTintColor: COLORS.textWhite,
            headerTitleAlign: 'left',
            headerTitleStyle: { fontWeight: '900', fontSize: 18 },
            drawerPosition: 'right',
            headerShown: true,
            headerLeft: () => null,
            headerRight: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
                    <TouchableOpacity onPress={() => router.push('/notifications' as any)} style={{ marginRight: 20 }}>
                        <Ionicons name="notifications-outline" size={24} color={COLORS.textWhite} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.openDrawer()}>
                        <Ionicons name="menu-outline" size={32} color={COLORS.textWhite} />
                    </TouchableOpacity>
                </View>
            ),
          })}
        >
          {/* Es importante que el nombre coincida con tu estructura de archivos */}
          <Drawer.Screen name="(tabs)/index" options={{ title: 'BUNKER-K' }} />
        </Drawer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  lockContainer: { flex: 1, backgroundColor: COLORS.deepMidnight, justifyContent: 'center', alignItems: 'center' },
  drawerLabel: { color: COLORS.textWhite, fontSize: 14, fontWeight: '500' },
  divider: { height: 1, backgroundColor: COLORS.textWhite, opacity: 0.1, marginVertical: 8, width: '90%', alignSelf: 'center' }
});