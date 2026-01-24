import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, AppState, AppStateStatus, View, ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { saveNotification } from '../storage/notificationsStorage';

const COLORS = { 
    deepMidnight: '#040740', 
    electricBlue: '#303AF2', 
    textWhite: '#F8F9FA',
    danger: '#FF4444'
};

function CustomDrawerContent(props: any) {
  const router = useRouter();
  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: COLORS.deepMidnight }}>
      <View style={[styles.drawerHeader, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }]}>
  <View>
    <Text style={styles.brandText}>BUNKER-K</Text>
    <Text style={styles.sloganText}>TERRITORIO DIGITAL BLINDADO</Text>
  </View>
  
  {/* Botón para cerrar el menú */}
  <TouchableOpacity onPress={() => props.navigation.closeDrawer()}>
    <Ionicons name="close-outline" size={28} color={COLORS.textWhite} style={{ opacity: 0.8 }} />
  </TouchableOpacity>
</View>
      <View style={styles.thinDivider} />

      <DrawerItem
        label="Mi Bóveda"
        labelStyle={styles.drawerLabel}
        icon={() => <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.textWhite} />}
        onPress={() => { props.navigation.closeDrawer(); router.push('/(tabs)' as any); }}
      />
      <DrawerItem
        label="Seguridad"
        labelStyle={styles.drawerLabel}
  icon={() => <Ionicons name="shield-half-outline" size={20} color={COLORS.textWhite} />}
  onPress={() => { props.navigation.closeDrawer(); router.push('/security' as any); }}
/>
      <DrawerItem
        label="Respaldos"
        labelStyle={styles.drawerLabel}
        icon={() => <Ionicons name="cloud-upload-outline" size={20} color={COLORS.textWhite} />}
        onPress={() => { props.navigation.closeDrawer(); router.push('/backups' as any); }}
      />
      <DrawerItem
        label="Configuración"
        labelStyle={styles.drawerLabel}
        icon={() => <Ionicons name="options-outline" size={20} color={COLORS.textWhite} />}
        onPress={() => { props.navigation.closeDrawer(); router.push('/settings' as any); }}
      />

      <View style={styles.thinDivider} />

      <DrawerItem
        label="Legal y Privacidad"
        labelStyle={styles.drawerLabel}
        icon={() => <Ionicons name="document-lock-outline" size={20} color={COLORS.textWhite} />}
        onPress={() => { props.navigation.closeDrawer(); router.push('/legal' as any); }}
      />
      <DrawerItem
        label="Preguntas Frecuentes"
        labelStyle={styles.drawerLabel}
        icon={() => <Ionicons name="help-circle-outline" size={20} color={COLORS.textWhite} />}
        onPress={() => { props.navigation.closeDrawer(); router.push('/faq' as any); }}
      />
      <DrawerItem
        label="Soporte Técnico"
        labelStyle={styles.drawerLabel}
        icon={() => <Ionicons name="chatbubble-ellipses-outline" size={20} color={COLORS.textWhite} />}
        onPress={() => { props.navigation.closeDrawer(); router.push('/support' as any); }}
      />

      <View style={styles.thinDivider} />

      <DrawerItem
        label="Cerrar Bóveda"
        labelStyle={[styles.drawerLabel, { color: COLORS.danger, fontWeight: '700' }]}
        icon={() => <Ionicons name="lock-closed" size={20} color={COLORS.danger} />}
        onPress={() => { props.navigation.closeDrawer(); }}
      />
    </DrawerContentScrollView>
  );
}

export default function TabLayout() {
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
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Bunker-K: Confirmar Identidad',
        fallbackLabel: 'Usar código de seguridad',
      });
      if (result.success) setIsLocked(false); else setIsLocked(true);
    } catch (error) { console.error(error); } finally { setIsAuthenticating(false); }
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
          screenOptions={{
            drawerPosition: 'right',
            headerShown: false, // <-- IMPORTANTE: Esto quita el texto "(tabs)" de arriba
            drawerType: 'front',
            drawerStyle: { width: '80%' }
          }}
        >
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
          </Stack>
        </Drawer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  lockContainer: { flex: 1, backgroundColor: COLORS.deepMidnight, justifyContent: 'center', alignItems: 'center' },
  drawerHeader: { padding: 25, paddingTop: 50 },
  brandText: { color: COLORS.textWhite, fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  sloganText: { color: COLORS.textWhite, opacity: 0.4, fontSize: 10, marginTop: 4 },
  drawerLabel: { color: COLORS.textWhite, fontSize: 14, fontWeight: '400', marginLeft: -10 },
  thinDivider: { height: 0.4, backgroundColor: COLORS.textWhite, opacity: 0.15, marginVertical: 12, width: '85%', alignSelf: 'center' },
});