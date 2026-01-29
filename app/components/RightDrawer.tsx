import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';

const COLORS = { 
    deepMidnight: '#040740', 
    electricBlue: '#303AF2', 
    textWhite: '#F8F9FA'
};

export default function RightDrawerContent(props: any) {
  const router = useRouter();
  
  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: COLORS.deepMidnight }}>
      {/* ENCABEZADO CON BOTÓN DE REGRESO (UX) */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.brandText}>BUNKER</Text>
          <Text style={styles.sloganText}>Tu infomración segura y a la mano.</Text>
        </View>
        
        <TouchableOpacity onPress={() => props.navigation.closeDrawer()}>
          <Ionicons name="chevron-forward-outline" size={28} color={COLORS.textWhite} />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <DrawerItem
        label="Mi Bóveda"
        labelStyle={styles.drawerLabel}
        icon={() => <Ionicons name="shield-checkmark-outline" size={22} color={COLORS.textWhite} />}
        onPress={() => {
          props.navigation.closeDrawer(); 
          router.push('/vault' as any);   
        }}
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
        onPress={() => {
          Alert.alert(
            "Cerrar Bóveda",
            "¿Estás seguro de que quieres salir? Se requerirá tu ID de acceso para volver a entrar.",
            [
              { text: "Cancelar", style: "cancel" },
              { 
                text: "Confirmar", 
                style: "destructive", 
                onPress: () => {
                  props.navigation.closeDrawer();
                  router.replace('/'); 
                } 
              }
            ]
          );
        }}
      />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  headerContainer: { 
    padding: 25, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 10 
  },
  brandText: { color: COLORS.textWhite, fontSize: 24, fontWeight: '900', letterSpacing: 1 },
  sloganText: { color: COLORS.textWhite, opacity: 0.5, fontSize: 11, marginTop: 5 },
  drawerLabel: { color: COLORS.textWhite, fontSize: 14, fontWeight: '500' },
  divider: { 
    height: 0.5, 
    backgroundColor: COLORS.textWhite, 
    opacity: 0.2, 
    marginVertical: 8, 
    width: '90%', 
    alignSelf: 'center' 
  }
});